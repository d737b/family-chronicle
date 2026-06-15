'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Settings, Search, X, RefreshCw, AlertCircle } from 'lucide-react';
import type { Entry, AppConfig, MemberConfig } from '@/lib/types';
import { loadConfig, isConfigured } from '@/lib/config';
import { bpmfSearch } from '@/lib/bopomofo';
import EntryCard from './EntryCard';
import EntryDetail from './EntryDetail';
import SettingsPanel from './SettingsPanel';

export default function AppClient() {
  const [config, setConfig]             = useState<AppConfig | null>(null);
  const [entries, setEntries]           = useState<Entry[]>([]);
  const [loading, setLoading]           = useState(false);
  const [fetchError, setFetchError]     = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  const [activeMember, setActiveMember] = useState<string>('all');
  const [query, setQuery]               = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const cfg = loadConfig();
    setConfig(cfg);
    if (!isConfigured(cfg)) setShowSettings(true);
  }, []);

  const fetchEntries = useCallback(async (cfg: AppConfig) => {
    if (!isConfigured(cfg)) return;
    setLoading(true);
    setFetchError('');
    try {
      const res = await fetch('/api/notion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: cfg.notionApiKey,
          members: cfg.members.map(m => ({ id: m.id, notionDbId: m.notionDbId })),
        }),
      });
      const json = await res.json() as { ok: boolean; data?: Entry[]; error?: string };
      if (json.ok && json.data) {
        setEntries(json.data);
      } else {
        setFetchError(json.error ?? '未知錯誤');
      }
    } catch (e) {
      setFetchError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const handleConfigSave = useCallback((newConfig: AppConfig) => {
    setConfig(newConfig);
    setShowSettings(false);
    fetchEntries(newConfig);
  }, [fetchEntries]);

  const filtered = (() => {
    let pool = entries;
    if (activeMember !== 'all') pool = pool.filter(e => e.memberId === activeMember);
    if (!query.trim()) return pool.map(item => ({ item, score: 1 }));
    return bpmfSearch(pool, query, e => [e.title, e.body, e.location ?? '']);
  })();

  const memberList: MemberConfig[] = config?.members ?? [];

  const scoreLabel = (s: number) => {
    if (s >= 1.0)  return { text: '完全符合', cls: 'bg-[#9BA89A]/20 text-[#6B7C6A]' };
    if (s >= 0.95) return { text: '去聲調',   cls: 'bg-[#C4A89B]/20 text-[#8B6B5A]' };
    if (s >= 0.90) return { text: '聲母韻母', cls: 'bg-[#8E9BAB]/20 text-[#5A6B7A]' };
    return             { text: '原文',      cls: 'bg-[#B5A99A]/20 text-[#7A6B5E]' };
  };

  if (!config) return (
    <div className="flex items-center justify-center min-h-screen bg-[#F2EDE6]">
      <div className="text-[#9B8F88] text-sm">載入中…</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F2EDE6] font-sans">

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#FFF9F5]/95 backdrop-blur border-b border-[#3D3530]/10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-[9px] flex items-center justify-center text-base flex-shrink-0"
               style={{ background: 'linear-gradient(135deg,#C4A89B,#B5A99A)' }}>
            🌸
          </div>
          <div className="flex-shrink-0">
            <div className="text-[13px] font-bold text-[#3D3530] leading-tight">家族記憶</div>
            <div className="text-[9px] text-[#9B8F88] tracking-widest">FAMILY CHRONICLE</div>
          </div>

          <div className="flex-1 relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8F88]" />
            <input
              ref={searchRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="搜尋… 或輸入注音 ㄉㄚˋㄧㄝˋ"
              className="w-full pl-8 pr-8 py-2 rounded-full text-[13px] bg-[#E8EDE7] border border-transparent focus:bg-white focus:border-[#9BA89A] outline-none transition-all text-[#3D3530] placeholder:text-[#9B8F88]"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B8F88] hover:text-[#3D3530]">
                <X size={12} />
              </button>
            )}
          </div>

          <button onClick={() => config && fetchEntries(config)} disabled={loading}
            className="flex-shrink-0 p-2 rounded-full hover:bg-[#E8EDE7] text-[#9B8F88] transition-colors disabled:opacity-40">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          <button onClick={() => setShowSettings(true)}
            className="flex-shrink-0 p-2 rounded-full hover:bg-[#E8EDE7] text-[#9B8F88] transition-colors">
            <Settings size={15} />
          </button>
        </div>
      </header>

      {/* MEMBER BAR */}
      <div className="bg-[#FFF9F5] border-b border-[#3D3530]/10">
        <div className="max-w-3xl mx-auto px-4 pt-3 pb-1 flex gap-3 overflow-x-auto scrollbar-hide">
          <button onClick={() => setActiveMember('all')} className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all
              ${activeMember === 'all' ? 'border-[#7A6B5E] shadow-sm bg-[#F2EDE6]' : 'border-transparent bg-[#E8EDE7]'}`}>
              👨‍👩‍👧‍👦
            </div>
            <span className={`text-[9px] font-medium ${activeMember === 'all' ? 'text-[#3D3530] font-bold' : 'text-[#9B8F88]'}`}>所有人</span>
          </button>
          {memberList.filter(m => m.notionDbId).map(m => (
            <button key={m.id} onClick={() => setActiveMember(m.id)} className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all"
                   style={{
                     backgroundColor: activeMember === m.id ? m.color + '33' : '#E8EDE7',
                     borderColor: activeMember === m.id ? m.color : 'transparent',
                   }}>
                {m.emoji}
              </div>
              <span className={`text-[9px] font-medium ${activeMember === m.id ? 'text-[#3D3530] font-bold' : 'text-[#9B8F88]'}`}>
                {m.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <main className="max-w-3xl mx-auto px-4 pt-4 pb-20">
        {fetchError && (
          <div className="mb-4 p-3 rounded-xl bg-[#FDE8E8] border border-[#E88]/40 flex gap-2 items-start text-[12px] text-[#C44]">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <span>{fetchError}</span>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] text-[#9B8F88] tracking-widest uppercase">
            {query ? `搜尋「${query}」` : (activeMember !== 'all' ? memberList.find(m => m.id === activeMember)?.name : '所有記憶')}
            {' · '}{filtered.length} 筆
          </span>
          {query && filtered.length > 0 && (
            <span className="text-[10px] text-[#9B8F88]">依注音相關度排序</span>
          )}
        </div>

        {!isConfigured(config) && (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">🌸</div>
            <div className="text-[14px] font-medium text-[#6B5F58] mb-2">尚未設定 Notion 連線</div>
            <div className="text-[12px] text-[#9B8F88] mb-6">請點右上角設定，填入 API Key 與成員 DB ID</div>
            <button onClick={() => setShowSettings(true)}
              className="px-5 py-2.5 rounded-full bg-[#C4A89B] text-white text-[13px] font-semibold hover:opacity-90 transition-opacity">
              開始設定
            </button>
          </div>
        )}

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl bg-white border border-[#3D3530]/10 overflow-hidden animate-pulse">
                <div className="h-24 bg-[#E8EDE7]" />
                <div className="p-3"><div className="h-3 bg-[#E8EDE7] rounded mb-2 w-3/4" /><div className="h-2 bg-[#E8EDE7] rounded w-1/2" /></div>
              </div>
            ))}
          </div>
        )}

        {!loading && isConfigured(config) && (
          filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-3xl mb-3">🌿</div>
              <div className="text-[13px] font-medium text-[#6B5F58] mb-1">找不到相關記憶</div>
              <div className="text-[11px] text-[#9B8F88]">試試其他關鍵字，或輸入注音 ㄅㄆㄇㄈ</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filtered.map(({ item: e, score }) => {
                const member = memberList.find(m => m.id === e.memberId);
                const badge = query ? scoreLabel(score) : null;
                return (
                  <EntryCard key={e.id} entry={e} member={member} scoreBadge={badge} onClick={() => setSelectedEntry(e)} />
                );
              })}
            </div>
          )
        )}
      </main>

      {selectedEntry && (
        <EntryDetail entry={selectedEntry} member={memberList.find(m => m.id === selectedEntry.memberId)} onClose={() => setSelectedEntry(null)} />
      )}

      {showSettings && (
        <SettingsPanel config={config} onSave={handleConfigSave} onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
