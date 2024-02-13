import { getConnection } from "typeorm";
import { nftEntity } from "../../../entity/inventory/nftEntity";

export async function getNFTHandler(parent, args, context) {
  if (context.user) {
    if (typeof args.id == "number") {
      const nft: any = await getConnection()
        .getRepository(nftEntity)
        .createQueryBuilder("nft_entity")
        .leftJoinAndSelect("nft_entity.current_owner", "current_owner")
        .leftJoinAndSelect("nft_entity.original_owner", "original_owner")
        .where("nft_entity.nft_token_id = :id", { id: args.id })
        .getOne();

      if (nft) {
        nft["current_owner"] = nft.current_owner.username.toString();
        nft["original_owner"] = nft.original_owner.username.toString();
      }

      return nft;
    }
  }

  return null;
}
