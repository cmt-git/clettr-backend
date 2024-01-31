import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
} from "typeorm";

// -> no capital letters for entity name
@Entity({ name: "user_entity" })
export class userEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 42,
    unique: true,
  })
  bsc_address: string;

  @Column()
  hashed_signature: string;

  @CreateDateColumn() // -> UTC
  time_registered: Date;

  @Column({
    length: 100,
    default: null,
    unique: true,
  })
  email: string;

  @Column({
    length: 16,
    default: null,
    unique: true,
  })
  username: string;

  @Column({
    length: 128,
    default: null,
  })
  hashed_password: string;

  @Column({
    default: false,
  })
  account_created: boolean;

  @Column({
    length: 200,
    default: null,
  })
  qr_code: string;
}
