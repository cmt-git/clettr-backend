import { getConnection } from "typeorm";
import { userPlayHistory } from "../../../entity/user/userPlayHistory";

export async function userPlayHistoryQueryHandler(parent, args, context) {
  if (context.user != null) {
    let query: any = await getConnection()
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
      .where("user_id.id = :value", { value: context.user.id });

    if (args.filter == "Search by Earnings") {
      query.addOrderBy("user_play_history.reward", "DESC");
    }

    if (args.filter == "Search by Words Cracked") {
      query.addOrderBy("user_play_history.words_cracked", "DESC");
    }

    if (args.filter == "Search by Difficulty") {
      query.addOrderBy("user_play_history.final_difficulty", "DESC");
    }

    query = query.offset(!args.page ? 0 : (args.page - 1) * 10).limit(15);

    if (args.filter === "Search by Oldest Times") {
      query.addOrderBy("user_play_history.id", "ASC");
    } else {
      query.addOrderBy("user_play_history.id", "DESC");
    }

    query = await query.getMany();

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

    return {
      user_play_history: data,
    };
  }
}
