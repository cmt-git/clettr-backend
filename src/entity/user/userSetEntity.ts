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
import { userEntity } from "./userEntity";
import { nftEntity } from "../inventory/nftEntity";

// -> no capital letters for entity name
@Entity({ name: "user_set_entity" })
export class userSetEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => userEntity, (user_entity) => user_entity.bsc_address, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "user_id" })
  user_id: userEntity;

  @OneToOne(() => nftEntity, { onDelete: "SET NULL" })
  @JoinColumn({ name: "set_1" })
  @Column({
    default: null,
  })
  set_1: nftEntity;

  @OneToOne(() => nftEntity, { onDelete: "SET NULL" })
  @JoinColumn({ name: "set_2" })
  @Column({
    default: null,
  })
  set_2: nftEntity;

  @OneToOne(() => nftEntity, { onDelete: "SET NULL" })
  @JoinColumn({ name: "set_3" })
  @Column({
    default: null,
  })
  set_3: nftEntity;

  @OneToOne(() => nftEntity, { onDelete: "SET NULL" })
  @JoinColumn({ name: "set_4" })
  @Column({
    default: null,
  })
  set_4: nftEntity;

  @OneToOne(() => nftEntity, { onDelete: "SET NULL" })
  @JoinColumn({ name: "set_5" })
  @Column({
    default: null,
  })
  set_5: nftEntity;
}
