import { getConnection } from "typeorm";
import {
  transactionType,
  userTransactionEntity,
} from "../../../entity/user/userTransaction";
import { userEntity } from "../../../entity/user/userEntity";

export async function transactionSummaryHandler(req: any, res: any) {
  const { to_date, from_date, username, global } = req.body;
  let data_template: {
    total_earned_ettr: number;
    total_earned_usdc: number;
    total_lost_ettr: number;
    total_lost_usdc: number;
    number_of_transactions: number;
    number_of_market_buys_passive: number;
    number_of_market_buys_active: number;
    number_of_market_sells_passive: number;
    number_of_market_sells_active: number;
    number_of_community_earnings: number;
    number_of_plays: number;
    number_of_forges_passive: number;
    number_of_forges_active: number;
    number_of_minted_active_nfts: number;
    number_of_minted_passive_nfts: number;
  } = {
    total_earned_ettr: 0,
    total_earned_usdc: 0,
    total_lost_ettr: 0,
    total_lost_usdc: 0,
    number_of_transactions: 0,
    number_of_market_buys_passive: 0,
    number_of_market_buys_active: 0,
    number_of_market_sells_passive: 0,
    number_of_market_sells_active: 0,
    number_of_community_earnings: 0,
    number_of_plays: 0,
    number_of_forges_passive: 0,
    number_of_forges_active: 0,
    number_of_minted_active_nfts: 0,
    number_of_minted_passive_nfts: 0,
  };

  const admin_query: boolean = req.user.roles == "admin" && username != null;
  let success: boolean = true;

  if (req.user !== undefined) {
    if (admin_query) {
      const user = await userEntity.findOne({ where: { username: username } });
      if (!user) {
        success = false;
      }
    }

    if (to_date != null && from_date != null && from_date < to_date) {
      data_template = {
        total_earned_ettr:
          (
            await getConnection()
              .getRepository(userTransactionEntity)
              .createQueryBuilder("user_transaction_entity")
              .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
              .select("SUM(user_transaction_entity.transaction_amount)", "sum")
              .where((qb) => {
                qb.andWhere(
                  "user_transaction_entity.transaction_currency = :currency",
                  {
                    currency: "ettr",
                  }
                ).andWhere("user_transaction_entity.transaction_amount > 0");
                if (global !== true) {
                  if (!admin_query) {
                    qb.andWhere("user_transaction_entity.user_id = :userId", {
                      userId: req.user.id,
                    });
                  } else {
                    qb.andWhere("user_id.username = :username", {
                      username: username,
                    });
                  }
                }
              })
              .andWhere(
                "(user_transaction_entity.transaction_date >= :date2 AND user_transaction_entity.transaction_date <= :date1)",
                {
                  date2: from_date,
                  date1: to_date,
                }
              )
              .getRawOne()
          ).sum || 0,
        total_earned_usdc:
          (
            await getConnection()
              .getRepository(userTransactionEntity)
              .createQueryBuilder("user_transaction_entity")
              .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
              .select("SUM(user_transaction_entity.transaction_amount)", "sum")
              .where((qb) => {
                qb.andWhere(
                  "user_transaction_entity.transaction_currency = :currency",
                  {
                    currency: "usdc",
                  }
                ).andWhere("user_transaction_entity.transaction_amount > 0");
                if (global !== true) {
                  if (!admin_query) {
                    qb.andWhere("user_transaction_entity.user_id = :userId", {
                      userId: req.user.id,
                    });
                  } else {
                    qb.andWhere("user_id.username = :username", {
                      username: username,
                    });
                  }
                }
              })
              .andWhere(
                "(user_transaction_entity.transaction_date >= :date2 AND user_transaction_entity.transaction_date <= :date1)",
                {
                  date2: from_date,
                  date1: to_date,
                  // replace "2024-01-01" and "2024-01-02" with your actual date strings
                }
              )
              .getRawOne()
          ).sum || 0,
        total_lost_ettr:
          (
            await getConnection()
              .getRepository(userTransactionEntity)
              .createQueryBuilder("user_transaction_entity")
              .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
              .select("SUM(user_transaction_entity.transaction_amount)", "sum")
              .where((qb) => {
                if (global !== true) {
                  if (!admin_query) {
                    qb.andWhere("user_transaction_entity.user_id = :userId", {
                      userId: req.user.id,
                    });
                  } else {
                    qb.andWhere("user_id.username = :username", {
                      username: username,
                    });
                  }
                }
              })
              .where("user_transaction_entity.user_id = :userId", {
                userId: req.user.id,
              })
              .andWhere(
                "user_transaction_entity.transaction_currency = :currency",
                {
                  currency: "ettr",
                }
              )
              .andWhere("user_transaction_entity.transaction_amount < 0")
              .andWhere(
                "(user_transaction_entity.transaction_date >= :date2 AND user_transaction_entity.transaction_date <= :date1)",
                {
                  date2: from_date,
                  date1: to_date,
                  // replace "2024-01-01" and "2024-01-02" with your actual date strings
                }
              )
              .getRawOne()
          ).sum || 0,
        total_lost_usdc:
          (
            await getConnection()
              .getRepository(userTransactionEntity)
              .createQueryBuilder("user_transaction_entity")
              .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
              .select("SUM(user_transaction_entity.transaction_amount)", "sum")
              .where((qb) => {
                if (global !== true) {
                  if (!admin_query) {
                    qb.andWhere("user_transaction_entity.user_id = :userId", {
                      userId: req.user.id,
                    });
                  } else {
                    qb.andWhere("user_id.username = :username", {
                      username: username,
                    });
                  }
                }
              })
              .where("user_transaction_entity.user_id = :userId", {
                userId: req.user.id,
              })
              .andWhere(
                "user_transaction_entity.transaction_currency = :currency",
                {
                  currency: "usdc",
                }
              )
              .andWhere("user_transaction_entity.transaction_amount < 0")
              .andWhere(
                "(user_transaction_entity.transaction_date >= :date2 AND user_transaction_entity.transaction_date <= :date1)",
                {
                  date2: from_date,
                  date1: to_date,
                  // replace "2024-01-01" and "2024-01-02" with your actual date strings
                }
              )
              .getRawOne()
          ).sum || 0,
        number_of_transactions: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
          .where((qb) => {
            if (global !== true) {
              if (!admin_query) {
                qb.andWhere("user_transaction_entity.user_id = :userId", {
                  userId: req.user.id,
                });
              } else {
                qb.andWhere("user_id.username = :username", {
                  username: username,
                });
              }
            }
          })
          .where("user_transaction_entity.user_id = :userId", {
            userId: req.user.id,
          })
          .andWhere(
            "(user_transaction_entity.transaction_date >= :date2 AND user_transaction_entity.transaction_date <= :date1)",
            {
              date2: from_date,
              date1: to_date,
              // replace "2024-01-01" and "2024-01-02" with your actual date strings
            }
          )
          .getCount(),
        number_of_market_buys_passive: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
          .where((qb) => {
            if (global !== true) {
              if (!admin_query) {
                qb.andWhere("user_transaction_entity.user_id = :userId", {
                  userId: req.user.id,
                });
              } else {
                qb.andWhere("user_id.username = :username", {
                  username: username,
                });
              }
            }
          })
          .where("user_transaction_entity.user_id = :userId", {
            userId: req.user.id,
          })
          .andWhere(
            "(user_transaction_entity.transaction_date >= :date2 AND user_transaction_entity.transaction_date <= :date1)",
            {
              date2: from_date,
              date1: to_date,
              // replace "2024-01-01" and "2024-01-02" with your actual date strings
            }
          )
          .andWhere("user_transaction_entity.transaction_type = :type", {
            type: transactionType.MARKET_BUY_PASSIVE,
          })
          .getCount(),
        number_of_market_buys_active: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
          .where((qb) => {
            if (global !== true) {
              if (!admin_query) {
                qb.andWhere("user_transaction_entity.user_id = :userId", {
                  userId: req.user.id,
                });
              } else {
                qb.andWhere("user_id.username = :username", {
                  username: username,
                });
              }
            }
          })
          .where("user_transaction_entity.user_id = :userId", {
            userId: req.user.id,
          })
          .andWhere(
            "(user_transaction_entity.transaction_date >= :date2 AND user_transaction_entity.transaction_date <= :date1)",
            {
              date2: from_date,
              date1: to_date,
              // replace "2024-01-01" and "2024-01-02" with your actual date strings
            }
          )
          .andWhere("user_transaction_entity.transaction_type = :type", {
            type: transactionType.MARKET_BUY_ACTIVE,
          })
          .getCount(),
        number_of_market_sells_active: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
          .where((qb) => {
            if (global !== true) {
              if (!admin_query) {
                qb.andWhere("user_transaction_entity.user_id = :userId", {
                  userId: req.user.id,
                });
              } else {
                qb.andWhere("user_id.username = :username", {
                  username: username,
                });
              }
            }
          })
          .where("user_transaction_entity.user_id = :userId", {
            userId: req.user.id,
          })
          .andWhere("user_transaction_entity.transaction_type = :type", {
            type: transactionType.MARKET_SELL_ACTIVE,
          })
          .andWhere(
            "(user_transaction_entity.transaction_date >= :date2 AND user_transaction_entity.transaction_date <= :date1)",
            {
              date2: from_date,
              date1: to_date,
              // replace "2024-01-01" and "2024-01-02" with your actual date strings
            }
          )
          .getCount(),
        number_of_market_sells_passive: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
          .where((qb) => {
            if (global !== true) {
              if (!admin_query) {
                qb.andWhere("user_transaction_entity.user_id = :userId", {
                  userId: req.user.id,
                });
              } else {
                qb.andWhere("user_id.username = :username", {
                  username: username,
                });
              }
            }
          })
          .where("user_transaction_entity.user_id = :userId", {
            userId: req.user.id,
          })
          .andWhere("user_transaction_entity.transaction_type = :type", {
            type: transactionType.MARKET_SELL_PASSIVE,
          })
          .andWhere(
            "(user_transaction_entity.transaction_date >= :date2 AND user_transaction_entity.transaction_date <= :date1)",
            {
              date2: from_date,
              date1: to_date,
              // replace "2024-01-01" and "2024-01-02" with your actual date strings
            }
          )
          .getCount(),
        number_of_community_earnings: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
          .where((qb) => {
            if (global !== true) {
              if (!admin_query) {
                qb.andWhere("user_transaction_entity.user_id = :userId", {
                  userId: req.user.id,
                });
              } else {
                qb.andWhere("user_id.username = :username", {
                  username: username,
                });
              }
            }
          })
          .where("user_transaction_entity.user_id = :userId", {
            userId: req.user.id,
          })
          .andWhere("user_transaction_entity.transaction_type = :type", {
            type: "community",
          })
          .andWhere(
            "(user_transaction_entity.transaction_date >= :date2 AND user_transaction_entity.transaction_date <= :date1)",
            {
              date2: from_date,
              date1: to_date,
              // replace "2024-01-01" and "2024-01-02" with your actual date strings
            }
          )
          .getCount(),
        number_of_plays: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
          .where((qb) => {
            if (global !== true) {
              if (!admin_query) {
                qb.andWhere("user_transaction_entity.user_id = :userId", {
                  userId: req.user.id,
                });
              } else {
                qb.andWhere("user_id.username = :username", {
                  username: username,
                });
              }
            }
          })
          .where("user_transaction_entity.user_id = :userId", {
            userId: req.user.id,
          })
          .andWhere("user_transaction_entity.transaction_type = :type", {
            type: "play",
          })
          .andWhere(
            "(user_transaction_entity.transaction_date >= :date2 AND user_transaction_entity.transaction_date <= :date1)",
            {
              date2: from_date,
              date1: to_date,
              // replace "2024-01-01" and "2024-01-02" with your actual date strings
            }
          )
          .getCount(),
        number_of_forges_passive: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
          .where((qb) => {
            if (global !== true) {
              if (!admin_query) {
                qb.andWhere("user_transaction_entity.user_id = :userId", {
                  userId: req.user.id,
                });
              } else {
                qb.andWhere("user_id.username = :username", {
                  username: username,
                });
              }
            }
          })
          .where("user_transaction_entity.user_id = :userId", {
            userId: req.user.id,
          })
          .andWhere("user_transaction_entity.transaction_type = :type", {
            type: transactionType.FORGE_PASSIVE,
          })
          .andWhere(
            "(user_transaction_entity.transaction_date >= :date2 AND user_transaction_entity.transaction_date <= :date1)",
            {
              date2: from_date,
              date1: to_date,
              // replace "2024-01-01" and "2024-01-02" with your actual date strings
            }
          )
          .getCount(),
        number_of_forges_active: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
          .where((qb) => {
            if (global !== true) {
              if (!admin_query) {
                qb.andWhere("user_transaction_entity.user_id = :userId", {
                  userId: req.user.id,
                });
              } else {
                qb.andWhere("user_id.username = :username", {
                  username: username,
                });
              }
            }
          })
          .where("user_transaction_entity.user_id = :userId", {
            userId: req.user.id,
          })
          .andWhere("user_transaction_entity.transaction_type = :type", {
            type: transactionType.FORGE_ACTIVE,
          })
          .andWhere(
            "(user_transaction_entity.transaction_date >= :date2 AND user_transaction_entity.transaction_date <= :date1)",
            {
              date2: from_date,
              date1: to_date,
              // replace "2024-01-01" and "2024-01-02" with your actual date strings
            }
          )
          .getCount(),
        number_of_minted_active_nfts: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
          .where((qb) => {
            if (global !== true) {
              if (!admin_query) {
                qb.andWhere("user_transaction_entity.user_id = :userId", {
                  userId: req.user.id,
                });
              } else {
                qb.andWhere("user_id.username = :username", {
                  username: username,
                });
              }
            }
          })
          .where("user_transaction_entity.user_id = :userId", {
            userId: req.user.id,
          })
          .andWhere("user_transaction_entity.transaction_type = :type", {
            type: transactionType.MINT_ACTIVE,
          })
          .andWhere(
            "(user_transaction_entity.transaction_date >= :date2 AND user_transaction_entity.transaction_date <= :date1)",
            {
              date2: from_date,
              date1: to_date,
              // replace "2024-01-01" and "2024-01-02" with your actual date strings
            }
          )
          .getCount(),
        number_of_minted_passive_nfts: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
          .where((qb) => {
            if (global !== true) {
              if (!admin_query) {
                qb.andWhere("user_transaction_entity.user_id = :userId", {
                  userId: req.user.id,
                });
              } else {
                qb.andWhere("user_id.username = :username", {
                  username: username,
                });
              }
            }
          })
          .where("user_transaction_entity.user_id = :userId", {
            userId: req.user.id,
          })
          .andWhere("user_transaction_entity.transaction_type = :type", {
            type: transactionType.MINT_PASSIVE,
          })
          .andWhere(
            "(user_transaction_entity.transaction_date >= :date2 AND user_transaction_entity.transaction_date <= :date1)",
            {
              date2: from_date,
              date1: to_date,
              // replace "2024-01-01" and "2024-01-02" with your actual date strings
            }
          )
          .getCount(),
      };
    } else {
      data_template = {
        total_earned_ettr:
          (
            await getConnection()
              .getRepository(userTransactionEntity)
              .createQueryBuilder("user_transaction_entity")
              .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
              .select("SUM(user_transaction_entity.transaction_amount)", "sum")
              .where((qb) => {
                qb.andWhere(
                  "user_transaction_entity.transaction_currency = :currency",
                  {
                    currency: "ettr",
                  }
                ).andWhere("user_transaction_entity.transaction_amount > 0");

                if (global !== true) {
                  if (!admin_query) {
                    qb.andWhere("user_transaction_entity.user_id = :userId", {
                      userId: req.user.id,
                    });
                  } else {
                    qb.andWhere("user_id.username = :username", {
                      username: username,
                    });
                  }
                }
              })
              .getRawOne()
          ).sum || 0,
        total_earned_usdc:
          (
            await getConnection()
              .getRepository(userTransactionEntity)
              .createQueryBuilder("user_transaction_entity")
              .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
              .select("SUM(user_transaction_entity.transaction_amount)", "sum")
              .where((qb) => {
                qb.andWhere(
                  "user_transaction_entity.transaction_currency = :currency",
                  {
                    currency: "usdc",
                  }
                ).andWhere("user_transaction_entity.transaction_amount > 0");

                if (global !== true) {
                  if (!admin_query) {
                    qb.andWhere("user_transaction_entity.user_id = :userId", {
                      userId: req.user.id,
                    });
                  } else {
                    qb.andWhere("user_id.username = :username", {
                      username: username,
                    });
                  }
                }
              })
              .getRawOne()
          ).sum || 0,
        total_lost_ettr:
          (
            await getConnection()
              .getRepository(userTransactionEntity)
              .createQueryBuilder("user_transaction_entity")
              .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
              .select("SUM(user_transaction_entity.transaction_amount)", "sum")
              .where((qb) => {
                qb.andWhere("user_transaction_entity.user_id = :userId", {
                  userId: req.user.id,
                });

                qb.andWhere(
                  "user_transaction_entity.transaction_currency = :currency",
                  {
                    currency: "ettr",
                  }
                );

                qb.andWhere("user_transaction_entity.transaction_amount < 0");

                if (global !== true) {
                  if (!admin_query) {
                    qb.andWhere("user_transaction_entity.user_id = :userId", {
                      userId: req.user.id,
                    });
                  } else {
                    qb.andWhere("user_id.username = :username", {
                      username: username,
                    });
                  }
                }
              })
              .getRawOne()
          ).sum || 0,
        total_lost_usdc:
          (
            await getConnection()
              .getRepository(userTransactionEntity)
              .createQueryBuilder("user_transaction_entity")
              .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
              .select("SUM(user_transaction_entity.transaction_amount)", "sum")
              .where((qb) => {
                qb.andWhere(
                  "user_transaction_entity.transaction_currency = :currency",
                  {
                    currency: "usdc",
                  }
                ).andWhere("user_transaction_entity.transaction_amount < 0");

                if (global !== true) {
                  if (!admin_query) {
                    qb.andWhere("user_transaction_entity.user_id = :userId", {
                      userId: req.user.id,
                    });
                  } else {
                    qb.andWhere("user_id.username = :username", {
                      username: username,
                    });
                  }
                }
              })
              .getRawOne()
          ).sum || 0,
        number_of_transactions: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
          .where((qb) => {
            if (global !== true) {
              if (!admin_query) {
                qb.andWhere("user_transaction_entity.user_id = :userId", {
                  userId: req.user.id,
                });
              } else {
                qb.andWhere("user_id.username = :username", {
                  username: username,
                });
              }
            }
          })
          .getCount(),
        number_of_market_buys_active: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
          .where((qb) => {
            qb.andWhere("user_transaction_entity.transaction_type = :type", {
              type: transactionType.MARKET_BUY_ACTIVE,
            });

            if (global !== true) {
              if (!admin_query) {
                qb.andWhere("user_transaction_entity.user_id = :userId", {
                  userId: req.user.id,
                });
              } else {
                qb.andWhere("user_id.username = :username", {
                  username: username,
                });
              }
            }
          })
          .getCount(),
        number_of_market_buys_passive: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
          .where((qb) => {
            qb.andWhere("user_transaction_entity.transaction_type = :type", {
              type: transactionType.MARKET_BUY_PASSIVE,
            });

            if (global !== true) {
              if (!admin_query) {
                qb.andWhere("user_transaction_entity.user_id = :userId", {
                  userId: req.user.id,
                });
              } else {
                qb.andWhere("user_id.username = :username", {
                  username: username,
                });
              }
            }
          })
          .getCount(),
        number_of_market_sells_active: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
          .where((qb) => {
            qb.andWhere("user_transaction_entity.transaction_type = :type", {
              type: transactionType.MARKET_SELL_ACTIVE,
            });

            if (global !== true) {
              if (!admin_query) {
                qb.andWhere("user_transaction_entity.user_id = :userId", {
                  userId: req.user.id,
                });
              } else {
                qb.andWhere("user_id.username = :username", {
                  username: username,
                });
              }
            }
          })
          .getCount(),
        number_of_market_sells_passive: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
          .where((qb) => {
            qb.andWhere("user_transaction_entity.transaction_type = :type", {
              type: transactionType.MARKET_SELL_PASSIVE,
            });

            if (global !== true) {
              if (!admin_query) {
                qb.andWhere("user_transaction_entity.user_id = :userId", {
                  userId: req.user.id,
                });
              } else {
                qb.andWhere("user_id.username = :username", {
                  username: username,
                });
              }
            }
          })
          .getCount(),
        number_of_community_earnings: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
          .where((qb) => {
            qb.andWhere("user_transaction_entity.transaction_type = :type", {
              type: "community",
            });

            if (global !== true) {
              if (!admin_query) {
                qb.andWhere("user_transaction_entity.user_id = :userId", {
                  userId: req.user.id,
                });
              } else {
                qb.andWhere("user_id.username = :username", {
                  username: username,
                });
              }
            }
          })
          .getCount(),
        number_of_plays: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
          .where((qb) => {
            qb.andWhere("user_transaction_entity.transaction_type = :type", {
              type: "play",
            });

            if (global !== true) {
              if (!admin_query) {
                qb.andWhere("user_transaction_entity.user_id = :userId", {
                  userId: req.user.id,
                });
              } else {
                qb.andWhere("user_id.username = :username", {
                  username: username,
                });
              }
            }
          })
          .getCount(),
        number_of_forges_passive: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
          .where((qb) => {
            qb.andWhere("user_transaction_entity.transaction_type = :type", {
              type: transactionType.FORGE_PASSIVE,
            });

            if (global !== true) {
              if (!admin_query) {
                qb.andWhere("user_transaction_entity.user_id = :userId", {
                  userId: req.user.id,
                });
              } else {
                qb.andWhere("user_id.username = :username", {
                  username: username,
                });
              }
            }
          })
          .getCount(),
        number_of_forges_active: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
          .where((qb) => {
            qb.andWhere("user_transaction_entity.transaction_type = :type", {
              type: transactionType.FORGE_ACTIVE,
            });

            if (global !== true) {
              if (!admin_query) {
                qb.andWhere("user_transaction_entity.user_id = :userId", {
                  userId: req.user.id,
                });
              } else {
                qb.andWhere("user_id.username = :username", {
                  username: username,
                });
              }
            }
          })
          .getCount(),
        number_of_minted_active_nfts: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
          .where((qb) => {
            qb.andWhere("user_transaction_entity.transaction_type = :type", {
              type: transactionType.MINT_ACTIVE,
            });

            if (global !== true) {
              if (!admin_query) {
                qb.andWhere("user_transaction_entity.user_id = :userId", {
                  userId: req.user.id,
                });
              } else {
                qb.andWhere("user_id.username = :username", {
                  username: username,
                });
              }
            }
          })
          .getCount(),
        number_of_minted_passive_nfts: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .leftJoinAndSelect("user_transaction_entity.user_id", "user_id")
          .where((qb) => {
            qb.andWhere("user_transaction_entity.transaction_type = :type", {
              type: transactionType.MINT_PASSIVE,
            });

            if (global !== true) {
              if (!admin_query) {
                qb.andWhere("user_transaction_entity.user_id = :userId", {
                  userId: req.user.id,
                });
              } else {
                qb.andWhere("user_id.username = :username", {
                  username: username,
                });
              }
            }
          })
          .getCount(),
      };
    }
  }

  return res.status(200).send({
    data: data_template,
    success: success,
  });
}
