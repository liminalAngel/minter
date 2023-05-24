import { Base64 } from '@tonconnect/protocol';
import { Address, beginCell } from 'ton';
import { crc32 } from './utils/crc32';

export function generateMintPayload(): string {
	const op = crc32('op::mint_nft_item'); 

    const nftContent = beginCell();
    nftContent.storeBuffer(Buffer.from('')); // put here json link

    const nftItemMessage = beginCell();

    nftItemMessage.storeAddress(Address.parse('EQBNHgU3GiNnGewebGogIfblJhInOtKkbO6knXDXQ24BBOJX'));
    nftItemMessage.storeAddress(Address.parse('EQBNHgU3GiNnGewebGogIfblJhInOtKkbO6knXDXQ24BBOJX'));
    nftItemMessage.storeRef(nftContent);

	const messageBody = beginCell()
		.storeUint(op, 32)
		.storeUint(1, 64)
        .storeUint(0, 64)
		.storeRef(nftItemMessage)
		.endCell();

	return Base64.encode(messageBody.toBoc());
}
