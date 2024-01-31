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

  type Query {
    user(username: String): User
    user_info: User_Info
    user_earnings_query: User_Earnings
    user_transactions(page: Int): [user_transaction]
    user_transactions_total: Int!
  }
`;

export const userSchema = {
  typeDefs: typeDefs,
  resolvers: resolvers,
};
