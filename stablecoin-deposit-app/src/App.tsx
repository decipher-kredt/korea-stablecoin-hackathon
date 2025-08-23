import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import DepositWithdraw from './components/DepositWithdraw';
import PaymentToReceipt from './components/PaymentToReceipt';
import BankDemo from './components/BankDemo';
import Settlement from './components/Settlement';
import './components/PaymentToReceipt.css';
import { useVaultManager } from './hooks/useVaultManager';
import { useStableCoin } from './hooks/useStableCoin';
import { usePaymentSystem } from './hooks/usePaymentSystem';
import { useECommerce } from './hooks/useECommerce';
import { ToastProvider } from './contexts/ToastContext';
import { Wallet, Receipt, Home, User, Building2, Calculator } from 'lucide-react';

const HomePage = () => {
  // 홈화면에서는 단순히 MetaMask 연결 상태만 확인
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);

  const checkWalletConnection = async () => {
    if (typeof (window as any).ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          setIsConnected(true);
          setAccount(accounts[0].address);
        } else {
          setIsConnected(false);
          setAccount(null);
        }
      } catch (error) {
        console.log('홈화면 - 지갑 연결 확인 실패:', error);
        setIsConnected(false);
        setAccount(null);
      }
    }
  };

  const handleConnectWallet = async () => {
    if (typeof (window as any).ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        
        if (accounts.length > 0) {
          setIsConnected(true);
          setAccount(accounts[0]);
        }
      } catch (error) {
        console.log('홈화면 - 지갑 연결 실패:', error);
      }
    }
  };

  // 페이지 로드 시 지갑 연결 상태 확인
  useEffect(() => {
    checkWalletConnection();
  }, []);

  return (
    <>
      <div className="sticky-wallet">
        {isConnected ? (
          <div className="wallet-info">
            <Wallet size={16} />
            {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
          </div>
        ) : (
          <button className="connect-wallet-btn" onClick={handleConnectWallet}>
            <Wallet size={16} />
            지갑 연결
          </button>
        )}
      </div>
      <div className="home-page">
        <h1>대한민국 스테이블코인 해커톤 데모</h1>
      
      <div className="demo-cards">
        <Link to="/deposit" className="demo-card">
          <Wallet className="demo-icon" size={48} />
          <h3>예금 시스템</h3>
          <p>스테이블코인 예금 및 출금</p>
        </Link>
        
        <Link to="/receipt" className="demo-card">
          <Receipt className="demo-icon" size={48} />
          <h3>현금영수증</h3>
          <p>암호화폐 결제 영수증 발행</p>
        </Link>
        
        <Link to="/settlement" className="demo-card">
          <Calculator className="demo-icon" size={48} />
          <h3>이커머스 셀러 정산</h3>
          <p>이커머스 셀러 3곳 스테이블코인 정산</p>
        </Link>
      </div>
      </div>
    </>
  );
};

