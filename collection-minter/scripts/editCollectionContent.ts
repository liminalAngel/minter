import { CollectionMinter } from '../wrappers/CollectionMinter';
import { compile, NetworkProvider, sleep } from '@ton-community/blueprint';
import { randomAddress } from '@ton-community/test-utils';
import { Address, beginCell, Cell, toNano } from 'ton-core';


export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Minter address'));

    const minter = provider.open(CollectionMinter.createFromAddress(address));

    await minter.sendEditCollectionContentMsg(provider.sender(), {
        collectionId: 1,
        royaltyParams: {
            royaltyFactor: 15,
            royaltyBase: 100,
            royaltyAddress: randomAddress()
        },
        commonContent: '',
        content: ''
    });

    ui.write("Edited!");
}