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
    community_reward: String
    sharer_username: String
  }

  type userPlayHistory {
    user_play_history: [userPlayHistoryTemplate!]!
  }

  extend type Query {
    owned_nfts(
      username: String
      filters: String
      nft_type: String
      nft_star: String
      nft_requirements: String
      nft_requirement_1: String
      nft_requirement_2: String
      nft_requirement_3: String
      nft_requirement_4: String
      nft_requirement_5: String
      nft_letter: String
      nft_color: String
      nft_pattern: String
      nft_hash: String
      nft_market_currency: String
      nft_market_operator: String
      nft_market_cost: String
      nft_market_only: Boolean
      set_traits: [String]
      page: Int
      not_user: Boolean
    ): InventoryNFTs
    user_set: userSet
    market_nfts(page: Int): MarketNFTs
    user_play_history_query(page: Int, filter: String): userPlayHistory
    nft(id: Int): NFTs
  }
`;

export const nftSchema = {
  typeDefs: typeDefs,
  resolvers: resolvers,
};
