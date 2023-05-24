import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Dictionary, Sender, SendMode, toNano } from 'ton-core';
import { encodeOffChainContent } from './content/content';
import { CollectionAddRevealInput, CollectionMintItemInput, MintDictValue, RevealDictValue } from './utils/collectionHelpers';
import { Opcodes } from './utils/opcodes';

export type CollectionMinterConfig = {
    owner: Address;
    nextCollectionIndex: number;
    mintPrice: bigint;
    collections: Dictionary<number, Address>;
};

export type RoyaltyParams = {
    royaltyFactor: number;
    royaltyBase: number;
    royaltyAddress: Address;
};

export type NftCollectionData = {
    ownerAddress: Address;
    nextItemIndex: number | bigint;
    collectionContent: string;
    commonContent: string;
    nftItemCode: Cell;
    royaltyParams: RoyaltyParams;
};

export function collectionMinterConfigToCell(config: CollectionMinterConfig): Cell {
    return beginCell()
        .storeAddress(config.owner)
        .storeUint(config.nextCollectionIndex, 64)
        .storeCoins(config.mintPrice)
        .storeDict(config.collections)
    .endCell();
}

export function buildNftCollectionDataCell(data: NftCollectionData): Cell {
    let dataCell = beginCell();

    dataCell.storeAddress(data.ownerAddress);
    dataCell.storeUint(data.nextItemIndex, 64);

    let contentCell = beginCell();

    let collectionContent = encodeOffChainContent(data.collectionContent);

    let commonContent = beginCell();
    commonContent.storeStringTail(data.commonContent);

    contentCell.storeRef(collectionContent);
    contentCell.storeRef(commonContent);
    dataCell.storeRef(contentCell);

    dataCell.storeRef(data.nftItemCode);

    let royaltyCell = beginCell();
    royaltyCell.storeUint(data.royaltyParams.royaltyFactor, 16);
    royaltyCell.storeUint(data.royaltyParams.royaltyBase, 16);
    royaltyCell.storeAddress(data.royaltyParams.royaltyAddress);
    dataCell.storeRef(royaltyCell);

    return dataCell.endCell();
}

