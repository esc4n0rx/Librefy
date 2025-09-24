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

// Novos schemas para assinatura
const createCheckoutSessionSchema = z.object({
  plan: z.string()
    .min(1, 'Plano é obrigatório')
    .refine(value => ['premium'].includes(value), 'Plano deve ser: premium')
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
  changeEmailSchema,
  createCheckoutSessionSchema
};