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