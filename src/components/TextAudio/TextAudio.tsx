import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./TextAudio.scss";


type TextAudioProps = {
  text?: string | null;
};

export default function TextAudio({ text }: TextAudioProps) {
  const textRef = useRef<HTMLDivElement | null>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const normalized = text?.replace(/\r\n/g,'\n') ?? ''
  

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
          className={`textaudio__textwrap ${isScrollable ? "is-scrollable" : ""}`}
          ref={textRef}
          role="region"
          aria-label="Текст"
          tabIndex={0}
        >
          <p className="textaudio__text">{normalized}</p>
        </div>
      )}
 
      
    </div>
  );
}
