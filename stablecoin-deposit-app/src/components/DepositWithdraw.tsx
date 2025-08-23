import React, { useState } from 'react';
import { Wallet, ArrowDownCircle, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';

interface DepositWithdrawProps {
  account: string | null;
  depositedAmount: string;
  interest: string;
  isConnected: boolean;
  onConnect: () => void;
  onDeposit: (amount: string) => Promise<{ success: boolean; txHash?: string }>;
  onSwitchToBank: () => void;
}

const DepositWithdraw: React.FC<DepositWithdrawProps> = ({
  account,
  depositedAmount,
  interest,
  isConnected,
  onConnect,
  onDeposit,
  onSwitchToBank,
}) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [depositCompleted, setDepositCompleted] = useState(false);
  const { showToast } = useToast();

  const handleDeposit = async () => {
    if (!isConnected) {
      onConnect();
      return;
    }
    setIsLoading(true);
    // 시뮬레이션을 위한 지연
    setTimeout(() => {
      setDepositCompleted(true);
      setIsLoading(false);
    }, 1000);
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

      <div className="main-interface">
        <div className="balance-display">
          <div className="balance-card">
            <span className="balance-label">예치금</span>
            <span className="balance-amount">{isConnected ? depositedAmount : '0'} KRW</span>
          </div>
          <div className="balance-card highlight">
            <span className="balance-label">발생 이자</span>
            <span className="balance-amount">{isConnected ? interest : '0'} KRW</span>
          </div>
          <div className="balance-card total">
            <span className="balance-label">총 금액</span>
            <span className="balance-amount">{isConnected ? totalAmount : '0'} KRW</span>
          </div>
        </div>

          <div className="action-tabs">
            <button
              className="tab active"
            >
              <ArrowDownCircle size={18} />
              입금
            </button>
          </div>

          <div className="action-content">
              <div className="deposit-section">
                {!depositCompleted ? (
                  <>
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
                  </>
                ) : (
                  <div className="deposit-completed">
                    <motion.div
                      className="success-icon"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    >
                      <div className="checkmark">✓</div>
                    </motion.div>
                    <motion.h3
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      입금 완료
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      {amount} KRW가 성공적으로 입금되었습니다
                    </motion.p>
                    <motion.button
                      className="reset-btn"
                      onClick={() => {
                        setDepositCompleted(false);
                        setAmount('');
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      다시 입금하기
                    </motion.button>
                  </div>
                )}
              </div>
          </div>
        </div>
    </div>
  );
};

export default DepositWithdraw;