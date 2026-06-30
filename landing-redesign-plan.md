# 메인 랜딩페이지 리디자인 플랜
### 컨셉: "사진 한 장 → AI 에이전트 Mark와 상담"

작성 기준: 현재 코드(`src/components/StartLanding.tsx`, `src/components/Hero.tsx`, `src/lib/useChat.ts`)

---

## 0. 핵심 진단 (왜 첫 화면에서 이탈하는가)

대상 페이지는 `/start` 경로의 `StartLanding.tsx`입니다. 현재 히어로의 문제:

- 첫 화면이 **텍스트만** 있고 시각적 후킹·상호작용이 없음
- 헤드라인("Apparel Production Handled from A to Z")이 **차별점을 말하지 않음** — 가장 강력한 무기인 "한국 생산 = Section 301 관세 0%"는 한참 아래 "Why Korea?" 섹션에 묻혀 있음
- CTA가 "Get a Free Quote" 하나뿐이고, 클릭하면 그냥 `/`로 이동 (부담 큰 단일 행동)
- 스크롤 유인(scent)이 없어 "이게 전부"라고 느끼고 떠남

**전략 전환:** 첫 화면을 "정적 마케팅 카피"에서 **"바로 써보는 인터랙티브 도구"**로 바꾼다. 이미 존재하는 AI 채팅+이미지 업로드를 히어로의 주인공으로 올린다.

---

## 1. 이미 있는 자산 (재사용) vs 새로 만들 것

| 기능 | 상태 | 위치 |
|---|---|---|
| AI 채팅 (Gemini) | ✅ 있음 | `useChat.ts` → `/api/chat` |
| 사진 업로드 + 분석 | ✅ 있음 | `useChat.ts` `handleImageSelect` → `/api/upload` (Supabase) |
| 음성 입력 | ✅ 있음 | `useChat.ts` `toggleListening` |
| 데스크탑 채팅 히어로 | ✅ 있음 | `Hero.tsx` slide 0 |
| 모바일 채팅 뷰 | ✅ 있음 | `MobileChatView.tsx` |
| **에이전트 이름 "Mark"** | ❌ 없음 (지금은 "virtual manufacture coordinator") | `App.tsx` 초기 메시지, `/api/index.ts` 시스템 프롬프트 |
| **`/start` 히어로의 사진/Mark 진입 UI** | ❌ 없음 | `StartLanding.tsx` (신규) |

> 결론: 백엔드/기능은 거의 다 있음. 작업의 80%는 `StartLanding.tsx` 히어로 재구성 + 에이전트 네이밍.

---

## 2. 새 히어로 — 화면 구성 (Above the Fold)

```
            Korea Apparel Works              ← 상단 브랜드
   ● 한국 생산 · Section 301 관세 0%          ← 배지: 차별점을 여기로!

        원하는 옷, 사진 한 장이면 됩니다        ← H1
   사진을 올리면 AI 에이전트 Mark가 단가·MOQ·
   리드타임까지 바로 알려드려요.                ← 서브카피

   ┌─────────────────────────────────────┐
   │  [📷 사진 첨부]  무엇을 만들고 싶으세요?  │  ← 실제 동작하는
   │                              [↑ 전송] │     채팅 입력창
   └─────────────────────────────────────┘
   [ 사진 올리고 Mark와 상담 ]  ← 주 CTA (드롭존 클릭)
   사진 없이 대화 시작  ← 보조 CTA (텍스트 링크)

   1pcs~ MOQ   ·   3~14 days 샘플   ·   100+ 브랜드   ← 신뢰 지표(유지)
```

핵심 변경점
- 배지에 **차별점(한국/관세 0%)**을 올린다 — 5초 안에 "왜 한국?" 답을 준다.
- 헤드라인을 승인안으로 교체:
  - **H1:** "원하는 옷, 사진 한 장이면 됩니다"
  - **Sub:** "사진을 올리면 AI 에이전트 Mark가 단가·MOQ·리드타임까지 바로 알려드려요. 한국 생산이라 Section 301 관세도 없습니다."
- 텍스트 CTA → **실제 동작하는 입력창 + 사진 드롭존**으로 교체.
  - 주 CTA: **"사진 올리고 Mark와 상담"** → 파일 선택 트리거 (`handleAnalyzeImage`)
  - 보조 CTA: **"사진 없이 대화 시작"** → 입력창 포커스
- 입력/업로드 시 기존 `Hero.tsx` slide 0 채팅 플로우로 자연스럽게 진입(또는 인라인 확장).

---

## 3. 인터랙션 플로우

