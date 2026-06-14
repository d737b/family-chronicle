'use client';

import type { Entry, MemberConfig } from '@/lib/types';

const TYPE_ICONS: Record<string, string> = {
  photo: '📷', video: '🎬', text: '✏️', link: '🔗', place: '📍', social: '💬',
};
const TYPE_LABELS: Record<string, string> = {
  photo: '照片', video: '影片', text: '文字', link: '網頁', place: '地點', social: '社群',
};
const TYPE_BG: Record<string, string> = {
  photo: '#FFF0E8', video: '#E8EEF5', text: '#EAE8F0', link: '#F0E8ED', place: '#E8EDE7', social: '#E8F5E8',
};

interface Props {
  entry: Entry;
  member?: MemberConfig;
  scoreBadge?: { text: string; cls: string } | null;
  onClick: () => void;
}

export default function EntryCard({ entry: e, member, scoreBadge, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-[#FDFAF7] rounded-xl border border-[#3D3530]/10 overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 group"
    >
      {/* Thumbnail */}
      <div
        className="h-24 flex items-center justify-center text-3xl relative overflow-hidden"
        style={{ background: TYPE_BG[e.type] ?? '#F2EDE6' }}
      >
        {e.coverUrl
          ? <img src={e.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          : <span>{TYPE_ICONS[e.type] ?? '📝'}</span>
        }
        {/* Score badge */}
        {scoreBadge && (
          <span className={`absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded-full font-medium ${scoreBadge.cls}`}>
            {scoreBadge.text}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-2.5">
        <div className="text-[12px] font-semibold text-[#3D3530] leading-snug line-clamp-2 mb-1.5">
          {e.title || '（無標題）'}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {member && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: member.color }} />
              <span className="text-[9px] text-[#9B8F88]">{member.name}</span>
            </div>
          )}
          <span className="text-[9px] text-[#9B8F88]">·</span>
          <span className="text-[9px] text-[#9B8F88]">{TYPE_LABELS[e.type]}</span>
          {e.date && (
            <>
              <span className="text-[9px] text-[#9B8F88]">·</span>
              <span className="text-[9px] text-[#9B8F88]">{e.date.slice(0, 7)}</span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}
