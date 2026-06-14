// ── 家族成員設定 ──────────────────────────────────────────────────────────────
export interface MemberConfig {
  id: string;          // 唯一識別（e.g. 'grandpa'）
  name: string;        // 顯示名稱（e.g. '爺爺'）
  emoji: string;       // 頭像 emoji
  color: string;       // 莫蘭迪色系主色
  notionDbId: string;  // 此成員的 Notion DB ID
}

// ── App 全域設定 ──────────────────────────────────────────────────────────────
export interface AppConfig {
  notionApiKey: string;
  members: MemberConfig[];
}

// ── 記憶條目（從 Notion 拉下後的標準化格式）─────────────────────────────────
export type EntryType = 'photo' | 'video' | 'text' | 'link' | 'place' | 'social';

export interface Entry {
  id: string;
  notionPageId: string;
  memberId: string;
  title: string;
  body: string;
  date: string;         // YYYY-MM-DD
  type: EntryType;
  tags: string[];
  coverUrl?: string;    // 封面圖 URL
  sourceUrl?: string;   // 原始連結（IG/FB/YouTube…）
  platform?: string;    // 社群平台名稱
  location?: string;    // 地點名稱
  bpmfTitle: string;    // 標題注音（後端預先計算，加速搜尋）
  bpmfBody: string;     // 內文注音
}

// ── Notion DB 頁面屬性（原始格式）────────────────────────────────────────────
export interface NotionPage {
  id: string;
  properties: Record<string, NotionProperty>;
  cover?: { type: string; external?: { url: string }; file?: { url: string } };
}

export type NotionProperty =
  | { type: 'title';        title: Array<{ plain_text: string }> }
  | { type: 'rich_text';    rich_text: Array<{ plain_text: string }> }
  | { type: 'select';       select: { name: string } | null }
  | { type: 'multi_select'; multi_select: Array<{ name: string }> }
  | { type: 'date';         date: { start: string } | null }
  | { type: 'url';          url: string | null }
  | { type: 'files';        files: Array<{ name: string; type: string; file?: { url: string }; external?: { url: string } }> }
  | { type: 'checkbox';     checkbox: boolean }
  | { type: 'number';       number: number | null };

// ── API 回傳格式 ──────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}
