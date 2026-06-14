import type { AppConfig, MemberConfig } from './types';

const CONFIG_KEY = 'fc_config';

export const DEFAULT_MEMBERS: MemberConfig[] = [
  { id: 'grandpa', name: '爺爺', emoji: '👴', color: '#9BA89A', notionDbId: '' },
  { id: 'grandma', name: '奶奶', emoji: '👵', color: '#C4A89B', notionDbId: '' },
  { id: 'dad',     name: '爸爸', emoji: '👨', color: '#8E9BAB', notionDbId: '' },
  { id: 'mom',     name: '媽媽', emoji: '👩', color: '#B5A99A', notionDbId: '' },
  { id: 'me',      name: '我',   emoji: '🙋', color: '#A89BAB', notionDbId: '' },
  { id: 'sister',  name: '姐姐', emoji: '👧', color: '#ABB59A', notionDbId: '' },
];

export const DEFAULT_CONFIG: AppConfig = {
  notionApiKey: '',
  members: DEFAULT_MEMBERS,
};

export function loadConfig(): AppConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return structuredClone(DEFAULT_CONFIG);
    const parsed = JSON.parse(raw) as Partial<AppConfig>;
    return {
      notionApiKey: parsed.notionApiKey ?? '',
      members: parsed.members ?? structuredClone(DEFAULT_MEMBERS),
    };
  } catch {
    return structuredClone(DEFAULT_CONFIG);
  }
}

export function saveConfig(config: AppConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function isConfigured(config: AppConfig): boolean {
  return (
    !!config.notionApiKey &&
    config.members.some(m => !!m.notionDbId)
  );
}
