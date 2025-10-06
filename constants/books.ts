// constants/books.ts

export const AGE_RATINGS = [
    { value: 'livre', label: 'Livre' },
    { value: '10', label: '+10' },
    { value: '12', label: '+12' },
    { value: '14', label: '+14' },
    { value: '16', label: '+16' },
    { value: '18', label: '+18' },
  ] as const;
  
  export const BOOK_STATUS_LABELS = {
    draft: 'Rascunho',
    published: 'Publicado',
    archived: 'Arquivado',
  } as const;
  
  export const MAX_CATEGORIES_PER_BOOK = 3;
  export const MAX_TAGS_PER_BOOK = 10;
  export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  
  export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];