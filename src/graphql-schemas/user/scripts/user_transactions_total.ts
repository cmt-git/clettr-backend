import { getConnection } from "typeorm";
import { userTransactionEntity } from "../../../entity/user/userTransaction";

export async function userTransactionTotal(parent, args, context) {
  if (context.user !== undefined) {
    const query = await getConnection()
      .getRepository(userTransactionEntity)
      .createQueryBuilder("user_transaction_entity")
      .where("user_transaction_entity.user_id = :value", {
        value: context.user.id,
      })
      .getCount();

    return Math.floor(query / 100) + 1;
  }
  return 0;
}
