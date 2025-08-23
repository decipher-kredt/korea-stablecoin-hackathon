import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import StableCoinABI from '../abi/StableCoinABI.json';


const KREDT = '0xD0eF62D450c249A1bC3D9c9045Ee8Df4503eB24A'; // Replace with deployed address

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

export const useStableCoin = () => {
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
      console.log('useStableCoin - Starting connection...');
      
      if (typeof (window as any).ethereum === 'undefined') {
        alert('이 dApp을 사용하려면 MetaMask를 설치해주세요');
        return;
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(KREDT, StableCoinABI, signer);

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
      
      console.log('useStableCoin - Connection completed successfully');
    } catch (error) {
      console.error('useStableCoin - 지갑 연결 오류:', error);
      throw error;
    }
  };

  const updateBalanceOf = async (account: string, contract: ethers.Contract) => {
    try {
      const bal = await contract.balanceOf(account);
      setWeb3State(prev => ({
        ...prev,
        balance: ethers.formatEther(bal),
      }));
    } catch (error) {
      console.error('토큰 잔액 업데이트 오류:', error);
      // 에러가 발생해도 기본값으로 설정
      setWeb3State(prev => ({
        ...prev,
        balance: '0',
      }));
    }
  };

  const approve = async (spender: string, amount: string): Promise<{ success: boolean; txHash?: string }> => {
    try {
      // 지갑이 연결되지 않았다면 연결 시도
      if (!web3State.contract || !web3State.signer) {
        console.log('StableCoin - 지갑 연결 시도');
        await connectWallet();
      }
      
      if (!web3State.contract || !web3State.signer) {
        console.error('StableCoin - 지갑 연결 실패');
        return { success: false };
      }
      
      const amountWei = ethers.parseEther(amount);
      const tx = await web3State.contract.approve(spender, amountWei);
      const receipt = await tx.wait();
      return { success: true, txHash: receipt.hash };
    } catch (error) {
      console.error('승인 오류:', error);
      return { success: false };
    }
  };

  const allowance = async (spender: string): Promise<string> => {
    if (!web3State.contract || !web3State.account) return '0';
    try {
      const a = await web3State.contract.allowance(web3State.account, spender);
      return ethers.formatEther(a);
    } catch (error) {
      console.error('허용 한도 조회 오류:', error);
      return '0';
    }
  };

  // 자동으로 지갑 연결 상태 확인 (balance 업데이트 없음)
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof (window as any).ethereum !== 'undefined') {
        try {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0 && !web3State.isConnected) {
            console.log('useStableCoin - 자동 연결 감지됨');
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(KREDT, StableCoinABI, signer);
            
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
          console.log('useStableCoin - 자동 연결 확인 실패:', error);
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
  const refreshBalance = async (): Promise<void> => {
    if (!web3State.account || !web3State.contract) return;
    await updateBalanceOf(web3State.account, web3State.contract);
  };

  return {
    ...web3State,
    connectWallet,
    approve,
    allowance,
    refreshBalance,
  };
};