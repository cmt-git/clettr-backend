import express, { Router } from "express";
import { ettrEntity } from "../../entity/ettr/ettrEntity";
import { getConnection } from "typeorm";
import { CurrencySimulator } from "./currencySimulator";

const simulationRouter = Router();
simulationRouter.use(express.json());
export default simulationRouter;

let initialSupply = 2500;
let initialValue = 0.1;

simulationRouter.post("/mint", async (req: any, res: any, next) => {
  console.log("called!");
  const { amount } = req.body;
  let close_price: string = "";

  if (typeof amount == "number") {
    const current_tick = await getConnection()
      .getRepository(ettrEntity)
      .createQueryBuilder("ettr_entity")
      .orderBy("ettr_entity.id", "DESC") // Order by id in descending order
      .getOne();
    let simulator: CurrencySimulator | undefined = undefined;
    if (current_tick) {
      close_price = current_tick.open;
      simulator = new CurrencySimulator(
        current_tick.supply,
        5,
        current_tick.supply * 2,
        Number(current_tick.open)
      );
    } else {
      simulator = new CurrencySimulator(
        initialSupply,
        5,
        initialSupply * 2,
        initialValue
      );
    }

    const transaction: number = simulator.simulateInflation(amount, 0, 0);
    console.log("Transaction: ", transaction);
    console.log("Price in USD", simulator.calculatePriceInUSD());
    console.log("Supply: ", simulator.getMoneySupply());
    const ettr_tick = await ettrEntity
      .create({
        open: simulator.calculatePriceInUSD().toString(),
        close: close_price,
        supply: simulator.getMoneySupply(),
      })
      .save();

    return res.status(200).send({
      success: true,
      data: ettrEntity,
    });
  } else {
    return res.status(200).send({
      success: false,
      data: null,
    });
  }
});

simulationRouter.post("/burn", async (req: any, res: any, next) => {});
