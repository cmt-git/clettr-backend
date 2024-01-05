import express, { Router } from "express";
import { getConnection } from "typeorm";
import { nftEntity } from "../entity/inventory/nftEntity";
import { userEntity } from "../entity/user/userEntity";
import { userInfoEntity } from "../entity/user/userInfoEntity";
import { userPlayHistory } from "../entity/user/userPlayHistory";
import { userSetEntity } from "../entity/user/userSetEntity";
import { weeklyHashesEntity } from "../entity/weekly-hashes/weeklyHashesEntity";
import authenticationRouter from "./authentication/authenticationRouter";
import hashesRouter from "./hashes/hashesRouter";
import homeRouter from "./home/homeRouter";
import nftsRouter from "./nfts/nftsRouter";
import playRouter from "./play/playRouter";
import userRouter from "./user/userRouter";

const routers = Router();

routers.use("/user", userRouter);
routers.use("/home", homeRouter);
routers.use("/hash", hashesRouter); //! REMOVE THIS FOR PRODUCTION
routers.use("/nfts", nftsRouter);
routers.use("/authentication", authenticationRouter);
routers.use("/play", playRouter);

routers.get(
    '/', async (req: any, res: any, next) => {
        const bsc_address = "0xd6077eA337b8c1B3EFd929EAA2c530C05Afd5136";
        let type: any = "active";

        let query: any = await getConnection()
        .getRepository(userPlayHistory)
        .createQueryBuilder("user_play_history")
        .leftJoin("user_play_history.user_id", "user_id")
        .select(`SUM(user_play_history.reward)`, "reward")
        .addSelect("date(user_play_history.time_registered)", "day")
        .where("user_id.id = :value", {value: 8})
        .groupBy("day")
        .limit(60)
        .getRawMany()

        return res.status(200).send({
            "confirmation": "111aa",
            "message": query
        })
    }
)
export default routers;