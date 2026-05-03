import { useCallback, useEffect, useRef } from "react";

function findMandarinVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | undefined {
  return (
    voices.find((voice) => voice.lang.toLowerCase() === "zh-cn") ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith("zh")) ??
    voices.find((voice) => /mandarin|chinese|普通话|中文/i.test(voice.name))
  );
}

export function useSpeech() {
  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;
  const voiceRef = useRef<SpeechSynthesisVoice | undefined>(undefined);

  useEffect(() => {
    if (!supported) {
      return;
    }

    const loadVoices = () => {
      voiceRef.current = findMandarinVoice(window.speechSynthesis.getVoices());
    };

    loadVoices();
    window.speechSynthesis.addEventListener?.("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener?.("voiceschanged", loadVoices);
    };
  }, [supported]);

  const cancel = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel();
    }
  }, [supported]);

  const speak = useCallback(
    (text: string, repeat = 1) =>
      new Promise<void>((resolve) => {
        if (!supported || !text) {
          resolve();
          return;
        }

        window.speechSynthesis.cancel();
        let spokenCount = 0;

        const speakOnce = () => {
          if (spokenCount >= repeat) {
            resolve();
            return;
          }

          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = "zh-CN";
          utterance.rate = 0.75;
          utterance.pitch = 1.05;
          utterance.volume = 1;

          if (voiceRef.current) {
            utterance.voice = voiceRef.current;
          }

          utterance.onend = () => {
            spokenCount += 1;
            window.setTimeout(speakOnce, 320);
          };

          utterance.onerror = () => {
            spokenCount += 1;
            window.setTimeout(speakOnce, 320);
          };

          window.speechSynthesis.speak(utterance);
        };

        speakOnce();
      }),
    [supported],
  );

  return { cancel, speak, supported };
}
