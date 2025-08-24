import React, { useState } from 'react';
import { Store, Truck, CreditCard, ArrowRight, Check, Wallet, User, ShoppingCart, Building2, Plus, Minus } from 'lucide-react';
import { useECommerce } from '../hooks/useECommerce';
import { useStableCoin } from '../hooks/useStableCoin';
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
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'idle' | 'payment_demo' | 'fee_transfer' | 'settlements' | 'completed'>('idle');
  const [settleProgress, setSettleProgress] = useState(0);
  const [showPaymentDemo, ] = useState(false);
  const [paymentStep, ] = useState<'user_pays' | 'funds_received' | 'ready_to_settle'>('user_pays');
  const [shoppingCart, setShoppingCart] = useState([
    { id: 1, name: 'Hoka Clifton 9', price: 219000, quantity: 0, seller: 'Hoka' },
    { id: 2, name: 'Nike Air Max 270', price: 189000, quantity: 0, seller: 'Nike' },
    { id: 3, name: 'Adidas Ultraboost 22', price: 249000, quantity: 0, seller: 'Adidas' },
    { id: 4, name: 'Puma RS-X', price: 159000, quantity: 0, seller: 'Puma' }
  ]);
  const { showToast } = useToast();
  const { account, isConnected: ecommerceConnected, connectWallet: connectEcommerce, pay, settle, sellers: contractSellers, fetchSellers, contract: ecommerceContract } = useECommerce();
  const { approve, isConnected: stableCoinConnected, connectWallet: connectStableCoin, contract: stableCoinContract } = useStableCoin();
  
  // 실제 컨트랙트 존재 여부로 연결 상태 확인
  const isEcommerceConnected = ecommerceConnected && ecommerceContract;
  const isStableCoinConnected = stableCoinConnected && stableCoinContract;
  const isConnected = isEcommerceConnected && isStableCoinConnected;
  
  // 상위 컴포넌트의 지갑 연결 상태 확인
  const checkGlobalWalletConnection = () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      return (window as any).ethereum.selectedAddress !== null;
    }
    return false;
  };
  
  const globalWalletConnected = checkGlobalWalletConnection();
  
  // 디버그 로그 (지갑 연결 시에만 출력)
  // console.log('Settlement - ECommerce connected:', ecommerceConnected);
  // console.log('Settlement - ECommerce contract:', !!ecommerceContract);
  // console.log('Settlement - ECommerce final connected:', isEcommerceConnected);
  // console.log('Settlement - StableCoin connected:', stableCoinConnected);
  // console.log('Settlement - StableCoin contract:', !!stableCoinContract);
  // console.log('Settlement - StableCoin final connected:', isStableCoinConnected);
  // console.log('Settlement - Both connected:', isConnected);
  
  const connectWallet = async () => {
    try {
      console.log('Settlement - Starting wallet connection...');
      console.log('Settlement - Global wallet connected:', globalWalletConnected);
      
      // 이미 전역적으로 연결되어 있다면 각 훅만 연결
      if (globalWalletConnected) {
        console.log('Settlement - Wallet already connected globally, connecting hooks...');
        
        // ECommerce 연결 시도
        console.log('Settlement - Connecting to ECommerce...');
        await connectEcommerce();
        console.log('Settlement - ECommerce connected successfully');
        
        // StableCoin 연결 시도
        console.log('Settlement - Connecting to StableCoin...');
        await connectStableCoin();
        console.log('Settlement - StableCoin connected successfully');
        
        console.log('Settlement - Hook connections completed');
      } else {
        // 전역적으로도 연결되지 않았다면 전체 연결 시도
        console.log('Settlement - Connecting wallet globally...');
        
        // ECommerce 연결 시도
        console.log('Settlement - Connecting to ECommerce...');
        await connectEcommerce();
        console.log('Settlement - ECommerce connected successfully');
        
        // StableCoin 연결 시도
        console.log('Settlement - Connecting to StableCoin...');
        await connectStableCoin();
        console.log('Settlement - StableCoin connected successfully');
        
        console.log('Settlement - Full wallet connection completed');
      }
      
      // 연결 후 상태 확인
      setTimeout(() => {
        console.log('Settlement - After connection check:');
        console.log('Settlement - ECommerce connected:', ecommerceConnected);
        console.log('Settlement - ECommerce contract:', !!ecommerceContract);
        console.log('Settlement - StableCoin connected:', stableCoinConnected);
        console.log('Settlement - StableCoin contract:', !!stableCoinContract);
        console.log('Settlement - Global wallet connected:', checkGlobalWalletConnection());
        
        // 상태가 제대로 업데이트되지 않았다면 강제로 새로고침
        if (!isConnected) {
          console.log('Settlement - Forcing page refresh to update state...');
          window.location.reload();
        }
      }, 1000);
      
    } catch (error) {
      console.error('Settlement - Wallet connection error:', error);
      showToast('지갑 연결 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
    }
  };
  
  useState<Seller[]>([
    {
      id: 'seller1',
      name: 'Nike',
      icon: <Store className="w-8 h-8" />,
      color: 'bg-blue-500',
      settlementAmount: 179000,
      grossAmount: 189000,
      feeAmount: 10000,
      netAmount: 179000,
      status: 'pending',
      category: '스포츠웨어',
      walletAddress: '0x742d35Cc6bF4532530d5E3C6F2c1B94E8bE3Bf85'
    },
    {
      id: 'seller2', 
      name: 'Adidas',
      icon: <CreditCard className="w-8 h-8" />,
      color: 'bg-purple-500',
      settlementAmount: 236000,
      grossAmount: 249000,
      feeAmount: 13000,
      netAmount: 236000,
      status: 'pending',
      category: '스포츠웨어',
      walletAddress: '0x8ba1f109551bD432803012645Hac136c22C501e5'
    },
    {
      id: 'seller3',
      name: 'Puma',
      icon: <Truck className="w-8 h-8" />,
      color: 'bg-green-500',
      settlementAmount: 151000,
      grossAmount: 159000,
      feeAmount: 8000,
      netAmount: 151000,
      status: 'pending',
      category: '스포츠웨어',
      walletAddress: '0xaB1f1845C3E6fE2E5d4B8b1C3aF9E0C4d5F6A7B8'
    }
  ]);

  const cartTotal = shoppingCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const updateQuantity = (id: number, change: number) => {
    setShoppingCart(prev => prev.map(item => 
      item.id === id 
        ? { ...item, quantity: Math.max(0, item.quantity + change) }
        : item
    ));
  };

  const completePurchase = async () => {
    const purchaseAmount = cartTotal;
    
    setIsPurchasing(true);
    
    try {
      console.log('실제 블록체인 트랜잭션 실행');
      const ECOMMERCE_ADDRESS = '0x3DC5b13a8211bc150DE77665792a5B286bbe6676';
      
      // 총 구매 금액 계산
      const totalPurchaseAmount = cartTotal;
      const totalPurchaseKREDT = totalPurchaseAmount.toString(); // KRW를 KREDT로 변환 (1:1 비율)
      
      console.log(`총 구매 금액: ${totalPurchaseKREDT} KREDT`);
      
      // 1. StableCoin approve - 총액으로 한 번만
      console.log('StableCoin approve 시작...');
      const approveResult = await approve(ECOMMERCE_ADDRESS, totalPurchaseKREDT);
      if (!approveResult.success) {
        showToast('StableCoin 승인 실패', 'error');
        return;
      }
      console.log('StableCoin approve 성공:', approveResult.txHash);
      
      // 2. 각 셀러별로 ECommerce.pay() 호출
      for (const item of shoppingCart) {
        if (item.quantity > 0) {
          const itemTotal = item.price * item.quantity;
          const itemTotalKREDT = itemTotal.toString(); // KRW를 KREDT로 변환 (1:1 비율)
          
          console.log(`${item.seller} 상품 구매: ${itemTotalKREDT} KREDT`);
          
          // ECommerce.pay() 호출
          const result = await pay(itemTotalKREDT, item.seller);
          if (!result.success) {
            showToast(`${item.seller} 결제 실패`, 'error');
            return;
          }
          
          console.log(`${item.seller} 결제 성공:`, result.txHash);
        }
      }
      
      // 모든 트랜잭션이 완료된 후 정산 탭으로 이동
      console.log('모든 결제 트랜잭션 완료');
      
      // 수량을 0으로 리셋 (상품은 유지)
      setShoppingCart(prev => prev.map(item => ({ ...item, quantity: 0 })));
      showToast(`구매 완료! ₩${purchaseAmount.toLocaleString()} 결제됨`, 'success');
      
      // 트랜잭션 완료 후 잠시 대기 후 정산 탭으로 이동
      setTimeout(async () => {
        console.log('정산 탭으로 이동 및 sellers 정보 새로고침');
        setActiveTab('settlement');
        
        // sellers 정보 새로고침
        if (fetchSellers) {
          await fetchSellers();
          console.log('Sellers 정보 새로고침 완료');
        }
        
        showToast('정산 현황이 업데이트되었습니다!', 'info');
      }, 2000); // 2초 대기로 트랜잭션 반영 시간 확보
    } catch (error) {
      console.error('구매 처리 중 오류:', error);
      showToast('구매 처리 중 오류가 발생했습니다', 'error');
    } finally {
      setIsPurchasing(false);
    }
  };


  const handleSettlement = async () => {
    if (!isConnected) {
      showToast('지갑을 먼저 연결해주세요!', 'error');
      return;
    }

    console.log('정산 시작:', { account, isConnected });
    
    try {
      setIsSettling(true);
      setCurrentStep('settlements');
      setSettleProgress(50);
      showToast('정산 중입니다...', 'info');

      // settle 함수만 호출
      const settleResult = await settle();
      if (!settleResult.success) {
        throw new Error('정산 트랜잭션 실패');
      }

      // sellers 정보 새로고침
      await fetchSellers();
      
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
            onClick={async () => {
              setActiveTab('settlement');
              console.log('정산 탭 클릭 - fetchSellers 호출');
              
              // 지갑 연결 상태 확인
              if (!ecommerceContract) {
                console.log('ECommerce 컨트랙트가 없음 - 지갑 연결 시도');
                try {
                  await connectEcommerce();
                  console.log('ECommerce 연결 완료');
                } catch (error) {
                  console.error('ECommerce 연결 실패:', error);
                  showToast('지갑 연결이 필요합니다. 지갑 연결 버튼을 클릭해주세요.', 'error');
                  return;
                }
              }
              
              if (fetchSellers) {
                await fetchSellers();
                console.log('fetchSellers 완료');
              } else {
                console.log('fetchSellers 함수가 없음');
              }
            }}
          >
            <Building2 size={16} />
            정산
          </button>
        </div>

        <div className="settlement-main">
          {/* Shopping Tab */}
          {activeTab === 'shopping' && (
            <div className="iphone-container">
              <div className="iphone-frame">
                <div className="iphone-notch"></div>
                <div className="iphone-screen">
                  <div className="shopping-demo-section">
              <div className="shopping-header">
                <div className="platform-info">
                  <Store className="platform-icon" size={32} />
                  <div>
                    <h3>🛒 이커머스 플랫폼 쇼핑</h3>
                    <p>고객이 스포츠웨어를 구매하고 있습니다</p>
                  </div>
                </div>
              </div>
              
              <div className="shopping-cart">
                <h4>🛍️ 상품 목록</h4>
                <div className="cart-items">
                  {shoppingCart.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="item-info">
                        <Store className="item-icon" size={20} />
                        <div className="item-details">
                          <span className="item-name">{item.name}</span>
                          <span className="item-seller">셀러: {item.seller}</span>
                          <span className="item-price">₩{item.price.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="quantity-controls">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          className="quantity-btn"
                          disabled={item.quantity === 0}
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
                      disabled={cartTotal === 0 || isPurchasing}
                    >
                      {isPurchasing ? (
                        <>
                          <div className="loading-spinner"></div>
                          결제 처리중...
                        </>
                      ) : (
                        <>
                          <CreditCard size={20} />
                          스테이블코인으로 결제하기
                        </>
                      )}
                    </button>
                </div>
              </div>
                  </div>
                </div>
              </div>
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
                      <div className="payment-amount">₩ {contractSellers.reduce((sum, seller) => sum + parseFloat(seller.balance || '0'), 0).toLocaleString()}</div>
                    </div>
                    
                    <ArrowRight className="payment-arrow" size={24} />
                    
                    <div className={`payment-step ${paymentStep === 'funds_received' ? 'active' : paymentStep === 'ready_to_settle' ? 'completed' : ''}`}>
                      <div className="payment-icon">
                        <Building2 size={24} />
                      </div>
                      <span>플랫폼 수령</span>
                      <div className="payment-amount">₩ {contractSellers.reduce((sum, seller) => sum + parseFloat(seller.balance || '0'), 0).toLocaleString()}</div>
                    </div>
                    
                    <ArrowRight className="payment-arrow" size={24} />
                    
                    <div className={`payment-step ${paymentStep === 'ready_to_settle' ? 'active' : ''}`}>
                      <div className="payment-icon">
                        <Wallet size={24} />
                      </div>
                      <span>정산 준비</span>
                      <div className="payment-breakdown">
                        <div className="breakdown-item">
                          <span>셀러: ₩{contractSellers.reduce((sum, seller) => sum + parseFloat(seller.balance || '0') * 0.95, 0).toLocaleString()}</span>
                        </div>
                        <div className="breakdown-item fee">
                          <span>수수료: ₩{contractSellers.reduce((sum, seller) => sum + parseFloat(seller.balance || '0') * 0.05, 0).toLocaleString()}</span>
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
                  {['Hoka', 'Nike', 'Adidas', 'Puma'].map((sellerName, index) => {
                    const seller = contractSellers.find(s => s.name === sellerName);
                    const balance = seller ? parseFloat(seller.balance) : 0;
                    const feeAmount = balance * 0.05; // 5% 수수료
                    const settlementAmount = balance - feeAmount;
                    
                    return (
                      <div key={sellerName} className="seller-card">
                        <div className="seller-header">
                          <div className={`seller-icon seller${index + 1}`}>
                            <Store className="w-8 h-8" />
                          </div>
                          <div className="seller-info">
                            <h3>{sellerName}</h3>
                            <p className="seller-category">스포츠웨어</p>
                          </div>
                        </div>
                        
                        <div className="seller-details">
                          <div className="detail-row">
                            <span className="detail-label">총 매출액</span>
                            <span className="settlement-amount">{balance.toFixed(3)} KREDT</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">플랫폼 수수료 (5%)</span>
                            <span className="settlement-amount">{feeAmount.toFixed(3)} KREDT</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">정산 금액</span>
                            <span className="settlement-amount">{settlementAmount.toFixed(3)} KREDT</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">지갑 주소</span>
                            <span className="wallet-address">
                              {sellerName === 'Hoka' ? '0x72A3aFdCa071C78eAc8e0557DfD560aeF80c5FB6' :
                               sellerName === 'Nike' ? '0x2AC0fa1C8CF6f988999B51Ac66d22ff1E0ce7D2a' :
                               sellerName === 'Adidas' ? '0x1d24ef3E80a08A6192aaCd3AE29afC07b0C90024' :
                               sellerName === 'Puma' ? '0x5D0Aaf78624C12785e7fF5CDaFBAE4689271b562' :
                               seller?.address || '등록되지 않음'}
                            </span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">상태</span>
                            {getStatusBadge(balance > 0 ? 'pending' : 'completed')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="total-summary">
                  <div className="total-row">
                    <span className="total-label">총 매출액</span>
                    <span className="total-amount">{contractSellers.reduce((sum, seller) => sum + parseFloat(seller.balance), 0).toFixed(3)} KREDT</span>
                  </div>
                  <div className="total-row">
                    <span className="total-label">플랫폼 수수료 (5%)</span>
                    <span className="total-amount">{contractSellers.reduce((sum, seller) => sum + (parseFloat(seller.balance) * 0.1), 0).toFixed(3)} KREDT</span>
                  </div>
                  <div className="total-row">
                    <span className="total-label">총 정산액</span>
                    <span className="total-amount">{contractSellers.reduce((sum, seller) => sum + (parseFloat(seller.balance) * 0.9), 0).toFixed(3)} KREDT</span>
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
                      지갑 연결 {!isEcommerceConnected && !isStableCoinConnected ? '' : 
                                isEcommerceConnected && !isStableCoinConnected ? '(StableCoin 연결 필요)' :
                                !isEcommerceConnected && isStableCoinConnected ? '(ECommerce 연결 필요)' : ''}
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