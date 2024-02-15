import { getConnection } from "typeorm";
import { userInfoEntity } from "../../../entity/user/userInfoEntity";

export async function userInfosHandler(parent, args, context) {
  console.log(context.user, context.user.roles);
  if (context.user !== undefined && context.user.roles == "admin") {
    const current_user_info = await getConnection()
      .getRepository(userInfoEntity)
      .createQueryBuilder("user_info")
      .leftJoinAndSelect("user_info.user_id", "user_id")
      .where(
        "user_id.account_approved = false and user_id.username is not null and user_id.email is not null"
      )
      .orderBy("user_info.user_id", "ASC")
      .offset(!args.page ? 0 : (args.page - 1) * 25)
      .limit(25)
      .getMany();

    for (let i = 0; i < current_user_info.length; i++) {
      current_user_info[i]["username"] =
        current_user_info[i]["user_id"]["username"];
    }

    // let query = await getConnection()
    //   .getRepository(nftEntity)
    //   .createQueryBuilder("nft_entity")
    //   .select(`COUNT(*)`, "total_active_nfts")
    //   .where(
    //     "nft_entity.nft_type = :value and nft_entity.current_owner = :id and (nft_entity.status is null or nft_entity.status != 'burned')",
    //     { value: "active", id: context.user.id }
    //   )
    //   .getRawOne();

    // json_template.active_nfts = query["total_active_nfts"]; //? need -1 here for some reason

    // query = await getConnection()
    //   .getRepository(nftEntity)
    //   .createQueryBuilder("nft_entity")
    //   .select(`COUNT(*)`, "total_passive_nfts")
    //   .where(
    //     "nft_entity.nft_type = :value and nft_entity.current_owner = :id and (nft_entity.status is null or nft_entity.status != 'burned')",
    //     { value: "passive", id: context.user.id }
    //   )
    //   .getRawOne();

    // json_template.passive_nfts = query["total_passive_nfts"]; //? need -1 here for some reason

    // query = await getConnection()
    //   .getRepository(nftEntity)
    //   .createQueryBuilder("nft_entity")
    //   .leftJoinAndSelect("nft_entity.current_owner", "current_owner")
    //   .select(`COUNT(*)`, "total_active_nfts")
    //   .where(
    //     "current_owner.bsc_address = :value and nft_entity.nft_type = 'active'",
    //     { value: context.user.bsc_address }
    //   )
    //   .getRawOne();
    // const total_active_nfts = query.total_active_nfts;

    // //! WARNING : THIS IS VERY IMPORTANT PLEASE SYNC THIS CLIENT-SIDE
    // json_template.max_energy = 3; //? DEFAULT VALUE

    // if (total_active_nfts >= 20) {
    //   json_template.max_energy = 5;
    // }

    // if (total_active_nfts >= 40) {
    //   json_template.max_energy = 8;
    // }

    // if (total_active_nfts >= 65) {
    //   json_template.max_energy = 12;
    // }

    // if (total_active_nfts >= 80) {
    //   json_template.max_energy = 15;
    // }

    // if (current_user_info.refill_energy) {
    //   json_template.current_energy = json_template.max_energy;

    //   await getConnection()
    //     .getRepository(userInfoEntity)
    //     .createQueryBuilder("user_info_entity")
    //     .update(userInfoEntity)
    //     .set({
    //       current_energy: json_template.max_energy,
    //       refill_energy: false,
    //     })
    //     .where("user_info_entity.user_id = :value", {
    //       value: context.user.id,
    //     })
    //     .execute();
    // }

    // return json_template;
    return current_user_info;
  } else {
    return null;
  }
}
