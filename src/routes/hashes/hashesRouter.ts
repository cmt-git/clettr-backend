import express, { Router } from "express";
import { getConnection } from "typeorm";
import { weeklyHashesEntity } from "../../entity/weekly-hashes/weeklyHashesEntity";

const hashesRouter = Router();
hashesRouter.use(express.json());
export default hashesRouter;

hashesRouter.post("/test/generate", async (req: any, res: any, next) => {
  await generateWeeklyHashes();

  return res.status(200).send({
    message: "new hashes has been generated",
  });
});

export const generateWeeklyHashes = async () => {
  const Letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  await getConnection()
    .createQueryBuilder()
    .delete()
    .from(weeklyHashesEntity)
    .execute();

  for (let i = 0; i < 10; i++) {
    let hash = "";
    for (let x = 0; x < 10; x++) {
      let rand = Math.floor(Math.random() * 2);

      if (rand == 0) {
        hash += (Math.floor(Math.random() * 9) + 1).toString();
      } else {
        hash += Letters[Math.floor(Math.random() * Letters.length)];
      }
    }

    await weeklyHashesEntity
      .create({
        hash_type: i < 5 ? "active" : "passive",
        hash: hash,
      })
      .save();
  }
};
