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
import { nftEntity } from "../inventory/nftEntity";
import { userEntity } from "./userEntity";

// -> no capital letters for entity name
@Entity({ name: "user_play_history_entity" })
export class userPlayHistory extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn() // -> UTC
  time_registered: Date;

  @ManyToOne(() => userEntity, (user_entity) => user_entity.bsc_address, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user_id: userEntity;

  @ManyToOne(() => nftEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "node" })
  node: nftEntity;

  @ManyToOne(() => nftEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "set_1" })
  set_1: nftEntity;

  @ManyToOne(() => nftEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "set_2" })
  set_2: nftEntity;

  @ManyToOne(() => nftEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "set_3" })
  set_3: nftEntity;

  @ManyToOne(() => nftEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "set_4" })
  set_4: nftEntity;

  @ManyToOne(() => nftEntity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "set_5" })
  set_5: nftEntity;

  @Column()
  words_cracked: string;

  @Column()
  rounds: number;

  @Column({
    type: "float",
  })
  total_boost: number;

  @Column()
  final_difficulty: number;

  @Column({
    default: null,
  })
  community_reward: string;

  @Column({
    default: null,
  })
  sharer_username: string;

  @Column({
    type: "float",
  })
  reward: number;
}
