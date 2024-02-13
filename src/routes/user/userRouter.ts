import express, { Router } from "express";
import { getConnection, MoreThan, SimpleConsoleLogger } from "typeorm";
import bcrypt from "bcrypt";
import passport from "passport";

import { userEntity } from "../../entity/user/userEntity";
import {
  generateAuthenticationCode,
  validateAuthenticationCode,
} from "../authentication/authenticationRouter";
import { authenticationEntity } from "../../entity/authentication/authenticationEntity";
import { redis_client } from "../..";

import geoip from "geoip-lite";
import { userInfoEntity } from "../../entity/user/userInfoEntity";
import { userSetEntity } from "../../entity/user/userSetEntity";
import { nftEntity } from "../../entity/inventory/nftEntity";
import { userTransactionEntity } from "../../entity/user/userTransaction";
import { banUserHandler } from "./scripts/banUserHandler";
import { questionnaireHandler } from "./scripts/questionnaireHandler";
import { governmentIdsHandler } from "./scripts/governtmentIdsHandler";

const userRouter = Router();
userRouter.use(express.json());
export default userRouter;

export const validateAddress = (address: any) => {
  const re = /^0x[a-zA-Z0-9]*$/;
  return re.test(String(address).toLowerCase());
};

function validateUsername(username: any) {
  const re = /^[a-zA-Z0-9_-]*$/;
  return re.test(String(username).toLowerCase());
}

function validateAuthCode(code: string) {
  const re = /^[0-9]*$/;
  return re.test(String(code).toLowerCase());
}

