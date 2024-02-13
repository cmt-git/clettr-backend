import { getConnection } from "typeorm";
import { userEntity } from "../../../entity/user/userEntity";
import { nftEntity } from "../../../entity/inventory/nftEntity";
import { adminLogsEntity } from "../../../entity/user/adminLogsEntity";

export async function nftEnforcement(req: any, res: any, next) {
  const { nft_token_id } = req.body;

  if (req.isAuthenticated() && req.user.roles == "admin") {
    let nft = await getConnection()
      .getRepository(nftEntity)
      .createQueryBuilder("nft_entity")
      .where({
        nft_token_id: nft_token_id,
      })
      .getOne();

    if (nft) {
      await getConnection()
        .getRepository(nftEntity)
        .createQueryBuilder("nft_entity")
        .update({
          status: nft.status != "burned" ? "burned" : null,
        })
        .where({
          nft_token_id: nft_token_id,
        })
        .execute();

      await adminLogsEntity
        .create({
          description: `${req.user.username} ${
            nft.status != "burned" ? "soft deleted" : "recovered"
          } NFT with token id ${nft_token_id}.`,
        })
        .save();

      return res.status(200).send({
        success: true,
        message: "Successfully updated NFT.",
      });
    } else {
      return res.status(200).send({
        success: false,
        message: "Cannot find NFT.",
      });
    }
  } else {
    return res.status(200).send({
      success: false,
      message: "Not successful.",
    });
  }
}
