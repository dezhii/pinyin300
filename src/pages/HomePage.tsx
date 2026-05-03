import { TOTAL_LEVELS } from '../data/characters';
import type { GameProgress } from '../types';

interface HomePageProps {
  progress: GameProgress;
  activeMistakesCount: number;
  masteredMistakesCount: number;
  onOpenMistakes: () => void;
  onOpenProgress: () => void;
  onStart: () => void;
}

export function HomePage({
  progress,
  activeMistakesCount,
  masteredMistakesCount,
  onOpenMistakes,
  onOpenProgress,
  onStart,
}: HomePageProps) {
  const completedLevels = Object.keys(progress.levelStars).length;
  const totalStars = Object.values(progress.levelStars).reduce((sum, stars) => sum + stars, 0);
  const completionPercent = Math.round((completedLevels / TOTAL_LEVELS) * 100);
  const accuracy = progress.totalAttempts === 0 ? 0 : Math.round((progress.totalCorrect / progress.totalAttempts) * 100);

  return (
    <main className="home-page">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">小学常见 300 字</p>
          <h1>拼音小火车</h1>
          <p className="hero-description">每关 3 个汉字，先听三遍读音，再输入拼音。答错会自动进入错题本，方便反复复习。</p>
          <div className="hero-actions">
            <button className="primary-button large" onClick={onStart} type="button">
              🚂 继续闯第 {progress.unlockedLevel} 关
            </button>
            <button className="secondary-button large" onClick={onOpenMistakes} type="button">
              📒 错题本 {activeMistakesCount > 0 ? `(${activeMistakesCount})` : ''}
            </button>
          </div>
        </div>
        <div className="train-illustration" aria-hidden="true">
          <span className="smoke smoke-one">☁️</span>
          <span className="smoke smoke-two">☁️</span>
          <div className="engine">🚂</div>
          <div className="rail">━━━ ✦ ━━━</div>
        </div>
      </section>

      <section className="stats-grid" aria-label="学习概览">
        <article className="stat-card">
          <span>学习进度</span>
          <strong>{completionPercent}%</strong>
          <small>
            已完成 {completedLevels} / {TOTAL_LEVELS} 关
          </small>
        </article>
        <article className="stat-card">
          <span>星星奖励</span>
          <strong>{totalStars}</strong>
          <small>每关最多 3 颗星</small>
        </article>
        <article className="stat-card">
          <span>正确率</span>
          <strong>{accuracy}%</strong>
          <small>累计答题 {progress.totalAttempts} 次</small>
        </article>
        <article className="stat-card">
          <span>错题复习</span>
          <strong>{activeMistakesCount}</strong>
          <small>已掌握 {masteredMistakesCount} 个</small>
        </article>
      </section>

      <section className="feature-grid">
        <article className="feature-card">
          <span className="feature-icon">👂</span>
          <h2>先听后拼</h2>
          <p>每个汉字出现时自动朗读 3 次，帮助孩子把字形、读音和拼音联系起来。</p>
        </article>
        <article className="feature-card">
          <span className="feature-icon">⭐</span>
          <h2>闯关奖励</h2>
          <p>3 个字就是一关，答得越准星星越多，学习过程更有成就感。</p>
        </article>
        <article className="feature-card">
          <span className="feature-icon">📒</span>
          <h2>错题本</h2>
          <p>输错的拼音会自动保存，之后可以集中复习，连续答对后标记为已掌握。</p>
        </article>
      </section>

      <section className="quick-actions panel">
        <div>
          <p className="eyebrow">家长入口</p>
          <h2>查看全部 100 关</h2>
          <p>可以查看每关星级、学习进度，也可以重玩已经解锁的关卡。</p>
        </div>
        <button className="secondary-button" onClick={onOpenProgress} type="button">
          打开关卡地图
        </button>
      </section>
    </main>
  );
}
