import React, { useState } from 'react';
import { solidityPackedKeccak256, parseEther, getBytes } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Receipt, Store, Hash, CheckCircle, 
  Loader2, Wallet, CreditCard, FileText,
  DollarSign, Shield, Smartphone
} from 'lucide-react';
import { useWeb3 } from '../hooks/useWeb3';
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

type FlowStep = 'payment' | 'processing' | 'receipt' | 'complete';

const PaymentToReceipt: React.FC = () => {
  const { account, signer, connectWallet } = useWeb3();
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState<FlowStep>('payment');
  const [formData, setFormData] = useState<PaymentData>({
    merchantName: '',
    amount: '',
    phoneNumber: '',
  });
  const [txHash, setTxHash] = useState<string>('');
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const simulatePayment = async (): Promise<string> => {
    if (!signer) throw new Error('No signer available');
    
    // Send to 0x000...000 address
    const tx = await signer.sendTransaction({
      to: '0x0000000000000000000000000000000000000000',
      value: parseEther(formData.amount)
    });
    
    await tx.wait();
    return tx.hash;
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
    setCurrentStep('processing');

    try {
      // Step 1: Process Payment
      const hash = await simulatePayment();
      setTxHash(hash);
      showToast('결제가 처리되었습니다', 'success');

      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 2: Generate Receipt
      setCurrentStep('receipt');
      const receiptData: ReceiptData = {
        ...formData,
        merchantAddress: account,
        txHash: hash,
        timestamp: Date.now(),
        receiptId: generateReceiptId(),
      };

      const signature = await signReceipt(receiptData);
      receiptData.signature = signature;

      await new Promise(resolve => setTimeout(resolve, 1500));
      setReceipt(receiptData);
      
      setCurrentStep('complete');
      showToast('현금영수증이 발행되었습니다', 'success');
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
    setTxHash('');
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
        <div className={`progress-step ${currentStep === 'payment' ? 'active' : ['processing', 'receipt', 'complete'].includes(currentStep) ? 'completed' : ''}`}>
          <div className="step-icon">
            <CreditCard size={20} />
          </div>
          <span>결제</span>
        </div>
        
        <div className="progress-line">
          <div className="progress-fill" style={{
            width: currentStep === 'payment' ? '0%' : 
                   currentStep === 'processing' ? '33%' : 
                   currentStep === 'receipt' ? '66%' : '100%'
          }} />
        </div>
        
        <div className={`progress-step ${currentStep === 'processing' ? 'active' : ['receipt', 'complete'].includes(currentStep) ? 'completed' : ''}`}>
          <div className="step-icon">
            <Send size={20} />
          </div>
          <span>처리중</span>
        </div>
        
        <div className="progress-line">
          <div className="progress-fill" style={{
            width: currentStep === 'receipt' ? '50%' : currentStep === 'complete' ? '100%' : '0%'
          }} />
        </div>
        
        <div className={`progress-step ${currentStep === 'receipt' ? 'active' : currentStep === 'complete' ? 'completed' : ''}`}>
          <div className="step-icon">
            <FileText size={20} />
          </div>
          <span>영수증</span>
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
                <h2>스테이블코인 결제</h2>
                <p>가맹점에 KRW로 결제하세요</p>
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
                    placeholder="예: 카이아 마트"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <DollarSign size={18} />
                    결제 금액 (KRW)
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

          {/* Processing Animation */}
          {currentStep === 'processing' && (
            <motion.div
              key="processing"
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
              
              <h3>거래 처리 중...</h3>
              <p>블록체인에서 거래를 확인하고 있습니다</p>
              
              <div className="tx-preview">
                <Hash size={16} />
                <span className="tx-hash">{txHash.substring(0, 20)}...</span>
              </div>
            </motion.div>
          )}

          {/* Receipt Generation Animation */}
          {currentStep === 'receipt' && !receipt && (
            <motion.div
              key="receipt-gen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="receipt-generation"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  duration: 0.8
                }}
                className="receipt-icon-wrapper"
              >
                <div className="receipt-icon-bg">
                  <Receipt size={60} />
                </div>
              </motion.div>
              
              <h3>현금영수증 생성 중...</h3>
              <p>전자 서명을 진행하고 있습니다</p>
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
                    <h3>전자 현금영수증</h3>
                  </div>
                  <CheckCircle className="success-icon" size={28} />
                </div>

                <div className="receipt-body">
                  <div className="receipt-row">
                    <span className="label">영수증 번호</span>
                    <span className="value mono">{receipt.receiptId}</span>
                  </div>

                  <div className="receipt-row">
                    <span className="label">가맹점</span>
                    <span className="value">{receipt.merchantName}</span>
                  </div>

                  <div className="receipt-row highlight">
                    <span className="label">결제 금액</span>
                    <span className="value amount">{receipt.amount} KRW</span>
                  </div>

                  <div className="receipt-row">
                    <span className="label">핸드폰 번호</span>
                    <span className="value">{receipt.phoneNumber}</span>
                  </div>

                  <div className="receipt-row">
                    <span className="label">거래 해시</span>
                    <span className="value mono small">{receipt.txHash.substring(0, 20)}...</span>
                  </div>

                  <div className="receipt-row">
                    <span className="label">발행 시간</span>
                    <span className="value">{new Date(receipt.timestamp).toLocaleString('ko-KR')}</span>
                  </div>

                  <div className="signature-section">
                    <Shield size={16} />
                    <span>전자서명 완료</span>
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