import { nftEntity } from "../../../entity/inventory/nftEntity";
import {
  transactionCurrency,
  transactionType,
} from "../../../entity/user/userTransaction";
import { userTransactionHandle } from "../../user/scripts/handleUserTransactions";
import { randomRequirement } from "../nftsRouter";

export async function nftForgeHandler(req, res) {
  let { type, nft_ids, token_id, token_uri } = req.body;
  let current_star: number = 0;

  if (
    req.user != null &&
    ["active", "passive"].includes(type) &&
    nft_ids.length == 3
  ) {
    let nft_template = {
      current_owner: req.user,
      original_owner: req.user,
      nft_token_id: token_id,
      nft_token_uri: token_uri,
      nft_type: type,
      nft_traits: "",
      nft_hash: "",
      nft_stars: "",
      nft_requirement: null,
    };

    let nft_infos = [];
    let error: boolean = false;

    if (type == "active") {
      for (let i = 0; i < nft_ids.length; i++) {
        const local_query = await nftEntity.findOne({
          where: { id: nft_ids[i], current_owner: req.user.id },
        });
        if (local_query != null) {
          nft_infos.push(local_query);
        } else {
          error = true;
        }
      }

      if (error == false) {
        nft_template.nft_stars = nft_infos[0].nft_stars + 1;

        current_star = Number(nft_template.nft_stars);

        for (let i = 0; i < nft_infos[0].nft_traits.split("-").length; i++) {
          nft_template.nft_traits +=
            [
              nft_infos[0].nft_traits.split("-")[i],
              nft_infos[1].nft_traits.split("-")[i],
              nft_infos[2].nft_traits.split("-")[i],
            ][Math.floor(Math.random() * 3)] + "-";
        }

        nft_template.nft_traits = nft_template.nft_traits.substring(
          0,
          nft_template.nft_traits.length - 1
        );

        let new_hash: string = "";
        for (let i = 0; i < nft_infos[0].nft_hash.length; i++) {
          new_hash += [
            nft_infos[0].nft_hash[i],
            nft_infos[1].nft_hash[i],
            nft_infos[2].nft_hash[i],
          ][Math.floor(Math.random() * 3)];
        }

        nft_template.nft_hash = new_hash;
      }
    }
    if (type == "passive") {
      nft_template.nft_requirement = randomRequirement();
      for (let i = 0; i < nft_ids.length; i++) {
        const local_query = await nftEntity.findOne({
          where: { id: nft_ids[i], current_owner: req.user.id },
        });
        if (local_query != null) {
          nft_infos.push(local_query);
        } else {
          error = true;
        }
      }

      if (error == false) {
        nft_template.nft_stars = nft_infos[0].nft_stars + 1;
        nft_template.nft_traits = [
          nft_infos[0].nft_traits,
          nft_infos[1].nft_traits,
          nft_infos[2].nft_traits,
        ][Math.floor(Math.random() * 3)];

        let new_hash: string = "";
        for (let i = 0; i < nft_infos[0].nft_hash.length; i++) {
          new_hash += [
            nft_infos[0].nft_hash[i],
            nft_infos[1].nft_hash[i],
            nft_infos[2].nft_hash[i],
          ][Math.floor(Math.random() * 3)];
        }

        nft_template.nft_hash = new_hash;
      }
    }

    if (error == true) {
      return res.status(403).send({
        message: "Internal Error.",
        success: false,
      });
    } else {
      const nft_entity = await nftEntity.create(nft_template).save();
      current_star = Number(nft_entity.nft_stars);

      await userTransactionHandle({
        user: req.user,
        transaction_type:
          type == "passive"
            ? transactionType.FORGE_PASSIVE
            : transactionType.FORGE_ACTIVE,
        description: `Forged NFT #${nft_entity.id}`,
        transaction_amount:
          current_star == 2
            ? -100
            : current_star == 3
            ? -200
            : current_star == 4
            ? -300
            : current_star == 5
            ? -500
            : 0,
        transaction_currency: transactionCurrency.ETTR,
      });

      for (let i = 0; i < nft_ids.length; i++) {
        await nftEntity.update(
          { id: nft_ids[i], current_owner: req.user.id },
          { status: "burned" }
        );
      }

      return res.status(200).send({
        message:
          "Forged has been successful. New Item has been minted to your inventory.",
        success: true,
      });
    }
  } else {
    return res.status(403).send({
      message: "Internal Error.",
      success: false,
    });
  }
}
