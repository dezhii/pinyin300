import type { CharacterItem } from "../types";

const AUDIO_BASE_PATH = "/audio/hanzi";

const TONE_MARKS: Record<string, { plain: string; tone: number }> = {
  ā: { plain: "a", tone: 1 },
  á: { plain: "a", tone: 2 },
  ǎ: { plain: "a", tone: 3 },
  à: { plain: "a", tone: 4 },
  ē: { plain: "e", tone: 1 },
  é: { plain: "e", tone: 2 },
  ě: { plain: "e", tone: 3 },
  è: { plain: "e", tone: 4 },
  ī: { plain: "i", tone: 1 },
  í: { plain: "i", tone: 2 },
  ǐ: { plain: "i", tone: 3 },
  ì: { plain: "i", tone: 4 },
  ō: { plain: "o", tone: 1 },
  ó: { plain: "o", tone: 2 },
  ǒ: { plain: "o", tone: 3 },
  ò: { plain: "o", tone: 4 },
  ū: { plain: "u", tone: 1 },
  ú: { plain: "u", tone: 2 },
  ǔ: { plain: "u", tone: 3 },
  ù: { plain: "u", tone: 4 },
  ǖ: { plain: "v", tone: 1 },
  ǘ: { plain: "v", tone: 2 },
  ǚ: { plain: "v", tone: 3 },
  ǜ: { plain: "v", tone: 4 },
  ü: { plain: "v", tone: 5 },
};

export function toToneNumberPinyin(pinyin: string): string {
  let tone = 5;
  const plain = Array.from(pinyin.toLowerCase())
    .map((char) => {
      const toneMark = TONE_MARKS[char];
      if (!toneMark) {
        return char;
      }

      tone = toneMark.tone;
      return toneMark.plain;
    })
    .join("")
    .replace(/u:/g, "v")
    .replace(/[^a-zv]/g, "");

  return `${plain}${tone}`;
}

function buildAudioFileName(id: number, pinyin: string): string {
  return `${String(id).padStart(3, "0")}_${toToneNumberPinyin(pinyin)}.mp3`;
}

function buildAudioPath(id: number, pinyin: string): string {
  return `${AUDIO_BASE_PATH}/${buildAudioFileName(id, pinyin)}`;
}

const RAW_GRADE_1_UP = `
一:yī 二:èr 三:sān 十:shí 木:mù 禾:hé 上:shàng 下:xià 土:tǔ 个:gè
八:bā 入:rù 大:dà 天:tiān 人:rén 火:huǒ 文:wén 六:liù 七:qī 儿:ér 九:jiǔ 无:wú
口:kǒu 日:rì 中:zhōng 了:le|liǎo 子:zǐ 门:mén 月:yuè 不:bù 开:kāi 四:sì 五:wǔ
目:mù 耳:ěr 头:tóu 米:mǐ 见:jiàn 白:bái 田:tián 电:diàn 也:yě 长:cháng|zhǎng 山:shān 出:chū
飞:fēi 马:mǎ 鸟:niǎo 云:yún 公:gōng 车:chē 牛:niú 羊:yáng 小:xiǎo 少:shǎo|shào
巾:jīn 牙:yá 尺:chǐ 毛:máo 卜:bǔ|bo 又:yòu 心:xīn 风:fēng 力:lì 手:shǒu 水:shuǐ
广:guǎng 升:shēng 足:zú 走:zǒu 方:fāng 半:bàn 巴:bā 业:yè 本:běn 平:píng 书:shū
自:zì 已:yǐ 东:dōng 西:xī 回:huí 片:piàn 皮:pí 生:shēng 里:lǐ 果:guǒ 几:jǐ 用:yòng 鱼:yú
今:jīn 正:zhèng|zhēng 雨:yǔ 两:liǎng 瓜:guā 衣:yī 来:lái 年:nián 左:zuǒ 右:yòu
`;

