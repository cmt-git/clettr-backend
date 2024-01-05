import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn} from "typeorm";

// -> no capital letters for entity name
@Entity({name:"weekly_hashes_entity"})
export class weeklyHashesEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column({
        length: 10
    })
    hash: String

    @Column({
        length: 10
    })
    hash_type: String //? this variable can only have active and passive 
}