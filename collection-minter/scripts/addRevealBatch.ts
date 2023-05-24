import { CollectionMinter } from '../wrappers/CollectionMinter';
import { compile, NetworkProvider, sleep } from '@ton-community/blueprint';
import { Address, beginCell, Cell, toNano } from 'ton-core';


export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Minter address'));

    const minter = provider.open(CollectionMinter.createFromAddress(address));

    await minter.sendCollectionAddRevealBatchMsg(provider.sender(), {
        revealBatch: [
            {
                index: 1,
                either: 0,
                revealContent: '3'
            },
            {
                index: 2,
                either: 1,
                revealContent: '4'
            },
        ],
        value: toNano('0.05'),
        collectionId: 1,
    });

    ui.write("Added reveal!");
}