export class CollectionMinter implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new CollectionMinter(address);
    }

    static createFromConfig(config: CollectionMinterConfig, code: Cell, workchain = 0) {
        const data = collectionMinterConfigToCell(config);
        const init = { code, data };
        return new CollectionMinter(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendMintCollectionMsg(
        provider: ContractProvider,
        via: Sender,
        opts: {
            collectionCode: Cell;
            collectionData: Cell;
        }
    ) {

        await provider.internal(via, {
            value: toNano('0.1'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.mintCollection, 32)
                .storeRef(opts.collectionCode)
                .storeRef(opts.collectionData)
                .endCell(),
        });
    }

    async sendMintNftItemMsg(
        provider: ContractProvider,
        via: Sender,
        opts: {
            itemIndex: number;
            itemContent: string;
            collectionId: number;
            itemOwnerAddress: Address;
            itemEditorAddress: Address;
        }
    ) {

        const nftContent = beginCell();
        nftContent.storeBuffer(Buffer.from(opts.itemContent));

        const nftItemMessage = beginCell();

        nftItemMessage.storeAddress(opts.itemOwnerAddress);
        nftItemMessage.storeAddress(opts.itemEditorAddress);
        nftItemMessage.storeRef(nftContent);

        await provider.internal(via, {
            value: await this.getMintPrice(provider),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.mintNftItem, 32)
                .storeUint(opts.collectionId, 64)
                .storeUint(opts.itemIndex, 64)
                .storeRef(nftItemMessage)
            .endCell()
        });

    }

    async sendBatchNftMintMsg(
        provider: ContractProvider,
        via: Sender,
        opts: {
            nfts: CollectionMintItemInput[];
            collectionId: number;
        }
    ) {
        if (opts.nfts.length > 250) {
            throw new Error('Too long list');
        }
      
        const dict = Dictionary.empty(Dictionary.Keys.Uint(64), MintDictValue);
            for (const item of opts.nfts) {
                dict.set(item.index, item)
            }
        
        const mintPrice = await this.getMintPrice(provider);

        await provider.internal(via, {
            value: BigInt(dict.size) * mintPrice,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.batchNftMint, 32)
                .storeUint(opts.collectionId, 64)
                .storeDict(dict)
            .endCell()
        });
    }

    async sendChangeCollectionOwnerMsg(
        provider: ContractProvider,
        via: Sender,
        opts: { 
            newOwner: Address;
            collectionId: number;
        }
    ) {

        await provider.internal(via, {
            value: toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.changeCollectionOwner, 32)
                .storeUint(opts.collectionId, 64)
                .storeAddress(opts.newOwner)
            .endCell()
        });
    }

    async sendEditCollectionContentMsg(
        provider: ContractProvider,
        via: Sender,
        opts: { 
            content: string;
            commonContent: string;
            royaltyParams: RoyaltyParams;
            collectionId: number;
        }
    ) {
        const contentCell = beginCell();

        const collectionContent = encodeOffChainContent(opts.content);

        const commonContent = beginCell();
        commonContent.storeBuffer(Buffer.from(opts.commonContent));

        contentCell.storeRef(collectionContent);
        contentCell.storeRef(commonContent);

        const royaltyCell = beginCell();
        royaltyCell.storeUint(opts.royaltyParams.royaltyFactor, 16);
        royaltyCell.storeUint(opts.royaltyParams.royaltyBase, 16);
        royaltyCell.storeAddress(opts.royaltyParams.royaltyAddress);

        await provider.internal(via, {
            value: toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.editCollectionContent, 32)
                .storeUint(opts.collectionId, 64)
                .storeRef(contentCell)
                .storeRef(royaltyCell)
            .endCell()
        });
    }

    async sendCollectionAddRevealBatchMsg(
        provider: ContractProvider,
        via: Sender,
        opts: { 
            revealBatch: CollectionAddRevealInput[];
            value: bigint;
            collectionId: number;
        }
    ) {
        if (opts.revealBatch.length > 250) {
            throw new Error('Too long list');
        }
      
        const revealDict = Dictionary.empty(Dictionary.Keys.Uint(64), RevealDictValue);
            for (const item of opts.revealBatch) {
                revealDict.set(item.index, item)
            }

        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.collectionAddRevealBatch, 32)
                .storeUint(opts.collectionId, 64)
                .storeDict(revealDict)
            .endCell()
        });
    }

    async sendTopUp(
        provider: ContractProvider,
        via: Sender,
        value: bigint
    ) {
        await provider.internal(via, {
            value: value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.topUp, 32)
            .endCell()
        });
    }

    async sendUpdateCodeMsg(
        provider: ContractProvider, 
        via: Sender,
        opts: {
            newCode: Cell;
        }
    ) {
        await provider.internal(via, {
            value: toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.updateCode, 32)
                .storeRef(opts.newCode)
            .endCell()
        });
    }

    async sendChangeOwnerMsg(
        provider: ContractProvider, 
        via: Sender,
        opts: {
            newOwner: Address;
        }
    ) {
        await provider.internal(via, {
            value: toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.changeOwner, 32)
                .storeAddress(opts.newOwner)
            .endCell()
        });
    }

    async sendUpdateMintPriceMsg(
        provider: ContractProvider, 
        via: Sender,
        opts: {
            newMintPrice: bigint;
        }
    ) {
        await provider.internal(via, {
            value: toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.updateMintPrice, 32)
                .storeCoins(opts.newMintPrice)
            .endCell()
        });
    }

    async sendWithdraw(
        provider: ContractProvider,
        via: Sender,
        opts: {
            withdrawAmount: bigint;
        }
    ) {
        await provider.internal(via, {
            value: toNano('0.05'),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.withdrawFunds, 32)
                .storeCoins(opts.withdrawAmount)
            .endCell()
        });
    }

    async getOwnerAddress(provider: ContractProvider): Promise<Address> {
        let res = (await provider.get('get_minter_data', [])).stack;
        return res.readAddress();
    }
    async getNextCollectionIndex(provider: ContractProvider): Promise<number> {
        let res = (await provider.get('get_minter_data', [])).stack;
        res.skip(1);
        return res.readNumber();
    }
    async getMintPrice(provider: ContractProvider): Promise<bigint> {
        let res = (await provider.get('get_minter_data', [])).stack;
        res.skip(2);
        return res.readBigNumber();
    }
    
    async getStateBalance(provider: ContractProvider): Promise<bigint> {
        const state = await provider.getState();
        return state.balance;
    }

}

