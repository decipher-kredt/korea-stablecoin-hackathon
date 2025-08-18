import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Building2, Percent, Calendar, Award } from 'lucide-react';

interface BankOffer {
  name: string;
  logo: string;
  product: string;
  baseRate: string;
  maxRate: string;
  term: string;
  specialNote?: string;
  color: string;
}

const BankComparison: React.FC = () => {
  const bankOffers: BankOffer[] = [
    {
      name: "Sh첫만남우대예금",
      logo: "🏦",
      product: "SH수협은행",
      baseRate: "1.85%",
      maxRate: "2.90%",
      term: "12개월",
      specialNote: "누구나가입 / 방문없이가입",
      color: "#3B82F6"
    },
    {
      name: "우리 첫거래우대 정기예금",
      logo: "🏢",
      product: "우리은행",
      baseRate: "1.80%",
      maxRate: "2.80%",
      term: "12개월",
      specialNote: "우대금리 최대 연 1.00% 적용시 최고 연...",
      color: "#10B981"
    },
    {
      name: "e-그린세이브예금",
      logo: "🏪",
      product: "SC제일은행",
      baseRate: "2.45%",
      maxRate: "2.75%",
      term: "12개월",
      specialNote: "누구나가입 / 방문없이가입",
      color: "#8B5CF6"
    },
    {
      name: "Sh해양플라스틱Zero!예금",
      logo: "🌊",
      product: "SH수협은행",
      baseRate: "2.40%",
      maxRate: "2.75%",
      term: "12개월",
      specialNote: "누구나가입 / 방문없이가입",
      color: "#0EA5E9"
    },
    {
      name: "헤이(Hey)정기예금",
      logo: "💰",
      product: "SH수협은행",
      baseRate: "2.70%",
      maxRate: "2.70%",
      term: "12개월",
      specialNote: "누구나가입 / 방문없이가입",
      color: "#F59E0B"
    },
    {
      name: "KIA타이거즈 우승기원예금",
      logo: "⚾",
      product: "광주은행",
      baseRate: "2.40%",
      maxRate: "2.65%",
      term: "12개월",
      specialNote: "기본금리 연 2.40%에 우대금리 최고 연 0.25% 적용시",
      color: "#EF4444"
    }
  ];

  return (
    <div className="bank-comparison-container">
      <h2 className="section-title">주요 은행 정기예금 상품 비교</h2>
      
      <div className="comparison-header">
        <div className="header-info">
          <Award size={24} className="header-icon" />
          <span>최고 금리 TOP 6 은행 상품</span>
        </div>
        <div className="header-note">
          <Percent size={20} />
          <span>비과세 혜택 적용 가능</span>
        </div>
      </div>

      <div className="banks-grid">
        {bankOffers.map((bank, index) => (
          <motion.div
            key={index}
            className="bank-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ 
              y: -5,
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)"
            }}
            style={{ borderTop: `4px solid ${bank.color}` }}
          >
            <div className="bank-header">
              <span className="bank-logo">{bank.logo}</span>
              <div className="bank-title">
                <h3>{bank.name}</h3>
                <p className="bank-provider">{bank.product}</p>
              </div>
            </div>

            <div className="rate-display">
              <div className="rate-box">
                <span className="rate-label">기본</span>
                <span className="rate-value">{bank.baseRate}</span>
              </div>
              <TrendingUp size={20} className="rate-arrow" />
              <div className="rate-box highlight">
                <span className="rate-label">최고</span>
                <span className="rate-value max-rate" style={{ color: bank.color }}>
                  {bank.maxRate}
                </span>
              </div>
            </div>

            <div className="bank-details">
              <div className="detail-item">
                <Calendar size={16} />
                <span>기본 {bank.term}</span>
              </div>
              {bank.specialNote && (
                <div className="special-note">
                  <span>{bank.specialNote}</span>
                </div>
              )}
            </div>

            <motion.button 
              className="apply-button"
              style={{ backgroundColor: bank.color }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              상품 자세히 보기
            </motion.button>
          </motion.div>
        ))}
      </div>

      <div className="comparison-footer">
        <div className="footer-note">
          <Building2 size={20} />
          <span>토스뱅크 앱 내 인터넷 특판 (스테이블 전용) 가입 가능</span>
        </div>
        <div className="footer-highlight">
          <TrendingUp size={20} />
          <span>1금융권 이자율 + 0.1% 추가 혜택</span>
        </div>
      </div>
    </div>
  );
};

export default BankComparison;