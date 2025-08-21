import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import DepositWithdraw from './components/DepositWithdraw';
import BankDemo from './components/BankDemo';
import PaymentToReceipt from './components/PaymentToReceipt';
import Settlement from './components/Settlement';
import './components/PaymentToReceipt.css';
import { useWeb3 } from './hooks/useWeb3';
import { ToastProvider } from './contexts/ToastContext';
import { Wallet, Receipt, Home, User, Building2, Calculator } from 'lucide-react';

const HomePage = () => {
  const { account, isConnected, connectWallet } = useWeb3();

  return (
    <>
      <div className="sticky-wallet">
        {isConnected ? (
          <div className="wallet-info">
            <Wallet size={16} />
            {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
          </div>
        ) : (
          <button className="connect-wallet-btn" onClick={connectWallet}>
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
    mintStablecoin,
    transferWithInterest,
  } = useWeb3();

  return (
    <>
      <div className="sticky-wallet">
        {isConnected ? (
          <div className="wallet-info">
            <Wallet size={16} />
            {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
          </div>
        ) : (
          <button className="connect-wallet-btn" onClick={connectWallet}>
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
              onClick={() => setActiveView('bank')}
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
          />
        ) : (
          <BankDemo
            onMintStablecoin={mintStablecoin}
            onTransferWithInterest={transferWithInterest}
          />
        )}
      </main>
      </div>
    </>
  );
};

const ReceiptPage = () => {
  const { account, isConnected, connectWallet } = useWeb3();

  return (
    <>
      <div className="sticky-wallet">
        {isConnected ? (
          <div className="wallet-info">
            <Wallet size={16} />
            {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
          </div>
        ) : (
          <button className="connect-wallet-btn" onClick={connectWallet}>
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
  const { account, isConnected, connectWallet } = useWeb3();

  return (
    <>
      <div className="sticky-wallet">
        {isConnected ? (
          <div className="wallet-info">
            <Wallet size={16} />
            {account?.substring(0, 6)}...{account?.substring(account.length - 4)}
          </div>
        ) : (
          <button className="connect-wallet-btn" onClick={connectWallet}>
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
