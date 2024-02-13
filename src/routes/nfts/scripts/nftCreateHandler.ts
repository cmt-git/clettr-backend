import { createConnection } from "net";
import { getConnection } from "typeorm";
import { nftEntity } from "../../../entity/inventory/nftEntity";
import { userEntity } from "../../../entity/user/userEntity";
import { Hash } from "crypto";
import { adminLogsEntity } from "../../../entity/user/adminLogsEntity";

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

    console.log(user, nft_owner_username);
    if (user) {
      try {
        let nft = await nftEntity
          .create({
            current_owner: user,
            original_owner: user,
            nft_token_id: nft_token_id,
            nft_token_uri: nft_hash,
            nft_type: nft_type,
            nft_traits: nft_traits,
            nft_hash: nft_hash.toUpperCase(),
            nft_stars: nft_stars,
            nft_requirement: nft_req,
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
