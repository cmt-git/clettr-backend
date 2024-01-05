import { miscSchema } from "./misc/misc-gql";
import { nftSchema } from "./nfts/nfts-gql";
import { userSchema } from "./user/user-gql";

const schemas = [
    userSchema,
    miscSchema,
    nftSchema
]

export default schemas;