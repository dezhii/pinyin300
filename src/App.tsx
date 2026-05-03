import { useEffect, useMemo, useState } from 'react';
import { TOTAL_LEVELS } from './data/characters';
import { GamePage } from './pages/GamePage';
import { HomePage } from './pages/HomePage';
import { MistakeBookPage } from './pages/MistakeBookPage';
import { ProgressPage } from './pages/ProgressPage';
import type { CharacterItem, GameProgress, MistakeRecord, Page, PracticeStats } from './types';
import {
  DEFAULT_PROGRESS,
  clearStorage,
  loadMistakes,
  loadProgress,
  recordMistake,
  recordReviewCorrect,
  removeMistake,
  saveMistakes,
  saveProgress,
  setMistakeMastered,
} from './utils/storage';
import './styles.css';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [progress, setProgress] = useState<GameProgress>(() => loadProgress());
  const [mistakes, setMistakes] = useState<MistakeRecord[]>(() => loadMistakes());

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    saveMistakes(mistakes);
  }, [mistakes]);

  const activeMistakesCount = useMemo(() => mistakes.filter((record) => !record.mastered).length, [mistakes]);
  const masteredMistakesCount = useMemo(() => mistakes.filter((record) => record.mastered).length, [mistakes]);

  const startLevel = (level: number) => {
    const safeLevel = Math.min(Math.max(level, 1), TOTAL_LEVELS);
    setCurrentLevel(safeLevel);
    setPage('game');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const completeLevel = (level: number, stats: PracticeStats) => {
    const stars = stats.stars ?? 1;

    setProgress((previous) => {
      const levelKey = String(level);
      const nextUnlockedLevel = level >= TOTAL_LEVELS ? TOTAL_LEVELS : Math.max(previous.unlockedLevel, level + 1);

      return {
        ...previous,
        unlockedLevel: nextUnlockedLevel,
        levelStars: {
          ...previous.levelStars,
          [levelKey]: Math.max(previous.levelStars[levelKey] ?? 0, stars),
        },
        totalCorrect: previous.totalCorrect + stats.correct,
        totalAttempts: previous.totalAttempts + stats.attempts,
        bestStreak: Math.max(previous.bestStreak, stats.bestStreak),
      };
    });
  };

  const handleWrongAnswer = (item: CharacterItem, wrongInput: string) => {
    setMistakes((previous) => recordMistake(previous, item, wrongInput));
  };

  const resetAll = () => {
    const shouldReset = window.confirm('确定要清空学习进度和错题本吗？这个操作不能撤销。');
    if (!shouldReset) {
      return;
    }

    clearStorage();
    setProgress(DEFAULT_PROGRESS);
    setMistakes([]);
    setCurrentLevel(1);
    setPage('home');
  };

  const clearMistakeBook = () => {
    const shouldClear = window.confirm('确定要清空错题本吗？学习进度会保留。');
    if (!shouldClear) {
      return;
    }

    setMistakes([]);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <button className="brand-button" onClick={() => setPage('home')} type="button">
          <span>🚂</span>
          拼音小火车
        </button>
        <nav aria-label="主导航">
          <button className={page === 'home' ? 'nav-active' : ''} onClick={() => setPage('home')} type="button">
            首页
          </button>
          <button className={page === 'progress' ? 'nav-active' : ''} onClick={() => setPage('progress')} type="button">
            关卡
          </button>
          <button className={page === 'mistakes' ? 'nav-active' : ''} onClick={() => setPage('mistakes')} type="button">
            错题本
            {activeMistakesCount > 0 && <span className="nav-badge">{activeMistakesCount}</span>}
          </button>
        </nav>
      </header>

      {page === 'home' && (
        <HomePage
          activeMistakesCount={activeMistakesCount}
          masteredMistakesCount={masteredMistakesCount}
          onOpenMistakes={() => setPage('mistakes')}
          onOpenProgress={() => setPage('progress')}
          onStart={() => startLevel(progress.unlockedLevel)}
          progress={progress}
        />
      )}

      {page === 'game' && (
        <GamePage
          level={currentLevel}
          onBack={() => setPage('home')}
          onComplete={completeLevel}
          onStartLevel={startLevel}
          onWrong={handleWrongAnswer}
        />
      )}

      {page === 'mistakes' && (
        <MistakeBookPage
          mistakes={mistakes}
          onBack={() => setPage('home')}
          onClear={clearMistakeBook}
          onRemove={(charId) => setMistakes((previous) => removeMistake(previous, charId))}
          onReviewCorrect={(charId) => setMistakes((previous) => recordReviewCorrect(previous, charId))}
          onSetMastered={(charId, mastered) => setMistakes((previous) => setMistakeMastered(previous, charId, mastered))}
          onWrong={handleWrongAnswer}
        />
      )}

      {page === 'progress' && (
        <ProgressPage
          activeMistakesCount={activeMistakesCount}
          onBack={() => setPage('home')}
          onOpenMistakes={() => setPage('mistakes')}
          onReset={resetAll}
          onStartLevel={startLevel}
          progress={progress}
        />
      )}

      <footer className="app-footer">
        <span>默认模式：不要求声调，只输入普通拼音。</span>
        <span>数据保存在当前浏览器本地。</span>
      </footer>
    </div>
  );
}
