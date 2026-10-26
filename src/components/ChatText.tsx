import { Fragment, ReactNode } from "react";

// BBally 답변용 아주 작은 마크다운 렌더러.
// 모델이 쓰는 것만 지원한다: **굵게**, 빈 줄 문단, "- " 목록. HTML은 해석하지 않는다(문자열 그대로 React 노드로).

function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={i} className="font-semibold text-neutral-900">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

const BULLET = /^\s*(?:[-•*]|\d+[.)])\s+/;

export default function ChatText({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const lines = paragraph;
    blocks.push(
      <p key={blocks.length}>
        {lines.map((line, i) => (
          <Fragment key={i}>
            {i > 0 && <br />}
            {renderInline(line)}
          </Fragment>
        ))}
      </p>
    );
    paragraph = [];
  };
  const flushBullets = () => {
    if (!bullets.length) return;
    blocks.push(
      <ul key={blocks.length} className="list-disc pl-5 space-y-1">
        {bullets.map((b, i) => (
          <li key={i}>{renderInline(b)}</li>
        ))}
      </ul>
    );
    bullets = [];
  };

  for (const line of text.split("\n")) {
    if (!line.trim()) {
      flushParagraph();
      flushBullets();
    } else if (BULLET.test(line)) {
      flushParagraph();
      bullets.push(line.replace(BULLET, ""));
    } else {
      flushBullets();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushBullets();

  return <div className="space-y-2.5">{blocks}</div>;
}

/** BBally 프로필 아이콘("B"). 대화 말풍선 왼쪽에 붙여 BBally가 직접 말하는 것처럼 보이게 한다. */
export function BBallyAvatar({ size = 32 }: { size?: number }) {
  return (
    <div
      role="img"
      aria-label="BBally"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.47) }}
      className="rounded-full shrink-0 bg-blue-900 text-white font-semibold flex items-center justify-center select-none leading-none"
    >
      B
    </div>
  );
}

/** 인사말처럼 이름까지 보여 줄 때 쓰는 머리말 */
export function BBallyName() {
  return <div className="text-[12px] font-semibold text-neutral-900 mb-1">BBally</div>;
}
