import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity({ name: "ettr_entity" })
export class ettrEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  date: Date;

  @Column({
    length: 100,
  })
  open: string;

  @Column({
    length: 100,
  })
  close: string;

  @Column()
  supply: string;
}
