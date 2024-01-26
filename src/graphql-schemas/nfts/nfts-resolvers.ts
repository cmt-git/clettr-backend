import { getConnection } from "typeorm";
import { nftEntity } from "../../entity/inventory/nftEntity";
import { userEntity } from "../../entity/user/userEntity";
import { userInfoEntity } from "../../entity/user/userInfoEntity";
import { userPlayHistory } from "../../entity/user/userPlayHistory";
import { userSetEntity } from "../../entity/user/userSetEntity";

const resolvers = {
  Query: {
    owned_nfts: async (parent, args, context) => {
      if (context.user != null) {
        const nft_arr: any = [];
        let query: any = null;

        let user_type =
          args.not_user !== true
            ? "(current_owner = :value or current_owner.username = :value)"
            : "(current_owner != :value)";

        if (args.filters == null) {
          query = await getConnection()
            .getRepository(nftEntity)
            .createQueryBuilder("nft_entity")
            .leftJoinAndSelect("nft_entity.current_owner", "current_owner")
            .leftJoinAndSelect("nft_entity.original_owner", "original_owner")
            .where(
              `${user_type} and (nft_entity.status != 'burned' or nft_entity.status is null)`,
              { value: args.username != null ? args.username : context.user.id }
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
                  value:
                    args.username != null ? args.username : context.user.id,
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
                  value:
                    args.username != null ? args.username : context.user.id,
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
              query[i].market_info != null
                ? query[i].market_info.toString()
                : "",
          });
        }

        return { inventory_nfts: nft_arr };
      } else {
        return null;
      }
    },
    user_set: async (parent, args, context) => {
      if (context.user != null) {
        const nft_arr = [];
        const query = await getConnection()
          .getRepository(userSetEntity)
          .createQueryBuilder("user_set_entity")
          .leftJoin("user_set_entity.user_id", "user_id")
          .leftJoinAndSelect("user_set_entity.set_1", "set_1")
          .leftJoinAndSelect("set_1.original_owner", "set_1_original_owner")
          .leftJoinAndSelect("user_set_entity.set_2", "set_2")
          .leftJoinAndSelect("set_2.original_owner", "set_2_original_owner")
          .leftJoinAndSelect("user_set_entity.set_3", "set_3")
          .leftJoinAndSelect("set_3.original_owner", "set_3_original_owner")
          .leftJoinAndSelect("user_set_entity.set_4", "set_4")
          .leftJoinAndSelect("set_4.original_owner", "set_4_original_owner")
          .leftJoinAndSelect("user_set_entity.set_5", "set_5")
          .leftJoinAndSelect("set_5.original_owner", "set_5_original_owner")
          .where("user_id = :id", { id: context.user.id })
          .getOne();

        const keys = Object.keys(query);
        for (let i = 0; i < keys.length; i++) {
          if (i > 0 && keys[i].split("_")[0] == "set") {
            if (query[keys[i]] != null) {
              console.log(query[keys[i]]);
              nft_arr.push({
                id: Number(query[keys[i]].id),
                current_owner: context.user.username,
                original_owner: query[keys[i]].original_owner.username,
                creation_date: query[keys[i]].creation_date.toString(),
                nft_parent_token_id: query[keys[i]].nft_parent_token_id,
                nft_token_id: query[keys[i]].nft_token_id,
                nft_token_uri: query[keys[i]].nft_token_uri,
                nft_type: query[keys[i]].nft_type.toString(),
                nft_traits: query[keys[i]].nft_traits.toString(),
                nft_hash: query[keys[i]].nft_hash.toString(),
                nft_stars: Number(query[keys[i]].nft_stars),
                nft_requirement:
                  query[keys[i]].nft_requirement != null
                    ? query[keys[i]].nft_requirement.toString()
                    : "",
                status:
                  query[keys[i]].status != null
                    ? query[keys[i]].status.toString()
                    : "",
                market_info:
                  query[keys[i]].market_info != null
                    ? query[keys[i]].market_info.toString()
                    : "",
              });
            }
          }
        }

        return { user_set: nft_arr };
      } else {
        return null;
      }
    },
    market_nfts: async (parent, args, context) => {
      const nft_arr: any = [];
      let query: any = null;

      query = await getConnection()
        .getRepository(nftEntity)
        .createQueryBuilder("nft_entity")
        .select(`COUNT(*)`, "total_market_active_nfts")
        .where(
          "nft_entity.nft_type = :value and nft_entity.status = 'market_sell'",
          { value: "active" }
        )
        .getRawOne();

      let total_active_nfts = query["total_market_active_nfts"];

      query = await getConnection()
        .getRepository(nftEntity)
        .createQueryBuilder("nft_entity")
        .select(`COUNT(*)`, "total_market_passive_nfts")
        .where(
          "nft_entity.nft_type = :value and nft_entity.status = 'market_sell'",
          { value: "passive" }
        )
        .getRawOne();

      let total_passive_nfts = query["total_market_passive_nfts"];

      query = await getConnection()
        .getRepository(nftEntity)
        .createQueryBuilder("nft_entity")
        .leftJoinAndSelect("nft_entity.current_owner", "current_owner")
        .leftJoinAndSelect("nft_entity.original_owner", "original_owner")
        .where("nft_entity.status = 'market_sell'")
        .offset(!args.page ? 0 : (args.page - 1) * 10)
        .limit(30)
        .orderBy("nft_entity.id", "DESC")
        .getMany();

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

      return {
        market_nfts: nft_arr,
        active_nfts: total_active_nfts,
        passive_nfts: total_passive_nfts,
      };
    },
    user_play_history_query: async (parent, args, context) => {
      if (context.user != null) {
        const query = await getConnection()
          .getRepository(userPlayHistory)
          .createQueryBuilder("user_play_history")
          .leftJoin("user_play_history.user_id", "user_id")
          .leftJoinAndSelect("user_play_history.node", "node")
          .leftJoinAndSelect("user_play_history.set_1", "set_1")
          .leftJoinAndSelect("user_play_history.set_2", "set_2")
          .leftJoinAndSelect("user_play_history.set_3", "set_3")
          .leftJoinAndSelect("user_play_history.set_4", "set_4")
          .leftJoinAndSelect("user_play_history.set_5", "set_5")
          .addSelect("user_play_history.words_cracked")
          .addSelect("user_play_history.rounds")
          .addSelect("user_play_history.total_boost")
          .addSelect("user_play_history.final_difficulty")
          .addSelect("user_play_history.reward")
          .where("user_id.id = :value", { value: context.user.id })
          .offset(!args.page ? 0 : (args.page - 1) * 10)
          .limit(15)
          .orderBy("user_play_history.id", "DESC")
          .getMany();

        let data = [];
        for (let i = 0; i < query.length; i++) {
          data.push({
            match_nfts: [
              query[i]["node"],
              query[i]["set_1"],
              query[i]["set_2"],
              query[i]["set_3"],
              query[i]["set_4"],
              query[i]["set_5"],
            ],
            date: query[i].time_registered,
            words_cracked: query[i].words_cracked,
            rounds: query[i].rounds,
            total_boost: query[i].total_boost,
            final_difficulty: query[i].final_difficulty,
            reward: query[i].reward,
          });
        }

        console.log(data);
        return {
          user_play_history: data,
        };
      }
    },
  },
};

export default resolvers;
