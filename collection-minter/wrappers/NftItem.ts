import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, toNano } from 'ton-core';
import { Opcodes } from './utils/opcodes';

export type NftItemConfig = {};

export function nftItemConfigToCell(config: NftItemConfig): Cell {
    return beginCell().endCell();
}

export class NftItem implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new NftItem(address);
    }

    static createFromConfig(config: NftItemConfig, code: Cell, workchain = 0) {
        const data = nftItemConfigToCell(config);
        const init = { code, data };
        return new NftItem(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendNftRevealUserRequest(provider: ContractProvider, via: Sender,
        opts: {
            queryId: number;
        }
    ) {
        await provider.internal(via, {
            value: toNano('1'),  // min_tons_for_reveal
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.nftRevealUserRequest, 32)
                .storeUint(opts.queryId, 64)
            .endCell(),
        });
    }
}