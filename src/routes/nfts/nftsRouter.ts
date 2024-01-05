import express, {Router} from 'express';
import { getConnection } from 'typeorm';
import { nftEntity } from '../../entity/inventory/nftEntity';
import { weeklyHashesEntity } from '../../entity/weekly-hashes/weeklyHashesEntity';

const nftsRouter = Router();
nftsRouter.use(express.json());
export default nftsRouter;

//? used in minting passive nfts
const randomRequirement = () => {
    const Letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const arr_req: any = [];
    let requirement = ""
    const rand = Math.floor(Math.random() * 5) + 1;

    for(let i = 0; i < rand; i++){

        let rand = Math.floor(Math.random() * 4) + 1;
        let selected = (
            rand == 1 ?
                Letters[Math.floor(Math.random() * Letters.length)]
            :
            rand == 2 ?
                ["pink", "purple", "blue", "teal", "lime", "green", "yellow", "orange", "red"][Math.floor(Math.random() * 9)]
            :
            rand == 3 ?
                ["striped", "spotted", "zigzag", "checkered", "cross", "sharp"][Math.floor(Math.random() * 6)]
            :
                (Math.floor(Math.random() * 5) + 1).toString()
        );
        
        if (arr_req.includes(selected) == false){
            arr_req.push(selected);
            requirement += selected + "-";
        }
        else {
            i--;
        }
    }

    return requirement.substring(0, requirement.length - 1);
}

nftsRouter.post('/mint', async (req: any, res: any, next) => {
    let {type, long_id} = req.body;

    if (req.isAuthenticated()){
        const Letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const getHash = (length: Number) => {
            let hash = ""
            for(let x = 0; x < length; x++){
                let rand = Math.floor(Math.random() * 2)

                if (rand == 0){
                    hash += (Math.floor(Math.random() * 9) + 1).toString();
                }
                else {
                    hash += Letters[Math.floor(Math.random() * Letters.length)];
                }
            }
            return hash
        }

        if (type == "active"){
            await nftEntity.create({
                current_owner: req.user,
                original_owner: req.user,
                nft_long_id: long_id,
                nft_type: type,
                nft_traits: `${Letters[Math.floor(Math.random() * Letters.length)]}-${["pink", "purple", "blue", "teal", "lime", "green", "yellow", "orange", "red"][Math.floor(Math.random() * 9)]}-${["striped", "spotted", "zigzag", "checkered", "cross", "sharp"][Math.floor(Math.random() * 6)]}`,
                nft_hash: getHash(2),
                nft_stars: 1
            }).save()

            return res.status(200).send({
                message : "Active NFT has been minted!",
                success: true
            });
        }

        if (type == "passive"){
            
            await nftEntity.create({
                current_owner: req.user,
                original_owner: req.user,
                nft_long_id: long_id,
                nft_type: type,
                nft_traits: ["pink", "purple", "blue", "teal", "lime", "green", "yellow", "orange", "red"][Math.floor(Math.random() * 9)],
                nft_hash: getHash(10),
                nft_stars: 1,
                nft_requirement: randomRequirement()
            }).save()

            return res.status(200).send({
                message : "Passive NFT has been minted!",
                success: true
            });
        }
    }
});

