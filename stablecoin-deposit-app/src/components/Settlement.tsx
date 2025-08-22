import React, { useState } from 'react';
import { Store, Truck, CreditCard, ArrowRight, Check, Wallet, User, ShoppingCart, Building2, Smartphone, Plus, Minus } from 'lucide-react';
import { useWeb3 } from '../hooks/useWeb3';
import { useToast } from '../contexts/ToastContext';

interface Seller {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  settlementAmount: number;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'fee_deducted' | 'completed';
  category: string;
  walletAddress: string;
}

const Settlement = () => {
  const [activeTab, setActiveTab] = useState<'shopping' | 'settlement'>('shopping');
  const [isSettling, setIsSettling] = useState(false);
  const [currentStep, setCurrentStep] = useState<'idle' | 'payment_demo' | 'fee_transfer' | 'settlements' | 'completed'>('idle');
  const [settleProgress, setSettleProgress] = useState(0);
  const [showPaymentDemo, setShowPaymentDemo] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'user_pays' | 'funds_received' | 'ready_to_settle'>('user_pays');
  const [shoppingCart, setShoppingCart] = useState([
    { id: 1, name: 'iPhone 15 Pro', price: 1290000, quantity: 1, seller: '전자제품 셀러' },
    { id: 2, name: 'AirPods Pro', price: 310000, quantity: 1, seller: '전자제품 셀러' }
  ]);
  const { showToast } = useToast();
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
      grossAmount: 3000000,
      feeAmount: 160000,
      netAmount: 2840000,
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
      grossAmount: 1650000,
      feeAmount: 90000,
      netAmount: 1560000,
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
      grossAmount: 3800000,
      feeAmount: 200000,
      netAmount: 3600000,
      status: 'pending',
      category: '생활용품',
      walletAddress: '0xaB1f1845C3E6fE2E5d4B8b1C3aF9E0C4d5F6A7B8'
    }
  ]);

  const COUPANG_FEE_WALLET = '0x1234567890abcdef1234567890abcdef12345678';

  const cartTotal = shoppingCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const totalAmount = sellers.reduce((sum, seller) => sum + seller.settlementAmount, 0);
  const totalFeeAmount = sellers.reduce((sum, seller) => sum + seller.feeAmount, 0);
  const totalGrossAmount = sellers.reduce((sum, seller) => sum + seller.grossAmount, 0);

  const updateQuantity = (id: number, change: number) => {
    setShoppingCart(prev => prev.map(item => 
      item.id === id 
        ? { ...item, quantity: Math.max(0, item.quantity + change) }
        : item
    ).filter(item => item.quantity > 0));
  };

  const completePurchase = () => {
    const purchaseAmount = cartTotal;
    
    setSellers(prev => prev.map(seller => 
      seller.id === 'seller1' 
        ? {
            ...seller,
            grossAmount: seller.grossAmount + purchaseAmount,
            feeAmount: seller.feeAmount + Math.round(purchaseAmount * 0.053),
            settlementAmount: seller.settlementAmount + Math.round(purchaseAmount * 0.947)
          }
        : seller
    ));
    
    setShoppingCart([]);
    showToast(`구매 완료! ₩${purchaseAmount.toLocaleString()} 결제됨`, 'success');
    
    setTimeout(() => {
      setActiveTab('settlement');
      showToast('정산 현황이 업데이트되었습니다!', 'info');
    }, 1500);
  };

  const startPaymentDemo = async () => {
    console.log('결제 데모 시작');
    setShowPaymentDemo(true);
    setCurrentStep('payment_demo');
    setPaymentStep('user_pays');
    
    setTimeout(() => {
      setPaymentStep('funds_received');
      showToast('고객들이 상품 대금을 결제했습니다!', 'success');
    }, 2000);
    
    setTimeout(() => {
      setPaymentStep('ready_to_settle');
      showToast('이커머스 플랫폼에서 정산을 준비하고 있습니다...', 'info');
    }, 4000);
    
    setTimeout(() => {
      setShowPaymentDemo(false);
      setCurrentStep('idle');
    }, 6000);
  };

  const handleSettlement = async () => {
    if (!isConnected) {
      showToast('지갑을 먼저 연결해주세요!', 'error');
      return;
    }

    if (!transferWithInterest) {
      showToast('transferWithInterest 함수를 사용할 수 없습니다. useWeb3 훅을 확인해주세요.', 'error');
      return;
    }

    console.log('정산 시작:', { account, isConnected, transferWithInterest });
    
    try {
      setIsSettling(true);
      await startPaymentDemo();
      
      await new Promise(resolve => setTimeout(resolve, 7000));
      
      setCurrentStep('fee_transfer');
      setSettleProgress(10);
      
      const feeResult = await transferWithInterest(COUPANG_FEE_WALLET, totalFeeAmount.toString(), '0');
      if (!feeResult.success) {
        throw new Error('수수료 전송 실패');
      }
      
      setSettleProgress(20);
      setCurrentStep('settlements');
      
      for (let i = 0; i < sellers.length; i++) {
        const seller = sellers[i];
        
        setSellers(prev => prev.map(s => 
          s.id === seller.id ? { ...s, status: 'processing' } : s
        ));
        
        setSettleProgress(20 + ((i + 1) / sellers.length) * 80);
        
        const result = await transferWithInterest(seller.walletAddress, seller.settlementAmount.toString(), '0');
        
        if (result.success) {
          setSellers(prev => prev.map(s => 
            s.id === seller.id ? { ...s, status: 'completed' } : s
          ));
          showToast(`${seller.name} 정산 완료!`, 'success');
        } else {
          throw new Error(`${seller.name} 정산 실패`);
        }
        
        if (i < sellers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      setCurrentStep('completed');
      setSettleProgress(100);
      showToast('모든 셀러 정산이 완료되었습니다!', 'success');
      setIsSettling(false);
      
      setTimeout(() => {
        setCurrentStep('idle');
        setSettleProgress(0);
      }, 5000);
    } catch (error) {
      console.error('정산 처리 중 오류:', error);
      showToast('정산 처리 중 오류가 발생했습니다.', 'error');
      setIsSettling(false);
      setCurrentStep('idle');
      setSettleProgress(0);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">대기중</span>;
      case 'fee_deducted':
        return <span className="px-3 py-1 text-xs bg-orange-100 text-orange-600 rounded-full animate-pulse">수수료 차감</span>;
      case 'processing':
        return <span className="px-3 py-1 text-xs bg-yellow-100 text-yellow-600 rounded-full animate-pulse">정산중</span>;
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
        {/* Tab Navigation */}
        <div className="view-switcher">
          <button
            className={`view-tab ${activeTab === 'shopping' ? 'active' : ''}`}
            onClick={() => setActiveTab('shopping')}
          >
            <ShoppingCart size={16} />
            쇼핑
          </button>
          <button
            className={`view-tab ${activeTab === 'settlement' ? 'active' : ''}`}
            onClick={() => setActiveTab('settlement')}
          >
            <Building2 size={16} />
            정산
          </button>
        </div>

        <div className="settlement-main">
          {/* Shopping Tab */}
          {activeTab === 'shopping' && (
            <div className="shopping-demo-section">
              <div className="shopping-header">
                <div className="platform-info">
                  <Store className="platform-icon" size={32} />
                  <div>
                    <h3>🛒 이커머스 플랫폼 쇼핑</h3>
                    <p>고객이 전자제품을 구매하고 있습니다</p>
                  </div>
                </div>
              </div>
              
              {shoppingCart.length > 0 ? (
                <div className="shopping-cart">
                  <h4>🛍️ 장바구니</h4>
                  <div className="cart-items">
                    {shoppingCart.map(item => (
                      <div key={item.id} className="cart-item">
                        <div className="item-info">
                          <Smartphone className="item-icon" size={20} />
                          <div className="item-details">
                            <span className="item-name">{item.name}</span>
                            <span className="item-seller">판매자: {item.seller}</span>
                            <span className="item-price">₩{item.price.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="quantity-controls">
                          <button 
                            onClick={() => updateQuantity(item.id, -1)}
                            className="quantity-btn"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="quantity">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)}
                            className="quantity-btn"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="cart-summary">
                    <div className="total-amount">
                      총 결제금액: ₩{cartTotal.toLocaleString()}
                    </div>
                    <button 
                      onClick={completePurchase}
                      className="purchase-btn"
                      disabled={cartTotal === 0}
                    >
                      <CreditCard size={20} />
                      스테이블코인으로 결제하기
                    </button>
                  </div>
                </div>
              ) : (
                <div className="empty-cart">
                  <div className="empty-cart-icon">
                    <ShoppingCart size={64} />
                  </div>
                  <h3>장바구니가 비어있습니다</h3>
                  <p>구매가 완료되었습니다. 정산 탭에서 확인해보세요!</p>
                  <button 
                    onClick={() => setActiveTab('settlement')}
                    className="goto-settlement-btn"
                  >
                    <Building2 size={20} />
                    정산 화면으로 이동
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Settlement Tab */}
          {activeTab === 'settlement' && (
            <>
              {/* Payment Demo */}
              {showPaymentDemo && (
                <div className="payment-demo-section">
                  <div className="demo-header">
                    <h3>💳 고객 결제 과정</h3>
                    <p>이커머스 플랫폼에서 고객들이 상품을 구매하고 있습니다</p>
                  </div>
                  
                  <div className="payment-flow">
                    <div className={`payment-step ${paymentStep === 'user_pays' ? 'active' : (paymentStep === 'funds_received' || paymentStep === 'ready_to_settle') ? 'completed' : ''}`}>
                      <div className="payment-icon">
                        <User size={24} />
                      </div>
                      <span>고객 결제</span>
                      <div className="payment-amount">₩ {totalGrossAmount.toLocaleString()}</div>
                    </div>
                    
                    <ArrowRight className="payment-arrow" size={24} />
                    
                    <div className={`payment-step ${paymentStep === 'funds_received' ? 'active' : paymentStep === 'ready_to_settle' ? 'completed' : ''}`}>
                      <div className="payment-icon">
                        <Building2 size={24} />
                      </div>
                      <span>플랫폼 수령</span>
                      <div className="payment-amount">₩ {totalGrossAmount.toLocaleString()}</div>
                    </div>
                    
                    <ArrowRight className="payment-arrow" size={24} />
                    
                    <div className={`payment-step ${paymentStep === 'ready_to_settle' ? 'active' : ''}`}>
                      <div className="payment-icon">
                        <Wallet size={24} />
                      </div>
                      <span>정산 준비</span>
                      <div className="payment-breakdown">
                        <div className="breakdown-item">
                          <span>셀러: ₩{totalAmount.toLocaleString()}</span>
                        </div>
                        <div className="breakdown-item fee">
                          <span>수수료: ₩{totalFeeAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Indicator */}
              {(currentStep !== 'idle' && currentStep !== 'payment_demo') && (
                <div className="flow-progress">
                  <div className={`progress-step ${currentStep === 'fee_transfer' ? 'active' : currentStep === 'settlements' || currentStep === 'completed' ? 'completed' : ''}`}>
                    <div className="step-icon">
                      <CreditCard size={20} />
                    </div>
                    <span>수수료 전송</span>
                  </div>
                  <div className="progress-line">
                    <div className="progress-fill" style={{ width: `${Math.min(settleProgress, 20) * 5}%` }}></div>
                  </div>
                  <div className={`progress-step ${currentStep === 'settlements' ? 'active' : currentStep === 'completed' ? 'completed' : ''}`}>
                    <div className="step-icon">
                      <Store size={20} />
                    </div>
                    <span>셀러 정산</span>
                  </div>
                  <div className="progress-line">
                    <div className="progress-fill" style={{ width: `${Math.max(0, Math.min(settleProgress - 20, 80)) * 1.25}%` }}></div>
                  </div>
                  <div className={`progress-step ${currentStep === 'completed' ? 'completed' : ''}`}>
                    <div className="step-icon">
                      <Check size={20} />
                    </div>
                    <span>정산 완료</span>
                  </div>
                </div>
              )}
              
              {/* Processing Section */}
              {isSettling && (
                <div className="processing-section">
                  <div className="processing-icon">
                    <div className="loading-spinner"></div>
                  </div>
                  <h3>
                    {currentStep === 'fee_transfer' && '이커머스 플랫폼으로 수수료 전송 중...'}
                    {currentStep === 'settlements' && '셀러들에게 정산금 전송 중...'}
                    {currentStep === 'completed' && '모든 정산이 완료되었습니다!'}
                  </h3>
                  <p>진행률: {settleProgress}%</p>
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${settleProgress}%` }}></div>
                  </div>
                </div>
              )}

              <div className="settlement-status">
                <h2 className="status-title">정산 현황</h2>
                
                <div className="sellers-grid">
                  {sellers.map((seller, index) => (
                    <div key={seller.id} className="seller-card">
                      <div className="seller-header">
                        <div className={`seller-icon seller${index + 1}`}>
                          {seller.icon}
                        </div>
                        <div className="seller-info">
                          <h3>{seller.name}</h3>
                          <p className="seller-category">{seller.category}</p>
                        </div>
                      </div>
                      
                      <div className="seller-details">
                        <div className="detail-row">
                          <span className="detail-label">총 매출액</span>
                          <span className="settlement-amount">₩{seller.grossAmount.toLocaleString()}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">플랫폼 수수료</span>
                          <span className="settlement-amount">₩{seller.feeAmount.toLocaleString()}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">정산 금액</span>
                          <span className="settlement-amount">₩{seller.settlementAmount.toLocaleString()}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">지갑 주소</span>
                          <span className="wallet-address">{seller.walletAddress}</span>
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
                    <span className="total-label">총 매출액</span>
                    <span className="total-amount">₩{totalGrossAmount.toLocaleString()}</span>
                  </div>
                  <div className="total-row">
                    <span className="total-label">플랫폼 수수료</span>
                    <span className="total-amount">₩{totalFeeAmount.toLocaleString()}</span>
                  </div>
                  <div className="total-row">
                    <span className="total-label">총 정산액</span>
                    <span className="total-amount">₩{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="total-note">* 수수료는 별도로 플랫폼 지갑에 전송됩니다</div>
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
                        <span className="connected-wallet">연결된 지갑: {account}</span>
                      </div>
                      <button 
                        onClick={handleSettlement}
                        disabled={isSettling}
                        className={`settle-btn ${isSettling ? 'disabled' : ''}`}
                        style={{ cursor: isSettling ? 'not-allowed' : 'pointer' }}
                      >
                        {isSettling ? (
                          <>
                            <div className="loading-spinner"></div>
                            블록체인 정산 처리중...
                          </>
                        ) : (
                          <>
                            스테이블코인으로 정산 시작
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </>
                  )}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settlement;