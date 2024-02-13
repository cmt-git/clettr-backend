import { cleanAuthenticationEntity } from "../routes/authentication/authenticationRouter";
import { cleanUsersEntity, refillEnergy } from "../routes/user/userRouter";

const cron = require("node-cron");

export const runCronScheduler = () => {
  // cron.schedule("0 */10 * * * *", () => {
  //     cleanUsersEntity();
  //     cleanAuthenticationEntity();
  // });
  // cron.schedule("0 0 * * *", () => {
  //     refillEnergy();
  // });
};
