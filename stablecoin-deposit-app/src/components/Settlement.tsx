import React, { useState } from 'react';
import { Store, Truck, CreditCard, ArrowRight, Check, Wallet } from 'lucide-react';
import { useWeb3 } from '../hooks/useWeb3';

interface Seller {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  settlementAmount: number;
  status: 'pending' | 'processing' | 'completed';
  category: string;
  walletAddress: string;
}

const Settlement = () => {
  const [isSettling, setIsSettling] = useState(false);
  const { 
    account, 
    isConnected, 
    connectWallet, 
    transferWithInterest 
  } = useWeb3();
  
  const [sellers, setSellers] = useState<Seller[]>([
    {
      id: 'seller1',
      name: '전자제품 셀러',
      icon: <Store className="w-8 h-8" />,
      color: 'bg-blue-500',
      settlementAmount: 2840000,
      status: 'pending',
      category: '전자제품',
      walletAddress: '0x742d35Cc6bF4532530d5E3C6F2c1B94E8bE3Bf85'
    },
    {
      id: 'seller2', 
      name: '의류 셀러',
      icon: <CreditCard className="w-8 h-8" />,
      color: 'bg-purple-500',
      settlementAmount: 1560000,
      status: 'pending',
      category: '패션/의류',
      walletAddress: '0x8ba1f109551bD432803012645Hac136c22C501e5'
    },
    {
      id: 'seller3',
      name: '생활용품 셀러',
      icon: <Truck className="w-8 h-8" />,
      color: 'bg-green-500',
      settlementAmount: 3600000,
      status: 'pending',
      category: '생활용품',
      walletAddress: '0xaB1f1845C3E6fE2E5d4B8b1C3aF9E0C4d5F6A7B8'
    }
  ]);

  const totalAmount = sellers.reduce((sum, seller) => sum + seller.settlementAmount, 0);

  const handleSettle = async () => {
    if (!isConnected) {
      alert('먼저 지갑을 연결해주세요!');
      return;
    }

    setIsSettling(true);
    
    for (let i = 0; i < sellers.length; i++) {
      const seller = sellers[i];
      
      // 처리중 상태로 변경
      setSellers(prev => prev.map((s, index) => 
        index === i ? { ...s, status: 'processing' } : s
      ));
      
      try {
        // 실제 블록체인 트랜잭션 실행
        const amountInKRW = (seller.settlementAmount / 1000).toString(); // KRW를 스테이블코인으로 변환
        const result = await transferWithInterest(
          seller.walletAddress, 
          amountInKRW, 
          '0'
        );
        
        if (result.success) {
          // 성공 시 완료 상태로 변경
          setSellers(prev => prev.map((s, index) => 
            index === i ? { ...s, status: 'completed' } : s
          ));
          console.log(`${seller.name} 정산 완료: ${result.txHash}`);
        } else {
          // 실패 시 대기 상태로 되돌리기
          setSellers(prev => prev.map((s, index) => 
            index === i ? { ...s, status: 'pending' } : s
          ));
          console.error(`${seller.name} 정산 실패`);
        }
      } catch (error) {
        console.error(`${seller.name} 정산 중 오류:`, error);
        setSellers(prev => prev.map((s, index) => 
          index === i ? { ...s, status: 'pending' } : s
        ));
      }
      
      // 다음 정산까지 2초 대기
      if (i < sellers.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setIsSettling(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">대기중</span>;
      case 'processing':
        return <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-600 rounded-full animate-pulse">처리중</span>;
      case 'completed':
        return <span className="px-3 py-1 text-xs bg-green-100 text-green-600 rounded-full flex items-center gap-1">
          <Check className="w-3 h-3" />
          완료
        </span>;
      default:
        return null;
    }
  };

  return (
    <div className="settlement-container">
      <div className="settlement-content">
        <div className="settlement-main">
          <div className="settlement-status">
            <h2 className="status-title">정산 현황</h2>
            
            <div className="sellers-grid">
              {sellers.map((seller, index) => (
                <div key={seller.id} className="seller-card">
                  <div className="seller-header">
                    <div className={`seller-icon ${seller.id}`}>
                      {seller.icon}
                    </div>
                    <div className="seller-info">
                      <h3 className="seller-name">{seller.name}</h3>
                      <p className="seller-category">{seller.category}</p>
                    </div>
                  </div>
                  
                  <div className="seller-details">
                    <div className="detail-row">
                      <span className="detail-label">정산금액</span>
                      <span className="settlement-amount">
                        {seller.settlementAmount.toLocaleString()}원
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">지갑주소</span>
                      <span className="wallet-address">
                        {seller.walletAddress.slice(0, 6)}...{seller.walletAddress.slice(-4)}
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">상태</span>
                      {getStatusBadge(seller.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="total-summary">
              <div className="total-row">
                <span className="total-label">총 정산 금액</span>
                <span className="total-amount">
                  {totalAmount.toLocaleString()}원
                </span>
              </div>
              <div className="total-note">
                스테이블코인으로 즉시 정산됩니다
              </div>
            </div>

            <div className="settlement-action">
              {!isConnected ? (
                <button
                  onClick={connectWallet}
                  className="wallet-connect-btn"
                >
                  <Wallet className="w-5 h-5" />
                  지갑 연결
                </button>
              ) : (
                <>
                  <div className="wallet-info-section">
                    <span className="connected-wallet">
                      연결된 지갑: {account?.slice(0, 6)}...{account?.slice(-4)}
                    </span>
                  </div>
                  <button
                    onClick={handleSettle}
                    disabled={isSettling}
                    className={`settle-btn ${isSettling ? 'disabled' : ''}`}
                  >
                    {isSettling ? (
                      <>
                        <div className="loading-spinner"></div>
                        블록체인 정산 처리중...
                      </>
                    ) : (
                      <>
                        스테이블코인 정산 시작
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="process-section">
            <h3 className="process-title">정산 프로세스</h3>
            <div className="process-grid">
              <div className="process-step">
                <div className="step-number step-1">1</div>
                <div className="step-title">결제 집계</div>
                <div className="step-desc">각 셀러별 판매금액을 집계합니다</div>
              </div>
              <div className="process-step">
                <div className="step-number step-2">2</div>
                <div className="step-title">스테이블코인 전송</div>
                <div className="step-desc">각 셀러 지갑으로 정산금을 전송합니다</div>
              </div>
              <div className="process-step">
                <div className="step-number step-3">3</div>
                <div className="step-title">정산 완료</div>
                <div className="step-desc">정산 내역을 국세청에 자동 통보합니다</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settlement;