import { CollectionMinter } from '../wrappers/CollectionMinter';
import { compile, NetworkProvider, sleep } from '@ton-community/blueprint';
import { randomAddress } from '@ton-community/test-utils';
import { Address, beginCell, Cell, toNano } from 'ton-core';


export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Minter address'));

    const minter = provider.open(CollectionMinter.createFromAddress(address));

    await minter.sendChangeCollectionOwnerMsg(provider.sender(), {
        collectionId: 0,
        newOwner: randomAddress(),
    });

    ui.write("Owner was changed!");
}