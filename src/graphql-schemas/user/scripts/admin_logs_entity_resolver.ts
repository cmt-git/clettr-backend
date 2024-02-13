import { getConnection } from "typeorm";
import { adminLogsEntity } from "../../../entity/user/adminLogsEntity";

export async function AdminLogsEntityResolver(parent, args, context) {
  if (context.user !== undefined && context.user.roles == "admin") {
    const limit = 100;
    const query = await getConnection()
      .getRepository(adminLogsEntity)
      .createQueryBuilder("admin_logs_entity")
      .offset(
        limit *
          (typeof args.page == "number" && args.page > 0 ? args.page - 1 : 0)
      )
      .orderBy("admin_logs_entity.date", "DESC")
      .limit(limit)
      .getMany();

    return query;
  }
  return 0;
}
