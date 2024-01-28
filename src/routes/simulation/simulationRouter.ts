import express, { Router } from "express";
import { ettrEntity } from "../../entity/ettr/ettrEntity";
import { getConnection } from "typeorm";
import { CurrencySimulator } from "./currencySimulator";
import { io } from "../../socket/socket";

const simulationRouter = Router();
simulationRouter.use(express.json());
export default simulationRouter;

let initialSupply = 2500;
let initialValue = 0.1;

export async function EttrModify(_amount: number) {
  let close_price: string = "0";

  const current_tick = await getConnection()
    .getRepository(ettrEntity)
    .createQueryBuilder("ettr_entity")
    .orderBy("ettr_entity.id", "DESC") // Order by id in descending order
    .getOne();
  let simulator: CurrencySimulator | undefined = undefined;
  if (current_tick) {
    close_price = current_tick.open;
    simulator = new CurrencySimulator(
      Number(current_tick.supply),
      5,
      Number(current_tick.supply) * 2,
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

  const transaction: number = simulator.simulateInflation(_amount, 0, 0);
  console.log("Transaction: ", transaction);
  console.log("Price in USD", simulator.getExchangeRate());
  console.log("Supply: ", simulator.getMoneySupply());
  const ettr_tick = await ettrEntity
    .create({
      open: simulator.getExchangeRate().toString(),
      close: close_price,
      supply: simulator.getMoneySupply().toString(),
    })
    .save();

  io.emit("price", simulator.getExchangeRate().toString());
  return ettr_tick;
}

simulationRouter.post("/modify", async (req: any, res: any, next) => {
  const { amount } = req.body;

  if (typeof amount == "number") {
    return res.status(200).send({
      success: true,
      data: EttrModify(amount),
    });
  } else {
    return res.status(200).send({
      success: false,
      data: null,
    });
  }
});

simulationRouter.post("/price", async (req: any, res: any, next) => {
  const { page } = req.body;
  let data: any = null;
  if (typeof page == "number" && page >= 1) {
    data = await getConnection()
      .getRepository(ettrEntity)
      .createQueryBuilder("ettr_entity")
      .offset(100 * page)
      .limit(100)
      .orderBy("ettr_entity.id", "DESC")
      .getMany();
  } else {
    data = await getConnection()
      .getRepository(ettrEntity)
      .createQueryBuilder("ettr_entity")
      .limit(100)
      .orderBy("ettr_entity.id", "DESC")
      .getMany(); // Assuming you want to retrieve entities
  }

  return res.status(200).send({
    data: data,
  });
});
