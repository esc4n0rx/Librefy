const { z } = require('zod');

const registerSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  
  username: z.string()
    .min(3, 'Nome de usuário deve ter pelo menos 3 caracteres')
    .max(50, 'Nome de usuário deve ter no máximo 50 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Nome de usuário deve conter apenas letras, números e underscore'),
  
  email: z.string()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres'),
  
  password: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
  
  birth_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data de nascimento deve estar no formato YYYY-MM-DD')
    .transform(str => new Date(str))
});

const loginSchema = z.object({
  username: z.string().min(1, 'Nome de usuário é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória')
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido')
});

const resetPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
  code: z.string()
    .length(6, 'Código deve ter exatamente 6 dígitos')
    .regex(/^\d{6}$/, 'Código deve conter apenas números'),
  new_password: z.string()
    .min(6, 'Nova senha deve ter pelo menos 6 caracteres')
    .max(100, 'Nova senha deve ter no máximo 100 caracteres')
});

const updateProfileSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .optional(),
  
  avatar_url: z.string().url('URL do avatar inválida').optional(),
  
  bio: z.string()
    .max(500, 'Bio deve ter no máximo 500 caracteres')
    .optional()
});

const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Senha atual é obrigatória'),
  new_password: z.string()
    .min(6, 'Nova senha deve ter pelo menos 6 caracteres')
    .max(100, 'Nova senha deve ter no máximo 100 caracteres')
});

const changeEmailSchema = z.object({
  new_email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória para alterar email')
});

// Schemas de assinatura
const createCheckoutSessionSchema = z.object({
  plan: z.string()
    .min(1, 'Plano é obrigatório')
    .refine(value => ['premium'].includes(value), 'Plano deve ser: premium')
});

// Novos schemas para livros e capítulos
const createBookSchema = z.object({
  title: z.string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título deve ter no máximo 200 caracteres')
    .transform(val => val.trim()),
  
  description: z.string()
    .max(2000, 'Descrição deve ter no máximo 2000 caracteres')
    .transform(val => val?.trim())
    .optional(),
  
  tags: z.array(z.string())
    .max(10, 'Máximo 10 tags permitidas')
    .optional()
    .default([]),
  
  visibility: z.enum(['public', 'unlisted', 'private'])
    .default('public')
});

const updateBookSchema = z.object({
  title: z.string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título deve ter no máximo 200 caracteres')
    .transform(val => val.trim())
    .optional(),
  
  description: z.string()
    .max(2000, 'Descrição deve ter no máximo 2000 caracteres')
    .transform(val => val?.trim())
    .optional(),
  
  tags: z.array(z.string())
    .max(10, 'Máximo 10 tags permitidas')
    .optional(),
  
  visibility: z.enum(['public', 'unlisted', 'private'])
    .optional()
});

const createChapterSchema = z.object({
  title: z.string()
    .min(1, 'Título do capítulo é obrigatório')
    .max(200, 'Título do capítulo deve ter no máximo 200 caracteres')
    .transform(val => val.trim()),
  
  content_md: z.string()
    .min(1, 'Conteúdo do capítulo é obrigatório')
    .transform(val => val.trim()),
  
  chapter_number: z.number()
    .int()
    .min(1, 'Número do capítulo deve ser maior que 0')
    .optional()
});

const updateChapterSchema = z.object({
  title: z.string()
    .min(1, 'Título do capítulo é obrigatório')
    .max(200, 'Título do capítulo deve ter no máximo 200 caracteres')
    .transform(val => val.trim())
    .optional(),
  
  content_md: z.string()
    .min(1, 'Conteúdo do capítulo é obrigatório')
    .transform(val => val.trim())
    .optional(),
  
  chapter_number: z.number()
    .int()
    .min(1, 'Número do capítulo deve ser maior que 0')
    .optional()
});

const reorderChaptersSchema = z.object({
  newOrder: z.array(
    z.object({
      chapterId: z.string().uuid('ID do capítulo inválido'),
      newNumber: z.number().int().min(1, 'Número do capítulo deve ser maior que 0')
    })
  ).min(1, 'Lista de reordenação não pode estar vazia')
});

