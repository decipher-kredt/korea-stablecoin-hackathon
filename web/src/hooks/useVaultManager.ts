import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import VaultManagerABI from '../abi/VaultManagerABI.json';
import StableCoinABI from '../abi/StableCoinABI.json';
// Removed unrelated ABIs; this hook is only for VaultManager


const CONTRACT_ADDRESS = '0x01fB4249Dcc0e3F82BcA02C39282802d6757799e'; // Replace with deployed address
const STABLECOIN_ADDRESS = '0xD0eF62D450c249A1bC3D9c9045Ee8Df4503eB24A'; // StableCoin contract address
const VAULT_ADDRESS = '0xC44C01b57D09A0FD37b9071076230Aa5F8ed411A'; // Vault address

export interface Web3State {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  contract: ethers.Contract | null;
  balance: string;
  depositedAmount: string;
  interest: string;
  isConnected: boolean;
  totalSupply: string;
  vaultBalance: string;
  isLoadingStableCoin: boolean;
}

export const useVaultManager = () => {
  const [web3State, setWeb3State] = useState<Web3State>({
    account: null,
    provider: null,
    signer: null,
    contract: null,
    balance: '0',
    depositedAmount: '0',
    interest: '0',
    isConnected: false,
    totalSupply: '0',
    vaultBalance: '0',
    isLoadingStableCoin: false,
  });

  const refreshStableCoinInfo = async (skipLoadingStart = false): Promise<void> => {
    try {
      // 로딩 상태 시작 (skipLoadingStart가 true가 아닐 때만)
      if (!skipLoadingStart) {
        setWeb3State(prev => ({ ...prev, isLoadingStableCoin: true }));
      }
      
      // 공개 RPC로 읽기 전용 provider 생성
      const provider = new ethers.JsonRpcProvider('https://public-en-kairos.node.kaia.io');
      const stableCoinContract = new ethers.Contract(STABLECOIN_ADDRESS, StableCoinABI, provider);
      
      // 전체 발행량과 Vault 잔액 조회
      const totalSupply = await stableCoinContract.totalSupply();
      const vaultBalance = await stableCoinContract.balanceOf(VAULT_ADDRESS);
      
      console.log('StableCoin totalSupply:', totalSupply.toString());
      console.log('Vault balance:', vaultBalance.toString());
      
      setWeb3State(prev => ({
        ...prev,
        totalSupply: ethers.formatEther(totalSupply),
        vaultBalance: ethers.formatEther(vaultBalance),
        isLoadingStableCoin: false,
      }));
    } catch (error) {
      console.error('StableCoin 정보 업데이트 오류:', error);
      setWeb3State(prev => ({ ...prev, isLoadingStableCoin: false }));
    }
  };

  // 컴포넌트 마운트 시 스테이블코인 정보 로드
  useEffect(() => {
    refreshStableCoinInfo();
  }, []);

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

      const contract = new ethers.Contract(CONTRACT_ADDRESS, VaultManagerABI, signer);

      setWeb3State(prev => ({
        ...prev,
        account: accounts[0],
        provider,
        signer,
        contract,
        balance: '0',
        depositedAmount: '0',
        interest: '0',
        isConnected: true,
      }));

      // connectWallet에서는 balance 업데이트 하지 않음 (수동으로만 호출)
      console.log('useVaultManager - connectWallet 완료 (balance 업데이트는 수동으로)');
    } catch (error) {
      console.error('지갑 연결 오류:', error);
    }
  };

  const updateBalances = async (account: string, contract: ethers.Contract) => {
    try {
      // 컨트랙트가 유효한지 확인
      if (!contract || !contract.getDepositInfo) {
        console.log('VaultManager - 유효하지 않은 컨트랙트');
        return;
      }
      
      console.log('VaultManager - updateBalances 호출:', account);
      const depositInfo = await contract.getDepositInfo(account);
      console.log('VaultManager - depositInfo:', depositInfo);
      
      setWeb3State(prev => ({
        ...prev,
        depositedAmount: ethers.formatEther(depositInfo.principal),
        interest: ethers.formatEther(depositInfo.interest),
      }));
    } catch (error) {
      console.error('VaultManager - 잔액 업데이트 오류:', error);
      // 에러가 발생해도 기본값으로 설정
      setWeb3State(prev => ({
        ...prev,
        depositedAmount: '0',
        interest: '0',
      }));
    }
  };

  const deposit = async (amount: string): Promise<{ success: boolean; txHash?: string }> => {
    if (!web3State.contract || !web3State.signer) return { success: false };

    try {
      const amountWei = ethers.parseEther(amount);
      if (!web3State.account) return { success: false };
      const tx = await web3State.contract.deposit(web3State.account, amountWei);
      const receipt = await tx.wait();

      if (web3State.account) {
        await updateBalances(web3State.account, web3State.contract);
      }

      return { success: true, txHash: receipt.hash };
    } catch (error) {
      console.error('입금 오류:', error);
      return { success: false };
    }
  };


  // 자동으로 지갑 연결 상태 확인 (balance 업데이트 없음 - 수동으로만 호출)
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof (window as any).ethereum !== 'undefined') {
        try {
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0 && !web3State.isConnected) {
            console.log('useVaultManager - 자동 연결 감지됨');
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, VaultManagerABI, signer);
            
            setWeb3State(prev => ({
              ...prev,
              account: accounts[0].address,
              provider,
              signer,
              contract,
              isConnected: true,
            }));
            
            // 자동 연결 시에는 balance 업데이트 하지 않음 (수동으로만 호출)
            console.log('useVaultManager - 자동 연결 완료 (balance 업데이트는 수동으로)');
          }
        } catch (error) {
          console.log('useVaultManager - 자동 연결 확인 실패:', error);
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
            totalSupply: '0',
            vaultBalance: '0',
            isLoadingStableCoin: false,
          });
        } else if (web3State.contract) {
          setWeb3State(prev => ({ ...prev, account: accounts[0] }));
        } else {
          setWeb3State({
            account: null,
            provider: null,
            signer: null,
            contract: null,
            balance: '0',
            depositedAmount: '0',
            interest: '0',
            isConnected: false,
            totalSupply: '0',
            vaultBalance: '0',
            isLoadingStableCoin: false,
          });
        }
      });
    }
  }, [web3State.contract]);

  const refreshDepositInfo = async (): Promise<void> => {
    if (!web3State.account || !web3State.contract) return;
    await updateBalances(web3State.account, web3State.contract);
  };

      return {
      ...web3State,
      connectWallet,
      deposit,
      updateBalances,
      // Bank demo helpers
      mintAndDepositStableCoin: async (amount: string, recipient: string): Promise<{ success: boolean; txHash?: string }> => {
        if (!web3State.contract || !web3State.signer) return { success: false };
        try {
          // 트랜잭션 시작 전 로딩 상태 시작
          setWeb3State(prev => ({ ...prev, isLoadingStableCoin: true }));
          
          const amountWei = ethers.parseEther(amount);
          // 은행이 입금할 때는 VaultManager의 deposit 함수 호출
          const tx = await web3State.contract.deposit(recipient, amountWei);
          const receipt = await tx.wait();
          
          // 트랜잭션 완료 후 스테이블코인 정보만 업데이트 (로딩 시작은 이미 했으므로 스킵)
          await refreshStableCoinInfo(true);
          
          return { success: true, txHash: receipt.hash };
        } catch (error) {
          console.error('스테이블코인 발행 오류:', error);
          // 에러 시 로딩 상태 해제
          setWeb3State(prev => ({ ...prev, isLoadingStableCoin: false }));
          return { success: false };
        }
      },
      transferWithInterest: async (recipient: string, principal: string, interest: string): Promise<{ success: boolean; txHash?: string }> => {
        if (!web3State.contract || !web3State.signer) return { success: false };
        try {
          // 트랜잭션 시작 전 로딩 상태 시작
          setWeb3State(prev => ({ ...prev, isLoadingStableCoin: true }));
          
          // 은행이 원금 + 이자를 송금할 때는 VaultManager의 withdraw 함수 호출
          const tx = await web3State.contract.withdraw(recipient);
          const receipt = await tx.wait();
          
          // 트랜잭션 완료 후 스테이블코인 정보만 업데이트 (로딩 시작은 이미 했으므로 스킵)
          await refreshStableCoinInfo(true);
          
          return { success: true, txHash: receipt.hash };
        } catch (error) {
          console.error('송금 오류:', error);
          // 에러 시 로딩 상태 해제
          setWeb3State(prev => ({ ...prev, isLoadingStableCoin: false }));
          return { success: false };
        }
      },
      refreshDepositInfo,
      refreshStableCoinInfo,
    };
};