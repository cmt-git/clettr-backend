import express, { Router } from "express";
import * as fs from "fs";
import path from "path";
import { getConnection } from "typeorm";
import { nftEntity } from "../../entity/inventory/nftEntity";
import { userInfoEntity } from "../../entity/user/userInfoEntity";
import { userPlayHistory } from "../../entity/user/userPlayHistory";
import { userSetEntity } from "../../entity/user/userSetEntity";
import { weeklyHashesEntity } from "../../entity/weekly-hashes/weeklyHashesEntity";
import {
  transactionCurrency,
  transactionType,
  userTransactionEntity,
} from "../../entity/user/userTransaction";
import { userTransactionHandle } from "../user/scripts/handleUserTransactions";

const playRouter = Router();
playRouter.use(express.json());
export default playRouter;

//! !!!!! - SYNC THIS WITH FRONTEND @ comparedHash.tsx - !!!!! ⤵
const getComparedHash = async (current_hash: string, type: any) => {
  //? front end implementation
  //const hash_set = type == "active" ? store.getState().queryState.value.misc.active_hashes :  store.getState().queryState.value.misc.passive_hashes;
  const weeklyHashSet = await weeklyHashesEntity.find({
    where: { hash_type: type },
  });

  const hash_set = [];
  for (let i = 0; i < weeklyHashSet.length; i++) {
    hash_set.push(weeklyHashSet[i].hash);
  }

  let compared_hash = "----------";
  let points = 0;
  for (let i = 0; i < hash_set.length; i++) {
    let current_points = 0;
    let char_arr = [];

    for (let x = 0; x < hash_set[i].length; x++) {
      if (hash_set[i][x] == current_hash[x]) {
        current_points += 5; //? Sync node boost constant with backend
      }
      char_arr.push(hash_set[i][x]);
    }

    if (current_points == 0) {
      for (let x = 0; x < char_arr.length; x++) {
        if (char_arr.includes(current_hash[x])) {
          let start_index = char_arr.indexOf(current_hash[x]);
          char_arr.splice(start_index, 1);
          current_points += 2.5;
        }
      }
    }

    if (current_points > points) {
      points = current_points;
      compared_hash = hash_set[i];
    }
  }

  return compared_hash;
};

const calculateActiveBoost = async (hash: string) => {
  const hash_set = await getComparedHash(hash, "active");

  const partner_hashes = [];
  let points = 0;
  let exclude = [];
  for (let x = 0; x < hash_set.length / 2; x++) {
    partner_hashes.push(hash.substring(x * 2, x * 2 + 2));
    if (
      hash.substring(x * 2, x * 2 + 2) == hash_set.substring(x * 2, x * 2 + 2)
    ) {
      points += 10;
      exclude.push(x);
    }
  }

  for (let x = 0; x < partner_hashes.length; x++) {
    if (exclude.includes(x) == false) {
      const current_item_index = partner_hashes[x];
      let first_letter_no_match: boolean = true;
      let second_letter_no_match: boolean = true;
      let char_arr = [];

      //? load characters from hash
      for (let i = 0; i < hash_set.length; i++) {
        char_arr.push(hash_set[i]);
      }

      //? compare selected ItemIndex to hash character one by one
      for (let k = 0; k < current_item_index.length; k++) {
        for (let i = 0; i < char_arr.length; i++) {
          if (current_item_index[k] == char_arr[i]) {
            let start_index = char_arr.indexOf(current_item_index[k]);
            char_arr.splice(start_index, 1);
            points += 2.5;

            if (k == 0) {
              first_letter_no_match = false;
            } else {
              second_letter_no_match = false;
            }
            break;
          }
        }
      }
      if (first_letter_no_match) {
        points += 1;
      }
      if (second_letter_no_match) {
        points += 1;
      }
    }
  }

  return (() => {
    let not_full: boolean = false;
    for (let i = 0; i < hash.length; i++) {
      if (hash[i] == "-") {
        not_full = true;
      }
    }
    return not_full == false;
  })()
    ? points
    : 1;
};

const calculatePassiveBoost = async (hash: string) => {
  const type: any = "passive";
  const weeklyHashSet = await weeklyHashesEntity.find({
    where: { hash_type: type },
  });
  const passive_hash_set = [];
  for (let i = 0; i < weeklyHashSet.length; i++) {
    passive_hash_set.push(weeklyHashSet[i].hash);
  }
  let points = 0;

  for (let i = 0; i < passive_hash_set.length; i++) {
    let current_points = 0;
    for (let x = 0; x < passive_hash_set[i].length; x++) {
      if (passive_hash_set[i][x] == hash[x]) {
        current_points += 5; //? Sync node boost constant with front @ compareHash.tsx
      }
    }
    if (current_points > points) {
      points = current_points;
    }
  }

  if (points == 0) {
    points = 1;
  }
  return points;
};
//! !!!!! - SYNC THIS WITH FRONTEND @ compareHash.tsx - !!!!! ⤴

