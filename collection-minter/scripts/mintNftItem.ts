import { CollectionMinter } from '../wrappers/CollectionMinter';
import { compile, NetworkProvider, sleep } from '@ton-community/blueprint';
import { Address } from 'ton-core';


export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Minter address'));

    const minter = provider.open(CollectionMinter.createFromAddress(address));

    await minter.sendMintNftItemMsg(provider.sender(), {
        collectionId: 1,
        itemOwnerAddress: provider.sender().address as Address,
        itemEditorAddress: provider.sender().address as Address,
        itemContent: '',
        itemIndex: 0,
    });

    ui.write("Item deployed!");
}