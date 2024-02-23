import express, { Router } from "express";
import { getConnection } from "typeorm";
import { nftEntity } from "../../entity/inventory/nftEntity";
import { weeklyHashesEntity } from "../../entity/weekly-hashes/weeklyHashesEntity";
import {
  transactionCurrency,
  transactionType,
  userTransactionEntity,
} from "../../entity/user/userTransaction";
import { userTransactionHandle } from "../user/scripts/handleUserTransactions";
import { nftCreateHandler } from "./scripts/nftCreateHandler";
import { nftUpdateHandler } from "./scripts/nftUpdateHandler";
import { nftEnforcement } from "./scripts/nftEnforcement";
import { nftForgeHandler } from "./scripts/nftForgeHandler";
import { Letters } from "../hashes/hashesRouter";

const nftsRouter = Router();
nftsRouter.use(express.json());
export default nftsRouter;

export const nft_colors = [
  "pink",
  "purple",
  "blue",
  "teal",
  "lime",
  "green",
  "yellow",
  "orange",
  "red",
];

export const nft_patterns = [
  "striped",
  "spotted",
  "zigzag",
  "checkered",
  "cross",
  "sharp",
];
//? used in minting passive nfts
export const randomRequirement = () => {
  const arr_req: any = [];
  let requirement = "";
  const rand = Math.floor(Math.random() * 5) + 1;

  for (let i = 0; i < rand; i++) {
    let rand = Math.floor(Math.random() * 4) + 1;
    let selected =
      rand == 1
        ? Letters[Math.floor(Math.random() * Letters.length)]
        : rand == 2
        ? nft_colors[Math.floor(Math.random() * nft_colors.length)]
        : rand == 3
        ? nft_patterns[Math.floor(Math.random() * nft_patterns.length)]
        : (Math.floor(Math.random() * 5) + 1).toString();

    if (arr_req.includes(selected) == false) {
      arr_req.push(selected);
      requirement += selected + "-";
    } else {
      i--;
    }
  }

  return requirement.substring(0, requirement.length - 1);
};

nftsRouter.post("/mint", async (req: any, res: any, next) => {
  let { type, token_id, token_uri, price } = req.body;

  if (req.isAuthenticated()) {
    const Letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const getHash = (length: number) => {
      let hash = "";

      for (let x = 0; x < length; x++) {
        let rand = Math.floor(Math.random() * 2);

        if (rand == 0) {
          hash += (Math.floor(Math.random() * 9) + 1).toString();
        } else {
          hash += Letters[Math.floor(Math.random() * Letters.length)];
        }
      }

      return hash;
    };

    if (type == "active") {
      const nft_color = nft_colors[Math.floor(Math.random() * 9)];
      const nft_pattern = nft_patterns[Math.floor(Math.random() * 6)];
      const nft_letters = Letters[Math.floor(Math.random() * Letters.length)];
      const nft_traits = `${nft_letters}-${nft_color}-${nft_pattern}`;
      const nft_entity = await nftEntity
        .create({
          current_owner: req.user,
          original_owner: req.user,
          nft_token_id: token_id,
          nft_token_uri: token_uri,
          nft_type: type,
          nft_traits: nft_traits,
          nft_letter: nft_letters,
          nft_color: nft_color,
          nft_pattern: nft_pattern,
          nft_hash: getHash(2),
          nft_stars: 1,
        })
        .save();

      await userTransactionHandle({
        user: req.user,
        description: `Bought Active NFT #${nft_entity.id}`,
        transaction_type: transactionType.MINT_ACTIVE,
        transaction_currency: transactionCurrency.ETTR,
        transaction_amount: 50.0,
      });

      return res.status(200).send({
        message: "Active NFT has been minted!",
        success: true,
      });
    }

    if (type == "passive") {
      const requirement = randomRequirement();
      const requirement_array = requirement.split("-");
      const nft_color = [
        "pink",
        "purple",
        "blue",
        "teal",
        "lime",
        "green",
        "yellow",
        "orange",
        "red",
      ][Math.floor(Math.random() * 9)];
      const nft_entity = await nftEntity
        .create({
          current_owner: req.user,
          original_owner: req.user,
          nft_token_id: token_id,
          nft_token_uri: token_uri,
          nft_type: type,
          nft_traits: nft_color,
          nft_color: nft_color,
          nft_hash: getHash(10),
          nft_stars: 1,
          nft_requirement: requirement,
          nft_requirement_1: requirement_array[0] || null,
          nft_requirement_2: requirement_array[1] || null,
          nft_requirement_3: requirement_array[2] || null,
          nft_requirement_4: requirement_array[3] || null,
          nft_requirement_5: requirement_array[4] || null,
          nft_requirement_length: requirement.length,
        })
        .save();

      await userTransactionHandle({
        user: req.user,
        transaction_type: transactionType.MINT_PASSIVE,
        description: `Bought Passive NFT #${nft_entity.id}`,
        transaction_amount: -5.0,
        transaction_currency: transactionCurrency.USDC,
      });

      return res.status(200).send({
        message: "Passive NFT has been minted!",
        success: true,
      });
    }
  }
});

