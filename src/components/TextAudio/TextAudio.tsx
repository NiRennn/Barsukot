import { useEffect, useLayoutEffect, useRef, useState, useMemo } from "react";
import type { JSX} from 'react'
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
  const normalized = (text ?? "").replace(/\r\n/g, "\n");

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

  const checkOverflow = () => {
    const el = textRef.current;
    if (!el) return;
    setIsScrollable(el.scrollHeight > el.clientHeight + 1);
  };

  useLayoutEffect(() => {
    checkOverflow();
  }, [normalized]);

  useEffect(() => {
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, []);

  return (
    <div className="textaudio">
      {normalized && (
        <div
          className={`textaudio__textwrap ${
            isScrollable ? "is-scrollable" : ""
          }`}
          ref={textRef}
          role="region"
          aria-label="Текст"
          tabIndex={0}
        >
          <p className="textaudio__text">
            {label ? (
              <>
                <span className="textaudio__version-prefix">{label}</span>
                <br />
              </>
            ) : null}
            {renderWithPromo(rest)}
          </p>
        </div>
      )}
    </div>
  );
}
