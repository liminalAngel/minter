import { Address, toNano } from 'ton-core';
import { NftItem } from '../wrappers/NftItem';
import { NetworkProvider, sleep } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Nft address'));

    const nftItem = provider.open(NftItem.createFromAddress(address));

        await nftItem.sendNftRevealUserRequest(provider.sender(), {
            queryId: Date.now(),
        });

    ui.write('Reveal request sent!');
}