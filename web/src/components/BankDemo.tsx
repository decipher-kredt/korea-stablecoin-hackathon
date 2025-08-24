import React, { useState } from 'react';
import { Building2, Coins, Send, UserCheck, ArrowRight, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import { ethers } from 'ethers';

interface BankDemoProps {
  onMintStablecoin: (amount: string, recipient: string) => Promise<{ success: boolean; txHash?: string }>;
  onTransferWithInterest: (recipient: string, principal: string, interest: string) => Promise<{ success: boolean; txHash?: string }>;
  totalSupply?: string;
  vaultBalance?: string;
  isLoadingStableCoin?: boolean;
}

const BankDemo: React.FC<BankDemoProps> = ({ onMintStablecoin, onTransferWithInterest, totalSupply = '0', vaultBalance = '0', isLoadingStableCoin = false }) => {
  const [activeOperation, setActiveOperation] = useState<'mint' | 'transfer'>('mint');
  const [mintAmount, setMintAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  // 자동으로 3% 이자 계산
  const interestAmount = principalAmount ? (parseFloat(principalAmount) * 0.03).toFixed(0) : '0';

  const handleMint = async () => {
    if (!mintAmount || parseFloat(mintAmount) <= 0) {
      showToast('유효한 금액을 입력해주세요', 'error');
      return;
    }
    if (!recipientAddress) {
      showToast('수령인 주소를 입력해주세요', 'error');
      return;
    }

    setIsLoading(true);
    const result = await onMintStablecoin(mintAmount, recipientAddress);
    
    if (result.success) {
      const explorerUrl = result.txHash 
        ? `https://kairos.kaiascan.io/tx/${result.txHash}`
        : undefined;
      
      showToast(`${mintAmount} KREDT 스테이블코인 발행 완료`, {
        type: 'success',
        action: explorerUrl ? {
          label: '확인',
          href: explorerUrl
        } : undefined
      });
      
      setMintAmount('');
      setRecipientAddress('');
    } else {
      showToast('스테이블코인 발행에 실패했습니다', 'error');
    }
    setIsLoading(false);
  };

  const handleVerifyDepositor = async () => {
    if (!recipientAddress) {
      showToast('입금자 주소를 입력해주세요', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Vault 컨트랙트에서 depositors 매핑 조회
      const provider = new ethers.JsonRpcProvider('https://public-en-kairos.node.kaia.io');
      const vaultContract = new ethers.Contract('0xC44C01b57D09A0FD37b9071076230Aa5F8ed411A', [
        {
          "inputs": [{"name": "", "type": "address"}],
          "name": "depositors",
          "outputs": [{"name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        }
      ], provider);
      
      const depositAmount = await vaultContract.depositors(recipientAddress);
      const depositAmountFormatted = ethers.formatEther(depositAmount);
      
      if (parseFloat(depositAmountFormatted) > 0) {
        setPrincipalAmount(depositAmountFormatted);
        showToast(`입금자 확인 완료: ${parseFloat(depositAmountFormatted).toLocaleString()} KREDT`, 'success');
      } else {
        showToast('해당 주소에 입금 내역이 없습니다', 'error');
        setPrincipalAmount('');
      }
    } catch (error) {
      console.error('입금자 확인 오류:', error);
      showToast('입금자 확인에 실패했습니다', 'error');
    }
    setIsLoading(false);
  };

  const handleTransfer = async () => {
    if (!principalAmount || parseFloat(principalAmount) <= 0) {
      showToast('유효한 원금을 입력해주세요', 'error');
      return;
    }
    if (!recipientAddress) {
      showToast('고객 주소를 입력해주세요', 'error');
      return;
    }

    setIsLoading(true);
    const result = await onTransferWithInterest(recipientAddress, principalAmount, interestAmount);
    
    if (result.success) {
      const total = (parseFloat(principalAmount) + parseFloat(interestAmount)).toFixed(2);
      const explorerUrl = result.txHash 
        ? `https://kairos.kaiascan.io/tx/${result.txHash}`
        : undefined;
      
      showToast(`${total} KREDT 송금 완료 (원금: ${principalAmount}, 이자: ${interestAmount})`, {
        type: 'success',
        action: explorerUrl ? {
          label: '확인',
          href: explorerUrl
        } : undefined
      });
      
      setPrincipalAmount('');
      setRecipientAddress('');
    } else {
      showToast('송금에 실패했습니다', 'error');
    }
    setIsLoading(false);
  };

  return (
    <div className="bank-demo-container">
      <div className="bank-header">
        <Building2 size={32} />
        <div>
          <h2>은행 운영 데모</h2>
          <p>은행이 스테이블코인을 발행하고 관리하는 프로세스</p>
        </div>
      </div>

      {activeOperation === 'mint' ? (
        <div className="balance-display">
          <div className="balance-card">
            <span className="balance-label">전체 발행량</span>
            <span className="balance-amount">
              {isLoadingStableCoin ? (
                <div className="loading-spinner" style={{ display: 'inline-block', width: '20px', height: '20px' }}></div>
              ) : (
                `${parseFloat(totalSupply).toLocaleString()} KREDT`
              )}
            </span>
          </div>
          <div className="balance-card">
            <span className="balance-label">총 예치 금액</span>
            <span className="balance-amount">
              {isLoadingStableCoin ? (
                <div className="loading-spinner" style={{ display: 'inline-block', width: '20px', height: '20px' }}></div>
              ) : (
                `${parseFloat(vaultBalance).toLocaleString()} KREDT`
              )}
            </span>
          </div>
        </div>
      ) : (
        <div className="balance-display">
          <div className="balance-card">
            <span className="balance-label">총 예치 금액</span>
            <span className="balance-amount">
              {isLoadingStableCoin ? (
                <div className="loading-spinner" style={{ display: 'inline-block', width: '20px', height: '20px' }}></div>
              ) : (
                `${parseFloat(vaultBalance).toLocaleString()} KREDT`
              )}
            </span>
          </div>
        </div>
      )}

      <div className="operation-tabs">
        <button
          className={`operation-tab ${activeOperation === 'mint' ? 'active' : ''}`}
          onClick={() => setActiveOperation('mint')}
        >
          <Coins size={18} />
          스테이블코인 발행
        </button>
        <button
          className={`operation-tab ${activeOperation === 'transfer' ? 'active' : ''}`}
          onClick={() => setActiveOperation('transfer')}
        >
          <Send size={18} />
          원금 + 이자 송금
        </button>
      </div>

      <div className="operation-content">
        {activeOperation === 'mint' ? (
          <div className="mint-section">
            <div className="operation-description">
              <div className="step-indicator">
                <div className="step active">
                  <DollarSign size={16} />
                  <span>법정화폐 입금</span>
                </div>
                <ArrowRight className="step-arrow" size={16} />
                <div className="step">
                  <Coins size={16} />
                  <span>스테이블코인 발행</span>
                </div>
              </div>
              <p className="description-text">
                고객이 은행에 1000만원을 입금하면, 은행은 동일한 가치의 스테이블코인을 발행합니다
              </p>
            </div>

            <div className="form-field">
              <label className="field-label">발행할 금액</label>
              <div className="input-wrapper">
                <input
                  type="number"
                  placeholder="예: 10000000"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  className="field-input"
                />
                <span className="input-suffix">KREDT</span>
              </div>
            </div>

            <div className="form-field">
              <label className="field-label">만기 시 수령인 지갑 주소</label>
              <input
                type="text"
                placeholder="0x..."
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="field-input address-type"
              />
              <span className="field-hint">예금 만기 시 원금과 이자를 받을 고객의 지갑 주소</span>
            </div>

            <motion.button
              className="action-btn mint-btn"
              onClick={handleMint}
              disabled={isLoading || !mintAmount || !recipientAddress}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? '처리중...' : '스테이블코인 발행'}
            </motion.button>
          </div>
        ) : (
          <div className="transfer-section">
            <div className="operation-description">
              <div className="step-indicator">
                <div className={`step ${!principalAmount ? 'active' : ''}`}>
                  <UserCheck size={16} />
                  <span>입금자 확인</span>
                </div>
                <ArrowRight className="step-arrow" size={16} />
                <div className={`step ${principalAmount ? 'active' : ''}`}>
                  <Send size={16} />
                  <span>원금+이자 송금</span>
                </div>
              </div>
              <p className="description-text">
                입금자의 지갑 주소를 입력하고 확인하여 원금을 자동으로 가져온 후, 원금과 이자를 합산하여 송금합니다
              </p>
            </div>

            <div className="form-field">
              <label className="field-label">입금자 지갑 주소</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="0x..."
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="field-input address-type"
                />
                <button
                  className="verify-btn"
                  onClick={handleVerifyDepositor}
                  disabled={!recipientAddress || isLoading}
                >
                  확인
                </button>
              </div>
              <span className="field-hint">입금자의 지갑 주소를 입력하고 확인 버튼을 눌러주세요</span>
            </div>

            <div className="form-field">
              <label className="field-label">원금</label>
              <div className="input-wrapper readonly">
                <input
                  type="text"
                  value={principalAmount}
                  className="field-input"
                  readOnly
                  disabled
                />
                <span className="input-suffix">KREDT</span>
              </div>
              <span className="field-hint">입금자 확인 시 자동으로 입력됩니다</span>
            </div>

            <div className="form-field">
              <label className="field-label">이자 (연 3% 자동 계산)</label>
              <div className="input-wrapper readonly">
                <input
                  type="text"
                  value={interestAmount}
                  className="field-input"
                  disabled
                />
                <span className="input-suffix">KREDT</span>
              </div>
              <span className="field-hint">원금의 3%가 자동으로 계산됩니다</span>
            </div>

            {principalAmount && (
              <div className="total-preview">
                <span>총 송금액:</span>
                <span className="total-amount">
                  {(parseFloat(principalAmount || '0') + parseFloat(interestAmount || '0')).toLocaleString()} KREDT
                </span>
              </div>
            )}

            <motion.button
              className="action-btn transfer-btn"
              onClick={handleTransfer}
              disabled={isLoading || !principalAmount || !recipientAddress}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? '처리중...' : '원금 + 이자 송금'}
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankDemo;