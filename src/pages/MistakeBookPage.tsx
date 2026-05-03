import { useMemo, useState } from 'react';
import { PracticeSession } from '../components/PracticeSession';
import type { CharacterItem, MistakeRecord, PracticeStats } from '../types';
import { renderStars } from '../utils/game';
import { formatPinyin } from '../utils/pinyin';
import { useSpeech } from '../hooks/useSpeech';

interface MistakeBookPageProps {
  mistakes: MistakeRecord[];
  onBack: () => void;
  onClear: () => void;
  onRemove: (charId: number) => void;
  onReviewCorrect: (charId: number) => void;
  onSetMastered: (charId: number, mastered: boolean) => void;
  onWrong: (item: CharacterItem, wrongInput: string) => void;
}

function recordToItem(record: MistakeRecord): CharacterItem {
  return {
    id: record.charId,
    char: record.char,
    pinyin: record.pinyin,
    pinyins: record.pinyins,
    answers: record.answers,
    source: record.source,
  };
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '未知时间';
  }

  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function MistakeBookPage({
  mistakes,
  onBack,
  onClear,
  onRemove,
  onReviewCorrect,
  onSetMastered,
  onWrong,
}: MistakeBookPageProps) {
  const { speak } = useSpeech();
  const [reviewItems, setReviewItems] = useState<CharacterItem[] | null>(null);
  const [reviewResult, setReviewResult] = useState<PracticeStats | null>(null);

  const activeMistakes = useMemo(
    () =>
      mistakes
        .filter((record) => !record.mastered)
        .sort((a, b) => b.mistakeCount - a.mistakeCount || Date.parse(b.lastWrongAt) - Date.parse(a.lastWrongAt)),
    [mistakes],
  );
  const masteredMistakes = useMemo(() => mistakes.filter((record) => record.mastered), [mistakes]);

  const startReview = () => {
    const nextItems = activeMistakes.slice(0, 3).map(recordToItem);
    setReviewItems(nextItems);
    setReviewResult(null);
  };

  if (reviewItems && !reviewResult) {
    return (
      <PracticeSession
        items={reviewItems}
        mode="review"
        onCorrect={(item) => onReviewCorrect(item.id)}
        onExit={() => setReviewItems(null)}
        onFinish={setReviewResult}
        onWrong={onWrong}
        subtitle="优先复习最近、错得多的汉字。连续复习答对 2 次后，会自动标记为已掌握。"
        title="错题复习"
      />
    );
  }

  if (reviewResult) {
    return (
      <section className="result-page panel">
        <p className="eyebrow">错题复习完成</p>
        <h1>{reviewResult.wrongCharIds.length === 0 ? '复习得真棒！' : '又进步了一点！'}</h1>
        <div className="result-stars">{renderStars(reviewResult.wrongCharIds.length === 0 ? 3 : 2)}</div>
        <p>
          本次复习答对 {reviewResult.correct} 个，尝试 {reviewResult.attempts} 次，最好连续答对 {reviewResult.bestStreak} 个。
        </p>
        <div className="result-actions">
          <button className="primary-button" disabled={activeMistakes.length === 0} onClick={startReview} type="button">
            继续复习
          </button>
          <button
            className="secondary-button"
            onClick={() => {
              setReviewItems(null);
              setReviewResult(null);
            }}
            type="button"
          >
            回错题本
          </button>
        </div>
      </section>
    );
  }

  return (
    <main className="mistake-page">
      <div className="page-topbar">
        <button className="ghost-button" onClick={onBack} type="button">
          ← 返回首页
        </button>
        <div>
          <p className="eyebrow">错题本</p>
          <h1>需要复习的拼音</h1>
          <p>错题会保存在当前浏览器里，方便孩子反复练习。</p>
        </div>
      </div>

      <section className="panel mistake-summary-panel">
        <div>
          <h2>今日复习建议</h2>
          <p>
            还有 <strong>{activeMistakes.length}</strong> 个汉字需要巩固，已掌握 <strong>{masteredMistakes.length}</strong> 个。
          </p>
        </div>
        <div className="panel-actions">
          <button className="primary-button" disabled={activeMistakes.length === 0} onClick={startReview} type="button">
            🚂 复习 3 个错题
          </button>
          <button className="ghost-button danger" disabled={mistakes.length === 0} onClick={onClear} type="button">
            清空错题本
          </button>
        </div>
      </section>

      {mistakes.length === 0 ? (
        <section className="panel empty-state">
          <h2>还没有错题</h2>
          <p>开始闯关后，输错的拼音会自动出现在这里。</p>
        </section>
      ) : (
        <section className="mistake-list" aria-label="错题列表">
          {[...activeMistakes, ...masteredMistakes].map((record) => (
            <article className={`mistake-card ${record.mastered ? 'mastered' : ''}`} key={record.charId}>
              <div className="mistake-character">{record.char}</div>
              <div className="mistake-content">
                <div className="mistake-title-row">
                  <h2>{formatPinyin(record)}</h2>
                  <span className={`status-pill ${record.mastered ? 'done' : 'todo'}`}>{record.mastered ? '已掌握' : '待复习'}</span>
                </div>
                <p>错误次数：{record.mistakeCount} 次 · 最近错误：{formatDate(record.lastWrongAt)}</p>
                {record.wrongInputs.length > 0 && <p>曾输入：{record.wrongInputs.join('、')}</p>}
                <p className="tiny-note">来源：{record.source}</p>
              </div>
              <div className="mistake-actions">
                <button className="secondary-button small" onClick={() => void speak(record.char, 3)} type="button">
                  听三遍
                </button>
                <button className="ghost-button small" onClick={() => onSetMastered(record.charId, !record.mastered)} type="button">
                  {record.mastered ? '重新复习' : '标记掌握'}
                </button>
                <button className="ghost-button small danger" onClick={() => onRemove(record.charId)} type="button">
                  删除
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
