import {useState} from "react";
import {SendTransactionRequest, UserRejectsError} from "@tonconnect/sdk";
import {connector} from "../connector";
import {createStandaloneToast} from "@chakra-ui/react";
import { generateMintPayload } from "../mintTransaction";
import { generateRevealPayload } from "../revealTransaction";

export function useSendMintTransaction() {
    const [confirmationOnProgress, setConfirmationOnProgress] = useState(false);

    async function sendMintTransaction() {

        setConfirmationOnProgress(true);
        const tx: SendTransactionRequest = {
            validUntil: Math.round(Date.now() / 1000) + 360,
            messages: [
                {
                    address: '0:C637079C860757F2983747C151B6FAC153356342D9F8D21FC4F85EA8F6F4CAA3',
                    amount: '50000000',
                    payload: generateMintPayload(),
                } 
            ]
        };

        const { toast } = createStandaloneToast();

        try {
            await connector.sendTransaction(tx);

            toast({
                status: 'success',
                title: 'Transaction sent successfully'
            });
        } catch (e) {
            if (e instanceof UserRejectsError) {
                return toast({
                    status: 'error',
                    title: 'You rejected the transaction'
                });
            }

            toast({
                status: 'error',
                title: 'Unknown error'
            });

            console.error(e);
        } finally {
            setConfirmationOnProgress(false);
        }
    }

    return [sendMintTransaction, confirmationOnProgress] as const;
}

export function useSendRevealTransaction() {
    const [confirmationOnProgress, setConfirmationOnProgress] = useState(false);

    async function sendRevealTransaction() {

        setConfirmationOnProgress(true);
        const tx: SendTransactionRequest = {
            validUntil: Math.round(Date.now() / 1000) + 360,
            messages: [
                {
                    address: '0:A09174C13FFD9CFC3236CEF86F5B0F574FC7F615AB1FE262C4BB006CE04BE304',
                    amount: '1000000000',
                    payload: generateRevealPayload(),
                } 
            ]
        };

        const { toast } = createStandaloneToast();

        try {
            await connector.sendTransaction(tx);

            toast({
                status: 'success',
                title: 'Transaction sent successfully'
            });
        } catch (e) {
            if (e instanceof UserRejectsError) {
                return toast({
                    status: 'error',
                    title: 'You rejected the transaction'
                });
            }

            toast({
                status: 'error',
                title: 'Unknown error'
            });

            console.error(e);
        } finally {
            setConfirmationOnProgress(false);
        }
    }

    return [sendRevealTransaction, confirmationOnProgress] as const;
}