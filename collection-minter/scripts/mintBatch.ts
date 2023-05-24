import { CollectionMinter } from '../wrappers/CollectionMinter';
import { compile, NetworkProvider, sleep } from '@ton-community/blueprint';
import { Address, beginCell, Cell, toNano } from 'ton-core';


export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Minter address'));

    const minter = provider.open(CollectionMinter.createFromAddress(address));

    await minter.sendBatchNftMintMsg(provider.sender(), {
        nfts: [
            {
                passAmount: toNano('0.05'),
                index: 1,
                ownerAddress: provider.sender().address as Address,
                editorAddress: provider.sender().address as Address,
                content: '1'
            },
            {
                passAmount: toNano('0.05'),
                index: 2,
                ownerAddress: provider.sender().address as Address,
                editorAddress: provider.sender().address as Address,
                content: '2'
            },
        ],
        collectionId: 1,
    });

    ui.write("Items deployed!");
}