const calculateRewards = async (json: any) => {
  const words = fs
    .readFileSync(path.join(__dirname, "/words_alpha.txt"), "utf8")
    .split("\n");

  const set_letters = json.set_letters;
  const node = json.node;
  const initial_boost_value =
    (await calculateActiveBoost(json.set_hash)) +
    (await calculatePassiveBoost(node.nft_hash));
  const boost = (initial_boost_value / 10) * (initial_boost_value / 100);

  const ettr_per_round =
    node.nft_stars == 1
      ? 0.06
      : node.nft_stars == 2
      ? 0.15
      : node.nft_stars == 3
      ? 0.24
      : node.nft_stars == 4
      ? 0.36
      : node.nft_stars == 5
      ? 0.6
      : 0;
  const active_boost: number = (() => {
    let total_boost = 0;
    for (let i = 0; i < json.set.length; i++) {
      total_boost +=
        json.set[i].nft_stars == 1
          ? 0.06
          : json.set[i].nft_stars == 2
          ? 0.18
          : json.set[i].nft_stars == 3
          ? 0.264
          : json.set[i].nft_stars == 4
          ? 0.42
          : json.set[i].nft_stars == 5
          ? 0.52
          : 0;
    }
    return total_boost;
  })();

  //? this is the extra rand letter.
  const letters = "abcdefghijklmnopqrstuvxyz";
  const rand_letter = letters[Math.floor(Math.random() * letters.length)];

  const letter_set =
    node.nft_traits == "pink"
      ? ["a", "b", "c", "d"]
      : node.nft_traits == "purple"
      ? ["d", "e", "f", "g"]
      : node.nft_traits == "blue"
      ? ["g", "h", "i", "j"]
      : node.nft_traits == "teal"
      ? ["j", "k", "l", "m"]
      : node.nft_traits == "lime"
      ? ["m", "n", "o", "p"]
      : node.nft_traits == "green"
      ? ["p", "q", "r", "s"]
      : node.nft_traits == "yellow"
      ? ["s", "t", "u", "v"]
      : node.nft_traits == "orange"
      ? ["v", "w", "x", "y"]
      : node.nft_traits == "red"
      ? ["y", "z", "a", "b"]
      : null;

  const word_index: any = [];
  const picked_words: any = [];

  while (word_index.length < 100) {
    const rand = Math.floor(Math.random() * words.length);

    if (
      word_index.includes(rand) == false &&
      [...letter_set, rand_letter].includes(words[rand][0].toLowerCase()) &&
      words[rand].length >= 6
    ) {
      picked_words.push(words[rand].substring(0, words[rand].length - 1));
      word_index.push(rand);
    }
  }

  let rounds = 0;
  let threshold = 1;
  let cracked = 0;
  let cracked_words = [];

  for (let i = 0; i < picked_words.length; i++) {
    rounds++;

    let letters_cracked = 0;
    for (let x = 0; x < picked_words[i].length - 1; x++) {
      for (let z = 0; z < set_letters.length; z++) {
        if (
          set_letters[z].toLowerCase() == picked_words[i][x + 1].toLowerCase()
        ) {
          letters_cracked++;
        }

        if (letters_cracked >= threshold) {
          cracked++;
          cracked_words.push(picked_words[i]);
          break;
        }
      }
      if (letters_cracked >= threshold) {
        break;
      }
    }
    if (cracked > 2 && threshold != 2) {
      threshold = 2;
    }

    if (cracked > 5 && threshold != 3) {
      threshold = 3;
    }

    if (cracked > 8 && threshold != 4) {
      threshold = 4;
    }
    if (cracked > 12 && threshold != 5) {
      threshold = 5;
    }
  }

  const ettr_reward: number = cracked * ettr_per_round;
  const reward_boost: number = ettr_per_round * active_boost * cracked;
  const reward: number =
    (ettr_reward + reward_boost + (ettr_reward + reward_boost)) * boost;

  await userPlayHistory
    .create({
      user_id: json.user,
      node: node,
      set_1: json.set[0],
      set_2: json.set[1],
      set_3: json.set[2],
      set_4: json.set[3],
      set_5: json.set[4],
      words_cracked: (() => {
        let all_words: any = "";
        for (let i = 0; i < cracked_words.length; i++) {
          all_words += cracked_words[i] + "-";
        }
        return all_words;
      })(),
      rounds: rounds,
      total_boost: initial_boost_value,
      final_difficulty: threshold,
      reward: reward,
    })
    .save();

  if (node.current_owner.id == json.user.id) {
    const reward_amount = reward * 1;
    await getConnection()
      .getRepository(userInfoEntity)
      .createQueryBuilder("user_info_entity")
      .leftJoin("user_info_entity.user_id", "user_id")
      .update(userInfoEntity)
      .set({ unclaimed_ettr: () => `unclaimed_ettr + ${reward_amount}` })
      .where("user_id.id = :value", { value: json.user.id })
      .execute();

    await userTransactionHandle({
      user: json.user.id,
      transaction_type: transactionType.PLAY,
      description: `Play Reward: ${reward_amount}`,
      transaction_amount: Number(reward_amount),
      transaction_currency: transactionCurrency.ETTR,
    });
  } else {
    await getConnection()
      .getRepository(userInfoEntity)
      .createQueryBuilder("user_info_entity")
      .leftJoin("user_info_entity.user_id", "user_id")
      .update(userInfoEntity)
      .set({
        unclaimed_ettr: () => `unclaimed_ettr + ${Number(reward * 0.95)}`,
      })
      .set({ node_used: json.user_info.node_used + node.id + "-" })
      .where("user_id.id = :value", { value: json.user.id })
      .execute();

    await userTransactionHandle({
      user: json.user.id,
      transaction_type: transactionType.PLAY,
      description: `Play Reward: ${reward * 0.95}`,
      transaction_amount: Number(reward * 0.95),
      transaction_currency: transactionCurrency.ETTR,
    });

    await getConnection()
      .getRepository(userInfoEntity)
      .createQueryBuilder("user_info_entity")
      .leftJoin("user_info_entity.user_id", "user_id")
      .update(userInfoEntity)
      .set({ unclaimed_ettr: () => `unclaimed_ettr + ${reward * 0.05}` })
      .where("user_id.id = :value", { value: node.current_owner.id })
      .execute();

    await userTransactionHandle({
      user: json.user.id,
      transaction_type: transactionType.COMMUNITY,
      description: `Play Reward: ${reward * 0.05}`,
      transaction_amount: Number(reward * 0.05),
      transaction_currency: transactionCurrency.ETTR,
    });
  }

  return {
    words_cracked: cracked_words,
    total_reward: reward,
    rounds: rounds,
    final_difficulty: threshold,
  };
};

