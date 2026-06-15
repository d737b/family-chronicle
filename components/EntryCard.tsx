'use client';

import type { Entry, MemberConfig } from '@/lib/types';

function fmtDate(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
}
function fmtEdited(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')} 更新`;
}

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
      className="text-left bg-[#FDFAF7] rounded-xl border border-[#3D3530]/10 overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all duration-150"
    >
      {/* Thumbnail */}
      <div className="h-24 flex items-center justify-center text-3xl relative overflow-hidden bg-[#F2EDE6]">
        {e.coverUrl
          ? <img src={e.coverUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
          : <span className="text-[#B5A99A] text-2xl">📝</span>
        }
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
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            {member && (
              <>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: member.color }} />
                <span className="text-[9px] text-[#9B8F88]">{member.name}</span>
                {e.date && <span className="text-[9px] text-[#9B8F88]">· {fmtDate(e.date)}</span>}
              </>
            )}
          </div>
          {e.lastEdited && (
            <span className="text-[9px] text-[#B5A99A]">{fmtEdited(e.lastEdited)}</span>
          )}
        </div>
      </div>
    </button>
  );
}
