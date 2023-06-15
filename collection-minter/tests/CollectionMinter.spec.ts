import { Blockchain, SandboxContract, TreasuryContract } from '@ton-community/sandbox';
import { Cell, Dictionary, toNano } from 'ton-core';
import { CollectionMinter, buildNftCollectionDataCell } from '../wrappers/CollectionMinter';
import '@ton-community/test-utils';
import { compile, sleep } from '@ton-community/blueprint';
import { randomAddress } from '@ton-community/test-utils';

describe('CollectionMinter', () => {
    let code: Cell;
    let blockchain: Blockchain;
    let collectionMinter: SandboxContract<CollectionMinter>;
    let owner: SandboxContract<TreasuryContract>;

    beforeAll(async () => {
        code = await compile('CollectionMinter');
    });
    
    beforeEach(async () => {
        blockchain = await Blockchain.create();
        owner = await blockchain.treasury('owner');

        collectionMinter = blockchain.openContract(CollectionMinter.createFromConfig({
            owner: owner.address,
            nextCollectionIndex: 0,
            mintPrice: toNano('0.05'),
            collections: Dictionary.empty(Dictionary.Keys.Uint(256), Dictionary.Values.Address())
        }, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await collectionMinter.sendDeploy(deployer.getSender(), toNano('5'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: collectionMinter.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and collectionMinter are ready to use
    });

    it('should mint collections and increase nextCollectionIndex', async () => {

        const collectionDataCell = buildNftCollectionDataCell({
            ownerAddress: owner.address,
            nextItemIndex: 0,
            collectionContent: '',
            commonContent: '',
            nftItemCode: await compile('NftItem'),
            royaltyParams: {
                royaltyFactor: 12,
                royaltyBase: 100,
                royaltyAddress: randomAddress()
            },
        });
        
        const mintCollectionResult = await collectionMinter.sendMintCollectionMsg(owner.getSender(), {
            collectionCode: await compile('NftCollection'),
            collectionData: collectionDataCell,
        });
        
        expect(mintCollectionResult.transactions).toHaveTransaction({
            from: owner.address,
            to: collectionMinter.address,
            success: true
        });
        
        const nextCollectionIndex = await collectionMinter.getNextCollectionIndex();
        
        expect(nextCollectionIndex).toBeGreaterThan(0);
    });

    it('should change owner', async () => {
        const newOwnerAddress = randomAddress();
  
        const changeOwnerResult = await collectionMinter.sendChangeOwnerMsg(owner.getSender(), {
          newOwner: newOwnerAddress
        });
  
        expect(changeOwnerResult.transactions).toHaveTransaction({
          from: owner.address,
          to: collectionMinter.address,
          success: true,
        });
  
        const currentOwnerAddress = await collectionMinter.getOwnerAddress();
  
        expect(currentOwnerAddress).toEqualAddress(newOwnerAddress);
    });
});
