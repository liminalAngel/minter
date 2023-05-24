import { Base64 } from '@tonconnect/protocol';
import { beginCell } from 'ton';
import { crc32 } from './utils/crc32';

export function generateRevealPayload(): string {
	const op = crc32('op::nft_reveal_user_request');

	const messageBody = beginCell()
		.storeUint(op, 32)
		.storeUint(0, 64)
        .endCell()

	return Base64.encode(messageBody.toBoc());
}