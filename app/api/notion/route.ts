import { NextRequest, NextResponse } from 'next/server';
import { textToBpmf } from '@/lib/bopomofo';
import type { Entry, NotionPage, NotionProperty } from '@/lib/types';

export const runtime = 'edge';

function getProp(props: Record<string, NotionProperty>, key: string): NotionProperty | undefined {
  return props[key];
}
function getText(prop: NotionProperty | undefined): string {
  if (!prop) return '';
  if (prop.type === 'title')     return prop.title.map(t => t.plain_text).join('');
  if (prop.type === 'rich_text') return prop.rich_text.map(t => t.plain_text).join('');
  if (prop.type === 'url')       return prop.url ?? '';
  return '';
}
function getDate(prop: NotionProperty | undefined): string {
  if (!prop || prop.type !== 'date') return '';
  return prop.date?.start ?? '';
}
function getCoverUrl(page: NotionPage): string {
  const cover = page.cover;
  if (!cover) return '';
  if (cover.type === 'external') return cover.external?.url ?? '';
  if (cover.type === 'file')     return cover.file?.url ?? '';
  return '';
}

function pageToEntry(page: NotionPage, memberId: string): Entry {
  const p = page.properties;
  const title    = getText(getProp(p, '標題') ?? getProp(p, 'Name') ?? getProp(p, 'title'));
  const body     = getText(getProp(p, '內容') ?? getProp(p, '描述') ?? getProp(p, 'Description'));
  const date     = getDate(getProp(p, '日期') ?? getProp(p, 'Date'));
  const sourceUrl = getText(getProp(p, '連結') ?? getProp(p, 'URL') ?? getProp(p, 'Link'));
  const location  = getText(getProp(p, '地點') ?? getProp(p, 'Location'));
  const coverUrl  = getCoverUrl(page);
  const lastEdited = page.last_edited_time ?? '';

  return {
    id: page.id,
    notionPageId: page.id,
    memberId,
    title,
    body,
    date,
    lastEdited,
    coverUrl,
    sourceUrl,
    location,
    bpmfTitle: textToBpmf(title),
    bpmfBody:  textToBpmf(body + ' ' + location),
  };
}

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
      sorts: [{ timestamp: 'last_edited_time', direction: 'descending' }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Notion API error (${res.status}): ${err}`);
  }

  const json = await res.json() as { results: NotionPage[] };
  return json.results.map(page => pageToEntry(page, memberId));
}

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

    // 預設依 last_edited_time 排序
    entries.sort((a, b) => b.lastEdited.localeCompare(a.lastEdited));

    return NextResponse.json({ ok: true, data: entries, errors });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