const RAW_GRADE_1_DOWN_FIRST_200 = `
万:wàn 丁:dīng 冬:dōng 百:bǎi 齐:qí 说:shuō 话:huà 朋:péng 友:yǒu 春:chūn 高:gāo
你:nǐ 们:men 红:hóng 绿:lǜ 花:huā 草:cǎo 爷:yé 节:jié 岁:suì 亲:qīn 的:de|dí|dì 行:xíng|háng|héng
古:gǔ 声:shēng 多:duō 处:chù|chǔ 知:zhī 忙:máng 洗:xǐ 认:rèn 扫:sǎo 真:zhēn 父:fù 母:mǔ
爸:bà 全:quán 关:guān 写:xiě 完:wán 家:jiā 看:kàn 着:zhe|zháo|zhuó|zhāo 画:huà 笑:xiào 兴:xìng|xīng 会:huì
妈:mā 奶:nǎi 午:wǔ 合:hé 放:fàng 收:shōu 女:nǚ 太:tài 气:qì 早:zǎo 去:qù 亮:liàng
和:hé|hè|huó|huò|hú 语:yǔ 千:qiān 李:lǐ 秀:xiù 香:xiāng 听:tīng 唱:chàng 连:lián 远:yuǎn 定:dìng 向:xiàng
以:yǐ 后:hòu 更:gèng|gēng 主:zhǔ 意:yì 总:zǒng 先:xiān 干:gān|gàn 赶:gǎn 起:qǐ 明:míng 净:jìng
同:tóng 工:gōng 专:zhuān 才:cái 级:jí 队:duì 蚂:mǎ 蚁:yǐ 前:qián 空:kōng|kòng 房:fáng 网:wǎng
诗:shī 林:lín 童:tóng 黄:huáng 闭:bì 立:lì 是:shì 朵:duǒ 美:měi 我:wǒ 叶:yè 机:jī
她:tā 他:tā 送:sòng 过:guò 时:shí 让:ràng 吗:ma 吧:ba 虫:chóng 往:wǎng 得:dé|de|děi 很:hěn
河:hé 姐:jiě 借:jiè 呢:ne|ní 呀:ya 哪:nǎ|na|něi 谁:shuí|shéi 怕:pà 跟:gēn 凉:liáng 量:liàng|liáng 最:zuì
园:yuán 因:yīn 为:wèi|wéi 脸:liǎn 阳:yáng 光:guāng 可:kě 石:shí 办:bàn 法:fǎ 找:zhǎo 许:xǔ
别:bié 到:dào 那:nà 都:dōu|dū 吓:xià|hè 叫:jiào 再:zài 象:xiàng 像:xiàng 做:zuò 点:diǎn 照:zhào
沙:shā 海:hǎi 桥:qiáo 竹:zhú 军:jūn 苗:miáo 井:jǐng 乡:xiāng 面:miàn 忘:wàng 想:xiǎng 念:niàn
王:wáng 从:cóng 边:biān 这:zhè|zhèi 进:jìn 道:dào 贝:bèi 原:yuán 男:nán 爱:ài 虾:xiā 跑:pǎo
吹:chuī 地:dì|de 快:kuài 乐:lè|yuè 老:lǎo 师:shī 短:duǎn 对:duì 冷:lěng 淡:dàn 热:rè 情:qíng
拉:lā 把:bǎ 给:gěi|jǐ 活:huó 种:zhòng|zhǒng 吃:chī 练:liàn 习:xí 苦:kǔ
`;

function parseRawEntries(
  raw: string,
  source: string,
  startId: number,
): CharacterItem[] {
  return raw
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token, index) => {
      const separatorIndex = token.indexOf(":");
      const char = token.slice(0, separatorIndex);
      const pinyinSpec = token.slice(separatorIndex + 1);
      const pinyins = pinyinSpec.split("|").filter(Boolean);

      return {
        id: startId + index,
        char,
        pinyin: pinyins[0],
        pinyins,
        answers: pinyins,
        source,
        audio: buildAudioPath(startId + index, pinyins[0]),
      };
    });
}

const grade1Up = parseRawEntries(RAW_GRADE_1_UP, "一年级上册常见字", 1);
const grade1Down = parseRawEntries(
  RAW_GRADE_1_DOWN_FIRST_200,
  "一年级下册常见字节选",
  grade1Up.length + 1,
);

export const CHARACTERS: CharacterItem[] = [...grade1Up, ...grade1Down];

if (CHARACTERS.length !== 300) {
  throw new Error(`拼音数据应为 300 个汉字，当前为 ${CHARACTERS.length} 个。`);
}

export const LEVEL_SIZE = 3;
export const TOTAL_LEVELS = Math.ceil(CHARACTERS.length / LEVEL_SIZE);

export function getLevelItems(level: number): CharacterItem[] {
  const start = (level - 1) * LEVEL_SIZE;
  return CHARACTERS.slice(start, start + LEVEL_SIZE);
}

export function findCharacterById(id: number): CharacterItem | undefined {
  return CHARACTERS.find((item) => item.id === id);
}
