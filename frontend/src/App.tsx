import {Box, Button, Center, useDisclosure} from "@chakra-ui/react";
import {Header} from "./components/Header";
import {ConnectWalletModal} from "./components/ConnectWalletModal";
import {useWallet} from "./hooks/useWallet";
import { useSendMintTransaction, useSendRevealTransaction } from "./hooks/useSendTransaction";
import {useEffect, useMemo, useState} from "react";
import {isWalletInfoCurrentlyEmbedded, WalletInfo} from "@tonconnect/sdk";
import {connector} from "./connector";

function App() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const wallet = useWallet();
    const [sendMintTransaction, mintConfirmationProgress] = useSendMintTransaction();
    const [sendRevealTransaction, revealConfirmationProgress] = useSendRevealTransaction();

    const [walletsList, setWalletsList] = useState<WalletInfo[] | null>(null);

    useEffect(() => {
        connector.getWallets().then(setWalletsList);
    }, []);

    const embeddedWallet = useMemo(() => walletsList && walletsList.find(isWalletInfoCurrentlyEmbedded), [walletsList]);

    const onConnectClick = () => {
        if (embeddedWallet) {
            connector.connect({jsBridgeKey: embeddedWallet.jsBridgeKey});
        }
        onOpen();
    }

    return (
    <Box p="4">
        <Header onConnect={onConnectClick} />
        <ConnectWalletModal isOpen={isOpen} onClose={onClose} />
        {
            !!wallet && <Center h="700px" w="100%">
            <Button w="190px" onClick={sendMintTransaction} isLoading={mintConfirmationProgress}>Mint</Button>
            <Button marginLeft="50px" w="190px" onClick={sendRevealTransaction} isLoading={revealConfirmationProgress}>Reveal</Button>
        </Center>
        }
    </Box>
  )
}

export default App