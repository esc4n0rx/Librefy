// types/reader.types.ts

export type ReadingTheme = 'light' | 'dark' | 'sepia';

export interface ReaderSettings {
  fontSize: number; // 14-24
  lineHeight: number; // 1.5-2.5
  theme: ReadingTheme;
  fontFamily: 'system' | 'serif';
}

export interface ReadingProgress {
  id: string;
  user_id: string;
  book_id: string;
  chapter_id: string;
  scroll_position: number; // 0-100
  last_read_at: string;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  fontSize: 16,
  lineHeight: 1.8,
  theme: 'light',
  fontFamily: 'system',
};

export const FONT_SIZE_OPTIONS = [
  { value: 14, label: 'Pequeno' },
  { value: 16, label: 'Normal' },
  { value: 18, label: 'Grande' },
  { value: 20, label: 'Muito Grande' },
  { value: 24, label: 'Extra Grande' },
];

export const LINE_HEIGHT_OPTIONS = [
  { value: 1.5, label: 'Compacto' },
  { value: 1.8, label: 'Normal' },
  { value: 2.0, label: 'Confortável' },
  { value: 2.5, label: 'Espaçoso' },
];

export const THEME_OPTIONS: { value: ReadingTheme; label: string; colors: { bg: string; text: string } }[] = [
  { value: 'light', label: 'Claro', colors: { bg: '#FFFFFF', text: '#000000' } },
  { value: 'dark', label: 'Escuro', colors: { bg: '#1a1a1a', text: '#E5E5E5' } },
  { value: 'sepia', label: 'Sépia', colors: { bg: '#F4ECD8', text: '#5C4B37' } },
];