nftsRouter.post('/forge', async (req: any, res: any, next) => {
    let {type, nft_ids, long_id} = req.body;

    if (req.user != null && ["active", "passive"].includes(type) && nft_ids.length == 3){
        let nft_template = {
            current_owner: req.user,
            original_owner: req.user,
            nft_long_id: long_id,
            nft_type: type,
            nft_traits: "",
            nft_hash: "",
            nft_stars: "",
            nft_requirement: null
        };

        let nft_infos = [];
        let error: boolean = false;

        if (type == "active"){
            for(let i = 0; i < nft_ids.length; i++){
                const local_query = await nftEntity.findOne({where:{id: nft_ids[i], current_owner: req.user.id}});
                if (local_query != null){
                    nft_infos.push(local_query);
                }
                else {
                    error = true;
                }
            }

            if (error == false){
                nft_template.nft_stars = nft_infos[0].nft_stars + 1;
                
                for(let i = 0; i < nft_infos[0].nft_traits.split('-').length; i++){
                    nft_template.nft_traits += (
                        [nft_infos[0].nft_traits.split('-')[i], nft_infos[1].nft_traits.split('-')[i], nft_infos[2].nft_traits.split('-')[i]][Math.floor(Math.random() * 3)] + "-"
                    );
                }

                nft_template.nft_traits = nft_template.nft_traits.substring(0, nft_template.nft_traits.length - 1);

                let new_hash: string = "";
                for(let i = 0; i < nft_infos[0].nft_hash.length; i++){
                    new_hash += (
                        [nft_infos[0].nft_hash[i], nft_infos[1].nft_hash[i], nft_infos[2].nft_hash[i]][Math.floor(Math.random() * 3)]
                    )
                }

                nft_template.nft_hash = new_hash;
            }
        }
        if (type == "passive") {
            nft_template.nft_requirement = randomRequirement();
            for(let i = 0; i < nft_ids.length; i++){
                const local_query = await nftEntity.findOne({where:{id: nft_ids[i], current_owner: req.user.id}});
                if (local_query != null){
                    nft_infos.push(local_query);
                }
                else {
                    error = true;
                }
            }

            if (error == false){
                nft_template.nft_stars = nft_infos[0].nft_stars + 1;
                nft_template.nft_traits = (
                    [nft_infos[0].nft_traits, nft_infos[1].nft_traits, nft_infos[2].nft_traits][Math.floor(Math.random() * 3)]
                )

                let new_hash: string = "";
                for(let i = 0; i < nft_infos[0].nft_hash.length; i++){
                    new_hash += (
                        [nft_infos[0].nft_hash[i], nft_infos[1].nft_hash[i], nft_infos[2].nft_hash[i]][Math.floor(Math.random() * 3)]
                    )
                }

                nft_template.nft_hash = new_hash;
            }
        }

        if (error == true){
            return res.status(403).send({
                "message": "Internal Error.",
                "success": false
            })
        }
        else {
            await nftEntity.create(nft_template).save();

            for(let i = 0; i < nft_ids.length; i++){
               await nftEntity.update({id: nft_ids[i], current_owner: req.user.id}, {status: "burned"});
            }
    
            return res.status(200).send({
                "message": "Forged has been successful. New Item has been minted to your inventory.",
                "success": true
            })
        }
    }
    else {
        return res.status(403).send({
            "message": "Internal Error.",
            "success": false
        })
    }
});

nftsRouter.post('/market_sell', async (req: any, res: any, next) => {
    let {nft_id, currency, price} = req.body;

    if (req.user != null && ["ettr", "usdc"].includes(currency) && Number(price) <= 10000){
        await nftEntity.update({current_owner: req.user.id, id: nft_id}, {market_info: `${currency}-${Math.round(price)}`, status:"market_sell"});
        return res.status(200).send({
            "message": "NFT has been listed.",
            "success": true
        });
    }
    else {
        return res.status(403).send({
            "message": "Internal Error.",
            "success": false
        });
    }
});

nftsRouter.post('/market_revoke', async (req: any, res: any, next) => {
    let {nft_id} = req.body;

    if (req.user != null){
        await nftEntity.update({current_owner: req.user.id, id: nft_id}, {market_info: null, status: null});
        return res.status(200).send({
            "message": "NFT has been delisted.",
            "success": true
        });
    }
    else {
        return res.status(403).send({
            "message": "Internal Error.",
            "success": false
        })
    }
});

nftsRouter.post('/market_buy', async (req: any, res: any, next) => {
    let {nft_id} = req.body;
    let _status: any = 'market_sell';

    if (req.user != null){
        let query = await nftEntity.update({id: nft_id, status: _status}, {market_info: null, status: null, current_owner: req.user.id});

        if (query == null){
            return res.status(403).send({
                "message": "Internal Error.",
                "success": false
            })
        }
        else {
            return res.status(200).send({
                "message": "NFT has been successfully bought.",
                "success": true
            });
        }
    }
    else {
        return res.status(403).send({
            "message": "Internal Error.",
            "success": false
        })
    }
});
