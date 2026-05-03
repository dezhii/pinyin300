import { useEffect, useMemo, useState } from "react";
import { PracticeSession } from "../components/PracticeSession";
import { getLevelItems, TOTAL_LEVELS } from "../data/characters";
import type { GameStyle } from "../data/gameStyles";
import type { CharacterItem, PracticeStats } from "../types";
import { calculateStars, renderStars } from "../utils/game";
import { formatPinyin } from "../utils/pinyin";

interface GamePageProps {
  level: number;
  gameStyle: GameStyle;
  onBack: () => void;
  onComplete: (level: number, stats: PracticeStats) => void;
  onStartLevel: (level: number) => void;
  onWrong: (item: CharacterItem, wrongInput: string) => void;
}

export function GamePage({
  level,
  gameStyle,
  onBack,
  onComplete,
  onStartLevel,
  onWrong,
}: GamePageProps) {
  const items = useMemo(() => getLevelItems(level), [level]);
  const [result, setResult] = useState<PracticeStats | null>(null);

  useEffect(() => {
    setResult(null);
  }, [level]);

  const finishLevel = (stats: PracticeStats) => {
    const stars = calculateStars(stats);
    const finishedStats = { ...stats, stars };
    setResult(finishedStats);
    onComplete(level, finishedStats);
  };

  if (result) {
    const isLastLevel = level >= TOTAL_LEVELS;

    return (
      <section className={`result-page panel ${gameStyle.themeClass}`}>
        <p className="eyebrow">第 {level} 关完成</p>
        <h1>
          {result.wrongCharIds.length === 0
            ? gameStyle.resultPerfectTitle
            : gameStyle.resultGoodTitle}
        </h1>
        <div className="result-stars" aria-label={`${result.stars ?? 0} 颗星`}>
          {renderStars(result.stars ?? 0)}
        </div>
        <p>
          本关答对 {result.correct} 个汉字，尝试 {result.attempts}{" "}
          次，最好连续答对 {result.bestStreak} 个。
        </p>

        <div className="level-summary">
          {items.map((item) => (
            <div className="summary-character" key={item.id}>
              <strong>{item.char}</strong>
              <span>{formatPinyin(item)}</span>
            </div>
          ))}
        </div>

        {result.wrongCharIds.length > 0 && (
          <p className="warm-note">
            答错的汉字已经放进错题本，可以稍后集中复习。
          </p>
        )}

        <div className="result-actions">
          <button
            className="secondary-button"
            onClick={() => onStartLevel(level)}
            type="button"
          >
            再玩一次
          </button>
          {!isLastLevel && (
            <button
              className="primary-button"
              onClick={() => onStartLevel(level + 1)}
              type="button"
            >
              {gameStyle.icon} 下一关
            </button>
          )}
          <button className="ghost-button" onClick={onBack} type="button">
            回首页
          </button>
        </div>
      </section>
    );
  }

  return (
    <PracticeSession
      items={items}
      mode="level"
      gameStyle={gameStyle}
      onCorrect={() => undefined}
      onExit={onBack}
      onFinish={finishLevel}
      onWrong={onWrong}
      subtitle={`每关 3 个字，现在是第 ${level} / ${TOTAL_LEVELS} 关。`}
      title={`${gameStyle.shortName} · 第 ${level} 关`}
    />
  );
}
