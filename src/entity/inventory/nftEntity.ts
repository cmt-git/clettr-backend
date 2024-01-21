import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { userEntity } from "../user/userEntity";

// -> no capital letters for entity name
@Entity({ name: "nft_entity" })
export class nftEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => userEntity, (user_entity) => user_entity.bsc_address, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "current_owner" })
  current_owner: userEntity;

  @ManyToOne(() => userEntity, (user_entity) => user_entity.bsc_address, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "original_owner" })
  original_owner: userEntity;

  @CreateDateColumn() // -> UTC
  creation_date: Date;

  @Column({
    length: 100,
    default: null,
    unique: true,
  })
  nft_parent_token_id: String; //? id used for tracking parents

  @Column({
    length: 1000,
    default: null,
    unique: true,
  })
  nft_forge_id: String; //? id used for tracking parents

  @Column({
    length: 1000,
    default: null,
    unique: true,
  })
  nft_token_id: String; //? generated from solidty

  @Column({
    length: 1000,
    default: null,
    unique: true,
  })
  nft_token_uri: String; //? used in token uris

  @Column()
  nft_type: String; //! WARNING THIS VARIABLE CAN ONLY HAVE "active" or "passive"

  @Column()
  nft_traits: String; //? Example trait -> letter trait : A-blue-striped, node trait: green

  @Column()
  nft_hash: String;

  @Column()
  nft_stars: Number;

  @Column({
    default: null,
  })
  nft_requirement: String; //? Example requirement -> letter req : null, node trait: striped-5-A-pink-1

  @Column({
    default: 0,
  })
  nft_bought_price: Number;

  @Column({
    default: null,
  })
  status: String; //? this variable is used for knowing if the NFT is currently for market, or burned. ENUM : market, burned

  @Column({
    default: null,
  })
  market_info: String; //? this variable is for storing market info for example -> USDC-49.99
}
