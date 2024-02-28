import { Brackets, getConnection } from "typeorm";
import { nftEntity } from "../../../entity/inventory/nftEntity";

export async function ownedNFTsHandle(parent, args, context) {
  const nft_type = args.nft_type;
  const nft_star = args.nft_star;
  const nft_requirements = args.nft_requirements;
  const nft_requirements_1 = args.nft_requirement_1;
  const nft_requirements_2 = args.nft_requirement_2;
  const nft_requirements_3 = args.nft_requirement_3;
  const nft_requirements_4 = args.nft_requirement_4;
  const nft_requirements_5 = args.nft_requirement_5;
  const nft_letter = args.nft_letter;
  const nft_pattern = args.nft_pattern;
  const nft_color = args.nft_color;
  const nft_hash = args.nft_hash;
  const nft_market_currency = args.nft_market_currency;
  const nft_market_operator = args.nft_market_operator;
  const nft_market_cost = args.nft_market_cost;
  const set_traits = args.set_traits;

  const nft_arr: any = [];
  let query: any = null;

  const filter_type = args.filters?.split("-")[0];
  const filter_stars =
    args.filters?.split("-").length > 1
      ? `(nft_entity.nft_stars = ${args.filters.split("-")[1]})`
      : "";

  query = await getConnection()
    .getRepository(nftEntity)
    .createQueryBuilder("nft_entity")
    .leftJoinAndSelect("nft_entity.current_owner", "current_owner")
    .leftJoinAndSelect("nft_entity.original_owner", "original_owner")
    .where((qb) => {
      if (context.user) {
        qb.andWhere(
          args.not_user !== true
            ? "current_owner = :value"
            : "(current_owner != :value)",
          { value: context.user.id }
        );
      }

      if (args.username) {
        qb.andWhere("current_owner.username = :username", {
          username: args.username,
        });
      }

      if (args.filters != null) {
        qb.andWhere(`nft_entity.nft_type = :filter`, {
          filter: filter_type,
        });
      }

      if (filter_stars != "") {
        qb.andWhere(filter_stars);
      }

      if (nft_type == "Search All") {
        if (args.nft_market_only) {
          qb.andWhere(`nft_entity.status = 'market_sell'`);
        } else {
          if (context.user) {
            qb.andWhere(
              "(nft_entity.status is NULL OR (nft_entity.status = 'market_sell' AND nft_entity.current_owner = :currentOwnerId))",
              { currentOwnerId: context.user.id }
            );
          }
        }
      }

      if (nft_type == "Search All No Market") {
        qb.andWhere(`nft_entity.status is null`);
      }
      if (nft_type == "Search Passive NFTs") {
        qb.andWhere(
          `nft_entity.nft_type = 'passive' and nft_entity.status is null`
        );
      }

      if (nft_type == "Search Active NFTs") {
        qb.andWhere(
          `nft_entity.nft_type = 'active' and nft_entity.status is null`
        );
      }

      if (nft_type == "Listed Passive NFTs") {
        qb.andWhere(
          `nft_entity.nft_type = 'passive' and nft_entity.status = 'market_sell'`
        );
      }

      if (nft_type == "Listed Active NFTs") {
        qb.andWhere(
          `nft_entity.nft_type = 'active' and nft_entity.status = 'market_sell'`
        );
      }

      if (
        nft_star &&
        nft_star != "Any Star" &&
        /^-?[1-5]$/.test(nft_star?.split(" ")[0])
      ) {
        qb.andWhere(`nft_entity.nft_stars = ${nft_star?.split(" ")[0]}`);
      }

      if (nft_requirements != "Any Requirement") {
        const req_limit = Number.parseInt(nft_requirements?.split(" ")[0]);

        if (req_limit >= 1) {
          qb.andWhere(`nft_entity.nft_requirement_1 is not null`);

          if (nft_requirements_1 != "Any Requirement") {
            qb.andWhere(
              `nft_entity.nft_requirement_1 = '${nft_requirements_1}'`
            );
          }
        }

        if (req_limit >= 2) {
          qb.andWhere(`nft_entity.nft_requirement_2 is not null`);

          if (nft_requirements_2 != "Any Requirement") {
            qb.andWhere(
              `nft_entity.nft_requirement_2 = '${nft_requirements_2}'`
            );
          }
        }

        if (req_limit >= 3) {
          qb.andWhere(`nft_entity.nft_requirement_3 is not null`);

          if (nft_requirements_3 != "Any Requirement") {
            qb.andWhere(
              `nft_entity.nft_requirement_3 = '${nft_requirements_3}'`
            );
          }
        }

        if (req_limit >= 4) {
          qb.andWhere(`nft_entity.nft_requirement_4 is not null`);

          if (nft_requirements_4 != "Any Requirement") {
            qb.andWhere(
              `nft_entity.nft_requirement_4 = '${nft_requirements_4}'`
            );
          }
        }

        if (req_limit >= 5) {
          qb.andWhere(`nft_entity.nft_requirement_5 is not null`);

          if (nft_requirements_5 != "Any Requirement") {
            qb.andWhere(
              `nft_entity.nft_requirement_5 = '${nft_requirements_5}'`
            );
          }
        }
      }

      if (set_traits != null) {
        qb.andWhere(
          "(nft_entity.nft_requirement_1 IN (:...set_traits) OR nft_entity.nft_requirement_2 IN (:...set_traits) OR nft_entity.nft_requirement_3 IN (:...set_traits) OR nft_entity.nft_requirement_4 IN (:...set_traits) OR nft_entity.nft_requirement_5 IN (:...set_traits)) and nft_entity.status is null",
          { set_traits }
        );
      }

      if (nft_pattern && nft_pattern != "Any Pattern") {
        qb.andWhere(`nft_entity.nft_pattern = '${nft_pattern.toLowerCase()}'`);
      }

      if (nft_color && nft_color != "Any Color") {
        qb.andWhere(`nft_entity.nft_color = '${nft_color.toLowerCase()}'`);
      }

      if (nft_letter && nft_letter != "Any Letter") {
        qb.andWhere(`nft_entity.nft_letter = '${nft_letter}'`);
      }

      if (nft_hash && (nft_hash.length == 2 || nft_hash.length == 10)) {
        qb.andWhere(`nft_entity.nft_hash = '${nft_hash}'`);
      }

      if (nft_market_currency && nft_market_currency != "Any Currency") {
        qb.andWhere(`nft_entity.market_currency = '${nft_market_currency}'`);
      }

      if (nft_market_cost) {
        if (!nft_market_operator || nft_market_operator != "No Operator") {
          qb.andWhere(`nft_entity.market_cost = ${nft_market_cost}`);
        } else {
          if (nft_market_operator == "Equals (=)") {
            qb.andWhere(`nft_entity.market_cost = ${nft_market_cost}`);
          }

          if (nft_market_operator == "Less Than (<)") {
            qb.andWhere(`nft_entity.market_cost < ${nft_market_cost}`);
          }

          if (nft_market_operator == "Less Than Or Equals (<=)") {
            qb.andWhere(`nft_entity.market_cost <= ${nft_market_cost}`);
          }

          if (nft_market_operator == "Greater Than (>)") {
            qb.andWhere(`nft_entity.market_cost > ${nft_market_cost}`);
          }

          if (nft_market_operator == "Greater Than Or Equals (>=)") {
            qb.andWhere(`nft_entity.market_cost >= ${nft_market_cost}`);
          }
        }
      }
    })
    .offset(!args.page ? 0 : (args.page - 1) * 10)
    .limit(30)
    .orderBy("nft_entity.id", "DESC");

  if (args.set_traits) {
    query
      .addOrderBy(
        "SUM(" +
          "CASE WHEN nft_entity.nft_requirement_1 IN (:...set_traits) THEN 1 ELSE 0 END + " +
          "CASE WHEN nft_entity.nft_requirement_2 IN (:...set_traits) THEN 1 ELSE 0 END + " +
          "CASE WHEN nft_entity.nft_requirement_3 IN (:...set_traits) THEN 1 ELSE 0 END + " +
          "CASE WHEN nft_entity.nft_requirement_4 IN (:...set_traits) THEN 1 ELSE 0 END + " +
          "CASE WHEN nft_entity.nft_requirement_5 IN (:...set_traits) THEN 1 ELSE 0 END" +
          ")",
        "DESC"
      )
      .addOrderBy("nft_entity.nft_requirement_length", "ASC")
      .addGroupBy("nft_entity.id")
      .addGroupBy("current_owner.id") // Include current_owner.id in GROUP BY
      .addGroupBy("original_owner.id") // Include current_owner.id in GROUP BY
      .setParameters({ set_traits: args.set_traits });
  }

  query = await query.getMany();
  // if (args.filters == null) {
  //   query = await getConnection()
  //     .getRepository(nftEntity)
  //     .createQueryBuilder("nft_entity")
  //     .leftJoinAndSelect("nft_entity.current_owner", "current_owner")
  //     .leftJoinAndSelect("nft_entity.original_owner", "original_owner")
  //     .where(
  //       `${user_type} and (nft_entity.status != 'burned' or nft_entity.status is null)`,
  //       { value: context.user.id, username: args.username }
  //     )
  //     .offset(!args.page ? 0 : (args.page - 1) * 10)
  //     .limit(30)
  //     .orderBy("nft_entity.id", "DESC")
  //     .getMany();
  // } else {
  //   if (filter_type == "active") {
  //     //? -> this is a temporary patch
  //     query = await getConnection()
  //       .getRepository(nftEntity)
  //       .createQueryBuilder("nft_entity")
  //       .leftJoinAndSelect("nft_entity.current_owner", "current_owner")
  //       .leftJoinAndSelect("nft_entity.original_owner", "original_owner")
  //       .where(
  //         `${user_type} and (nft_entity.status != 'burned' or nft_entity.status is null) and (nft_entity.nft_type = 'active') ${filter_stars}`,
  //         {
  //           value: context.user.id,
  //           username: args.username,
  //         }
  //       )
  //       .offset(!args.page ? 0 : (args.page - 1) * 10)
  //       .limit(30)
  //       .orderBy("nft_entity.id", "DESC")
  //       .getMany();
  //   }

  //   if (filter_type == "passive") {
  //   }
  // }

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
}
