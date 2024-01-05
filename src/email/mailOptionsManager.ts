
const handlebars = require("handlebars")
const fs = require("fs")
const path = require("path")

const templateManager = (type: string, json: any) => {
    let emailTemplateSource: any = null;
    let template: any = null;
    let htmlToSend: any = null;

    switch(type){
        case "auth-code":
            emailTemplateSource = fs.readFileSync(path.join(__dirname, "/templates/authenticationCode.hbs"), "utf8")
            template = handlebars.compile(emailTemplateSource)
            htmlToSend = template({authenticationCode: json["authentication_code"]})

            return(
                htmlToSend
            )
            break;
        case "email-code":
            emailTemplateSource = fs.readFileSync(path.join(__dirname, "/templates/emailCode.hbs"), "utf8")
            template = handlebars.compile(emailTemplateSource)
            htmlToSend = template({authenticationCode: json["authentication_code"], new_email: json["new_email"]})

            return(
                htmlToSend
            )
            break;
    }
}

export const getEmailOptions = (receiver: string, subject: string, type: string, json: any) => {

    return(
        {
            from: 'Clettr <clettr.noreply@clettr.com>',
            to: receiver,
            subject: subject,
            generateTextfromHTML: true,
            html: templateManager(type, json),
            attachments: [{
                filename: 'clettr-logo.png',
                path: __dirname +'/img/clettr-logo.png',
                cid: 'logo' //my mistake was putting "cid:logo@cid" here! 
           }]
            //template : optionManager(type, json)
        }
    )
};