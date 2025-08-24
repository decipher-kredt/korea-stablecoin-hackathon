import React, { useState } from 'react';
import { solidityPackedKeccak256, getBytes, parseEther } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Receipt, Store, CheckCircle, 
  Loader2, Wallet, CreditCard,
  HandCoins, Shield, Smartphone
} from 'lucide-react';
import { usePaymentSystem } from '../hooks/usePaymentSystem';
import { useStableCoin } from '../hooks/useStableCoin';
import { useToast } from '../contexts/ToastContext';

interface PaymentData {
  merchantName: string;
  amount: string;
  phoneNumber: string;
}

interface ReceiptData extends PaymentData {
  merchantAddress: string;
  txHash: string;
  timestamp: number;
  signature?: string;
  receiptId?: string;
}

type FlowStep = 'payment' | 'approve' | 'pay' | 'complete';

const PaymentToReceipt: React.FC = () => {
  const { account, signer, connectWallet: connectPaymentWallet, pay } = usePaymentSystem();
  const { approve, connectWallet: connectStableCoinWallet } = useStableCoin();
  const { showToast } = useToast();
  
  const connectWallet = async () => {
    await connectPaymentWallet();
    await connectStableCoinWallet();
  };
  const [currentStep, setCurrentStep] = useState<FlowStep>('payment');
  const [formData, setFormData] = useState<PaymentData>({
    merchantName: '',
    amount: '',
    phoneNumber: '',
  });
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const processPayment = async (): Promise<string> => {
    if (!pay || !approve) throw new Error('Payment functions not available');
    
    const CONTRACT_ADDRESS = '0xae4AAD5AF1Ccbb68655311dA4b9F782898180000'; // PaymentSystem 주소
    
    // Step 1: StableCoin approve to PaymentSystem
    setCurrentStep('approve');
    const approveResult = await approve(CONTRACT_ADDRESS, formData.amount);
    if (!approveResult.success) {
      throw new Error('StableCoin approve 실패');
    }
    
    // Step 2: PaymentSystem.pay(amount, products) 호출
    setCurrentStep('pay');
    const products: string[] = []; // 빈 데이터
    const result = await pay(formData.amount, products);
    
    if (!result.success || !result.txHash) {
      throw new Error('결제 트랜잭션 실패');
    }
    
    return result.txHash;
  };

  const generateReceiptId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `KR-${timestamp}-${random}`;
  };

  const signReceipt = async (data: ReceiptData): Promise<string> => {
    if (!signer) throw new Error('No signer available');
    
    const message = solidityPackedKeccak256(
      ['string', 'address', 'uint256', 'string', 'string', 'uint256'],
      [
        data.merchantName,
        data.merchantAddress,
        parseEther(data.amount),
        data.phoneNumber,
        data.txHash,
        data.timestamp
      ]
    );
    
    const signature = await signer.signMessage(getBytes(message));
    return signature;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      showToast('지갑을 먼저 연결해주세요', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1 & 2: Process Payment (approve + pay)
      const hash = await processPayment();

      // Generate Receipt immediately
      const receiptData: ReceiptData = {
        ...formData,
        merchantAddress: account,
        txHash: hash,
        timestamp: Date.now(),
        receiptId: generateReceiptId(),
      };

      const signature = await signReceipt(receiptData);
      receiptData.signature = signature;

      setReceipt(receiptData);
      setCurrentStep('complete');
      showToast('스테이블코인 영수증이 발행되었습니다', 'success');
    } catch (error) {
      console.error('Process failed:', error);
      showToast('처리 중 오류가 발생했습니다', 'error');
      setCurrentStep('payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetFlow = () => {
    setCurrentStep('payment');
    setFormData({ merchantName: '', amount: '', phoneNumber: '' });
    setReceipt(null);
  };

  const submitToNTS = async () => {
    if (!receipt) return;
    
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      showToast('국세청에 제출되었습니다', 'success');
    } catch (error) {
      showToast('제출 실패', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="payment-receipt-container">
      {/* Progress Indicator */}
      <div className="flow-progress">
        <div className={`progress-step ${currentStep === 'payment' ? 'active' : ['approve', 'pay', 'complete'].includes(currentStep) ? 'completed' : ''}`}>
          <div className="step-icon">
            <CreditCard size={20} />
          </div>
          <span>구매</span>
        </div>
        
        <div className="progress-line">
          <div className="progress-fill" style={{
            width: currentStep === 'payment' ? '0%' : 
                   currentStep === 'approve' ? '33%' : 
                   currentStep === 'pay' ? '66%' : '100%'
          }} />
        </div>
        
        <div className={`progress-step ${currentStep === 'approve' ? 'active' : ['pay', 'complete'].includes(currentStep) ? 'completed' : ''}`}>
          <div className="step-icon">
            <Shield size={20} />
          </div>
          <span>결제 승인</span>
        </div>
        
        <div className="progress-line">
          <div className="progress-fill" style={{
            width: currentStep === 'pay' ? '50%' : currentStep === 'complete' ? '100%' : '0%'
          }} />
        </div>
        
        <div className={`progress-step ${currentStep === 'pay' ? 'active' : currentStep === 'complete' ? 'completed' : ''}`}>
          <div className="step-icon">
            <Send size={20} />
          </div>
          <span>결제</span>
        </div>
        
        <div className="progress-line">
          <div className="progress-fill" style={{
            width: currentStep === 'complete' ? '100%' : '0%'
          }} />
        </div>
        
        <div className={`progress-step ${currentStep === 'complete' ? 'active completed' : ''}`}>
          <div className="step-icon">
            <CheckCircle size={20} />
          </div>
          <span>완료</span>
        </div>
      </div>

      <div className="flow-content">
        <AnimatePresence mode="wait">
          {/* Payment Form */}
          {currentStep === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="payment-section"
            >
              <div className="section-header">
                <Wallet className="header-icon" />
                <h2>스테이블코인 영수증 발행 시스템</h2>
                <p>PaymentSystem 스마트 컨트랙트를 통한 스테이블코인 결제</p>
              </div>

              <form onSubmit={handlePayment} className="payment-form">
                <div className="form-group">
                  <label>
                    <Store size={18} />
                    가맹점명
                  </label>
                  <input
                    type="text"
                    name="merchantName"
                    value={formData.merchantName}
                    onChange={handleInputChange}
                    required
                    placeholder="예: 카이아 마트, 커피, 식사 등"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <HandCoins size={18} />
                    결제 금액 (KREDT)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    step="1"
                    placeholder="10000"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <Smartphone size={18} />
                    핸드폰 번호
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="010-1234-5678"
                    className="form-input"
                  />
                </div>

                {!account ? (
                  <motion.button
                    type="button"
                    onClick={connectWallet}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="submit-button primary"
                  >
                    <Wallet size={20} />
                    지갑 연결하기
                  </motion.button>
                ) : (
                  <motion.button
                    type="submit"
                    disabled={!formData.merchantName || !formData.amount || !formData.phoneNumber}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="submit-button primary"
                  >
                    <Send size={20} />
                    결제하기
                  </motion.button>
                )}
              </form>
            </motion.div>
          )}

          {/* Approve Step */}
          {currentStep === 'approve' && (
            <motion.div
              key="approve"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="processing-section"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1, repeat: Infinity }
                }}
                className="processing-icon"
              >
                <Shield size={60} />
              </motion.div>
              
              <h3>결제 승인 요청 중</h3>
              <p>MetaMask에서 PaymentSystem 스마트 컨트랙트에 대한 승인을 확인해주세요</p>
              
              <div className="step-info">
                <div className="info-card">
                  <span className="info-label">승인 금액:</span>
                  <span className="info-value">{formData.amount} KREDT</span>
                </div>
                <div className="info-card">
                  <span className="info-label">승인 대상:</span>
                  <span className="info-value">PaymentSystem</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Pay Step */}
          {currentStep === 'pay' && (
            <motion.div
              key="pay"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="processing-section"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1, repeat: Infinity }
                }}
                className="processing-icon"
              >
                <Send size={60} />
              </motion.div>
              
              <h3>결제 진행 중</h3>
              <p>MetaMask에서 결제 트랜잭션을 확인해주세요</p>
              
              <div className="step-info">
                <div className="info-card">
                  <span className="info-label">결제 금액:</span>
                  <span className="info-value">{formData.amount} KREDT</span>
                </div>
                <div className="info-card">
                  <span className="info-label">가맹점:</span>
                  <span className="info-value">{formData.merchantName}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Complete Receipt */}
          {currentStep === 'complete' && receipt && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="complete-section"
            >
              <div className="receipt-card">
                <div className="receipt-header">
                  <div className="receipt-title">
                    <Receipt size={24} />
                    <h3>전자 스테이블코인 영수증</h3>
                  </div>
                  <CheckCircle className="success-icon" size={28} />
                </div>

                <div className="receipt-body">
                  <div className="receipt-row">
                    <span className="label">영수증 번호</span>
                    <span className="value mono">{receipt.receiptId}</span>
                  </div>

                  <div className="receipt-row">
                    <span className="label">상품/가맹점</span>
                    <span className="value">{receipt.merchantName}</span>
                  </div>

                  <div className="receipt-row highlight">
                    <span className="label">결제 금액</span>
                    <span className="value amount">{receipt.amount} KREDT</span>
                  </div>

                  <div className="receipt-row">
                    <span className="label">핸드폰 번호</span>
                    <span className="value">{receipt.phoneNumber}</span>
                  </div>

                  <div className="receipt-row">
                    <span className="label">거래 해시</span>
                    <a 
                      href={`https://kairos.kaiascan.io/tx/${receipt.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="value mono small tx-link"
                    >
                      {receipt.txHash.substring(0, 20)}...
                    </a>
                  </div>

                  <div className="receipt-row">
                    <span className="label">발행 시간</span>
                    <span className="value">{new Date(receipt.timestamp).toLocaleString('ko-KR')}</span>
                  </div>

                  <div className="receipt-row">
                    <span className="label">컨트랙트</span>
                    <span className="value mono small">PaymentSystem</span>
                  </div>

                  <div className="signature-section">
                    <Shield size={16} />
                    <span>PaymentSystem Receipt 이벤트 완료</span>
                  </div>
                </div>

                <div className="receipt-actions">
                  <motion.button
                    onClick={submitToNTS}
                    disabled={isProcessing}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="submit-button success"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        제출 중...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        국세청 제출
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    onClick={resetFlow}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="submit-button secondary"
                  >
                    새 결제
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PaymentToReceipt;