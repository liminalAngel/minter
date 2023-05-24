import { CollectionMinter } from '../wrappers/CollectionMinter';
import { NetworkProvider } from '@ton-community/blueprint';
import { Address, toNano } from 'ton-core';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Minter address'));

    const minter = provider.open(CollectionMinter.createFromAddress(address));

    await minter.sendWithdraw(provider.sender(), {
        withdrawAmount: toNano('0.5')
    });

}