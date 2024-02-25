import { getConnection } from "typeorm";
import {
  transactionType,
  userTransactionEntity,
} from "../../../entity/user/userTransaction";

export async function userTransactionResolver(parent, args, context) {
  if (context.user !== undefined) {
    const limit: number = 100;
    const query = await getConnection()
      .getRepository(userTransactionEntity)
      .createQueryBuilder("user_transaction_entity")
      .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
      .where((qb) => {
        if (args.global !== true) {
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

        if (args.filter && args.filter != "Any") {
          const current_filter = (() => {
            switch (args.filter) {
              case "Play":
                return transactionType.PLAY;
              case "Community":
                return transactionType.COMMUNITY;
              case "Forge (Active)":
                return transactionType.FORGE_ACTIVE;
              case "Forge (Passive)":
                return transactionType.FORGE_PASSIVE;
              case "Mint (Active)":
                return transactionType.MINT_ACTIVE;
              case "Mint (Passive)":
                return transactionType.MINT_PASSIVE;
              case "Market Buy (Passive)":
                return transactionType.MARKET_BUY_PASSIVE;
              case "Market Buy (Active)":
                return transactionType.MARKET_BUY_ACTIVE;
              case "Market Sell (Passive)":
                return transactionType.MARKET_SELL_PASSIVE;
              case "Market Sell (Active)":
                return transactionType.MARKET_SELL_ACTIVE;
            }
          })();
          qb.andWhere("user_transaction_entity.transaction_type = :type", {
            type: current_filter,
          });
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
