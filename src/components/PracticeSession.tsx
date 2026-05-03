import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useSpeech } from '../hooks/useSpeech';
import type { CharacterItem, PracticeStats } from '../types';
import { formatPinyin, getPinyinHint, isCorrectPinyin, normalizePinyin } from '../utils/pinyin';

interface PracticeSessionProps {
  title: string;
  subtitle: string;
  items: CharacterItem[];
  mode: 'level' | 'review';
  onCorrect: (item: CharacterItem) => void;
  onWrong: (item: CharacterItem, wrongInput: string) => void;
  onFinish: (stats: PracticeStats) => void;
  onExit: () => void;
}

type Feedback = {
  type: 'idle' | 'success' | 'error';
  text: string;
};

const DEFAULT_STATS: PracticeStats = {
  correct: 0,
  attempts: 0,
  wrongCharIds: [],
  bestStreak: 0,
};

export function PracticeSession({
  title,
  subtitle,
  items,
  mode,
  onCorrect,
  onWrong,
  onFinish,
  onExit,
}: PracticeSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<Feedback>({ type: 'idle', text: '听一听，再输入拼音。' });
  const [currentSolved, setCurrentSolved] = useState(false);
  const [wrongTimesForCurrent, setWrongTimesForCurrent] = useState(0);
  const [stats, setStats] = useState<PracticeStats>(DEFAULT_STATS);
  const [currentStreak, setCurrentStreak] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { cancel, speak, supported } = useSpeech();

  const item = items[currentIndex];
  const completionText = mode === 'level' ? '到站啦，查看星星' : '完成复习';

  const trainCars = useMemo(
    () =>
      items.map((car, index) => ({
        ...car,
        status: index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'locked',
      })),
    [currentIndex, items],
  );

  useEffect(() => {
    setCurrentIndex(0);
    setInput('');
    setFeedback({ type: 'idle', text: '听一听，再输入拼音。' });
    setCurrentSolved(false);
    setWrongTimesForCurrent(0);
    setStats(DEFAULT_STATS);
    setCurrentStreak(0);
  }, [items]);

  useEffect(() => {
    if (!item) {
      return;
    }

    setInput('');
    setFeedback({ type: 'idle', text: '听一听，再输入拼音。' });
    setCurrentSolved(false);
    setWrongTimesForCurrent(0);
    inputRef.current?.focus();
    void speak(item.char, 3);

    return () => cancel();
  }, [cancel, item, speak]);

  if (!item) {
    return (
      <section className="panel empty-state">
        <h2>还没有可以练习的汉字</h2>
        <button className="primary-button" onClick={onExit} type="button">
          返回
        </button>
      </section>
    );
  }

  const submitAnswer = (event: FormEvent) => {
    event.preventDefault();

    if (currentSolved) {
      return;
    }

    const rawInput = input.trim();
    if (!rawInput) {
      setFeedback({ type: 'error', text: '先输入拼音，再按回车。' });
      inputRef.current?.focus();
      return;
    }

    if (isCorrectPinyin(rawInput, item)) {
      const nextStreak = currentStreak + 1;
      const nextStats: PracticeStats = {
        ...stats,
        correct: stats.correct + 1,
        attempts: stats.attempts + 1,
        bestStreak: Math.max(stats.bestStreak, nextStreak),
      };

      setCurrentStreak(nextStreak);
      setStats(nextStats);
      setCurrentSolved(true);
      setFeedback({ type: 'success', text: `答对啦！${item.char} 的拼音是 ${formatPinyin(item)}。` });
      onCorrect(item);
      return;
    }

    const nextWrongTimes = wrongTimesForCurrent + 1;
    const nextWrongCharIds = stats.wrongCharIds.includes(item.id) ? stats.wrongCharIds : [...stats.wrongCharIds, item.id];
    const normalizedInput = normalizePinyin(rawInput);
    const learningHint = nextWrongTimes >= 2 ? `正确拼音：${formatPinyin(item)}。再输入一遍巩固一下。` : getPinyinHint(item);

    setWrongTimesForCurrent(nextWrongTimes);
    setCurrentStreak(0);
    setStats({
      ...stats,
      attempts: stats.attempts + 1,
      wrongCharIds: nextWrongCharIds,
    });
    setFeedback({ type: 'error', text: `“${normalizedInput || rawInput}” 还不对。${learningHint}` });
    onWrong(item, rawInput);
    inputRef.current?.focus();
  };

  const goNext = () => {
    if (!currentSolved) {
      return;
    }

    if (currentIndex >= items.length - 1) {
      onFinish(stats);
      return;
    }

    setCurrentIndex((value) => value + 1);
  };

  return (
    <section className="practice-page">
      <div className="page-topbar">
        <button className="ghost-button" onClick={onExit} type="button">
          ← 返回
        </button>
        <div>
          <p className="eyebrow">拼音小火车</p>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="train-track" aria-label="本关小火车">
        {trainCars.map((car, index) => (
          <div className={`train-car ${car.status}`} key={car.id}>
            <span className="train-car-index">{index + 1}</span>
            <strong>{car.char}</strong>
          </div>
        ))}
      </div>

      <div className="practice-card">
        <div className="character-stage">
          <span className="current-step">
            第 {currentIndex + 1} / {items.length} 个汉字
          </span>
          <div className="big-character" aria-label={`当前汉字 ${item.char}`}>
            {item.char}
          </div>
          <button className="listen-button" onClick={() => void speak(item.char, 3)} type="button">
            🔊 再听三遍
          </button>
          {!supported && <p className="tiny-note">当前浏览器不支持自动朗读，可以换用 Chrome、Edge 或 Safari。</p>}
        </div>

        <form className="answer-panel" onSubmit={submitAnswer}>
          <label htmlFor="pinyin-input">请输入这个汉字的拼音，不需要声调</label>
          <div className="input-row">
            <input
              autoComplete="off"
              disabled={currentSolved}
              id="pinyin-input"
              inputMode="text"
              onChange={(event) => setInput(event.target.value)}
              placeholder="例如：shan"
              ref={inputRef}
              type="text"
              value={input}
            />
            {!currentSolved ? (
              <button className="primary-button" type="submit">
                提交
              </button>
            ) : (
              <button className="primary-button" onClick={goNext} type="button">
                {currentIndex >= items.length - 1 ? completionText : '下一节车厢'}
              </button>
            )}
          </div>
          <p className={`feedback ${feedback.type}`}>{feedback.text}</p>
          <p className="tiny-note">小键盘提示：ü 可以输入成 v，例如 “lǜ” 可以打 “lv”。</p>
        </form>
      </div>
    </section>
  );
}
