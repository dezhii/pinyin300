export type Page = "home" | "game" | "mistakes" | "progress";

export type GameStyleId = "train" | "monster" | "garden" | "space";

export interface CharacterItem {
  id: number;
  char: string;
  pinyin: string;
  pinyins: string[];
  answers: string[];
  source: string;
  audio?: string;
}

export interface MistakeRecord {
  charId: number;
  char: string;
  pinyin: string;
  pinyins: string[];
  answers: string[];
  source: string;
  wrongInputs: string[];
  mistakeCount: number;
  correctReviewCount: number;
  mastered: boolean;
  lastWrongAt: string;
}

export interface GameProgress {
  unlockedLevel: number;
  levelStars: Record<string, number>;
  totalCorrect: number;
  totalAttempts: number;
  bestStreak: number;
}

export interface PracticeStats {
  correct: number;
  attempts: number;
  wrongCharIds: number[];
  bestStreak: number;
  stars?: number;
}
