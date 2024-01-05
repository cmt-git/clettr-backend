import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn} from "typeorm";

// -> no capital letters for entity name
@Entity({name:"authentication_entity"})
export class authenticationEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @CreateDateColumn()
    time_registered: Date;

    @Column({
        length: 100,
        unique: true
    })
    email: string;
        
    @Column({
        length: 7,
        default: null
    })
    authentication_code: string;

    //? - Used in authentication when changing email address
    @Column({
        length: 50,
        default: null
    })
    long_authentication_code: string;

}