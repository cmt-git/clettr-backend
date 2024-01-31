import { getConnection } from "typeorm";
import { userTransactionEntity } from "../../../entity/user/userTransaction";

export async function userTransactionResolver(parent, args, context) {
  if (context.user !== undefined) {
    const limit: number = 100;

    const query = await getConnection()
      .getRepository(userTransactionEntity)
      .createQueryBuilder("user_transaction_entity")
      .where("user_transaction_entity.user_id = :value", {
        value: context.user.id,
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
