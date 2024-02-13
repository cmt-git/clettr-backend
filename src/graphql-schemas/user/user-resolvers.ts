import { getConnection } from "typeorm";
import { nftEntity } from "../../entity/inventory/nftEntity";
import { userEntity } from "../../entity/user/userEntity";
import { userInfoEntity } from "../../entity/user/userInfoEntity";
import { userPlayHistory } from "../../entity/user/userPlayHistory";
import { userTransactionResolver } from "./scripts/user_transaction_entity_resolver";
import { userTransactionTotal } from "./scripts/user_transactions_total";
import { AdminLogsEntityResolver } from "./scripts/admin_logs_entity_resolver";
import { userInfosHandler } from "./scripts/userInfosHandler";

const resolvers = {
  Query: {
    user: async (parent, args, context) => {
      if (context.user !== undefined) {
        let currentUser: any = null;
        if (
          args.username != undefined &&
          args.username !== null &&
          args.username !== "" &&
          args.username.length <= 16
        ) {
          const query_user = await userEntity.findOne({
            where: { username: args.username },
          });
          if (query_user === undefined) {
            return null;
          } else {
            currentUser = query_user;
            currentUser.bsc_address = "";
            currentUser.email = "";
            currentUser._2fa_enabled = false;
          }
        } else {
          currentUser = context.user;
          currentUser._2fa_enabled = context.user.qr_code !== null;
        }

        return currentUser;
      } else {
        return null;
      }
    },
    user_info: async (parent, args, context) => {
      if (context.user !== undefined) {
        let json_template = {
          current_energy: 0,
          max_energy: 0,
          unclaimed_ettr: 0,
          nfts_sold: 0,
          active_nfts: 0,
          passive_nfts: 0,
          facebook_handle: null,
          instagram_handle: null,
          twitter_handle: null,
          tiktok_handle: null,
          youtube_channel: null,
          username_change_time: null,
          node_used: "",
        };

        const current_user_info = await getConnection()
          .getRepository(userInfoEntity)
          .createQueryBuilder("user_info")
          .leftJoinAndSelect("user_info.user_id", "user_id")
          .where("user_id.bsc_address = :value", {
            value: context.user.bsc_address,
          })
          .getOne();

        json_template.current_energy = current_user_info.current_energy;
        json_template.unclaimed_ettr = current_user_info.unclaimed_ettr;
        json_template.nfts_sold = current_user_info.nfts_sold;
        json_template.facebook_handle = current_user_info.facebook_handle;
        json_template.instagram_handle = current_user_info.instagram_handle;
        json_template.twitter_handle = current_user_info.twitter_handle;
        json_template.tiktok_handle = current_user_info.tiktok_handle;
        json_template.youtube_channel = current_user_info.youtube_channel;
        json_template.username_change_time =
          current_user_info.username_change_time;
        json_template.node_used = current_user_info.node_used;

        let query = await getConnection()
          .getRepository(nftEntity)
          .createQueryBuilder("nft_entity")
          .select(`COUNT(*)`, "total_active_nfts")
          .where(
            "nft_entity.nft_type = :value and nft_entity.current_owner = :id and (nft_entity.status is null or nft_entity.status != 'burned')",
            { value: "active", id: context.user.id }
          )
          .getRawOne();

        json_template.active_nfts = query["total_active_nfts"]; //? need -1 here for some reason

        query = await getConnection()
          .getRepository(nftEntity)
          .createQueryBuilder("nft_entity")
          .select(`COUNT(*)`, "total_passive_nfts")
          .where(
            "nft_entity.nft_type = :value and nft_entity.current_owner = :id and (nft_entity.status is null or nft_entity.status != 'burned')",
            { value: "passive", id: context.user.id }
          )
          .getRawOne();

        json_template.passive_nfts = query["total_passive_nfts"]; //? need -1 here for some reason

        query = await getConnection()
          .getRepository(nftEntity)
          .createQueryBuilder("nft_entity")
          .leftJoinAndSelect("nft_entity.current_owner", "current_owner")
          .select(`COUNT(*)`, "total_active_nfts")
          .where(
            "current_owner.bsc_address = :value and nft_entity.nft_type = 'active'",
            { value: context.user.bsc_address }
          )
          .getRawOne();
        const total_active_nfts = query.total_active_nfts;

        //! WARNING : THIS IS VERY IMPORTANT PLEASE SYNC THIS CLIENT-SIDE
        json_template.max_energy = 3; //? DEFAULT VALUE

        if (total_active_nfts >= 20) {
          json_template.max_energy = 5;
        }

        if (total_active_nfts >= 40) {
          json_template.max_energy = 8;
        }

        if (total_active_nfts >= 65) {
          json_template.max_energy = 12;
        }

        if (total_active_nfts >= 80) {
          json_template.max_energy = 15;
        }

        if (current_user_info.refill_energy) {
          json_template.current_energy = json_template.max_energy;

          await getConnection()
            .getRepository(userInfoEntity)
            .createQueryBuilder("user_info_entity")
            .update(userInfoEntity)
            .set({
              current_energy: json_template.max_energy,
              refill_energy: false,
            })
            .where("user_info_entity.user_id = :value", {
              value: context.user.id,
            })
            .execute();
        }

        return json_template;
      } else {
        return null;
      }
    },
    user_earnings_query: async (parent, args, context) => {
      if (context.user !== undefined) {
        const query = await getConnection()
          .getRepository(userPlayHistory)
          .createQueryBuilder("user_play_history")
          .leftJoin("user_play_history.user_id", "user_id")
          .select(`SUM(user_play_history.reward)`, "reward")
          .addSelect("date(user_play_history.time_registered)", "day")
          .where("user_id.id = :value", { value: context.user.id })
          .groupBy("day")
          .limit(50)
          .getRawMany();

        return {
          user_earnings: query,
        };
      } else {
        return null;
      }
    },
    user_transactions: async (parent, args, context) => {
      return await userTransactionResolver(parent, args, context);
    },
    user_transactions_total: async (parent, args, context) => {
      return await userTransactionTotal(parent, args, context);
    },
    user_infos: async (parent, args, context) => {
      return await userInfosHandler(parent, args, context);
    },
    admin_logs_entity: async (parent, args, context) => {
      return await AdminLogsEntityResolver(parent, args, context);
    },
  },
};

export default resolvers;
