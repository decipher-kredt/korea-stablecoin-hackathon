import React from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <DollarSign className="logo-icon" size={32} />
          <h1>스테이블코인 정기예금 시스템</h1>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <TrendingUp size={20} />
            <span>최고 금리: 3.0%</span>
          </div>
          <div className="stat-item">
            <span>비과세 혜택 적용</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;