nftsRouter.post("/forge", async (req: any, res: any, next) => {
  await nftForgeHandler(req, res);
});

nftsRouter.post("/market_sell", async (req: any, res: any, next) => {
  let { nft_id, currency, price } = req.body;

  if (
    req.user != null &&
    ["ettr", "usdc"].includes(currency) &&
    Number(price) <= 10000
  ) {
    const nft_entity = await nftEntity.update(
      { current_owner: req.user.id, id: nft_id },
      { market_info: `${currency}-${Math.round(price)}`, status: "market_sell" }
    );

    return res.status(200).send({
      message: "NFT has been listed.",
      success: true,
    });
  } else {
    return res.status(403).send({
      message: "Internal Error.",
      success: false,
    });
  }
});

nftsRouter.post("/market_revoke", async (req: any, res: any, next) => {
  let { nft_id } = req.body;

  if (req.user != null) {
    await nftEntity.update(
      { current_owner: req.user.id, id: nft_id },
      { market_info: null, status: null }
    );
    return res.status(200).send({
      message: "NFT has been delisted.",
      success: true,
    });
  } else {
    return res.status(403).send({
      message: "Internal Error.",
      success: false,
    });
  }
});

nftsRouter.post("/market_buy", async (req: any, res: any, next) => {
  let { nft_id } = req.body;
  let _status: any = "market_sell";

  if (req.user != null) {
    const nft_entity = await nftEntity
      .createQueryBuilder("nft_entity")
      .leftJoinAndSelect("nft_entity.current_owner", "current_owner")
      .leftJoinAndSelect("nft_entity.original_owner", "original_owner")
      .where("nft_entity.id = :nft_id", { nft_id })
      .getOne();

    let query = await nftEntity.update(
      { id: nft_id, status: _status },
      { market_info: null, status: null, current_owner: req.user.id }
    );

    if (query == null) {
      return res.status(403).send({
        message: "Internal Error.",
        success: false,
      });
    } else {
      const nft_entity_market_info = nft_entity.market_info.split("-");

      await userTransactionHandle({
        user: nft_entity.current_owner,
        transaction_type:
          nft_entity.nft_type == "active"
            ? transactionType.MARKET_SELL_ACTIVE
            : transactionType.MARKET_SELL_PASSIVE,
        description: `Sold NFT #${nft_id}`,
        transaction_amount: Number(nft_entity_market_info[1]),
        transaction_currency:
          nft_entity_market_info[0] == "ettr"
            ? transactionCurrency.ETTR
            : transactionCurrency.USDC,
      });

      await userTransactionHandle({
        user: req.user,
        transaction_type:
          nft_entity.nft_type == "active"
            ? transactionType.MARKET_BUY_ACTIVE
            : transactionType.MARKET_BUY_PASSIVE,
        description: `Bought NFT #${nft_id}`,
        transaction_amount: -Number(nft_entity_market_info[1]),
        transaction_currency:
          nft_entity_market_info[0] == "ettr"
            ? transactionCurrency.ETTR
            : transactionCurrency.USDC,
      });

      return res.status(200).send({
        message: "NFT has been successfully bought.",
        success: true,
      });
    }
  } else {
    return res.status(403).send({
      message: "Internal Error.",
      success: false,
    });
  }
});

