import type { GameStyleId } from '../types';

export interface GameStyle {
  id: GameStyleId;
  name: string;
  shortName: string;
  icon: string;
  heroTitle: string;
  heroSubtitle: string;
  progressTitle: string;
  cardLabel: string;
  currentLabel: string;
  doneLabel: string;
  lockedLabel: string;
  nextButtonText: string;
  finishButtonText: string;
  successText: string;
  resultPerfectTitle: string;
  resultGoodTitle: string;
  reviewTitle: string;
  themeClass: string;
}

export const GAME_STYLES: GameStyle[] = [
  {
    id: 'train',
    name: '拼音小火车',
    shortName: '小火车',
    icon: '🚂',
    heroTitle: '拼音小火车',
    heroSubtitle: '每答对一个汉字，小火车就前进一节车厢。',
    progressTitle: '本关小火车',
    cardLabel: '车厢',
    currentLabel: '当前车厢',
    doneLabel: '已到站',
    lockedLabel: '待出发',
    nextButtonText: '下一节车厢',
    finishButtonText: '到站啦，查看星星',
    successText: '小火车前进啦！',
    resultPerfectTitle: '满星到站！',
    resultGoodTitle: '到站啦，继续加油！',
    reviewTitle: '错题复习小火车',
    themeClass: 'theme-train',
  },
  {
    id: 'monster',
    name: '拼音打怪兽',
    shortName: '打怪兽',
    icon: '🦖',
    heroTitle: '拼音打怪兽',
    heroSubtitle: '每拼对一个汉字，就用拼音能量击退一只小怪兽。',
    progressTitle: '怪兽挑战',
    cardLabel: '怪兽',
    currentLabel: '正在挑战',
    doneLabel: '已击退',
    lockedLabel: '等你挑战',
    nextButtonText: '挑战下一只',
    finishButtonText: '怪兽退散，查看奖励',
    successText: '拼音能量命中！',
    resultPerfectTitle: '怪兽全退散！',
    resultGoodTitle: '成功守住拼音城！',
    reviewTitle: '错题怪兽挑战',
    themeClass: 'theme-monster',
  },
  {
    id: 'garden',
    name: '拼音花园',
    shortName: '花园',
    icon: '🌻',
    heroTitle: '拼音花园',
    heroSubtitle: '每答对一个汉字，就让花园里开出一朵拼音花。',
    progressTitle: '花园小苗',
    cardLabel: '小花',
    currentLabel: '正在浇水',
    doneLabel: '已经开花',
    lockedLabel: '等待发芽',
    nextButtonText: '浇下一朵花',
    finishButtonText: '花园开满啦，查看奖励',
    successText: '拼音花开啦！',
    resultPerfectTitle: '花园全开花！',
    resultGoodTitle: '花园又漂亮了！',
    reviewTitle: '错题小苗复习',
    themeClass: 'theme-garden',
  },
  {
    id: 'space',
    name: '拼音星球',
    shortName: '星球',
    icon: '🚀',
    heroTitle: '拼音星球',
    heroSubtitle: '每拼对一个汉字，飞船就收集一颗拼音能量星。',
    progressTitle: '星球探险',
    cardLabel: '星星',
    currentLabel: '正在探索',
    doneLabel: '已收集',
    lockedLabel: '等待点亮',
    nextButtonText: '飞向下一颗星',
    finishButtonText: '星球点亮啦，查看奖励',
    successText: '能量星收集成功！',
    resultPerfectTitle: '星球全部点亮！',
    resultGoodTitle: '飞船顺利返航！',
    reviewTitle: '错题星球复习',
    themeClass: 'theme-space',
  },
];

export const DEFAULT_GAME_STYLE_ID: GameStyleId = 'train';

export function getGameStyle(styleId: GameStyleId): GameStyle {
  return GAME_STYLES.find((style) => style.id === styleId) ?? GAME_STYLES[0];
}
