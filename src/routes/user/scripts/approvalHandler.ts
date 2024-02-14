import { getConnection } from "typeorm";
import { userEntity } from "../../../entity/user/userEntity";
import { adminLogsEntity } from "../../../entity/user/adminLogsEntity";

export async function approvalHandler(req: any, res: any) {
  const { approval, username } = req.body;

  if (
    req.isAuthenticated() &&
    req.user.roles == "admin" &&
    typeof approval == "boolean"
  ) {
    if (approval == true) {
      await getConnection()
        .getRepository(userEntity)
        .createQueryBuilder("user_entity")
        .update({ account_approved: approval })
        .where({ username: username })
        .execute();

      await adminLogsEntity
        .create({
          description: `${req.user.username} has been approved the account of ${username}.`,
        })
        .save();

      return res.status(200).send({
        success: true,
        message: "Account has been approved.",
      });
    } else {
      await getConnection()
        .getRepository(userEntity)
        .createQueryBuilder("user_entity")
        .delete()
        .where({ username: username })
        .execute();

      await adminLogsEntity
        .create({
          description: `${req.user.username} has been rejected the account of ${username}.`,
        })
        .save();

      return res.status(200).send({
        success: true,
        message: "Account has been rejected.",
      });
    }
  } else {
    return res.status(200).send({
      success: false,
      message: "You do not have the correct permission.",
    });
  }
}
