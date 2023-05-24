import { Address, Dictionary, toNano } from 'ton-core';
import { CollectionMinter } from '../wrappers/CollectionMinter';
import { compile, NetworkProvider } from '@ton-community/blueprint';

export async function run(provider: NetworkProvider) {
    const collectionMinter = provider.open(CollectionMinter.createFromConfig({

        owner: provider.sender().address as Address,
        nextCollectionIndex: 0,
        mintPrice: toNano('0.05'),
        collections: Dictionary.empty(Dictionary.Keys.Uint(256), Dictionary.Values.Address())

    }, await compile('CollectionMinter')));

    await collectionMinter.sendDeploy(provider.sender(), toNano('1'));

    await provider.waitForDeploy(collectionMinter.address);

    // run methods on `collectionMinter`
}
