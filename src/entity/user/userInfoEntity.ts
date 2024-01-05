import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, OneToOne, JoinColumn} from "typeorm";
import { userEntity } from "./userEntity";

// -> no capital letters for entity name
@Entity({name:"user_info_entity"})
export class userInfoEntity extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number

    @OneToOne(() => userEntity, user_entity => user_entity.bsc_address, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'user_id'})
    user_id: userEntity;

    @Column({
        default: true
    })
    refill_energy: Boolean

    @Column({
        default: 0
    })
    current_energy: number

    @Column({
        default: 0,
        type: "float"
    })
    unclaimed_ettr: number

    @Column({
        default: 0
    })
    nfts_sold: number

    @Column({
        default: null,
        length: 100
    })
    discord_handle: string;

    @Column({
        default: null,
        length: 100
    })
    facebook_handle: string;

    @Column({
        default: null,
        length: 100 
    })
    instagram_handle: string;

    @Column({
        default: null,
        length: 100
    })
    twitter_handle: string;

    @Column({
        default: null,
        length: 100
    })
    tiktok_handle: string;

    @Column({
        default: null,
        length: 100
    })
    youtube_channel: string;

    @Column({
        default: null
    })
    username_change_time: Date;

    //? this resets every day
    @Column({
        default: null
    })
    node_used: string
}