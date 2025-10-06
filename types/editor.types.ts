// types/editor.types.ts

export type ContentType = 
  | 'summary' 
  | 'dedication' 
  | 'acknowledgments' 
  | 'prologue' 
  | 'epilogue' 
  | 'note'
  | 'preface';

export interface BookContent {
  id: string;
  book_id: string;
  content_type: ContentType;
  title?: string;
  content?: string;
  content_format: 'markdown' | 'html' | 'plaintext';
  position: number;
  created_at: string;
  updated_at: string;
}

export interface EditorState {
  currentContentId: string | null;
  currentContentType: 'chapter' | ContentType;
  hasUnsavedChanges: boolean;
  isSaving: boolean;
  lastSaved?: Date;
}

export interface FormattingAction {
  type: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'h1' | 'h2' | 'h3' | 'bullet' | 'number' | 'quote' | 'code';
  label: string;
  icon: string;
}

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  summary: 'Sumário',
  dedication: 'Dedicatória',
  acknowledgments: 'Agradecimentos',
  prologue: 'Prólogo',
  epilogue: 'Epílogo',
  note: 'Nota do Autor',
  preface: 'Prefácio',
};

export const FORMATTING_ACTIONS: FormattingAction[] = [
  { type: 'bold', label: 'Negrito', icon: 'bold' },
  { type: 'italic', label: 'Itálico', icon: 'italic' },
  { type: 'underline', label: 'Sublinhado', icon: 'underline' },
  { type: 'h1', label: 'Título 1', icon: 'textformat.size.larger' },
  { type: 'h2', label: 'Título 2', icon: 'textformat.size' },
  { type: 'h3', label: 'Título 3', icon: 'textformat' },
  { type: 'bullet', label: 'Lista', icon: 'list.bullet' },
  { type: 'quote', label: 'Citação', icon: 'quote.opening' },
];