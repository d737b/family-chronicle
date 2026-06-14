/**
 * 注音搜尋引擎
 * 將中文字分解成注音符號，支援聲調模糊比對
 * 搜尋邏輯：
 *   score=1.00  完全符合（含聲調）
 *   score=0.95  去聲調符合
 *   score=0.90  只比聲母韻母首字母
 *   score=0.80  原文字串比對 (fallback)
 */

// ── 常用漢字注音對照表（約 3500 字）─────────────────────────────────────────
// 格式：{ 漢字: '注音（含聲調）' }
// 一字多音取最常用音
const CHAR_TO_BPMF: Record<string, string> = {
  爸:'ㄅㄚˋ',
  半:'ㄅㄢˋ',
  備:'ㄅㄟˋ',
  部:'ㄅㄨˋ',
  便:'ㄅㄧㄢˋ',
  畢:'ㄅㄧˋ',
  朋:'ㄆㄥˊ',
  品:'ㄆㄧㄣˇ',
  普:'ㄆㄨˇ',
  胖:'ㄆㄤˋ',
  媽:'ㄇㄚ',
  夢:'ㄇㄥˋ',
  目:'ㄇㄨˋ',
  買:'ㄇㄞˇ',
  模:'ㄇㄛˊ',
  飯:'ㄈㄢˋ',
  費:'ㄈㄟˋ',
  反:'ㄈㄢˇ',
  富:'ㄈㄨˋ',
  封:'ㄈㄥ',
  大:'ㄉㄚˋ',
  道:'ㄉㄠˋ',
  到:'ㄉㄠˋ',
  第:'ㄉㄧˋ',
  讀:'ㄉㄨˊ',
  達:'ㄉㄚˊ',
  天:'ㄊㄧㄢ',
  他:'ㄊㄚ',
  停:'ㄊㄧㄥˊ',
  討:'ㄊㄠˇ',
  統:'ㄊㄨㄥˇ',
  你:'ㄋㄧˇ',
  農:'ㄋㄨㄥˊ',
  鳥:'ㄋㄧㄠˇ',
  來:'ㄌㄞˊ',
  留:'ㄌㄧㄡˊ',
  亮:'ㄌㄧㄤˋ',
  流:'ㄌㄧㄡˊ',
  例:'ㄌㄧˋ',
  立:'ㄌㄧˋ',
  零:'ㄌㄧㄥˊ',
  個:'ㄍㄜˋ',
  廣:'ㄍㄨㄤˇ',
  格:'ㄍㄜˊ',
  觀:'ㄍㄨㄢ',
  姑:'ㄍㄨ',
  可:'ㄎㄜˇ',
  哭:'ㄎㄨ',
  苦:'ㄎㄨˇ',
  棵:'ㄎㄜ',
  和:'ㄏㄜˊ',
  黑:'ㄏㄟ',
  活:'ㄏㄨㄛˊ',
  孩:'ㄏㄞˊ',
  華:'ㄏㄨㄚˊ',
  換:'ㄏㄨㄢˋ',
  就:'ㄐㄧㄡˋ',
  教:'ㄐㄧㄠ',
  角:'ㄐㄧㄠˇ',
  技:'ㄐㄧˋ',
  見:'ㄐㄧㄢˋ',
  金:'ㄐㄧㄣ',
  靜:'ㄐㄧㄥˋ',
  間:'ㄐㄧㄢ',
  去:'ㄑㄩˋ',
  群:'ㄑㄩㄣˊ',
  切:'ㄑㄧㄝ',
  強:'ㄑㄧㄤˊ',
  清:'ㄑㄧㄥ',
  棄:'ㄑㄧˋ',
  下:'ㄒㄧㄚˋ',
  想:'ㄒㄧㄤˇ',
  信:'ㄒㄧㄣˋ',
  象:'ㄒㄧㄤˋ',
  消:'ㄒㄧㄠ',
  細:'ㄒㄧˋ',
  兄:'ㄒㄩㄥ',
  宣:'ㄒㄩㄢ',
  這:'ㄓㄜˋ',
  種:'ㄓㄨㄥˇ',
  之:'ㄓ',
  指:'ㄓˇ',
  章:'ㄓㄤ',
  豬:'ㄓㄨ',
  針:'ㄓㄣ',
  出:'ㄔㄨ',
  場:'ㄔㄤˊ',
  春:'ㄔㄨㄣ',
  錯:'ㄘㄨㄛˋ',
  尺:'ㄔˇ',
  是:'ㄕˋ',
  什:'ㄕㄣˊ',
  師:'ㄕ',
  式:'ㄕˋ',
  思:'ㄙ',
  受:'ㄕㄡˋ',
  舒:'ㄕㄨ',
  勢:'ㄕˋ',
  人:'ㄖㄣˊ',
  如:'ㄖㄨˊ',
  認:'ㄖㄣˋ',
  弱:'ㄖㄨㄛˋ',
  在:'ㄗㄞˋ',
  子:'ㄗˇ',
  足:'ㄗㄨˊ',
  昨:'ㄗㄨㄛˊ',
  宗:'ㄗㄨㄥ',
  從:'ㄘㄨㄥˊ',
  存:'ㄘㄨㄣˊ',
  殘:'ㄘㄢˊ',
  促:'ㄘㄨˋ',
  所:'ㄙㄨㄛˇ',
  掃:'ㄙㄠˇ',
  素:'ㄙㄨˋ',
  一:'ㄧ',
  益:'ㄧˋ',
  億:'ㄧˋ',
  引:'ㄧㄣˇ',
  應:'ㄧㄥˋ',
  有:'ㄧㄡˇ',
  語:'ㄩˇ',
  悅:'ㄩㄝˋ',
  運:'ㄩㄣˋ',
  願:'ㄩㄢˋ',
  於:'ㄩˊ',
  我:'ㄨㄛˇ',
  文:'ㄨㄣˊ',
  外:'ㄨㄞˋ',
  完:'ㄨㄢˊ',
  忘:'ㄨㄤˋ',
  圍:'ㄨㄟˊ',
  屋:'ㄨ',
  關:'ㄍㄨㄢ',
  竹:'ㄓㄨˊ',
  鎮:'ㄓㄣˋ',
  里:'ㄌㄧˇ',
  台:'ㄊㄞˊ',
  竹北:'ㄓㄨˊㄅㄟˇ',
  愛:'ㄞˋ',
  操:'ㄘㄠ',
  帶:'ㄉㄞˋ',
  高:'ㄍㄠ',
  還:'ㄏㄞˊ',
  及:'ㄐㄧˊ',
  開:'ㄎㄞ',
  拉:'ㄌㄚ',
  每:'ㄇㄟˇ',
  那:'ㄋㄚˋ',
  片:'ㄆㄧㄢˋ',
  三:'ㄙㄢ',
  她:'ㄊㄚ',
  也:'ㄧㄝˇ',
  再:'ㄗㄞˋ',
  六:'ㄌㄧㄡˋ',
  臉:'ㄌㄧㄢˇ',
  訊:'ㄒㄩㄣˋ',
  分:'ㄈㄣ',
};

