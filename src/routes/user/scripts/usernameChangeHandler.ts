import { getConnection } from "typeorm";
import { userEntity } from "../../../entity/user/userEntity";
import bcrypt from "bcrypt";

export async function usernameChangeHandler(req: any, res: any) {
  const { username, password, bsc_address } = req.body;

  if (typeof username == "string" && typeof password == "string") {
    const user = await userEntity.findOne({
      where: { bsc_address: bsc_address },
    });

    const check_user = await userEntity.findOne({
      where: { username: username },
    });

    if (!check_user) {
      if (user) {
        bcrypt.compare(
          password,
          user["hashed_password"],
          async (err, result) => {
            if (result) {
              await getConnection()
                .getRepository(userEntity)
                .createQueryBuilder("user_entity")
                .update({
                  username: username,
                })
                .where({
                  bsc_address: bsc_address,
                })
                .execute();

              return res.status(200).send({
                message: "Username has been updated!",
                success: true,
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
      return res.status(200).send({
        success: false,
        message: "Username already taken.",
      });
    }
  }
}
