This is a demo repository for the stablecoin blockchain hackathon.

The demo should be a web app that allows users to deposit and withdraw stablecoins.

The design should be modern, simple and clean.

It has EVM-compatible smart contract that allows users to deposit and withdraw stablecoins.

1. 디자인 토큰

• 색: --brand: #6E56CF(보라), --accent: #10B981(초록), 배경 #0B0B10, 텍스트 #EDEDED
• 라운딩: rounded-2xl
• 그림자: shadow-lg(hover 시 shadow-xl)
• 간격: 카드 내부 p-6, 섹션 py-16
• 폰트: Sans(Inter/pretendard), 헤드라인 font-semibold

2. UX 원칙

• 3단 그리드 이상 쓰면 모바일에서 1단 → 2단 → 3단 반응형
• 터치 타겟 최소 40px
• 기본 대비 WCAG AA 이상
• 모든 버튼/링크에 aria-label 또는 텍스트

3. 코드 가드레일

• shadcn/ui 우선 사용(ex. Button, Card, Dialog)
• Tailwind 유틸은 중복 금지 → 재사용 클래스를 cn() 또는 컴포넌트로 올리기
• 애니메이션은 Framer Motion의 whileHover/whileTap만 간단 사용