const searchBooksSchema = z.object({
  q: z.string()
    .min(1, 'Termo de busca é obrigatório')
    .max(100, 'Termo de busca deve ter no máximo 100 caracteres'),
  
  limit: z.string()
    .transform(val => parseInt(val))
    .refine(val => !isNaN(val) && val > 0 && val <= 50, 'Limite deve ser entre 1 e 50')
    .default('20'),
  
  offset: z.string()
    .transform(val => parseInt(val))
    .refine(val => !isNaN(val) && val >= 0, 'Offset deve ser maior ou igual a 0')
    .default('0')
});

const getPublishedBooksSchema = z.object({
  limit: z.string()
    .transform(val => parseInt(val))
    .refine(val => !isNaN(val) && val > 0 && val <= 50, 'Limite deve ser entre 1 e 50')
    .default('20'),
  
  offset: z.string()
    .transform(val => parseInt(val))
    .refine(val => !isNaN(val) && val >= 0, 'Offset deve ser maior ou igual a 0')
    .default('0'),
  
  orderBy: z.enum(['published_at', 'reads_count', 'likes_count', 'title'])
    .default('published_at')
});

const addToLibrarySchema = z.object({
  bookId: z.string()
    .uuid('Book ID deve ser um UUID válido')
});

const createOfflineLicenseSchema = z.object({
  deviceId: z.string()
    .min(1, 'Device ID é obrigatório')
    .max(100, 'Device ID deve ter no máximo 100 caracteres')
});

const renewOfflineLicenseSchema = z.object({
  deviceId: z.string()
    .min(1, 'Device ID é obrigatório')
    .max(100, 'Device ID deve ter no máximo 100 caracteres')
});

const libraryQuerySchema = z.object({
  limit: z.string()
    .transform(val => parseInt(val))
    .refine(val => !isNaN(val) && val > 0 && val <= 50, 'Limite deve ser entre 1 e 50')
    .default('20'),
  
  offset: z.string()
    .transform(val => parseInt(val))
    .refine(val => !isNaN(val) && val >= 0, 'Offset deve ser maior ou igual a 0')
    .default('0'),

  deviceId: z.string()
    .max(100, 'Device ID deve ter no máximo 100 caracteres')
    .optional()
});

const rateBookSchema = z.object({
  rating: z.number()
    .int('Rating deve ser um número inteiro')
    .min(1, 'Rating deve ser no mínimo 1')
    .max(5, 'Rating deve ser no máximo 5')
});

const createCommentSchema = z.object({
  content: z.string()
    .min(1, 'Conteúdo do comentário é obrigatório')
    .max(1000, 'Comentário deve ter no máximo 1000 caracteres')
    .transform(val => val.trim()),
  
  parent_comment_id: z.string()
    .uuid('Parent comment ID deve ser um UUID válido')
    .optional()
});

const updateCommentSchema = z.object({
  content: z.string()
    .min(1, 'Conteúdo do comentário é obrigatório')
    .max(1000, 'Comentário deve ter no máximo 1000 caracteres')
    .transform(val => val.trim())
});

const getCommentsSchema = z.object({
  limit: z.string()
    .transform(val => parseInt(val))
    .refine(val => !isNaN(val) && val > 0 && val <= 100, 'Limite deve ser entre 1 e 100')
    .default('50'),
  
  offset: z.string()
    .transform(val => parseInt(val))
    .refine(val => !isNaN(val) && val >= 0, 'Offset deve ser maior ou igual a 0')
    .default('0')
});

const getRatingsSchema = z.object({
  limit: z.string()
    .transform(val => parseInt(val))
    .refine(val => !isNaN(val) && val > 0 && val <= 50, 'Limite deve ser entre 1 e 50')
    .default('20'),
  
  offset: z.string()
    .transform(val => parseInt(val))
    .refine(val => !isNaN(val) && val >= 0, 'Offset deve ser maior ou igual a 0')
    .default('0')
});



module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
  changeEmailSchema,
  
  createCheckoutSessionSchema,
  
  createBookSchema,
  updateBookSchema,
  createChapterSchema,
  updateChapterSchema,
  reorderChaptersSchema,
  searchBooksSchema,
  getPublishedBooksSchema,

  addToLibrarySchema,
  createOfflineLicenseSchema,
  renewOfflineLicenseSchema,
  libraryQuerySchema,

  rateBookSchema,
  createCommentSchema,
  updateCommentSchema,
  getCommentsSchema,
  getRatingsSchema
};