import { userEntity } from "../entity/user/userEntity";
import bcrypt from 'bcrypt';

const LocalStrategy = require('passport-local').Strategy;

export const InitializePassport = (passport: any) => {
    passport.use(
        new LocalStrategy({usernameField: 'email'}, async (email, password, done) => {
            try{
                const user = await userEntity.findOne({where: { email: email}});
                if (user !== undefined){
                    if (password === user['hashed_password']){
                        return done(null, user);
                    }
                    else {
                        bcrypt.compare(password, user['hashed_password'], async (err, result) => {
                            if (result){
                                return done(null, user);
                            }
                            else {
                                return done(null, false);
                            }
                        });
                    }
                }
                else {
                    return done(null, false);
                }
            }
            catch (err){ 
                done(err, false);
            }
        }),
    )

    passport.serializeUser((user, done) => {
        done(null, user["bsc_address"])
    })
    
    passport.deserializeUser(async (bsc_address, done) => {
        try{
            const user = await userEntity.findOne({where: { bsc_address: bsc_address}});
            if (user !== undefined){
                done(null, user);
            }
        } catch (err) {
            done(err, null)
        }
    })
}

