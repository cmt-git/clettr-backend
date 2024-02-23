import { createConnection } from "net";
import { getConnection } from "typeorm";
import { nftEntity } from "../../../entity/inventory/nftEntity";
import { userEntity } from "../../../entity/user/userEntity";
import { Hash } from "crypto";
import { adminLogsEntity } from "../../../entity/user/adminLogsEntity";
import { nft_colors, nft_patterns } from "../nftsRouter";
import { LetterArray } from "../../hashes/hashesRouter";

export async function nftCreateHandler(req: any, res: any, next) {
  const {
    nft_owner_username,
    nft_type,
    nft_token_id,
    nft_hash,
    nft_req,
    nft_traits,
    nft_stars,
  } = req.body;

  if (req.isAuthenticated() && req.user.roles == "admin") {
    const user = await getConnection()
      .getRepository(userEntity)
      .createQueryBuilder("user_entity")
      .where("user_entity.username = :username", {
        username: nft_owner_username,
      })
      .getOne();

    if (user) {
      try {
        const nft_req_array = nft_req.split("-");
        const nft_traits_split = nft_traits.split("-");

        let nft_color = "";
        let nft_pattern = "";
        let nft_letter = "";

        for (const trait of nft_traits_split) {
          if (nft_colors.includes(trait)) {
            nft_color = trait;
          }

          if (nft_patterns.includes(trait)) {
            nft_pattern = trait;
          }

          if (LetterArray.includes(trait)) {
            nft_letter = trait;
          }
        }

        let nft = await nftEntity
          .create({
            current_owner: user,
            original_owner: user,
            nft_token_id: nft_token_id,
            nft_token_uri: nft_hash,
            nft_type: nft_type,
            nft_traits: nft_traits,
            nft_color: nft_color,
            nft_pattern: nft_pattern,
            nft_letter: nft_letter,
            nft_hash: nft_hash.toUpperCase(),
            nft_stars: nft_stars,
            nft_requirement: nft_req,
            nft_requirement_1: nft_req_array[0] || null,
            nft_requirement_2: nft_req_array[1] || null,
            nft_requirement_3: nft_req_array[2] || null,
            nft_requirement_4: nft_req_array[3] || null,
            nft_requirement_5: nft_req_array[4] || null,
            nft_requirement_length: nft_req.split("-").length,
          })
          .save();

        await adminLogsEntity
          .create({
            description: `${req.user.username} created NFT with token id ${nft_token_id}.`,
          })
          .save();

        return res.status(200).send({
          success: true,
          message: "Successfully created NFT.",
        });
      } catch (e) {
        return res.status(200).send({
          success: false,
          message: e.message,
        });
      }
    } else {
      return res.status(200).send({
        success: false,
        message: "User not found.",
      });
    }
  } else {
    return res.status(200).send({
      success: false,
      message: "Not successful.",
    });
  }
}
