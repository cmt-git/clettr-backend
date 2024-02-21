import {
  transactionCurrency,
  transactionType,
  userTransactionEntity,
} from "../../../entity/user/userTransaction";
import { EttrModify } from "../../simulation/simulationRouter";

export async function userTransactionHandle(data: {
  user: any;
  description: string;
  transaction_amount: number;
  transaction_type: transactionType;
  transaction_currency: transactionCurrency;
}) {
  await userTransactionEntity
    .create({
      user_id: data.user,
      transaction_type: data.transaction_type,
      description: data.description,
      transaction_amount: data.transaction_amount,
      transaction_currency: data.transaction_currency,
    })
    .save();

  if (data.transaction_currency == transactionCurrency.ETTR) {
    await EttrModify(data.transaction_amount);
  }
}
