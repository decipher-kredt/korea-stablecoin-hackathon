import React from 'react';
import './App.css';
import DepositWithdraw from './components/DepositWithdraw';
import { useWeb3 } from './hooks/useWeb3';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  const {
    account,
    depositedAmount,
    interest,
    isConnected,
    connectWallet,
    deposit,
    withdraw,
  } = useWeb3();

  return (
    <ToastProvider>
      <div className="App">
        <header className="app-header">
          <h1>스테이블코인 예금</h1>
          <p>스테이블코인 예금으로 연 3.0% 이자를 받으세요</p>
        </header>
        <main className="main-content">
          <DepositWithdraw
            account={account}
            depositedAmount={depositedAmount}
            interest={interest}
            isConnected={isConnected}
            onConnect={connectWallet}
            onDeposit={deposit}
            onWithdraw={withdraw}
          />
        </main>
      </div>
    </ToastProvider>
  );
}

export default App;
