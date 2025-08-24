# 스테이블코인 예금 dApp

스테이블코인 예금으로 연 3.0% 이자를 받을 수 있는 탈중앙화 애플리케이션입니다.

## 주요 기능

- 💰 스테이블코인(KREDT) 예금
- 📈 연 3.0% 이자율
- 🔐 MetaMask 지갑 연결
- 💸 원금 + 이자 출금
- 🎨 모던하고 깔끔한 UI
- 📱 반응형 디자인

## 기술 스택

- React + TypeScript
- Ethers.js (Web3 연동)
- Framer Motion (애니메이션)
- Solidity (스마트 컨트랙트)
- Vercel (배포)

## 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 프로덕션 빌드
npm run build
```

## Vercel 배포

```bash
# Vercel CLI로 배포
vercel

# 프로덕션 배포
vercel --prod
```

## 스마트 컨트랙트

스마트 컨트랙트는 `src/contracts/StablecoinDeposit.sol`에 있습니다.

배포 후 `src/hooks/useWeb3.ts`의 `CONTRACT_ADDRESS`를 업데이트해주세요.

## 환경 설정

1. MetaMask 설치
2. Kaia/Klaytn 네트워크 추가
3. 테스트넷 KLAY 받기
4. 스마트 컨트랙트 배포
5. 컨트랙트 주소 업데이트

## 라이선스

MIT
