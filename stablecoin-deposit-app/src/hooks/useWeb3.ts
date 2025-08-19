import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractABI from '../contracts/abi.json';

const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000'; // Replace with deployed address

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

export const useWeb3 = () => {
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

      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, signer);

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

      await updateBalances(accounts[0], contract);
    } catch (error) {
      console.error('지갑 연결 오류:', error);
    }
  };

  const updateBalances = async (account: string, contract: ethers.Contract) => {
    try {
      const depositInfo = await contract.getDepositInfo(account);
      setWeb3State(prev => ({
        ...prev,
        depositedAmount: ethers.formatEther(depositInfo.principal),
        interest: ethers.formatEther(depositInfo.interest),
      }));
    } catch (error) {
      console.error('잔액 업데이트 오류:', error);
    }
  };

  const deposit = async (amount: string): Promise<boolean> => {
    if (!web3State.contract || !web3State.signer) return false;

    try {
      const amountWei = ethers.parseEther(amount);
      const tx = await web3State.contract.deposit(amountWei);
      await tx.wait();

      if (web3State.account) {
        await updateBalances(web3State.account, web3State.contract);
      }

      return true;
    } catch (error) {
      console.error('입금 오류:', error);
      return false;
    }
  };

  const withdraw = async (): Promise<boolean> => {
    if (!web3State.contract) return false;

    try {
      const tx = await web3State.contract.withdraw();
      await tx.wait();

      if (web3State.account) {
        await updateBalances(web3State.account, web3State.contract);
      }

      return true;
    } catch (error) {
      console.error('출금 오류:', error);
      return false;
    }
  };

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
          updateBalances(accounts[0], web3State.contract!);
        }
      });
    }
  }, [web3State.contract]);

  return {
    ...web3State,
    connectWallet,
    deposit,
    withdraw,
  };
};