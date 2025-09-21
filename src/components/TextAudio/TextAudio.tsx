import { useEffect, useLayoutEffect, useRef, useState, useMemo } from "react";
import type { JSX } from "react";
import "./TextAudio.scss";

type TextAudioProps = {
  text?: string | null;
  highlightVersionPrefix?: boolean;
  highlightPromo?: boolean;
  highlightVersionHeader?: boolean;
};

export default function TextAudio({
  text,
  highlightVersionPrefix,
  highlightPromo = true,
}: TextAudioProps) {
  const textRef = useRef<HTMLDivElement | null>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(true);

  const normalized = (text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\u00A0/g, " ");

  const isVersionQuestion = useMemo(() => {
    const s = normalized.trim().replace(/[«»"“”]/g, "");
    return /^Какую\s+версию(?:\s|\n)*выбираете\?\s*$/i.test(s);
  }, [normalized]);

  const { label, rest } = useMemo(() => {
    if (!highlightVersionPrefix)
      return { label: null as string | null, rest: normalized };
    const m = normalized.match(/^\s*(Версия\s*\d+\s*:)([\s\S]*)$/i);
    if (!m) return { label: null, rest: normalized };
    return { label: m[1].trim(), rest: m[2].replace(/^\s*/, "") };
  }, [normalized, highlightVersionPrefix]);

  const promoRegex = useMemo(
    () => /Смотрите сериал о моих приключениях только на Кинопоиске!?/gi,
    []
  );

  const renderWithPromo = (s: string) => {
    if (!highlightPromo) return s;
    const matches = [...s.matchAll(promoRegex)];
    if (matches.length === 0) return s;

    const out: (string | JSX.Element)[] = [];
    let last = 0;
    matches.forEach((m, idx) => {
      const i = m.index ?? 0;
      if (i > last) out.push(s.slice(last, i));
      out.push(
        <span className="textaudio__promo" key={`promo-${i}-${idx}`}>
          {m[0]}
        </span>
      );
      last = i + m[0].length;
    });
    if (last < s.length) out.push(s.slice(last));
    return out;
  };

  const recomputeScrollFlags = () => {
    const el = textRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const epsilon = 1;
    setIsScrollable(scrollHeight > clientHeight + epsilon);
    setAtTop(scrollTop <= epsilon);
    setAtBottom(scrollTop + clientHeight >= scrollHeight - epsilon);
  };

  useLayoutEffect(() => {
    recomputeScrollFlags();
  }, [normalized]);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const onScroll = () => recomputeScrollFlags();
    el.addEventListener("scroll", onScroll, { passive: true });

    const onResize = () => recomputeScrollFlags();
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const wrapClasses = [
    "textaudio__textwrap",
    isScrollable ? "is-scrollable" : "",
    isVersionQuestion ? "textaudio__textwrap--version-question" : "",
    isScrollable && !atTop ? "has-top-fade" : "",
    isScrollable && !atBottom ? "has-bottom-fade" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="textaudio">
      {normalized && (
<div
  className={wrapClasses}
  ref={textRef}
  role="region"
  aria-label="Текст"
  tabIndex={0}
  style={isVersionQuestion ? { paddingBottom: 0 } : undefined}
>
  <p
    className={[
      "textaudio__text",
      isVersionQuestion ? "textaudio__text--version-question" : "",
    ].join(" ")}
  >
            {label ? (
              <>
                <span className="textaudio__version-prefix">{label}</span>
                <br />
              </>
            ) : null}
            {isVersionQuestion ? rest : renderWithPromo(rest)}
          </p>
        </div>
      )}
    </div>
  );
}