const DepositPage = () => {
  const [activeView, setActiveView] = useState<'customer' | 'bank'>('customer');
  const {
    account,
    depositedAmount,
    interest,
    isConnected,
    connectWallet,
    deposit,
    withdraw,
    mintAndDepositStableCoin,
    transferWithInterest,
    totalSupply,
    vaultBalance,
    refreshStableCoinInfo,
    isLoadingStableCoin,
    updateBalances,
    contract,
  } = useVaultManager();

  const handleConnectWallet = async () => {
    await connectWallet();
    // 지갑 연결 후 수동으로 balance 업데이트
    if (account && contract) {
      try {
        await updateBalances(account, contract);
      } catch (error) {
        console.log('예금 서비스 - balance 업데이트 실패:', error);
      }
    }
  };

  return (
    <>
      <div className="sticky-wallet">
        {isConnected ? (
          <div className="wallet-info">
            <Wallet size={16} />
            {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
          </div>
        ) : (
          <button className="connect-wallet-btn" onClick={handleConnectWallet}>
            <Wallet size={16} />
            지갑 연결
          </button>
        )}
      </div>
      <div className="App">
        <header className="app-header">
          <Link to="/" className="back-link">
            <Home size={20} />
            홈으로
          </Link>
          <h1>스테이블코인 예금 시스템</h1>
          <p>블록체인 기반 디지털 예금 서비스</p>
          
          <div className="view-switcher">
            <button
              className={`view-tab ${activeView === 'customer' ? 'active' : ''}`}
              onClick={() => setActiveView('customer')}
            >
              <User size={16} />
              고객 예금
            </button>
            <button
              className={`view-tab ${activeView === 'bank' ? 'active' : ''}`}
              onClick={() => {
                setActiveView('bank');
                // 은행 탭으로 이동할 때 스테이블코인 정보 업데이트 (지갑 연결 없이도 가능)
                refreshStableCoinInfo();
              }}
            >
              <Building2 size={16} />
              은행 운영
            </button>
          </div>
        </header>
      <main className="main-content">
        {activeView === 'customer' ? (
          <DepositWithdraw
            account={account}
            depositedAmount={depositedAmount}
            interest={interest}
            isConnected={isConnected}
            onConnect={connectWallet}
            onDeposit={deposit}
            onWithdraw={withdraw}
            onSwitchToBank={() => setActiveView('bank')}
          />
        ) : (
          <BankDemo 
            onMintStablecoin={mintAndDepositStableCoin} 
            onTransferWithInterest={transferWithInterest}
            totalSupply={totalSupply}
            vaultBalance={vaultBalance}
            isLoadingStableCoin={isLoadingStableCoin}
          />
        )}
      </main>
      </div>
    </>
  );
};

const ReceiptPage = () => {
  const { account: stableCoinAccount, isConnected: isStableCoinConnected, connectWallet: connectStableCoin } = useStableCoin();
  const { account: paymentAccount, isConnected: isPaymentConnected, connectWallet: connectPayment } = usePaymentSystem();

  const handleConnectWallet = async () => {
    await connectStableCoin();
    await connectPayment();
  };

  const isConnected = isStableCoinConnected && isPaymentConnected;
  const account = stableCoinAccount || paymentAccount;

  return (
    <>
      <div className="sticky-wallet">
        {isConnected ? (
          <div className="wallet-info">
            <Wallet size={16} />
            {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
          </div>
        ) : (
          <button className="connect-wallet-btn" onClick={handleConnectWallet}>
            <Wallet size={16} />
            지갑 연결
          </button>
        )}
      </div>
      <div className="App">
        <header className="app-header">
          <Link to="/" className="back-link">
            <Home size={20} />
            홈으로
          </Link>
          <h1>현금영수증 발행 시스템</h1>
          <p>스테이블코인 결제 소득공제 영수증</p>
        </header>
      <main className="main-content">
        <PaymentToReceipt />
      </main>
      </div>
    </>
  );
};

const SettlementPage = () => {
  const { account: ecommerceAccount, isConnected: isEcommerceConnected, connectWallet: connectEcommerce } = useECommerce();
  const { account: stableCoinAccount, isConnected: isStableCoinConnected, connectWallet: connectStableCoin } = useStableCoin();

  const handleConnectWallet = async () => {
    await connectEcommerce();
    await connectStableCoin();
  };

  const isConnected = isEcommerceConnected && isStableCoinConnected;
  const account = ecommerceAccount || stableCoinAccount;

  return (
    <>
      <div className="sticky-wallet">
        {isConnected ? (
          <div className="wallet-info">
            <Wallet size={16} />
            {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
          </div>
        ) : (
          <button className="connect-wallet-btn" onClick={handleConnectWallet}>
            <Wallet size={16} />
            지갑 연결
          </button>
        )}
      </div>
      <div className="App">
        <header className="app-header">
          <Link to="/" className="back-link">
            <Home size={20} />
            홈으로
          </Link>
          <h1>이커머스 셀러 정산 시스템</h1>
          <p>이커머스 셀러 스테이블코인 자동 정산</p>
        </header>
      <main className="main-content">
        <Settlement />
      </main>
      </div>
    </>
  );
};

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/deposit" element={<DepositPage />} />
          <Route path="/receipt" element={<ReceiptPage />} />
          <Route path="/settlement" element={<SettlementPage />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
