# 스테이블코인 예치/출금 데모

스테이블코인 블록체인 해커톤을 위한 데모 레포지토리입니다.

## 📋 프로젝트 개요

사용자가 스테이블코인을 예치하고 출금할 수 있는 웹 애플리케이션입니다. EVM 호환 스마트 계약을 통해 안전한 예치/출금 기능을 제공합니다.

## 🏗️ 아키텍처

### 스마트 계약 (`/contracts`)
- **Vault.sol**: 스테이블코인 예치/출금 및 이자 계산
- **VaultManager.sol**: Vault 관리 및 접근 제어
- **PaymentSystem.sol**: 결제 시스템
- **ECommerce.sol**: 전자상거래 기능
- **Token.sol**: ERC20 스테이블코인 토큰

### 웹 애플리케이션 (`/stablecoin-deposit-app`)
- React 18 + TypeScript
- Web3 연동 (ethers.js)
- 반응형 디자인 (Tailwind CSS)
- Framer Motion 애니메이션

## 🚀 시작하기

### 스마트 계약 배포

```bash
cd contracts
forge install
forge build
forge script script/Deploy.s.sol --rpc-url <RPC_URL> --private-key <PRIVATE_KEY>
```

### 웹 앱 실행

```bash
cd stablecoin-deposit-app
npm install
npm start
```

## ✨ 주요 기능

- **예치**: 스테이블코인 예치 및 3% 연이율 적용
- **출금**: 원금 + 이자 출금 (365일 락업)
- **실시간 잔액**: Web3 연동을 통한 실시간 잔액 조회
- **반응형 UI**: 모바일 친화적 인터페이스

## 🎨 디자인 시스템

- **색상**: 브랜드 #6E56CF (보라), 액센트 #10B981 (초록)
- **배경**: #0B0B10, 텍스트: #EDEDED
- **컴포넌트**: shadcn/ui 기반
- **애니메이션**: Framer Motion

## 🛠️ 기술 스택

- **Smart Contracts**: Solidity, OpenZeppelin, Foundry
- **Frontend**: React, TypeScript, Tailwind CSS
- **Web3**: ethers.js, Web3.js
- **Deployment**: Netlify, Vercel

## 📝 라이선스

MIT License