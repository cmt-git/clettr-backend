import { getConnection } from "typeorm";
import { userEntity } from "../../../entity/user/userEntity";
import { userInfoEntity } from "../../../entity/user/userInfoEntity";

export async function questionnaireHandler(req, res) {
  let {
    bsc_address,
    question_1,
    question_2,
    question_3,
    question_4,
    question_5,
    question_6,
    question_7,
    question_8,
    question_9,
  } = req.body;

  const user = await getConnection()
    .createQueryBuilder()
    .update(userInfoEntity)
    .set({
      question_1: question_1,
      question_2: question_2,
      question_3: question_3,
      question_4: question_4,
      question_5: question_5,
      question_6: question_6,
      question_7: question_7,
      question_8: question_8,
      question_9: question_9,
    })
    .where(
      "user_id IN (SELECT id FROM user_entity WHERE bsc_address = :bsc_address)",
      {
        bsc_address: bsc_address,
      }
    )
    .execute();

  if (user) {
    await getConnection()
      .createQueryBuilder()
      .update(userEntity)
      .set({
        account_created: true,
      })
      .where({
        bsc_address: bsc_address,
      })
      .execute();

    return res.status(200).send({
      success: true,
      message: "Updated questionnaire.",
    });
  } else {
    return res.status(200).send({
      success: false,
      message: "Could not find user.",
    });
  }
}
