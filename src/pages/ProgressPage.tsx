import { CHARACTERS, TOTAL_LEVELS, getLevelItems } from '../data/characters';
import type { GameProgress } from '../types';
import { renderStars } from '../utils/game';

interface ProgressPageProps {
  activeMistakesCount: number;
  progress: GameProgress;
  onBack: () => void;
  onOpenMistakes: () => void;
  onReset: () => void;
  onStartLevel: (level: number) => void;
}

export function ProgressPage({ activeMistakesCount, progress, onBack, onOpenMistakes, onReset, onStartLevel }: ProgressPageProps) {
  const completedLevels = Object.keys(progress.levelStars).length;
  const totalStars = Object.values(progress.levelStars).reduce((sum, stars) => sum + stars, 0);
  const totalPossibleStars = TOTAL_LEVELS * 3;
  const completedCharacters = completedLevels * 3;

  return (
    <main className="progress-page">
      <div className="page-topbar">
        <button className="ghost-button" onClick={onBack} type="button">
          ← 返回首页
        </button>
        <div>
          <p className="eyebrow">关卡地图</p>
          <h1>100 关学习进度</h1>
          <p>300 个常见汉字，每关 3 个字。已经解锁的关卡可以随时重玩。</p>
        </div>
      </div>

      <section className="stats-grid">
        <article className="stat-card">
          <span>已完成关卡</span>
          <strong>{completedLevels}</strong>
          <small>共 {TOTAL_LEVELS} 关</small>
        </article>
        <article className="stat-card">
          <span>已练汉字</span>
          <strong>{Math.min(completedCharacters, CHARACTERS.length)}</strong>
          <small>共 {CHARACTERS.length} 个</small>
        </article>
        <article className="stat-card">
          <span>星星</span>
          <strong>{totalStars}</strong>
          <small>最多 {totalPossibleStars} 颗</small>
        </article>
        <article className="stat-card">
          <span>待复习错题</span>
          <strong>{activeMistakesCount}</strong>
          <small>最好当天复习</small>
        </article>
      </section>

      <section className="panel progress-actions">
        <div>
          <h2>家长操作</h2>
          <p>可以从这里进入错题本，或者重置当前浏览器里的学习记录。</p>
        </div>
        <div className="panel-actions">
          <button className="secondary-button" onClick={onOpenMistakes} type="button">
            打开错题本
          </button>
          <button className="ghost-button danger" onClick={onReset} type="button">
            重置学习记录
          </button>
        </div>
      </section>

      <section className="level-grid" aria-label="全部关卡">
        {Array.from({ length: TOTAL_LEVELS }, (_, index) => {
          const level = index + 1;
          const locked = level > progress.unlockedLevel;
          const stars = progress.levelStars[String(level)] ?? 0;
          const chars = getLevelItems(level).map((item) => item.char).join(' ');

          return (
            <button
              className={`level-tile ${locked ? 'locked' : ''} ${stars > 0 ? 'completed' : ''}`}
              disabled={locked}
              key={level}
              onClick={() => onStartLevel(level)}
              title={locked ? '先完成前面的关卡' : chars}
              type="button"
            >
              <span>第 {level} 关</span>
              <strong>{locked ? '🔒' : chars}</strong>
              <small>{locked ? '未解锁' : renderStars(stars)}</small>
            </button>
          );
        })}
      </section>
    </main>
  );
}
