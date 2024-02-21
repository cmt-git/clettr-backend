import { authenticationEntity } from "../../../entity/authentication/authenticationEntity";
import { randomAuthCode } from "../../authentication/authenticationRouter";

export async function authGenerateHandler(req, res) {
  const { email } = req.body;

  if (
    req.user &&
    typeof email == "string" &&
    /^[\w\.-]+@[\w\.-]+\.\w+$/.test(email) &&
    req.user &&
    req.user.account_approved == true
  ) {
    if (
      !(await authenticationEntity.findOne({
        where: {
          email: email,
        },
      }))
    ) {
      await authenticationEntity
        .create({
          email: email,
          authentication_code: randomAuthCode(),
        })
        .save();

      return res.status(200).send({
        success: true,
        message: "Sent Authenticaton Code.",
      });
    } else {
      return res.status(200).send({
        success: true,
        message: "Already sent auth code.",
      });
    }
  } else {
    return res.status(200).send({
      success: false,
      message: "Email not valid.",
    });
  }
}
