import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import PaymentSystemABI from '../abi/PaymentSystemABI.json';



const CONTRACT_ADDRESS = '0xae4AAD5AF1Ccbb68655311dA4b9F782898180000'; // Replace with deployed address

export interface Web3State {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  contract: ethers.Contract | null;
  balance: string;
  depositedAmount: string;
  interest: string;
  isConnected: boolean;
}

export const usePaymentSystem = () => {
  const [web3State, setWeb3State] = useState<Web3State>({
    account: null,
    provider: null,
    signer: null,
    contract: null,
    balance: '0',
    depositedAmount: '0',
    interest: '0',
    isConnected: false,
  });

  const connectWallet = async () => {
    try {
      if (typeof (window as any).ethereum === 'undefined') {
        alert('이 dApp을 사용하려면 MetaMask를 설치해주세요');
        return;
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);

      // Kaia Kairos Testnet 네트워크로 전환
      const chainId = '0x3e9'; // 1001 in hex for Kaia Kairos testnet
      
      // 먼저 네트워크 추가를 시도
      try {
        await provider.send('wallet_addEthereumChain', [{
          chainId,
          chainName: 'Kaia Kairos Testnet',
          nativeCurrency: {
            name: 'KAIA',
            symbol: 'KAIA',
            decimals: 18
          },
          rpcUrls: ['https://public-en-kairos.node.kaia.io'],
          blockExplorerUrls: ['https://kairos.kaiascan.io']
        }]);
      } catch (addError: any) {
        // 이미 추가된 네트워크인 경우 전환 시도
        if (addError.code === 4001) {
          // 사용자가 거부한 경우
          console.error('사용자가 네트워크 추가를 거부했습니다');
          return;
        }
        // 이미 존재하는 네트워크면 전환 시도
        try {
          await provider.send('wallet_switchEthereumChain', [{ chainId }]);
        } catch (switchError) {
          console.error('네트워크 전환 실패:', switchError);
          throw switchError;
        }
      }

      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(CONTRACT_ADDRESS, PaymentSystemABI, signer);

      setWeb3State({
        account: accounts[0],
        provider,
        signer,
        contract,
        balance: '0',
        depositedAmount: '0',
        interest: '0',
        isConnected: true,
      });

      // PaymentSystem has no deposit info to track here
    } catch (error) {
      console.error('지갑 연결 오류:', error);
    }
  };

  // No balances to update for this hook

  const pay = async (amount: string, products: string[]): Promise<{ success: boolean; txHash?: string }> => {
    if (!web3State.contract || !web3State.signer) return { success: false };
    try {
      const amountWei = ethers.parseEther(amount);
      const tx = await web3State.contract.pay(amountWei, products);
      const receipt = await tx.wait();
      return { success: true, txHash: receipt.hash };
    } catch (error) {
      console.error('결제 오류:', error);
      return { success: false };
    }
  };

  // No withdraw in PaymentSystem

  // 자동으로 지갑 연결 상태 확인 (balance 업데이트 없음)
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof (window as any).ethereum !== 'undefined') {
        try {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0 && !web3State.isConnected) {
            console.log('usePaymentSystem - 자동 연결 감지됨');
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, PaymentSystemABI, signer);
            
            setWeb3State(prev => ({
              ...prev,
              account: accounts[0].address,
              provider,
              signer,
              contract,
              isConnected: true,
            }));
          }
        } catch (error) {
          console.log('usePaymentSystem - 자동 연결 확인 실패:', error);
        }
      }
    };

    checkConnection();
  }, []);

  useEffect(() => {
    if ((window as any).ethereum) {
      (window as any).ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          setWeb3State({
            account: null,
            provider: null,
            signer: null,
            contract: null,
            balance: '0',
            depositedAmount: '0',
            interest: '0',
            isConnected: false,
          });
        } else if (web3State.contract) {
          setWeb3State(prev => ({ ...prev, account: accounts[0] }));
        }
      });
    }
  }, [web3State.contract]);

  return {
    ...web3State,
    connectWallet,
    pay,
  };
};