1. 방문자가 히어로 도착 → 입력창과 "사진 첨부"가 바로 보임 (행동 유도)
2. **사진 업로드** → `handleImageSelect` → Supabase 저장 → Gemini가 "이건 폴로셔츠네요" 식으로 분석 → Mark가 MOQ/단가/리드타임 응답
3. **텍스트만 입력** → 동일하게 Mark 응답
4. 대화가 시작되면(`messages.length > 1`) 채팅 UI가 전체 화면으로 확장 (기존 Hero 로직 재사용)
5. 견적 의향이 잡히면 로그인/이메일 모달(`QuoteModal`)로 리드 수집

**중요 — 첫 응답 품질이 곧 신뢰.** 사진→의미있는 응답까지 막힘없이 가야 함. 느리거나 엉뚱하면 오히려 이탈↑. `/api/index.ts` 시스템 프롬프트를 "사진 분석 시 의류 종류·추정 단가대·MOQ·리드타임을 먼저 제시"하도록 튜닝 권장.

---

## 4. 페이지 섹션 순서 재배치

현재 순서: 히어로 → Custom Apparel → **Why Korea(관세)** → Why KAW → AI 플로우 → Export Map → CTA

제안 순서:
1. **히어로** (사진+Mark, 관세 0% 배지)
2. **Why Korea? / Section 301 관세 0%** ← 위로 올림 (가장 강력한 구매 이유)
3. Custom Apparel Solutions (제품 갤러리 = 비주얼)
4. Why KAW (30년 경력 등 신뢰)
5. AI-powered 플로우 (Mark가 뭘 하는지 설명)
6. Global Export Reach
7. 최종 CTA

> 근거: 차별점(관세)과 비주얼(제품)을 위로 올려, 스크롤 초반에 "왜 여기서 해야 하는지"를 빠르게 납득시킴.

---

## 5. 에이전트 네이밍 "Mark"

- `App.tsx`: 초기 인사 메시지를 Mark 1인칭으로 ("Hi, I'm Mark, your apparel production coordinator at Korea Apparel Works...")
- `/api/index.ts`: 시스템 프롬프트에 페르소나(이름 Mark, 역할, 톤) 정의
- UI: 채팅 버블/헤더에 "Mark" 라벨 + 작은 아바타 → 봇인지 사람인지 모호함 제거
- 카피: "AI 에이전트 Mark"로 표기해 AI임을 명확히 (기대치 관리)

---

## 6. 모바일

- 모바일은 이미 slide 0 = `MobileChatView` (채팅 화면)라 컨셉과 잘 맞음
- `/start` 모바일 히어로도 동일하게 입력창+사진 버튼을 한 화면에 배치
- 사진 버튼은 모바일에서 카메라 촬영도 허용 (`accept="image/*" capture` 고려)
- 첫 화면에 다음 섹션 일부가 살짝 보이게 해 스크롤 유인 제공

---

## 7. 측정 (효과 검증)

- GTM 이미 설치됨(`GTM-KP3W9T9D`) → 이벤트 정의:
  - `hero_photo_upload`, `hero_chat_start`, `mark_first_reply`, `quote_modal_open`, `lead_submit`
- **Microsoft Clarity**(무료) 연결 → 히트맵·세션 녹화로 "어디서 이탈하는지" 실제 확인
- A/B: 기존 히어로 vs 새 히어로로 첫 화면 이탈률 / 채팅 시작률 비교

---

## 8. 단계별 실행 (제안)

**Phase 1 — 카피·구조 (빠른 효과)**
- [ ] 히어로 H1/서브/배지 교체 (관세 0% 위로)
- [ ] 섹션 순서 재배치 (Why Korea 위로)
- [ ] 에이전트 "Mark" 네이밍

**Phase 2 — 인터랙티브 히어로**
- [ ] `/start` 히어로에 실제 입력창 + 사진 드롭존 삽입
- [ ] 주/보조 CTA 연결 (`handleAnalyzeImage` / 입력창 포커스)
- [ ] 대화 시작 시 채팅 확장 플로우 연결

**Phase 3 — 품질·측정**
- [ ] Mark 사진 분석 응답 프롬프트 튜닝 (단가·MOQ·리드타임 우선)
- [ ] GTM 이벤트 + Clarity 연결
- [ ] 첫 화면 이탈률 추적·비교

---

## 9. 리스크 / 체크포인트

- AI 응답 지연·오류 시 이탈 가속 → 첫 응답 속도·정확도가 최우선
- 사진 업로드 실패(권한/용량) 대비 폴백 메시지
- 견적 모달이 너무 일찍 뜨면 부담 → 충분히 대화한 뒤 자연스럽게 유도
- "관세 0%" 문구는 사실관계(원산지·HTS 기준) 확인 후 표기 — 법적 오해 소지 주의
