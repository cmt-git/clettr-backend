import { createQueryBuilder, getConnection } from "typeorm";
import { userEntity } from "../../../entity/user/userEntity";
import { validateAuthenticationCode } from "../../authentication/authenticationRouter";

export async function emailModifyHandler(req, res) {
  const { email, bsc_address, authentication_code } = req.body;

  if (
    typeof email == "string" &&
    /^[\w\.-]+@[\w\.-]+\.\w+$/.test(email) &&
    typeof bsc_address == "string" &&
    typeof authentication_code == "string" &&
    req.user &&
    req.user.bsc_address == bsc_address
  ) {
    if (
      !(await userEntity.findOne({
        where: {
          email: email,
        },
      }))
    ) {
      const validate_code = await validateAuthenticationCode({
        email: email,
        authentication_code: authentication_code,
      });

      if (validate_code == "valid") {
        await getConnection()
          .getRepository(userEntity)
          .createQueryBuilder("user_entity")
          .update({
            email: email,
          })
          .where({
            bsc_address: bsc_address,
          })
          .execute();

        return res.status(200).send({
          success: true,
          message: "Email has been changed!.",
        });
      } else {
        return res.status(200).send({
          success: false,
          message: "Auth code is not valid.",
        });
      }
    } else {
      return res.status(200).send({
        success: false,
        message: "Email already taken.",
      });
    }
  } else {
    return res.status(200).send({
      success: false,
      message: "Email not valid.",
    });
  }
}