export function validateEmail(email: any) {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

const msToTime = (s: any) => {
  var ms = s % 1000;
  s = (s - ms) / 1000;
  var secs = s % 60;
  s = (s - secs) / 60;
  var mins = s % 60;

  return +mins;
};

const createUser = async (json: any) => {
  await bcrypt.genSalt(10, async (err, salt) => {
    await bcrypt.hash(json["signature"], salt, async (err, hash) => {
      await userEntity.delete({ bsc_address: json["bsc_address"] });

      const user = await userEntity
        .create({ bsc_address: json["bsc_address"], hashed_signature: hash })
        .save();

      await userInfoEntity
        .create({
          user_id: user,
        })
        .save();

      await userSetEntity
        .create({
          user_id: user,
        })
        .save();
    });
  });
};

//! TEMPORARY EXTREMELY UNSAFE
userRouter.post("/ettr_subtract", async (req: any, res: any, next) => {
  if (req.user) {
    let { value } = req.body;
    const user_info = await getConnection()
      .getRepository(userInfoEntity)
      .createQueryBuilder("user_info_entity")
      .leftJoin("user_info_entity.user_id", "user_id")
      .where("user_id.id = :value", { value: req.user.id })
      .getOne();

    if (user_info.unclaimed_ettr - value >= 0) {
      await getConnection()
        .getRepository(userInfoEntity)
        .createQueryBuilder("user_info_entity")
        .leftJoin("user_info_entity.user_id", "user_id")
        .update(userInfoEntity)
        .set({ unclaimed_ettr: () => `unclaimed_ettr - ${value}` })
        .where("user_id.id = :id", { id: req.user.id })
        .execute();

      return res.status(200).send({
        message: `You have successfully withdrew ${value} ettr!`,
        success: true,
      });
    } else {
      return res.status(403).send({
        message: "Internal Error. Do not tamper with this request.",
        success: false,
        account_created: false,
      });
    }
  } else {
    return res.status(403).send({
      message: "Internal Error. Do not tamper with this request.",
      success: false,
      account_created: false,
    });
  }
});

userRouter.post("/connect", async (req: any, res: any, next) => {
  let { bsc_address, signature, password, email } = req.body;

  bsc_address = bsc_address !== undefined ? bsc_address : null;
  signature = signature !== undefined ? signature.toLowerCase() : null;

  if (
    bsc_address !== null &&
    signature !== null &&
    bsc_address.length == 42 &&
    signature.length == 132 &&
    validateAddress(bsc_address) &&
    validateAddress(signature) &&
    email === undefined &&
    password === undefined
  ) {
    const checkSignature = await userEntity.findOne({
      where: { bsc_address: bsc_address },
    });
    if (checkSignature == null) {
      await createUser({
        bsc_address: bsc_address,
        signature: signature,
      });

      return res.status(200).send({
        message:
          "Address registered! Please create an account within 10 minutes.",
        success: true,
        account_created: false,
      });
    } else {
      if (
        checkSignature["account_created"] == true &&
        checkSignature["account_approved"] == true
      ) {
        // -> used in passport callback
        let { email, hashed_password } = checkSignature;
        let password = hashed_password;

        req.body = { email: email, password: password };
        passport.authenticate("local", function (err, user, info) {
          if (err) {
            return next(err);
          }
          if (!user) {
            return res.status(200).send({
              message:
                "Could not find account. Please retry entering email or password.",
              success: false,
            });
          }
          req.logIn(user, function (err) {
            if (err) {
              return next(err);
            }

            return res.status(200).send({
              message: "Logged In.",
              success: true,
            });
          });
        })(req, res, next);
      } else {
        if (checkSignature["account_created"] == false) {
          const tenMinutes = 600000;

          const timeLeft =
            new Date().getTime() -
            new Date(checkSignature["time_registered"]).getTime();
          const minute = msToTime(tenMinutes - timeLeft);
          if (timeLeft <= tenMinutes) {
            return res.status(200).send({
              message:
                `Account not yet created. Please register, expiration in ${minute}` +
                (minute ? ` minutes.` : ` minute.`),
              success: false,
              account_created: checkSignature["account_created"],
            });
          } else {
            await createUser({
              bsc_address: bsc_address,
              signature: signature,
            });

            return res.status(200).send({
              message:
                "Address registered! Please create an account within 10 minutes.",
              success: true,
              account_created: false,
            });
          }
        }

        if (checkSignature["account_approved"] == false) {
          return res.status(200).send({
            message:
              "Your account has been created, but it has not been approved yet. Please wait for it to be approved.",
            success: false,
            account_created: true,
            account_approved: false,
          });
        }
      }
    }
  } else {
    return res.status(403).send({
      message: "Internal Error. Do not tamper with address and signature!.",
      success: false,
      account_approved: false,
    });
  }
});

userRouter.post("/login", async (req: any, res: any, next) => {
  let { email, password } = req.body;

  email = email !== undefined ? email.toLowerCase() : null;
  password = password !== undefined ? password.toLowerCase() : null;

  if (
    email !== null &&
    password !== null &&
    email.length <= 100 &&
    password.length <= 100
  ) {
    const checkaccount = await userEntity.findOne({ where: { email: email } });

    if (checkaccount !== undefined) {
      bcrypt.compare(
        password,
        checkaccount["hashed_password"],
        (err, result) => {
          if (result) {
            passport.authenticate("local", function (err, user, info) {
              if (err) {
                return next(err);
              }
              if (!user) {
                return res.status(200).send({
                  message:
                    "Could not find account. Please retry entering email or password.",
                  success: false,
                });
              }
              req.logIn(user, function (err) {
                if (err) {
                  return next(err);
                }

                return res.status(200).send({
                  message: "Logged In.",
                  success: true,
                });
              });
            })(req, res, next);
          } else {
            return res.status(200).send({
              message:
                "Could not find account. Please retry entering email or password.",
              success: false,
            });
          }
        }
      );
    } else {
      return res.status(200).send({
        message:
          "Could not find account. Please retry entering email or password.",
        success: false,
      });
    }
  } else {
    return res.status(403).send({
      message: "Internal Error.",
      success: false,
    });
  }
});

userRouter.post("/logout", async (req: any, res: any, next) => {
  if (req.user != undefined) {
    req.session.destroy();

    return res.status(200).send({
      message: "Logged Out.",
      success: true,
    });
  } else {
    return res.status(403).send({
      message: "Internal Error.",
      success: false,
    });
  }
});

userRouter.post("/register", async (req: any, res: any) => {
  let {
    bsc_address,
    signature,
    email,
    username,
    password,
    confirm_password,
    authentication_code,
  } = req.body;

  bsc_address = bsc_address !== undefined ? bsc_address : null;
  signature = signature !== undefined ? signature.toLowerCase() : null;
  email = email !== undefined ? email.toLowerCase() : null;
  username = username !== undefined ? username.toLowerCase() : null;
  password = password !== undefined ? password.toLowerCase() : null;
  confirm_password =
    confirm_password !== undefined ? confirm_password.toLowerCase() : null;
  if (
    bsc_address !== null &&
    signature !== null &&
    email !== null &&
    username !== null &&
    password !== null &&
    confirm_password !== null &&
    authentication_code !== undefined &&
    authentication_code.length == 7 &&
    bsc_address.length == 42 &&
    signature.length == 132 &&
    email.length <= 100 &&
    username.length >= 3 &&
    username.length <= 16 &&
    password.length >= 3 &&
    password.length <= 16 &&
    confirm_password.length >= 3 &&
    confirm_password.length <= 16 &&
    password === confirm_password &&
    validateAddress(bsc_address) &&
    validateAddress(signature) &&
    validateUsername(username) &&
    validateEmail(email) &&
    validateAuthCode(authentication_code)
  ) {
    const checkSignature = await userEntity.findOne({
      where: { bsc_address: bsc_address },
    });

    if (checkSignature === undefined) {
      return res.status(403).send({
        message: "Internal Error.",
        success: false,
      });
    } else {
      const tenMinutes = 600000;
      const timeLeft =
        new Date().getTime() -
        new Date(checkSignature["time_registered"]).getTime();

      if (timeLeft > tenMinutes) {
        await createUser({
          bsc_address: bsc_address,
          signature: signature,
        });
      }

      const validation = await validateAuthenticationCode({
        email: email,
        authentication_code: authentication_code,
      });

      switch (validation) {
        case "error":
          return res.status(403).send({
            message:
              "Internal Error. Please request for another authentication code.",
            success: false,
          });
          break;
        case "invalid":
          return res.status(200).send({
            message: "Authentication Code is not valid.",
            success: false,
          });
          break;
        case "valid":
          const tenMinutes = 600000;
          const timeLeft =
            new Date().getTime() -
            new Date(checkSignature["time_registered"]).getTime();

          if (timeLeft > tenMinutes) {
            await createUser({
              bsc_address: bsc_address,
              signature: signature,
            });
          }

          await bcrypt.genSalt(10, async (err, salt) => {
            await bcrypt.hash(password, salt, async (err, hash) => {
              const user = await userEntity.update(
                { bsc_address },
                {
                  email,
                  username,
                  hashed_password: hash,
                  //account_created: true,
                }
              );
              return res.status(200).send({
                message: "Account registered!",
                success: true,
              });
            });
          });

          break;
      }
    }
  } else {
    return res.status(403).send({
      message: "Internal Error.",
      success: false,
    });
  }
});

userRouter.post("/validate", async (req: any, res: any) => {
  let { username, email, bsc_address, signature } = req.body;

  username = username !== undefined ? username.toLowerCase() : null;
  email = email !== undefined ? email.toLowerCase() : null;
  bsc_address = bsc_address !== undefined ? bsc_address : null;
  signature = signature !== undefined ? signature.toLowerCase() : null;

  if (
    username !== null &&
    email !== null &&
    username.length <= 16 &&
    email.length <= 100 &&
    validateUsername(username) &&
    validateEmail(email)
  ) {
    const validateUser = await userEntity.findOne({
      where: { username: username, email: email },
    });

    if (validateUser == null) {
      return await generateAuthenticationCode(
        {
          bsc_address: bsc_address,
          email: email,
        },
        res
      );
    } else {
      return res.status(200).send({
        message: "Username or Address is invalid. Please try another one.",
        success: false,
      });
    }
  } else {
    return res.status(403).send({
      message: "Internal Error.",
      success: false,
    });
  }
});

userRouter.post("/updateset", async (req: any, res: any) => {
  if (req.user != null && req.isAuthenticated()) {
    let { set_ids } = req.body;
    let error: boolean = false;
    // for(let i = 0; i < 5; i++){
    //     if (set_ids[i]){
    //         const query = await getConnection()
    //         .getRepository(nftEntity)
    //         .createQueryBuilder("nft_entity")
    //         .leftJoin("nft_entity.current_owner", "current_owner")
    //         .where("current_owner.id = :user_id and nft_entity.id = :nft_id", {value: {user_id: req.user.id, nft_id: set_ids[i]}})
    //         .getOne();

    //         if(query == null) {
    //             error = true
    //         }
    //     }
    //     else {
    //         error = true;
    //     }
    // }

    if (error) {
      return res.status(403).send({
        message: "Internal Error.",
        success: false,
      });
    } else {
      const current_nft_entity_1 = await nftEntity.findOne({
        where: { id: set_ids[0] },
      });
      const current_nft_entity_2 = await nftEntity.findOne({
        where: { id: set_ids[1] },
      });
      const current_nft_entity_3 = await nftEntity.findOne({
        where: { id: set_ids[2] },
      });
      const current_nft_entity_4 = await nftEntity.findOne({
        where: { id: set_ids[3] },
      });
      const current_nft_entity_5 = await nftEntity.findOne({
        where: { id: set_ids[4] },
      });

      await getConnection()
        .getRepository(userSetEntity)
        .createQueryBuilder("user_set_entity")
        .update(userSetEntity)
        .set({
          set_1: current_nft_entity_1,
          set_2: current_nft_entity_2,
          set_3: current_nft_entity_3,
          set_4: current_nft_entity_4,
          set_5: current_nft_entity_5,
        })
        .where("user_set_entity.user_id = :value", { value: req.user.id })
        .execute();

      return res.status(200).send({
        message: "Set has been updated.",
        success: true,
      });
    }
  } else {
    return res.status(403).send({
      message: "Internal Error.",
      success: false,
    });
  }
});

userRouter.post("/transactions/summary", async (req: any, res: any, next) => {
  console.log("transactions summary called");
  const { to_date, from_date } = req.body;
  let data_template: {
    total_earned_ettr: number;
    total_earned_usdc: number;
    total_lost_ettr: number;
    total_lost_usdc: number;
    number_of_transactions: number;
    number_of_market_buys: number;
    number_of_market_sells: number;
    number_of_community_earnings: number;
    number_of_plays: number;
    number_of_forges: number;
  } = {
    total_earned_ettr: 0,
    total_earned_usdc: 0,
    total_lost_ettr: 0,
    total_lost_usdc: 0,
    number_of_transactions: 0,
    number_of_market_buys: 0,
    number_of_market_sells: 0,
    number_of_community_earnings: 0,
    number_of_plays: 0,
    number_of_forges: 0,
  };

  if (req.user !== undefined) {
    if (to_date != null && from_date != null && from_date < to_date) {
      data_template = {
        total_earned_ettr:
          (
            await getConnection()
              .getRepository(userTransactionEntity)
              .createQueryBuilder("user_transaction_entity")
              .select("SUM(user_transaction_entity.transaction_amount)", "sum")
              .where("user_transaction_entity.user_id = :userId", {
                userId: req.user.id,
              })
              .andWhere(
                "user_transaction_entity.transaction_currency = :currency",
                {
                  currency: "ettr",
                }
              )
              .andWhere("user_transaction_entity.transaction_amount > 0")
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
        total_earned_usdc:
          (
            await getConnection()
              .getRepository(userTransactionEntity)
              .createQueryBuilder("user_transaction_entity")
              .select("SUM(user_transaction_entity.transaction_amount)", "sum")
              .where("user_transaction_entity.user_id = :userId", {
                userId: req.user.id,
              })
              .andWhere(
                "user_transaction_entity.transaction_currency = :currency",
                {
                  currency: "usdc",
                }
              )
              .andWhere("user_transaction_entity.transaction_amount > 0")
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
              .select("SUM(user_transaction_entity.transaction_amount)", "sum")
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
              .select("SUM(user_transaction_entity.transaction_amount)", "sum")
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
        number_of_market_buys: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
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
            type: "market_buy",
          })
          .getCount(),
        number_of_market_sells: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .where("user_transaction_entity.user_id = :userId", {
            userId: req.user.id,
          })
          .andWhere("user_transaction_entity.transaction_type = :type", {
            type: "market_sell",
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
        number_of_forges: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .where("user_transaction_entity.user_id = :userId", {
            userId: req.user.id,
          })
          .andWhere("user_transaction_entity.transaction_type = :type", {
            type: "forge",
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
              .select("SUM(user_transaction_entity.transaction_amount)", "sum")
              .where("user_transaction_entity.user_id = :userId", {
                userId: req.user.id,
              })
              .andWhere(
                "user_transaction_entity.transaction_currency = :currency",
                {
                  currency: "ettr",
                }
              )
              .andWhere("user_transaction_entity.transaction_amount > 0")
              .getRawOne()
          ).sum || 0,
        total_earned_usdc:
          (
            await getConnection()
              .getRepository(userTransactionEntity)
              .createQueryBuilder("user_transaction_entity")
              .select("SUM(user_transaction_entity.transaction_amount)", "sum")
              .where("user_transaction_entity.user_id = :userId", {
                userId: req.user.id,
              })
              .andWhere(
                "user_transaction_entity.transaction_currency = :currency",
                {
                  currency: "usdc",
                }
              )
              .andWhere("user_transaction_entity.transaction_amount > 0")
              .getRawOne()
          ).sum || 0,
        total_lost_ettr:
          (
            await getConnection()
              .getRepository(userTransactionEntity)
              .createQueryBuilder("user_transaction_entity")
              .select("SUM(user_transaction_entity.transaction_amount)", "sum")
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
              .getRawOne()
          ).sum || 0,
        total_lost_usdc:
          (
            await getConnection()
              .getRepository(userTransactionEntity)
              .createQueryBuilder("user_transaction_entity")
              .select("SUM(user_transaction_entity.transaction_amount)", "sum")
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
              .getRawOne()
          ).sum || 0,
        number_of_transactions: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .where("user_transaction_entity.user_id = :userId", {
            userId: req.user.id,
          })
          .getCount(),
        number_of_market_buys: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .where("user_transaction_entity.user_id = :userId", {
            userId: req.user.id,
          })
          .andWhere("user_transaction_entity.transaction_type = :type", {
            type: "market_buy",
          })
          .getCount(),
        number_of_market_sells: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .where("user_transaction_entity.user_id = :userId", {
            userId: req.user.id,
          })
          .andWhere("user_transaction_entity.transaction_type = :type", {
            type: "market_sell",
          })
          .getCount(),
        number_of_community_earnings: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .where("user_transaction_entity.user_id = :userId", {
            userId: req.user.id,
          })
          .andWhere("user_transaction_entity.transaction_type = :type", {
            type: "community",
          })
          .getCount(),
        number_of_plays: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .where("user_transaction_entity.user_id = :userId", {
            userId: req.user.id,
          })
          .andWhere("user_transaction_entity.transaction_type = :type", {
            type: "play",
          })
          .getCount(),
        number_of_forges: await getConnection()
          .getRepository(userTransactionEntity)
          .createQueryBuilder("user_transaction_entity")
          .where("user_transaction_entity.user_id = :userId", {
            userId: req.user.id,
          })
          .andWhere("user_transaction_entity.transaction_type = :type", {
            type: "forge",
          })
          .getCount(),
      };
    }
  }

  return res.status(200).send({
    data: data_template,
    success: true,
  });
});

userRouter.post("/enforcement", async (req: any, res: any) => {
  return await banUserHandler(req, res);
});

userRouter.post("/modify", async (req: any, res: any) => {
  return await banUserHandler(req, res);
});

userRouter.post("/questionnaire", async (req: any, res: any) => {
  return await questionnaireHandler(req, res);
});

userRouter.put("/government", async (req: any, res: any) => {
  return await governmentIdsHandler(req, res);
});

export const cleanUsersEntity = async () => {
  const tenMinutes = 600000;
  const subtractedSeconds = new Date().getTime() - tenMinutes;
  const subtractedDate = new Date(subtractedSeconds);

  await getConnection()
    .createQueryBuilder()
    .delete()
    .from(userEntity)
    .where("time_registered < :subtractedDate AND account_created = false", {
      subtractedDate: subtractedDate,
    })
    .execute();
};

export const refillEnergy = async () => {
  userInfoEntity.update({ id: MoreThan(0) }, { refill_energy: true });
};
