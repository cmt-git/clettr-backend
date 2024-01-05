import { gql } from "apollo-server-express";
import resolvers from "./misc-resolvers";

const typeDefs = gql`

    type Misc{
        total_players: Int!
        ettr_minted: Int!
        nft_circulation: Int!
        active_hashes: [String!]!
        passive_hashes: [String!]!
    }

    extend type Query{
        misc: Misc
    }
`;

export const miscSchema = {
    typeDefs: typeDefs, resolvers: resolvers
}