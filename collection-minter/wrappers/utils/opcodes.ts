import { crc32 } from "./crc32";

export const Opcodes = {
    changeOwner: crc32("op::change_owner"),
    mintCollection: crc32("op::mint_collection"),
    changeCollectionOwner: crc32("op::change_collection_owner"),
    mintNftItem: crc32("op::mint_nft_item"),
    batchNftMint: crc32("op::batch_nft_mint"),
    editCollectionContent: crc32("op::edit_collection_content"),
    updateCode: crc32("op::update_code"),
    updateMintPrice: crc32("op::update_mint_price"),
    withdrawFunds: crc32("op::withdraw_funds"),
    topUp: crc32("op::top_up"),
    collectionAddRevealBatch: 0x5fcc3d1d,
    nftRevealUserRequest: 0x5fcc3d1a,
    nftRevealNftRequest: 0x5fcc3d1b,
    nftRevealSuccessCollectionResponse: 0x5fcc3d1c
    
};