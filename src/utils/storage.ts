import { DEFAULT_GAME_STYLE_ID, GAME_STYLES } from "../data/gameStyles";
import type {
  CharacterItem,
  GameProgress,
  GameStyleId,
  MistakeRecord,
} from "../types";

const PROGRESS_KEY = "pinyin-train-progress-v1";
const MISTAKES_KEY = "pinyin-train-mistakes-v1";
const GAME_STYLE_KEY = "pinyin-train-game-style-v1";

export const DEFAULT_PROGRESS: GameProgress = {
  unlockedLevel: 1,
  levelStars: {},
  totalCorrect: 0,
  totalAttempts: 0,
  bestStreak: 0,
};

function canUseStorage(): boolean {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function loadProgress(): GameProgress {
  if (!canUseStorage()) {
    return DEFAULT_PROGRESS;
  }

  return {
    ...DEFAULT_PROGRESS,
    ...safeParse<GameProgress>(
      window.localStorage.getItem(PROGRESS_KEY),
      DEFAULT_PROGRESS,
    ),
  };
}

export function saveProgress(progress: GameProgress): void {
  if (canUseStorage()) {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }
}

export function loadMistakes(): MistakeRecord[] {
  if (!canUseStorage()) {
    return [];
  }

  return safeParse<MistakeRecord[]>(
    window.localStorage.getItem(MISTAKES_KEY),
    [],
  );
}

export function saveMistakes(mistakes: MistakeRecord[]): void {
  if (canUseStorage()) {
    window.localStorage.setItem(MISTAKES_KEY, JSON.stringify(mistakes));
  }
}

export function loadGameStyleId(): GameStyleId {
  if (!canUseStorage()) {
    return DEFAULT_GAME_STYLE_ID;
  }

  const savedStyleId = window.localStorage.getItem(
    GAME_STYLE_KEY,
  ) as GameStyleId | null;
  if (savedStyleId && GAME_STYLES.some((style) => style.id === savedStyleId)) {
    return savedStyleId;
  }

  return DEFAULT_GAME_STYLE_ID;
}

export function saveGameStyleId(styleId: GameStyleId): void {
  if (canUseStorage()) {
    window.localStorage.setItem(GAME_STYLE_KEY, styleId);
  }
}

export function recordMistake(
  mistakes: MistakeRecord[],
  item: CharacterItem,
  wrongInput: string,
): MistakeRecord[] {
  const trimmedWrongInput = wrongInput.trim();
  const now = new Date().toISOString();
  const existing = mistakes.find((record) => record.charId === item.id);

  if (!existing) {
    return [
      {
        charId: item.id,
        char: item.char,
        pinyin: item.pinyin,
        pinyins: item.pinyins,
        answers: item.answers,
        source: item.source,
        audio: item.audio,
        wrongInputs: trimmedWrongInput ? [trimmedWrongInput] : [],
        mistakeCount: 1,
        correctReviewCount: 0,
        mastered: false,
        lastWrongAt: now,
      },
      ...mistakes,
    ];
  }

  const nextWrongInputs = trimmedWrongInput
    ? [
        trimmedWrongInput,
        ...existing.wrongInputs.filter((input) => input !== trimmedWrongInput),
      ].slice(0, 5)
    : existing.wrongInputs;

  return mistakes.map((record) =>
    record.charId === item.id
      ? {
          ...record,
          pinyin: item.pinyin,
          pinyins: item.pinyins,
          answers: item.answers,
          source: item.source,
          audio: item.audio,
          wrongInputs: nextWrongInputs,
          mistakeCount: record.mistakeCount + 1,
          correctReviewCount: 0,
          mastered: false,
          lastWrongAt: now,
        }
      : record,
  );
}

export function recordReviewCorrect(
  mistakes: MistakeRecord[],
  charId: number,
): MistakeRecord[] {
  return mistakes.map((record) => {
    if (record.charId !== charId) {
      return record;
    }

    const correctReviewCount = record.correctReviewCount + 1;
    return {
      ...record,
      correctReviewCount,
      mastered: correctReviewCount >= 2,
    };
  });
}

export function setMistakeMastered(
  mistakes: MistakeRecord[],
  charId: number,
  mastered: boolean,
): MistakeRecord[] {
  return mistakes.map((record) =>
    record.charId === charId
      ? {
          ...record,
          mastered,
          correctReviewCount: mastered
            ? Math.max(record.correctReviewCount, 2)
            : 0,
        }
      : record,
  );
}

export function removeMistake(
  mistakes: MistakeRecord[],
  charId: number,
): MistakeRecord[] {
  return mistakes.filter((record) => record.charId !== charId);
}

export function clearStorage(): void {
  if (canUseStorage()) {
    window.localStorage.removeItem(PROGRESS_KEY);
    window.localStorage.removeItem(MISTAKES_KEY);
    window.localStorage.removeItem(GAME_STYLE_KEY);
  }
}
