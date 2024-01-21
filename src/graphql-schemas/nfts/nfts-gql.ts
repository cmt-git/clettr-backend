import { gql } from "apollo-server-express";
import resolvers from "./nfts-resolvers";

const typeDefs = gql`
  type NFTs {
    id: Int!
    current_owner: String
    original_owner: String
    creation_date: String!
    nft_parent_token_id: String
    nft_token_id: String
    nft_token_uri: String
    nft_type: String!
    nft_traits: String!
    nft_hash: String!
    nft_stars: Int!
    nft_requirement: String
    status: String
    market_info: String
  }

  type InventoryNFTs {
    inventory_nfts: [NFTs!]!
  }

  type MarketNFTs {
    market_nfts: [NFTs!]!
    active_nfts: Int!
    passive_nfts: Int!
  }

  type userSet {
    user_set: [NFTs!]!
  }

  type userPlayHistoryTemplate {
    match_nfts: [NFTs!]!
    date: String
    words_cracked: String!
    rounds: Int!
    total_boost: String!
    final_difficulty: Int!
    reward: String!
  }

  type userPlayHistory {
    user_play_history: [userPlayHistoryTemplate!]!
  }

  extend type Query {
    owned_nfts(
      username: String
      filters: String
      page: Int
      not_user: Boolean
    ): InventoryNFTs
    user_set: userSet
    market_nfts(page: Int): MarketNFTs
    user_play_history_query(page: Int): userPlayHistory
  }
`;

export const nftSchema = {
  typeDefs: typeDefs,
  resolvers: resolvers,
};
