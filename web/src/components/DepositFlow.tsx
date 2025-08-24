import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Users, 
  FileText, 
  Coins, 
  TrendingUp, 
  RefreshCw,
  ArrowRight,
  Shield,
  Landmark
} from 'lucide-react';

interface FlowStep {
  id: number;
  title: string;
  description: string;
  entity: string;
  icon: React.ReactNode;
  color: string;
}

const DepositFlow: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const flowSteps: FlowStep[] = [
    {
      id: 1,
      title: "정기예금 가입",
      description: "인터넷 특판 정기예금 (1년 만기, 3.0% 금리)",
      entity: "고객",
      icon: <Users size={24} />,
      color: "#4F46E5"
    },
    {
      id: 2,
      title: "현금유입 & 준비자산",
      description: "은행이 신탁사에 예금분 고객자산을 맡김",
      entity: "신탁사",
      icon: <Shield size={24} />,
      color: "#7C3AED"
    },
    {
      id: 3,
      title: "단기국채 매입 & 스테이블코인 발행",
      description: "단기국채 매입 (금리 2.5%) 및 준비자산 기반 발행",
      entity: "국채시장",
      icon: <Landmark size={24} />,
      color: "#DC2626"
    },
    {
      id: 4,
      title: "기업 대출",
      description: "무역금융대출 중심 (만기 1년, 금리 3.5%)",
      entity: "일반기업",
      icon: <Building2 size={24} />,
      color: "#059669"
    },
    {
      id: 5,
      title: "만기 시 스테이블코인 상환",
      description: "기업이 원금 + 이자(3.5%)를 스테이블코인으로 상환",
      entity: "은행",
      icon: <RefreshCw size={24} />,
      color: "#EA580C"
    },
    {
      id: 6,
      title: "스테이블코인 지급",
      description: "고객에게 원금 + 이자(3%) 지급",
      entity: "고객",
      icon: <Coins size={24} />,
      color: "#4F46E5"
    },
    {
      id: 7,
      title: "스테이블코인 ↔ 원화 환전",
      description: "가상자산거래소에서 환전",
      entity: "거래소",
      icon: <TrendingUp size={24} />,
      color: "#0891B2"
    }
  ];

  return (
    <div className="deposit-flow-container">
      <h2 className="section-title">스테이블코인 정기예금 운영 구조</h2>
      
      <div className="flow-diagram">
        <div className="entities-row">
          <div className="entity-box customer">
            <Users size={32} />
            <h3>고객</h3>
          </div>
          <div className="entity-box bank">
            <Building2 size={32} />
            <h3>은행</h3>
          </div>
          <div className="entity-box trust">
            <Shield size={32} />
            <h3>신탁사</h3>
          </div>
          <div className="entity-box market">
            <Landmark size={32} />
            <h3>국채시장</h3>
          </div>
          <div className="entity-box company">
            <FileText size={32} />
            <h3>일반기업</h3>
          </div>
        </div>

        <div className="stablecoin-center">
          <motion.div 
            className="stablecoin-icon"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Coins size={48} />
            <span>STABLECOIN</span>
          </motion.div>
        </div>

        <div className="flow-steps">
          {flowSteps.map((step, index) => (
            <motion.div
              key={step.id}
              className={`flow-step ${activeStep === step.id ? 'active' : ''}`}
              onClick={() => setActiveStep(step.id)}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="step-number" style={{ backgroundColor: step.color }}>
                {step.id}
              </div>
              <div className="step-content">
                <div className="step-icon" style={{ color: step.color }}>
                  {step.icon}
                </div>
                <div className="step-info">
                  <h4>{step.title}</h4>
                  <p>{step.description}</p>
                  <span className="step-entity">{step.entity}</span>
                </div>
              </div>
              {index < flowSteps.length - 1 && (
                <ArrowRight className="step-arrow" size={20} />
              )}
            </motion.div>
          ))}
        </div>

        <div className="key-benefits">
          <h3>주요 이점</h3>
          <div className="benefits-grid">
            <div className="benefit-card">
              <TrendingUp size={20} />
              <span>높은 금리 (3.0%)</span>
            </div>
            <div className="benefit-card">
              <Shield size={20} />
              <span>비과세 혜택</span>
            </div>
            <div className="benefit-card">
              <Coins size={20} />
              <span>스테이블코인 활용</span>
            </div>
            <div className="benefit-card">
              <RefreshCw size={20} />
              <span>안정적 운용</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositFlow;