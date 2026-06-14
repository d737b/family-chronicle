import { NextRequest, NextResponse } from 'next/server';
import { textToBpmf } from '@/lib/bopomofo';
import type { Entry, NotionPage, NotionProperty, EntryType } from '@/lib/types';

export const runtime = 'edge';

// ── 從 Notion 屬性取純文字 ───────────────────────────────────────────────────
function getProp(props: Record<string, NotionProperty>, key: string): NotionProperty | undefined {
  return props[key];
}
function getText(prop: NotionProperty | undefined): string {
  if (!prop) return '';
  if (prop.type === 'title')     return prop.title.map(t => t.plain_text).join('');
  if (prop.type === 'rich_text') return prop.rich_text.map(t => t.plain_text).join('');
  if (prop.type === 'url')       return prop.url ?? '';
  if (prop.type === 'select')    return prop.select?.name ?? '';
  return '';
}
function getDate(prop: NotionProperty | undefined): string {
  if (!prop || prop.type !== 'date') return '';
  return prop.date?.start ?? '';
}
function getTags(prop: NotionProperty | undefined): string[] {
  if (!prop || prop.type !== 'multi_select') return [];
  return prop.multi_select.map(s => s.name);
}
function getCoverUrl(page: NotionPage): string {
  const cover = page.cover;
  if (!cover) return '';
  if (cover.type === 'external') return cover.external?.url ?? '';
  if (cover.type === 'file')     return cover.file?.url ?? '';
  return '';
}

// ── 將 Notion 頁面轉成 Entry ──────────────────────────────────────────────────
function pageToEntry(page: NotionPage, memberId: string): Entry {
  const p = page.properties;
  const title    = getText(getProp(p, '標題') ?? getProp(p, 'Name') ?? getProp(p, 'title'));
  const body     = getText(getProp(p, '內容') ?? getProp(p, '描述') ?? getProp(p, 'Description'));
  const date     = getDate(getProp(p, '日期') ?? getProp(p, 'Date'));
  const rawType  = getText(getProp(p, '類型') ?? getProp(p, 'Type') ?? getProp(p, '分類'));
  const tags     = getTags(getProp(p, '標籤') ?? getProp(p, 'Tags'));
  const sourceUrl = getText(getProp(p, '連結') ?? getProp(p, 'URL') ?? getProp(p, 'Link'));
  const platform  = getText(getProp(p, '平台') ?? getProp(p, 'Platform'));
  const location  = getText(getProp(p, '地點') ?? getProp(p, 'Location'));
  const coverUrl  = getCoverUrl(page);

  const typeMap: Record<string, EntryType> = {
    照片: 'photo', photo: 'photo',
    影片: 'video', video: 'video',
    文字: 'text',  text: 'text',
    網頁: 'link',  link: 'link', url: 'link',
    地點: 'place', place: 'place',
    社群: 'social', social: 'social',
    facebook: 'social', ig: 'social', line: 'social', youtube: 'video',
  };
  const type: EntryType = typeMap[rawType.toLowerCase()] ?? 'text';

  return {
    id: page.id,
    notionPageId: page.id,
    memberId,
    title,
    body,
    date,
    type,
    tags,
    coverUrl,
    sourceUrl,
    platform,
    location,
    bpmfTitle: textToBpmf(title),
    bpmfBody:  textToBpmf(body + ' ' + tags.join(' ') + ' ' + location),
  };
}

// ── 從單一 Notion DB 拉資料 ───────────────────────────────────────────────────
async function fetchFromDb(
  apiKey: string,
  dbId: string,
  memberId: string,
  limit = 100
): Promise<Entry[]> {
  const url = `https://api.notion.com/v1/databases/${dbId}/query`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      page_size: limit,
      sorts: [{ property: '日期', direction: 'descending' }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Notion API error (${res.status}): ${err}`);
  }

  const json = await res.json() as { results: NotionPage[] };
  return json.results.map(page => pageToEntry(page, memberId));
}

// ── Route Handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      apiKey: string;
      members: Array<{ id: string; notionDbId: string }>;
    };

    const { apiKey, members } = body;
    if (!apiKey) return NextResponse.json({ ok: false, error: 'Missing API key' }, { status: 400 });

    const configured = members.filter(m => !!m.notionDbId);
    if (!configured.length) return NextResponse.json({ ok: false, error: 'No DB configured' }, { status: 400 });

    // 並行拉取所有成員的 DB
    const results = await Promise.allSettled(
      configured.map(m => fetchFromDb(apiKey, m.notionDbId, m.id))
    );

    const entries: Entry[] = [];
    const errors: string[] = [];

    results.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        entries.push(...r.value);
      } else {
        errors.push(`${configured[i].id}: ${r.reason}`);
      }
    });

    return NextResponse.json({ ok: true, data: entries, errors });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
