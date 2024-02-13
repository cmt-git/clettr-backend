import { getConnection } from "typeorm";
import { UserType, userEntity } from "../../../entity/user/userEntity";
import { adminLogsEntity } from "../../../entity/user/adminLogsEntity";

export async function banUserHandler(req: any, res: any) {
  const { username } = req.body;
  if (req.user && req.user.roles == UserType.ADMIN) {
    if (typeof username == "string" && username.length <= 255) {
      let current_user = await getConnection()
        .getRepository(userEntity)
        .createQueryBuilder("user_entity")
        .where("user_entity.username = :username", { username: username })
        .getOne();
      if (current_user) {
        await getConnection()
          .createQueryBuilder()
          .update(userEntity)
          .set({ banned: !current_user.banned })
          .where("username = :username", { username: username })
          .execute();

        await adminLogsEntity
          .create({
            description: `${req.user.username} ${
              !current_user.banned == true ? "banned" : "unbanned"
            } ${username}.`,
          })
          .save();

        return res.status(200).send({
          success: true,
          message:
            !current_user.banned == true
              ? "User is now banned."
              : "User is now unbanned.",
        });
      } else {
        return res.status(200).send({
          success: false,
          message: "Username is not valid.",
        });
      }
    } else {
      return res.status(200).send({
        success: false,
        message: "Username is not valid.",
      });
    }
  } else {
    return res.status(200).send({
      success: false,
      message: "You do not have permission to execute this request.",
    });
  }
}
