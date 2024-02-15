import { getConnection } from "typeorm";
import { nftEntity } from "../../../entity/inventory/nftEntity";

export async function ownedNFTsHandle(parent, args, context) {
  if (context.user != null) {
    const nft_arr: any = [];
    let query: any = null;

    let user_type =
      args.not_user !== true
        ? "(current_owner = :value or current_owner.username = :value)"
        : //"(current_owner.username = :username and current_owner is not :value)";
          "(current_owner != :value)";
    //"()";

    if (args.filters == null) {
      query = await getConnection()
        .getRepository(nftEntity)
        .createQueryBuilder("nft_entity")
        .leftJoinAndSelect("nft_entity.current_owner", "current_owner")
        .leftJoinAndSelect("nft_entity.original_owner", "original_owner")
        .where(
          `${user_type} and (nft_entity.status != 'burned' or nft_entity.status is null)`,
          { value: context.user.id, username: args.username }
        )
        .offset(!args.page ? 0 : (args.page - 1) * 10)
        .limit(30)
        .orderBy("nft_entity.id", "DESC")
        .getMany();
    } else {
      const filter_type = args.filters.split("-")[0];
      const filter_stars =
        args.filters.split("-").length > 1
          ? `and (nft_entity.nft_stars = ${args.filters.split("-")[1]})`
          : "";

      if (filter_type == "active") {
        //? -> this is a temporary patch
        query = await getConnection()
          .getRepository(nftEntity)
          .createQueryBuilder("nft_entity")
          .leftJoinAndSelect("nft_entity.current_owner", "current_owner")
          .leftJoinAndSelect("nft_entity.original_owner", "original_owner")
          .where(
            `${user_type} and (nft_entity.status != 'burned' or nft_entity.status is null) and (nft_entity.nft_type = 'active') ${filter_stars}`,
            {
              value: context.user.id,
              username: args.username,
            }
          )
          .offset(!args.page ? 0 : (args.page - 1) * 10)
          .limit(30)
          .orderBy("nft_entity.id", "DESC")
          .getMany();
      }

      if (filter_type == "passive") {
        //? -> this is a temporary patch
        query = await getConnection()
          .getRepository(nftEntity)
          .createQueryBuilder("nft_entity")
          .leftJoinAndSelect("nft_entity.current_owner", "current_owner")
          .leftJoinAndSelect("nft_entity.original_owner", "original_owner")
          .where(
            `${user_type} and (nft_entity.status != 'burned' or nft_entity.status is null) and (nft_entity.nft_type = 'passive') ${filter_stars}`,
            {
              value: context.user.id,
              username: args.username,
            }
          )
          .offset(!args.page ? 0 : (args.page - 1) * 10)
          .limit(30)
          .orderBy("nft_entity.id", "DESC")
          .getMany();
      }
    }

    //? sync null filters to variables with default: null on nftEntity
    for (let i = 0; i < query.length; i++) {
      nft_arr.push({
        id: Number(query[i].id),
        current_owner: query[i].current_owner.username,
        original_owner: query[i].original_owner.username,
        creation_date: query[i].creation_date.toString(),
        nft_parent_token_id: query[i].nft_parent_token_id,
        nft_token_id: query[i].nft_token_id,
        nft_token_uri: query[i].nft_token_uri,
        nft_type: query[i].nft_type.toString(),
        nft_traits: query[i].nft_traits.toString(),
        nft_hash: query[i].nft_hash.toString(),
        nft_stars: Number(query[i].nft_stars),
        nft_requirement:
          query[i].nft_requirement != null
            ? query[i].nft_requirement.toString()
            : "",
        status: query[i].status != null ? query[i].status.toString() : "",
        market_info:
          query[i].market_info != null ? query[i].market_info.toString() : "",
      });
    }

    return { inventory_nfts: nft_arr };
  } else {
    return null;
  }
}
