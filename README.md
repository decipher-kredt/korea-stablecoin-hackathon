# 스테이블코인 예치/출금 플랫폼

스테이블코인 블록체인 해커톤을 위한 데모 프로젝트입니다.

## 📋 프로젝트 개요

이 프로젝트는 사용자가 스테이블코인을 예치하고 출금할 수 있는 웹 애플리케이션입니다. EVM 호환 스마트 컨트랙트를 통해 안전한 자금 관리를 제공합니다.

## 🏗️ 아키텍처

### Frontend (`stablecoin-deposit-app/`)
- **프레임워크**: React 19 + TypeScript
- **스타일링**: Tailwind CSS + Framer Motion
- **웹3 연동**: Ethers.js, Web3.js
- **UI 컴포넌트**: shadcn/ui 기반 커스텀 컴포넌트

### Smart Contracts (`contracts/`)
- **개발 환경**: Foundry
- **주요 컨트랙트**:
  - `Vault.sol`: 예치/출금 핵심 로직 (3.0% 연이율, 365일 잠금)
  - `VaultManager.sol`: 볼트 관리 시스템
  - `PaymentSystem.sol`: 결제 처리 시스템
  - `ECommerce.sol`: 전자상거래 통합
  - `Token.sol`: ERC20 스테이블코인 구현

## 🚀 시작하기

### 필수 요구사항
- Node.js 16+
- Foundry
- 지원되는 웹3 지갑 (MetaMask 등)

### 설치 및 실행

1. **저장소 복제**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **스마트 컨트랙트 설정**
   ```bash
   cd contracts
   forge install
   forge build
   forge test
   ```

3. **Frontend 애플리케이션 실행**
   ```bash
   cd stablecoin-deposit-app
   npm install
   npm start
   ```

4. **브라우저에서 접속**
   - http://localhost:3000

## 🎨 디자인 시스템

### 색상 팔레트
- **브랜드 컬러**: `#6E56CF` (보라색)
- **액센트**: `#10B981` (초록색)  
- **배경**: `#0B0B10` (다크 네이비)
- **텍스트**: `#EDEDED` (밝은 회색)

### 스타일 가이드
- **라운딩**: `rounded-2xl`
- **그림자**: `shadow-lg` (호버시 `shadow-xl`)
- **간격**: 카드 내부 `p-6`, 섹션 `py-16`
- **폰트**: Inter/Pretendard, 헤드라인 `font-semibold`

## 💡 주요 기능

- ✅ **스테이블코인 예치**: 사용자 자금을 안전하게 보관
- ✅ **이자 적립**: 연 3.0% 고정 이율
- ✅ **잠금 기간**: 365일 예치 잠금
- ✅ **실시간 잔액**: 현재 예치 금액 및 누적 이자 확인
- ✅ **웹3 지갑 연동**: MetaMask 등 주요 지갑 지원
- ✅ **반응형 디자인**: 모바일/데스크톱 최적화

## 🛡️ 보안

- OpenZeppelin 표준 라이브러리 사용
- 스마트 컨트랙트 테스트 커버리지
- WCAG AA 접근성 표준 준수
- 타임스탬프 기반 이자 계산

## 📱 사용자 인터페이스

### 모바일 우선 반응형
- 1단 → 2단 → 3단 그리드 전환
- 최소 터치 타겟 40px
- 직관적인 예치/출금 플로우

### 접근성
- 모든 버튼/링크에 aria-label 제공
- 고대비 컬러 스킴
- 스크린 리더 지원

## 🔧 개발 환경

### Frontend 스택
```json
{
  "react": "^19.1.1",
  "typescript": "^4.9.5",
  "ethers": "^6.15.0",
  "framer-motion": "^12.23.12"
}
```

### Smart Contract 도구
- Foundry (빌드/테스트)
- OpenZeppelin Contracts
- Solidity ^0.8.0

## 📄 라이선스

MIT License

---

**⚡ 해커톤 데모 프로젝트** - 실제 프로덕션 환경에서는 추가적인 보안 검토가 필요합니다.