playRouter.post("/", async (req: any, res: any, next) => {
  let { node_id } = req.body;

  if (req.user != null) {
    const set_tags = ["set_1", "set_2", "set_3", "set_4", "set_5"];
    const user_info = await getConnection()
      .getRepository(userInfoEntity)
      .createQueryBuilder("user_info_entity")
      .leftJoinAndSelect("user_info_entity.user_id", "user_id")
      .where("user_id.id = :value", { value: req.user.id })
      .getOne();

    const node_nft = await getConnection()
      .getRepository(nftEntity)
      .createQueryBuilder("nft_entity")
      .leftJoinAndSelect("nft_entity.current_owner", "current_owner")
      .where("nft_entity.id = :value", { value: node_id })
      .getOne();

    const user_set = await getConnection()
      .getRepository(userSetEntity)
      .createQueryBuilder("user_set_entity")
      .leftJoinAndSelect("user_set_entity.user_id", "user_id")
      .leftJoinAndSelect("user_set_entity.set_1", set_tags[0])
      .leftJoinAndSelect("user_set_entity.set_2", set_tags[1])
      .leftJoinAndSelect("user_set_entity.set_3", set_tags[2])
      .leftJoinAndSelect("user_set_entity.set_4", set_tags[3])
      .leftJoinAndSelect("user_set_entity.set_5", set_tags[4])
      .where("user_id.id = :value", { value: req.user.id })
      .getOne();

    if (
      user_info != null &&
      user_info.current_energy > 0 &&
      user_set != null &&
      node_nft != null &&
      node_nft.nft_type === "passive"
    ) {
      await getConnection()
        .getRepository(userInfoEntity)
        .createQueryBuilder("user_info_entity")
        .leftJoin("user_info_entity.user_id", "user_id")
        .update(userInfoEntity)
        .set({ current_energy: () => "current_energy - 1" })
        .where("user_id.id = :value", { value: req.user.id })
        .execute();

      let set_hash: any = "";
      const letters = [];
      const set = [];

      for (let i = 0; i < set_tags.length; i++) {
        set_hash += user_set[set_tags[i]].nft_hash;
        letters.push(user_set[set_tags[i]].nft_traits.split("-")[0]);
        set.push(user_set[set_tags[i]]);
      }

      const rewards = await calculateRewards({
        set: set,
        set_letters: letters,
        set_hash: set_hash,
        node: node_nft,
        user: req.user,
        user_info: user_info,
      });

      return res.status(200).send({
        success: true,
        message: "Enjoy your rewards!",
        ...rewards,
      });
    } else {
      if (user_info.current_energy <= 0) {
        return res.status(403).send({
          message:
            "You have no energy, please try again when it gets refilled.",
          success: false,
        });
      } else {
        return res.status(403).send({
          message: "Internal Error. (2)",
          test: [
            user_info != null,
            user_info.current_energy > 0,
            user_set != null,
            user_set,
            node_nft != null,
            node_nft.nft_type === "passive",
          ],
          success: false,
        });
      }
    }
  } else {
    return res.status(403).send({
      message: "Internal Error. (1)",
      success: false,
    });
  }
});
