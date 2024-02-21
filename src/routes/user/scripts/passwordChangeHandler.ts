import { getConnection } from "typeorm";
import { userEntity } from "../../../entity/user/userEntity";
import bcrypt from "bcrypt";

export async function passwordChangeHandler(req: any, res: any) {
  const { old_password, new_password, confirm_password, bsc_address } =
    req.body;

  if (
    typeof old_password == "string" &&
    typeof new_password == "string" &&
    typeof confirm_password == "string" &&
    new_password == confirm_password
  ) {
    const user = await userEntity.findOne({
      where: { bsc_address: bsc_address },
    });

    if (user) {
      bcrypt.compare(
        old_password,
        user["hashed_password"],
        async (err, result) => {
          if (result) {
            await bcrypt.genSalt(10, async (err, salt) => {
              await bcrypt.hash(new_password, salt, async (err, hash) => {
                const user = await userEntity.update(
                  { bsc_address },
                  {
                    hashed_password: hash,
                    account_created: true,
                    account_approved: true,
                  }
                );
                return res.status(200).send({
                  message: "Password has been changed!",
                  success: true,
                });
              });
            });
          } else {
            return res.status(200).send({
              message:
                "Could not find account. Please retry entering password.",
              success: false,
            });
          }
        }
      );
    } else {
      return res.status(200).send({
        success: false,
        message: "Could not find account.",
      });
    }
  } else {
    if (new_password != confirm_password) {
      return res.status(200).send({
        success: false,
        message: "New password do not match.",
      });
    } else {
      return res.status(200).send({
        success: false,
        message: "Password is invalid.",
      });
    }
  }
}
