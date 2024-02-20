import { getConnection } from "typeorm";
import { userTransactionEntity } from "../../../entity/user/userTransaction";

export async function userTransactionResolver(parent, args, context) {
  if (context.user !== undefined) {
    const limit: number = 100;
    const query = await getConnection()
      .getRepository(userTransactionEntity)
      .createQueryBuilder("user_transaction_entity")
      .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
      .where((qb) => {
        if (args.global !== true) {
          console.log(args.username, " - username");
          if (args.username) {
            qb.andWhere("user_id.username = :value", {
              value: args.username,
            });
          } else {
            qb.andWhere("user_transaction_entity.user_id = :value", {
              value: context.user.id,
            });
          }
        }
      })
      .offset(
        limit *
          (typeof args.page == "number" && args.page > 0 ? args.page - 1 : 0)
      )
      .orderBy("user_transaction_entity.transaction_date", "DESC")
      .limit(limit)
      .getMany();

    return query;
  }
  return null;
}