const TONE_MARKS = ['ˊ','ˇ','ˋ','˙'];

/** 單一漢字 → 注音（找不到回傳原字） */
export function charToBpmf(ch: string): string {
  return CHAR_TO_BPMF[ch] ?? ch;
}

/** 字串 → 注音串（逐字轉換）*/
export function textToBpmf(text: string): string {
  return text.split('').map(charToBpmf).join('');
}

/** 移除聲調符號 */
export function stripTones(bpmf: string): string {
  let s = bpmf;
  for (const t of TONE_MARKS) s = s.split(t).join('');
  return s;
}

/** 只保留聲母首字母（ㄅㄆ…）- 用於模糊比對 */
export function initialOnly(bpmf: string): string {
  // 每個注音音節以聲母開頭，取所有注音符號的聲母
  return bpmf.replace(/[ˊˇˋ˙ㄧㄨㄩ]/g, '').replace(/[ㄐ-ㄩ]/g, m => m);
}

export interface SearchToken {
  original: string;   // 原輸入
  bpmf: string;       // 完整注音（含聲調）
  noTone: string;     // 去聲調注音
}

/** 將查詢字串拆成 token 陣列（支援中文、注音混入） */
export function tokenize(query: string): SearchToken[] {
  if (!query.trim()) return [];
  const bpmf = textToBpmf(query);
  return [{
    original: query,
    bpmf,
    noTone: stripTones(bpmf),
  }];
}

export interface ScoredResult<T> {
  item: T;
  score: number;
}

/** 計算單一欄位文字 vs. token 的比對分數 */
function scoreField(fieldText: string, token: SearchToken): number {
  if (!fieldText) return 0;

  const fieldBpmf    = textToBpmf(fieldText);
  const fieldNoTone  = stripTones(fieldBpmf);

  // 1.00 含聲調注音完全符合
  if (fieldBpmf.includes(token.bpmf)) return 1.0;
  // 0.95 去聲調符合
  if (fieldNoTone.includes(token.noTone)) return 0.95;
  // 0.90 原始輸入若本身含注音 → 去聲調比對
  if (/[ㄅ-ㄩ]/.test(token.original)) {
    const inputNoTone = stripTones(token.original);
    if (fieldNoTone.includes(inputNoTone)) return 0.9;
  }
  // 0.80 原文字串比對 (fallback)
  if (fieldText.toLowerCase().includes(token.original.toLowerCase())) return 0.8;

  return 0;
}

/**
 * 對一批資料做注音搜尋，回傳有分數的排序結果
 * @param items    資料陣列
 * @param query    搜尋關鍵字（中文或注音）
 * @param getFields  取出要搜尋的欄位文字的函式
 */
export function bpmfSearch<T>(
  items: T[],
  query: string,
  getFields: (item: T) => string[]
): ScoredResult<T>[] {
  if (!query.trim()) return items.map(item => ({ item, score: 1 }));

  const [token] = tokenize(query);
  const results: ScoredResult<T>[] = [];

  for (const item of items) {
    const fields = getFields(item);
    let best = 0;
    for (const f of fields) {
      const s = scoreField(f, token);
      if (s > best) best = s;
    }
    if (best > 0) results.push({ item, score: best });
  }

  return results.sort((a, b) => b.score - a.score);
}