nftsRouter.post("/create", async (req: any, res: any, next) => {
  let { type, token_id, token_uri, price } = req.body;

  if (req.isAuthenticated()) {
    const Letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const getHash = (length: number) => {
      let hash = "";

      for (let x = 0; x < length; x++) {
        let rand = Math.floor(Math.random() * 2);

        if (rand == 0) {
          hash += (Math.floor(Math.random() * 9) + 1).toString();
        } else {
          hash += Letters[Math.floor(Math.random() * Letters.length)];
        }
      }
      return hash;
    };

    if (type == "active") {
      const nft_color = nft_colors[Math.floor(Math.random() * 9)];
      const nft_pattern = nft_patterns[Math.floor(Math.random() * 6)];
      const nft_letters = Letters[Math.floor(Math.random() * Letters.length)];
      const nft_traits = `${nft_letters}-${nft_color}-${nft_pattern}`;
      const nft_entity = await nftEntity
        .create({
          current_owner: req.user,
          original_owner: req.user,
          nft_token_id: token_id,
          nft_token_uri: token_uri,
          nft_type: type,
          nft_traits: nft_traits,
          nft_letter: nft_letters,
          nft_color: nft_color,
          nft_pattern: nft_pattern,
          nft_hash: getHash(2),
          nft_stars: 1,
        })
        .save();

      await userTransactionHandle({
        user: req.user,
        description: `Bought Active NFT #${nft_entity.id}`,
        transaction_type: transactionType.MARKET_BUY,
        transaction_currency: transactionCurrency.ETTR,
        transaction_amount: -50,
      });

      return res.status(200).send({
        message: "Active NFT has been minted!",
        success: true,
      });
    }

    if (type == "passive") {
      const requirement = randomRequirement();
      const requirement_array = requirement.split("-");
      const nft_color = [
        "pink",
        "purple",
        "blue",
        "teal",
        "lime",
        "green",
        "yellow",
        "orange",
        "red",
      ][Math.floor(Math.random() * 9)];
      const nft_entity = await nftEntity
        .create({
          current_owner: req.user,
          original_owner: req.user,
          nft_token_id: token_id,
          nft_token_uri: token_uri,
          nft_type: type,
          nft_traits: nft_color,
          nft_color: nft_color,
          nft_hash: getHash(10),
          nft_stars: 1,
          nft_requirement: requirement,
          nft_requirement_1: requirement_array[0] || null,
          nft_requirement_2: requirement_array[1] || null,
          nft_requirement_3: requirement_array[2] || null,
          nft_requirement_4: requirement_array[3] || null,
          nft_requirement_5: requirement_array[4] || null,
          nft_requirement_length: requirement.length,
        })
        .save();

      await userTransactionHandle({
        user: req.user,
        transaction_type: transactionType.MARKET_BUY,
        description: `Bought Passive NFT #${nft_entity.id}`,
        transaction_amount: -5,
        transaction_currency: transactionCurrency.USDC,
      });

      return res.status(200).send({
        message: "Passive NFT has been minted!",
        success: true,
      });
    }
  }
});

nftsRouter.post("/customcreate", async (req: any, res: any, next) => {
  return await nftCreateHandler(req, res, next);
});

nftsRouter.post("/update", async (req: any, res: any, next) => {
  return await nftUpdateHandler(req, res, next);
});

nftsRouter.post("/enforcement", async (req: any, res: any, next) => {
  return await nftEnforcement(req, res, next);
});
