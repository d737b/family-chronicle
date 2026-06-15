export interface MemberConfig {
  id: string;
  name: string;
  emoji: string;
  color: string;
  notionDbId: string;
}

export interface AppConfig {
  notionApiKey: string;
  members: MemberConfig[];
}

export interface Entry {
  id: string;
  notionPageId: string;
  memberId: string;
  title: string;
  body: string;
  date: string;        // 日期欄位 YYYY-MM-DD
  lastEdited: string;  // last_edited_time ISO string
  coverUrl?: string;
  sourceUrl?: string;
  location?: string;
  bpmfTitle: string;
  bpmfBody: string;
}

export interface NotionPage {
  id: string;
  last_edited_time: string;
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

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}
