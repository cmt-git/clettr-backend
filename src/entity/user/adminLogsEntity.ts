import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
} from "typeorm";

// -> no capital letters for entity name
@Entity({ name: "admin_logs_entity" })
export class adminLogsEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn() // -> UTC
  date: Date;

  @Column({
    length: 1000,
  })
  description: string;
}
