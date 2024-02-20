import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  BeforeInsert,
} from "typeorm";
import { userEntity } from "./userEntity";

export enum transactionType {
  MARKET_BUY = "market_buy", // not in use
  MARKET_SELL = "market_sell", // not in use
  PLAY = "play",
  COMMUNITY = "community",
  FORGE = "forge", // not in use
  FORGE_ACTIVE = "forge_active",
  FORGE_PASSIVE = "forge_passive",
  MINT_PASSIVE = "mint_active",
  MINT_ACTIVE = "mint_passive",
  MARKET_BUY_PASSIVE = "market_buy_passive", // not in use
  MARKET_BUY_ACTIVE = "market_buy_active", // not in use
  MARKET_SELL_PASSIVE = "market_sell_passive", // not in use
  MARKET_SELL_ACTIVE = "market_sell_active", // not in use
}

export enum transactionCurrency {
  USDC = "usdc",
  ETTR = "ettr",
}

@Entity({ name: "user_transaction_entity" })
export class userTransactionEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn() // -> UTC
  transaction_date: Date;

  @Column()
  day: number;

  @Column()
  month: number;

  @Column()
  year: number;

  @BeforeInsert()
  updateTransactionDate() {
    const currentDate = new Date();
    this.day = currentDate.getUTCDate();
    this.month = currentDate.getUTCMonth() + 1; // Months are zero-based, so add 1
    this.year = currentDate.getUTCFullYear();
  }

  @ManyToOne(() => userEntity, (user_entity) => user_entity.bsc_address, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user_id: userEntity;

  @Column({
    name: "transaction_type",
    type: "enum",
    enum: transactionType,
    default: transactionType.MARKET_BUY,
  })
  transaction_type: transactionType;

  @Column({
    name: "description",
    type: "varchar",
    length: 1000,
    nullable: false, // Set to false if the description is mandatory
  })
  description: string;

  @Column({
    type: "float",
    name: "transaction_amount",
    default: 0,
  })
  transaction_amount: number;

  @Column({
    name: "transaction_currency",
    type: "enum",
    enum: transactionCurrency,
    default: transactionCurrency.USDC,
  })
  transaction_currency: string;
}
