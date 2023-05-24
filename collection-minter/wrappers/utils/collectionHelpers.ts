import { Address, beginCell, DictionaryValue } from 'ton-core';

export type CollectionMintItemInput = {
    passAmount: bigint;
    index: number;
    ownerAddress: Address;
    content: string;
    editorAddress: Address;
};

export type RoyaltyParams = {
    royaltyFactor: number;
    royaltyBase: number;
    royaltyAddress: Address;
};

export const MintDictValue: DictionaryValue<CollectionMintItemInput> = {
    serialize(src, builder) {
      const nftItemMessage = beginCell();
  
      const itemContent = beginCell();
      itemContent.storeBuffer(Buffer.from(src.content));
  
      nftItemMessage.storeAddress(src.ownerAddress);
      nftItemMessage.storeAddress(src.editorAddress);
      nftItemMessage.storeRef(itemContent);
  
      builder.storeCoins(src.passAmount);
      builder.storeRef(nftItemMessage);
    },
    parse() {
      return {
        passAmount: 0n,
        index: 0,
        ownerAddress: new Address(0, Buffer.from([])),
        content: '',
        editorAddress: new Address(0, Buffer.from([])),
      }
    },
}  

export type CollectionAddRevealInput = {
    either: number;
    revealContent: string;
    index: number;
}

export const RevealDictValue: DictionaryValue<CollectionAddRevealInput> = {
  serialize(src, builder) {
    const revealMessage = beginCell();

    const content = beginCell();
    content.storeBuffer(Buffer.from(src.revealContent));

    revealMessage.storeRef(content);

    builder.storeUint(src.either, 1);
    builder.storeRef(revealMessage);
  },
  parse() {
    return {
      either: 0,
      revealContent: '',
      index: 0
    }
  },
}  