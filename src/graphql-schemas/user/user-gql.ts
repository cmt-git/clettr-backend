import { gql } from "apollo-server-express";
import resolvers from "./user-resolvers";

`
NOTES :
* unclaimed_ettr's value is a float, and is parsed on client side
`;

const typeDefs = gql`
  type User {
    bsc_address: String!
    username: String!
    email: String!
    time_registered: String!
    _2fa_enabled: Boolean!
    banned: Boolean!
    roles: String!
  }

  type User_Info {
    current_energy: Int!
    max_energy: Int!
    unclaimed_ettr: String!
    nfts_sold: Int!
    active_nfts: Int!
    passive_nfts: Int!
    facebook_handle: String!
    instagram_handle: String!
    twitter_handle: String!
    tiktok_handle: String!
    youtube_channel: String!
    username_change_time: String!
    node_used: String
    total_gains: String!
    total_rounds: Int!
  }

  type Admin_User_Info {
    question_1: String
    question_2: String
    question_3: String
    question_4: String
    question_5: String
    question_6: String
    question_7: String
    question_8: String
    question_9: String
    government_id: String
    government_id_1: String
    government_id_2: String
    username: String
  }

  type user_transaction {
    id: Int!
    transaction_date: String
    transaction_type: String
    description: String
    transaction_amount: String
    transaction_currency: String
  }

  type user_earnings_template {
    reward: String!
    day: String!
  }

  type User_Earnings {
    user_earnings: [user_earnings_template!]!
  }

  type AdminLogs {
    description: String!
    date: String!
  }

  type Query {
    user(username: String): User
    user_info: User_Info
    user_infos(page: Int): [Admin_User_Info]
    user_earnings_query: User_Earnings
    user_transactions(
      page: Int
      global: Boolean
      username: String
      filter: String
    ): [user_transaction]
    user_transactions_total: Int!
    admin_logs_entity(page: Int): [AdminLogs]
  }
`;

export const userSchema = {
  typeDefs: typeDefs,
  resolvers: resolvers,
};
