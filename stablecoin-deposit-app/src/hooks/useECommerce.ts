import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import ECommerceABI from '../abi/ECommerceABI.json';

const CONTRACT_ADDRESS = '0x3DC5b13a8211bc150DE77665792a5B286bbe6676';

export interface SellerInfo {
  name: string;
  address: string;
  balance: string;
}

export interface Web3State {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  contract: ethers.Contract | null;
  balance: string;
  depositedAmount: string;
  interest: string;
  isConnected: boolean;
  sellers: SellerInfo[];
  isLoadingSellers: boolean;
}

export const useECommerce = () => {
  const [web3State, setWeb3State] = useState<Web3State>({
    account: null,
    provider: null,
    signer: null,
    contract: null,
    balance: '0',
    depositedAmount: '0',
    interest: '0',
    isConnected: false,
    sellers: [],
    isLoadingSellers: false,
  });

  const connectWallet = async () => {
    try {
      console.log('useECommerce - Starting connection...');
      
      if (typeof (window as any).ethereum === 'undefined') {
        alert('이 dApp을 사용하려면 MetaMask를 설치해주세요');
        return;
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ECommerceABI, signer);

      setWeb3State({
        account: accounts[0],
        provider,
        signer,
        contract,
        balance: '0',
        depositedAmount: '0',
        interest: '0',
        isConnected: true,
        sellers: [],
        isLoadingSellers: false,
      });
      
      console.log('useECommerce - Connection completed successfully');
    } catch (error) {
      console.error('useECommerce - 지갑 연결 오류:', error);
      throw error;
    }
  };

  const pay = async (amount: string, name: string): Promise<{ success: boolean; txHash?: string }> => {
    try {
      // 지갑이 연결되지 않았다면 연결 시도
      if (!web3State.contract || !web3State.signer) {
        console.log('ECommerce - 지갑 연결 시도');
        await connectWallet();
      }
      
      if (!web3State.contract || !web3State.signer) {
        console.error('ECommerce - 지갑 연결 실패');
        return { success: false };
      }
      
      const amountWei = ethers.parseEther(amount);
      const tx = await web3State.contract.pay(amountWei, name);
      const receipt = await tx.wait();
      return { success: true, txHash: receipt.hash };
    } catch (error) {
      console.error('결제 오류:', error);
      return { success: false };
    }
  };

  const settle = async (): Promise<{ success: boolean; txHash?: string }> => {
    if (!web3State.contract) return { success: false };
    try {
      const tx = await web3State.contract.settle();
      const receipt = await tx.wait();
      return { success: true, txHash: receipt.hash };
    } catch (error) {
      console.error('정산 오류:', error);
      return { success: false };
    }
  };

  const fetchSellers = useCallback(async () => {
    console.log('fetchSellers 호출됨');
    console.log('web3State.contract:', !!web3State.contract);
    
    if (!web3State.contract) {
      console.log('컨트랙트가 없어서 fetchSellers 중단');
      return;
    }
    
    try {
      console.log('Sellers 정보 가져오기 시작');
      setWeb3State(prev => ({ ...prev, isLoadingSellers: true }));
      
      const sellerNames = ['Nike', 'Adidas', 'Puma'];
      const sellersData: SellerInfo[] = [];
      
      for (const name of sellerNames) {
        try {
          console.log(`${name} 셀러 정보 조회 중...`);
          // sellers(name) 함수 호출 - string 매개변수로 SellerInfo 구조체 반환
          const sellerInfo = await web3State.contract.sellers(name);
          console.log(`${name} 셀러 정보:`, sellerInfo);
          
          // SellerInfo 구조체: {addr: address, balance: uint256}
          sellersData.push({
            name,
            address: sellerInfo.addr,
            balance: ethers.formatEther(sellerInfo.balance)
          });
          console.log(`${name} 셀러 추가됨:`, {
            name,
            address: sellerInfo.addr,
            balance: ethers.formatEther(sellerInfo.balance)
          });
        } catch (error) {
          console.log(`Seller ${name} not found or error:`, error);
          // 에러가 발생해도 기본값으로 추가
          sellersData.push({
            name,
            address: '0x0000000000000000000000000000000000000000',
            balance: '0'
          });
        }
      }
      
      console.log('최종 sellers 데이터:', sellersData);
      setWeb3State(prev => ({ 
        ...prev, 
        sellers: sellersData,
        isLoadingSellers: false 
      }));
      console.log('Sellers 정보 업데이트 완료');
    } catch (error) {
      console.error('Sellers 정보 가져오기 실패:', error);
      setWeb3State(prev => ({ ...prev, isLoadingSellers: false }));
    }
  }, [web3State.contract]);

  // 자동으로 지갑 연결 상태 확인 (balance 업데이트 없음)
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof (window as any).ethereum !== 'undefined') {
        try {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0 && !web3State.isConnected) {
            console.log('useECommerce - 자동 연결 감지됨');
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, ECommerceABI, signer);
            
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
          console.log('useECommerce - 자동 연결 확인 실패:', error);
        }
      }
    };

    checkConnection();
  }, [web3State.isConnected]);

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
            sellers: [],
            isLoadingSellers: false,
          });
        } else if (web3State.contract) {
          setWeb3State(prev => ({ ...prev, account: accounts[0] }));
        }
      });
    }
  }, [web3State.contract]);

  useEffect(() => {
    if (web3State.contract) {
      fetchSellers();
    }
  }, [web3State.contract, fetchSellers]);

  return {
    ...web3State,
    connectWallet,
    pay,
    settle,
    fetchSellers,
  };
};