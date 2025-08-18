import React, { useState } from 'react';
import { Wallet, ArrowDownCircle, ArrowUpCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface DepositWithdrawProps {
  account: string | null;
  depositedAmount: string;
  interest: string;
  isConnected: boolean;
  onConnect: () => void;
  onDeposit: (amount: string) => Promise<boolean>;
  onWithdraw: () => Promise<boolean>;
}

const DepositWithdraw: React.FC<DepositWithdrawProps> = ({
  account,
  depositedAmount,
  interest,
  isConnected,
  onConnect,
  onDeposit,
  onWithdraw,
}) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('유효한 금액을 입력해주세요');
      return;
    }

    setIsLoading(true);
    const success = await onDeposit(amount);
    if (success) {
      setAmount('');
      alert('입금이 성공적으로 완료되었습니다!');
    } else {
      alert('입금에 실패했습니다. 다시 시도해주세요.');
    }
    setIsLoading(false);
  };

  const handleWithdraw = async () => {
    setIsLoading(true);
    const success = await onWithdraw();
    if (success) {
      alert('출금이 성공적으로 완료되었습니다!');
    } else {
      alert('출금에 실패했습니다. 다시 시도해주세요.');
    }
    setIsLoading(false);
  };

  const totalAmount = (parseFloat(depositedAmount) + parseFloat(interest)).toFixed(4);

  return (
    <div className="deposit-withdraw-container">
      <div className="wallet-section">
        {!isConnected ? (
          <motion.button
            className="connect-wallet-btn"
            onClick={onConnect}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Wallet size={20} />
            지갑 연결
          </motion.button>
        ) : (
          <div className="wallet-info">
            <Wallet size={20} />
            <span>{account?.slice(0, 6)}...{account?.slice(-4)}</span>
          </div>
        )}
      </div>

      {isConnected && (
        <div className="main-interface">
          <div className="balance-display">
            <div className="balance-card">
              <span className="balance-label">예치금</span>
              <span className="balance-amount">{depositedAmount} KRW</span>
            </div>
            <div className="balance-card highlight">
              <span className="balance-label">발생 이자</span>
              <span className="balance-amount">{interest} KRW</span>
            </div>
            <div className="balance-card total">
              <span className="balance-label">총 금액</span>
              <span className="balance-amount">{totalAmount} KRW</span>
            </div>
          </div>

          <div className="action-tabs">
            <button
              className={`tab ${activeTab === 'deposit' ? 'active' : ''}`}
              onClick={() => setActiveTab('deposit')}
            >
              <ArrowDownCircle size={18} />
              입금
            </button>
            <button
              className={`tab ${activeTab === 'withdraw' ? 'active' : ''}`}
              onClick={() => setActiveTab('withdraw')}
            >
              <ArrowUpCircle size={18} />
              출금
            </button>
          </div>

          <div className="action-content">
            {activeTab === 'deposit' ? (
              <div className="deposit-section">
                <div className="input-group">
                  <input
                    type="number"
                    placeholder="입금할 금액을 입력하세요"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="amount-input"
                  />
                  <span className="currency-label">KRW</span>
                </div>
                
                <div className="info-box">
                  <TrendingUp size={16} />
                  <span>연 이자율: 3.0%</span>
                </div>

                <motion.button
                  className="action-btn deposit-btn"
                  onClick={handleDeposit}
                  disabled={isLoading || !amount}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? '처리중...' : '스테이블코인 입금'}
                </motion.button>
              </div>
            ) : (
              <div className="withdraw-section">
                <div className="withdraw-info">
                  <div className="info-row">
                    <span>원금:</span>
                    <span>{depositedAmount} KRW</span>
                  </div>
                  <div className="info-row">
                    <span>이자:</span>
                    <span className="interest-amount">+{interest} KRW</span>
                  </div>
                  <div className="info-row total">
                    <span>출금 가능 금액:</span>
                    <span>{totalAmount} KRW</span>
                  </div>
                </div>

                <motion.button
                  className="action-btn withdraw-btn"
                  onClick={handleWithdraw}
                  disabled={isLoading || parseFloat(depositedAmount) === 0}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? '처리중...' : '전액 출금'}
                </motion.button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DepositWithdraw;