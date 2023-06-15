import { buildNftCollectionDataCell, CollectionMinter } from '../wrappers/CollectionMinter';
import { compile, NetworkProvider, sleep } from '@ton-community/blueprint';
import { Address, beginCell, Cell, toNano } from 'ton-core';
import { randomAddress } from '@ton-community/test-utils';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Minter address'));

    const minter = provider.open(CollectionMinter.createFromAddress(address));

    const collectionDataCell = buildNftCollectionDataCell({
        ownerAddress: address, 
        nextItemIndex: 0, 
        collectionContent: "",
        commonContent: 'tonstorage://0D51A77C4BE0E59ED44D149B5FE32332AE726FE09AE83E84E363FC50A21DFB56/',
        nftItemCode: await compile('NftItem'),
        royaltyParams: {
            royaltyFactor: 12,
            royaltyBase: 100,
            royaltyAddress: randomAddress()
        },
    });

    await minter.sendMintCollectionMsg(provider.sender(), {
        collectionCode: await compile('NftCollection'),
        collectionData: collectionDataCell,
    });

    sleep(4000);

    const nextCollectionIndex = await minter.getNextCollectionIndex();
    console.log(nextCollectionIndex);
    ui.write("Collection deployed!");
}