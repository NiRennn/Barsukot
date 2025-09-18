import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./TextAudio.scss";
import AudioPlayer, { RHAP_UI } from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";

type TextAudioProps = {
  text?: string | null;
  audio?: string | null;
};

export default function TextAudio({ text, audio }: TextAudioProps) {
  const textRef = useRef<HTMLDivElement | null>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  const checkOverflow = () => {
    const el = textRef.current;
    if (!el) return;
    setIsScrollable(el.scrollHeight > el.clientHeight + 1);
  };

  useLayoutEffect(() => {
    checkOverflow();
  }, [text]);

  useEffect(() => {
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, []);

  return (
    <div className="textaudio">
      {text && (
        <div
          className={`textaudio__textwrap ${isScrollable ? "is-scrollable" : ""}`}
          ref={textRef}
          role="region"
          aria-label="Текст"
          tabIndex={0}
        >
          <p className="textaudio__text">{text}</p>
        </div>
      )}
 
      {audio && (
        <div className="textaudio__player">
          <AudioPlayer
            key={audio}
            src={`https://barsukot.brandservicebot.ru${audio}`}
            preload="auto"
            showSkipControls={false}
            showJumpControls={false}
            showDownloadProgress={false}
            customAdditionalControls={[]}
            customVolumeControls={[]}
            customProgressBarSection={[RHAP_UI.PROGRESS_BAR]}
            customControlsSection={[RHAP_UI.MAIN_CONTROLS]}
            customIcons={{
              play: (
                <img
                  src="/icons/play.svg"
                  alt="Play"
                  width={16}
                  height={16}
                  style={{ display: "block" }}
                />
              ),
              pause: (
                <img
                  src="/icons/pause.svg"
                  alt="Pause"
                  width={16}
                  height={16}
                  style={{ display: "block" }}
                />
              ),
            }}
            layout="horizontal-reverse"
            className="textaudio__audioplayer"
          />
        </div>
      )}
    </div>
  );
}
