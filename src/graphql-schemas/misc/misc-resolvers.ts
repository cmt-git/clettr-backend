import { getConnection } from "typeorm";
import { nftEntity } from "../../entity/inventory/nftEntity";
import { userEntity } from "../../entity/user/userEntity";
import { userInfoEntity } from "../../entity/user/userInfoEntity";
import { weeklyHashesEntity } from "../../entity/weekly-hashes/weeklyHashesEntity";

const resolvers = {
  Query: {
    misc: async (parent, args, context) => {
      let json_template = {
        total_players: 0,
        ettr_minted: 0,
        nft_circulation: 0,
        active_hashes: [],
        passive_hashes: [],
      };

      const [user, userCount] = await userEntity.findAndCount();
      const query = await getConnection()
        .getRepository(nftEntity)
        .createQueryBuilder("nft_entity")
        .select(`COUNT(*)`, "total_nfts")
        .where("nft_entity.status is null or nft_entity.status != 'burned'")
        .getRawOne();

      // const ettrCount = await getConnection()
      // .getRepository(userInfoEntity)
      // .createQueryBuilder()
      // .select("SUM(total_gains)", "total")
      // .getRawOne();

      json_template.total_players = userCount;
      json_template.nft_circulation = query["total_nfts"];

      const getHashes = async (type: string) => {
        let query = await getConnection()
          .getRepository(weeklyHashesEntity)
          .createQueryBuilder("weekly_hashes_entity")
          .select("hash")
          .where("hash_type = :value", { value: type })
          .getRawMany();

        let new_arr = [];
        for (let i = 0; i < query.length; i++) {
          new_arr.push(query[i]["hash"]);
        }
        return new_arr;
      };

      json_template.passive_hashes = await getHashes("passive");
      json_template.active_hashes = await getHashes("active");

      //json_template.ettr_minted = ettr["total"];
      return json_template;
    },
  },
};

export default resolvers;
