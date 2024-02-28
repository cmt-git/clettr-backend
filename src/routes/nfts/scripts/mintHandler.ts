import { nftEntity } from "../../../entity/inventory/nftEntity";
import {
  transactionCurrency,
  transactionType,
} from "../../../entity/user/userTransaction";
import { userTransactionHandle } from "../../user/scripts/handleUserTransactions";
import { nft_colors, nft_patterns, randomRequirement } from "../nftsRouter";

export async function mintHandler(req: any, res: any, next) {
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
          nft_requirement_length: requirement_array.length,
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
}
