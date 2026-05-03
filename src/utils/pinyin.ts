import type { CharacterItem, MistakeRecord } from '../types';

const TONE_MARKS: Record<string, string> = {
  ā: 'a',
  á: 'a',
  ǎ: 'a',
  à: 'a',
  ē: 'e',
  é: 'e',
  ě: 'e',
  è: 'e',
  ī: 'i',
  í: 'i',
  ǐ: 'i',
  ì: 'i',
  ō: 'o',
  ó: 'o',
  ǒ: 'o',
  ò: 'o',
  ū: 'u',
  ú: 'u',
  ǔ: 'u',
  ù: 'u',
  ǖ: 'v',
  ǘ: 'v',
  ǚ: 'v',
  ǜ: 'v',
  ü: 'v',
  ń: 'n',
  ň: 'n',
  ǹ: 'n',
  ḿ: 'm',
};

export function normalizePinyin(value: string): string {
  const lowered = value.trim().toLowerCase().normalize('NFC');
  const withoutToneMarks = Array.from(lowered)
    .map((char) => TONE_MARKS[char] ?? char)
    .join('');

  return withoutToneMarks
    .replace(/u:/g, 'v')
    .replace(/[1-5]/g, '')
    .replace(/[\s'’`·.-]/g, '')
    .replace(/[^a-zv]/g, '');
}

function expandAnswer(answer: string): string[] {
  const normalized = normalizePinyin(answer);
  if (!normalized) {
    return [];
  }

  const answers = new Set([normalized]);

  // 儿童键盘上很难输入 ü。默认接受 lv / lü / lu 三种友好写法。
  if (normalized.includes('v')) {
    answers.add(normalized.replace(/v/g, 'u'));
  }

  return Array.from(answers);
}

export function getAcceptedAnswers(item: Pick<CharacterItem, 'answers' | 'pinyins'>): string[] {
  const rawAnswers = item.answers.length > 0 ? item.answers : item.pinyins;
  return Array.from(new Set(rawAnswers.flatMap(expandAnswer)));
}

export function isCorrectPinyin(input: string, item: Pick<CharacterItem, 'answers' | 'pinyins'>): boolean {
  const normalizedInput = normalizePinyin(input);
  return getAcceptedAnswers(item).includes(normalizedInput);
}

export function formatPinyin(item: Pick<CharacterItem, 'pinyins'> | Pick<MistakeRecord, 'pinyins'>): string {
  return item.pinyins.join(' / ');
}

export function getPinyinHint(item: CharacterItem): string {
  const answer = normalizePinyin(item.pinyin);
  if (!answer) {
    return '认真听读音，再试一次。';
  }

  return `小提示：这个拼音以 “${answer[0]}” 开头。`;
}
