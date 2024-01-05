import express, { Router } from 'express';
import bcrypt from 'bcrypt';
import { sendMail } from '../../email/email-instance';
import { authenticationEntity } from '../../entity/authentication/authenticationEntity';
import { userEntity } from '../../entity/user/userEntity';
import { validateAddress, validateEmail } from '../user/userRouter';
import { getConnection } from 'typeorm';

const authenticationRouter = Router();
authenticationRouter.use(express.json());

authenticationRouter.post('/new', async (req: any, res: any) => {
    let {email, bsc_address} = req.body;

    bsc_address = bsc_address !== undefined ? bsc_address : null;

    if (req.isAuthenticated()){
        bsc_address = req.user.bsc_address
    }

    if (email.length <= 100
        && validateAddress(bsc_address) && bsc_address.length == 42 
        && validateEmail(email)){
        return await generateAuthenticationCode({
            "email": email,
            "bsc_address": bsc_address
        },res);
    }
    else {
        return res.status(403).send({
            "message": "Internal Error.",
            "success": false,
        })
    }
});

authenticationRouter.post('/email_code', async (req: any, res: any) => {
    let {new_email, email} = req.body;

    if (req.isAuthenticated()
        && email.length <= 100 && new_email.length <= 100
        && validateEmail(email)
        && validateEmail(new_email)
        && req.user.qr_code != null
        && new_email != req.user.email
        ){
        await generateAuthenticationCode({
            "email": new_email,
            "bsc_address": req.user.bsc_address
        },res);

        return await generateLongAuthCode({
            "email": email,
            "new_email": new_email
        },res);
    }
    else {
        if (req.user.qr_code == null){
            return res.status(403).send({
                "message": "Please setup 2FA Authentication before changing email.",
                "success": false,
            })
        }
        else if (new_email === req.user.email){
            return res.status(403).send({
                "message": "New email is the same as your current email.",
                "success": false,
            })
        }
        else {
            return res.status(403).send({
                "message": "Internal Error.",
                "success": false,
            })
        }
    }
});

authenticationRouter.post('/2FA/new', async (req: any, res: any) => {
    let {bsc_address, secret, authentication_code} = req.body;
    bsc_address = bsc_address !== undefined ? bsc_address : null;

    const checkSignature = await userEntity.findOne({where: {bsc_address: bsc_address}});
    
    if (bsc_address != null && bsc_address.length == 42 
        && authentication_code.length == 6 
        && secret.length < 100
        && validateAddress(bsc_address)
        && checkSignature != null
        && checkSignature.qr_code === null
        ){
            const speakeasy = require('speakeasy');
            const verified = speakeasy.totp.verify({
                secret: secret,
                encoding: 'ascii',
                token: authentication_code
            });

            if (verified == true){
                await userEntity.update({bsc_address}, {qr_code: secret});
                return res.status(200).send({
                    "message": "2FA Authentication successfully setup!",
                    "success": true,
                })
            }
            else {
                return res.status(200).send({
                    "message": "Wrong authentication code.",
                    "success": false,
                })
            }
    }   
    else {
        return res.status(403).send({
            "message": "Internal Error.",
            "success": false,
        })
    }
});

authenticationRouter.post('/2FA/revoke', async (req: any, res: any) => {
    let {authentication_code, authenticator_code} = req.body;

    if (req.isAuthenticated() 
        && authentication_code.length == 7 && authenticator_code.length == 6) 
        {
            const validation = await validateAuthenticationCode({
                "email": req.user.email,
                "authentication_code": authentication_code
            });

            switch(validation){
                case "error":
                    return res.status(403).send({
                        "message": "Internal Error. Please request for another authentication code.",
                        "success": false
                    })
                    break;
                case "invalid":
                    return res.status(200).send({
                        "message": "Authentication Code is not valid.",
                        "success": false
                    })  
                    break;
                case "valid":
                    const speakeasy = require('speakeasy');
                    const verified = speakeasy.totp.verify({
                        secret: req.user.qr_code,
                        encoding: 'ascii',
                        token: authenticator_code
                    });

                    if (verified == true){
                        await userEntity.update({bsc_address: req.user.bsc_address}, {qr_code: null});
                        return res.status(200).send({
                            "message": "2FA Authentication successfully revoked!",
                            "success": true,
                        })
                    }
                    else {
                        return res.status(200).send({
                            "message": "Wrong authentication code.",
                            "success": false,
                        })
                    }
                    break;
            }
    }   
    else {
        return res.status(403).send({
            "message": "Internal Error.",
            "success": false,
        })
    }
});

const createAuthenticationEntity = async (json: any) => {
    await authenticationEntity.delete({email: json.email});
    await authenticationEntity.create({email: json.email, authentication_code: json["authentication_code"]}).save(); 
}

export const generateAuthenticationCode = async (json: any, res: any) => {

    let authentication_code: string = "";
    for(let i = 0; i < 7; i++){
        authentication_code += Math.floor(Math.random() * 10).toString();
    }

    const checkAuthentication = await authenticationEntity.findOne({where: {email: json.email}});
    const checkSignature = await userEntity.findOne({where: {bsc_address: json["bsc_address"]}});

    if (checkAuthentication === undefined && checkSignature !== undefined){
        await createAuthenticationEntity({
            email: json.email,
            "authentication_code": authentication_code
        });

        await sendMail(json["email"], "Authentication Code", "auth-code", {"authentication_code": authentication_code});

        return res.status(200).send({
            "message": "Authentication Code has been sent. Please use within 10 minutes.",
            "success": true,
        });
    }
    else {
        if (checkSignature === undefined){
            return res.status(403).send({
                "message": "Internal Error.",
                "success": false,
            })
        }
        else {
            await createAuthenticationEntity({
                email: json.email,
                "authentication_code": authentication_code
            });

            await sendMail(json["email"], "Authentication Code", "auth-code", {"authentication_code": authentication_code});

            return res.status(200).send({
                "message": "Authentication Code has been sent. Please use within 10 minutes.",
                "success": true,
            });
        }
    }
}

export const generateLongAuthCode = async (json: any, res: any) => {

    let authentication_code: string = "";
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!;[]-()*&^%$#@<>:\{}/.,"
    for(let i = 0; i < 50; i++){
        authentication_code +=  characters[Math.floor(Math.random() * characters.length)].toString();
    }

    await authenticationEntity.delete({email: json.email});
    await authenticationEntity.create({email: json.email, long_authentication_code: authentication_code}).save(); 

    await sendMail(json["email"], "Authentication Code", "email-code", {"authentication_code": authentication_code, "new_email": json.new_email});
}

export const validateAuthenticationCode = async (json: any) => {
    let {email, authentication_code} = json;
    
    const checkAuthentication = await authenticationEntity.findOne({where: {email: email}});
    if ( checkAuthentication !== undefined){
        if (checkAuthentication["authentication_code"] === authentication_code){
            await authenticationEntity.delete({email: email});
            return "valid";
        }
        else {
            return "invalid";
        }
    }
    else {
        return "error";
    }
}

export const cleanAuthenticationEntity = async () => {
    const tenMinutes = 600000;
    const subtractedSeconds = new Date().getTime() - tenMinutes;
    const subtractedDate = new Date(subtractedSeconds);

    await getConnection()
    .createQueryBuilder()
    .delete()
    .from(authenticationEntity)
    .where("time_registered < :subtractedDate", { subtractedDate: subtractedDate })
    .execute();
};

export default authenticationRouter;