import React, { useState } from 'react';
import './App.css';
import DepositWithdraw from './components/DepositWithdraw';
import BankDemo from './components/BankDemo';
import { useWeb3 } from './hooks/useWeb3';
import { ToastProvider } from './contexts/ToastContext';
import { User, Building2 } from 'lucide-react';

function App() {
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
    <ToastProvider>
      <div className="App">
        <header className="app-header">
          <h1>스테이블코인 예금 시스템</h1>
          <p>블록체인 기반 디지털 예금 서비스</p>
          
          <div className="view-switcher">
            <button
              className={`view-tab ${activeView === 'customer' ? 'active' : ''}`}
              onClick={() => setActiveView('customer')}
            >
              <User size={16} />
              예금
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
    </ToastProvider>
  );
}

export default App;
