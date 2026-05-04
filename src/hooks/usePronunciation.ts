import { useCallback, useRef } from "react";
import type { CharacterItem } from "../types";
import { useSpeech } from "./useSpeech";

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function usePronunciation() {
  const {
    cancel: cancelSpeech,
    speak,
    supported: speechSupported,
  } = useSpeech();
  const playTokenRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const missingAudioRef = useRef<Set<string>>(new Set());

  const stopAudio = useCallback(() => {
    if (!audioRef.current) {
      return;
    }

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current.src = "";
    audioRef.current = null;
  }, []);

  const playAudioOnce = useCallback(
    (src: string): Promise<void> =>
      new Promise((resolve, reject) => {
        stopAudio();
        const audio = new Audio(src);
        audioRef.current = audio;
        audio.preload = "auto";
        audio.onended = () => {
          if (audioRef.current === audio) {
            audioRef.current = null;
          }
          resolve();
        };
        audio.onerror = () => {
          if (audioRef.current === audio) {
            audioRef.current = null;
          }
          reject(new Error(`Audio failed: ${src}`));
        };
        audio.play().catch(reject);
      }),
    [stopAudio],
  );

  const cancel = useCallback(() => {
    playTokenRef.current += 1;
    stopAudio();
    cancelSpeech();
  }, [cancelSpeech, stopAudio]);

  const speakItem = useCallback(
    async (item: Pick<CharacterItem, "char" | "audio">, repeat = 1) => {
      const token = playTokenRef.current + 1;
      playTokenRef.current = token;
      stopAudio();
      cancelSpeech();

      const audioSrc = item.audio;
      if (audioSrc && !missingAudioRef.current.has(audioSrc)) {
        try {
          for (let index = 0; index < repeat; index += 1) {
            if (playTokenRef.current !== token) {
              return;
            }

            await playAudioOnce(audioSrc);
            if (index < repeat - 1) {
              await wait(260);
            }
          }
          return;
        } catch {
          missingAudioRef.current.add(audioSrc);
        }
      }

      if (playTokenRef.current === token) {
        await speak(item.char, repeat);
      }
    },
    [cancelSpeech, playAudioOnce, speak, stopAudio],
  );

  return {
    cancel,
    speakItem,
    supported: typeof Audio !== "undefined" || speechSupported,
  };
}
