import React, { useState } from 'react';
import { ethers, solidityPackedKeccak256, parseEther, getBytes } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, Phone, Hash, Store, CheckCircle, Loader2 } from 'lucide-react';
import { useWeb3 } from '../hooks/useWeb3';
import { useToast } from '../contexts/ToastContext';

interface ReceiptData {
  merchantName: string;
  merchantAddress: string;
  amount: string;
  phoneNumber: string;
  txHash: string;
  timestamp: number;
  signature?: string;
  receiptId?: string;
}

const CashReceipt: React.FC = () => {
  const { account, signer } = useWeb3();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    merchantName: '',
    amount: '',
    phoneNumber: '',
    txHash: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      showToast('지갑을 먼저 연결해주세요', 'error');
      return;
    }

    setIsGenerating(true);
    setShowAnimation(true);

    try {
      const receiptData: ReceiptData = {
        merchantName: formData.merchantName,
        merchantAddress: account,
        amount: formData.amount,
        phoneNumber: formData.phoneNumber,
        txHash: formData.txHash,
        timestamp: Date.now(),
        receiptId: generateReceiptId(),
      };

      const signature = await signReceipt(receiptData);
      receiptData.signature = signature;

      await new Promise(resolve => setTimeout(resolve, 2000));

      setReceipt(receiptData);
      showToast('현금영수증이 발행되었습니다', 'success');
      
      setTimeout(() => {
        setShowAnimation(false);
      }, 500);
    } catch (error) {
      console.error('Receipt generation failed:', error);
      showToast('영수증 발행 실패', 'error');
      setShowAnimation(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const submitToNTS = async () => {
    if (!receipt) return;
    
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      showToast('국세청에 제출되었습니다', 'success');
    } catch (error) {
      showToast('제출 실패', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-6 border border-gray-800"
        >
          <div className="flex items-center gap-3 mb-6">
            <Receipt className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold">현금영수증 발행</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Store className="w-4 h-4" />
                가맹점명
              </label>
              <input
                type="text"
                name="merchantName"
                value={formData.merchantName}
                onChange={handleInputChange}
                required
                placeholder="예: 카이아 마트"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Receipt className="w-4 h-4" />
                결제 금액 (USDT)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                step="0.01"
                placeholder="100.00"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Phone className="w-4 h-4" />
                핸드폰 번호
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                placeholder="010-1234-5678"
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Hash className="w-4 h-4" />
                트랜잭션 해시
              </label>
              <input
                type="text"
                name="txHash"
                value={formData.txHash}
                onChange={handleInputChange}
                required
                placeholder="0x..."
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-purple-500 transition-colors font-mono text-sm"
              />
            </div>

            <motion.button
              type="submit"
              disabled={!account || isGenerating}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  처리 중...
                </>
              ) : (
                <>
                  <Receipt className="w-5 h-5" />
                  영수증 발행
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        <div className="relative">
          <AnimatePresence>
            {showAnimation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center z-10"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    duration: 0.6
                  }}
                  className="bg-gradient-to-br from-purple-600 to-green-600 rounded-full p-8"
                >
                  <Receipt className="w-24 h-24 text-white" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {receipt && !showAnimation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">전자 현금영수증</h3>
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">영수증 번호</span>
                  <span className="font-mono">{receipt.receiptId}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">가맹점</span>
                  <span>{receipt.merchantName}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">결제 금액</span>
                  <span className="text-lg font-semibold text-green-400">
                    {receipt.amount} USDT
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b border-gray-700">
                  <span className="text-gray-400">핸드폰 번호</span>
                  <span>{receipt.phoneNumber}</span>
                </div>

                <div className="py-2 border-b border-gray-700">
                  <span className="text-gray-400 block mb-1">TX Hash</span>
                  <span className="font-mono text-xs break-all text-purple-400">
                    {receipt.txHash}
                  </span>
                </div>

                <div className="py-2">
                  <span className="text-gray-400 block mb-1">서명</span>
                  <span className="font-mono text-xs break-all text-gray-500">
                    {receipt.signature?.substring(0, 42)}...
                  </span>
                </div>

                <div className="flex justify-between py-2">
                  <span className="text-gray-400">발행 시간</span>
                  <span>{new Date(receipt.timestamp).toLocaleString('ko-KR')}</span>
                </div>
              </div>

              <motion.button
                onClick={submitToNTS}
                disabled={isGenerating}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    제출 중...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    국세청 제출
                  </>
                )}
              </motion.button>
            </motion.div>
          )}

          {!receipt && !showAnimation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-900/50 backdrop-blur-md rounded-2xl p-12 border border-gray-800 flex flex-col items-center justify-center h-full"
            >
              <Receipt className="w-16 h-16 text-gray-600 mb-4" />
              <p className="text-gray-400 text-center">
                영수증 정보를 입력하고<br />
                발행 버튼을 눌러주세요
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashReceipt;