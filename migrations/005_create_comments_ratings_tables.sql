-- Execute este SQL no Supabase Dashboard > SQL Editor

-- Tabela de avaliações (ratings)
CREATE TABLE IF NOT EXISTS book_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Um usuário só pode avaliar um livro uma vez
    UNIQUE(user_id, book_id)
);

-- Tabela de comentários
CREATE TABLE IF NOT EXISTS book_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES book_comments(id) ON DELETE CASCADE, -- Para replies/threads
    content TEXT NOT NULL CHECK (length(trim(content)) > 0),
    is_deleted BOOLEAN DEFAULT false, -- Soft delete para moderação
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Quem deletou (autor do livro ou próprio usuário)
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Validações
    CONSTRAINT content_not_empty CHECK (length(trim(content)) > 0),
    CONSTRAINT content_max_length CHECK (length(content) <= 1000)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_book_ratings_book_id ON book_ratings(book_id);
CREATE INDEX IF NOT EXISTS idx_book_ratings_user_id ON book_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_book_ratings_rating ON book_ratings(book_id, rating);

CREATE INDEX IF NOT EXISTS idx_book_comments_book_id ON book_comments(book_id);
CREATE INDEX IF NOT EXISTS idx_book_comments_user_id ON book_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_book_comments_parent_id ON book_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_book_comments_created_at ON book_comments(book_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_book_comments_not_deleted ON book_comments(book_id, is_deleted, created_at DESC);

-- Triggers para updated_at
CREATE TRIGGER update_book_ratings_updated_at 
    BEFORE UPDATE ON book_ratings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_book_comments_updated_at 
    BEFORE UPDATE ON book_comments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar estatísticas de rating do livro
CREATE OR REPLACE FUNCTION update_book_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalcular média e contagem de ratings
    UPDATE books SET
        average_rating = (
            SELECT ROUND(AVG(rating)::numeric, 2)
            FROM book_ratings 
            WHERE book_id = COALESCE(NEW.book_id, OLD.book_id)
        ),
        ratings_count = (
            SELECT COUNT(*)
            FROM book_ratings 
            WHERE book_id = COALESCE(NEW.book_id, OLD.book_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.book_id, OLD.book_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar contador de comentários
CREATE OR REPLACE FUNCTION update_book_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalcular contagem de comentários (apenas não deletados)
    UPDATE books SET
        comments_count = (
            SELECT COUNT(*)
            FROM book_comments 
            WHERE book_id = COALESCE(NEW.book_id, OLD.book_id)
            AND is_deleted = false
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.book_id, OLD.book_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar estatísticas automaticamente
CREATE TRIGGER update_book_rating_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON book_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_book_rating_stats();

CREATE TRIGGER update_book_comments_count_trigger
    AFTER INSERT OR UPDATE OF is_deleted OR DELETE ON book_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_book_comments_count();

-- Adicionar colunas às tabelas existentes
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS ratings_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- Criar índices para as novas colunas
CREATE INDEX IF NOT EXISTS idx_books_average_rating ON books(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_books_ratings_count ON books(ratings_count DESC);

-- View para comentários com informações do usuário (para facilitar consultas)
CREATE VIEW book_comments_with_users AS
SELECT 
    c.id,
    c.user_id,
    c.book_id,
    c.parent_comment_id,
    c.content,
    c.is_deleted,
    c.deleted_by,
    c.deleted_at,
    c.created_at,
    c.updated_at,
    u.name as user_name,
    u.username as user_username,
    u.avatar_url as user_avatar,
    -- Informações de quem deletou (se aplicável)
    deleter.name as deleted_by_name,
    deleter.username as deleted_by_username
FROM book_comments c
INNER JOIN users u ON c.user_id = u.id
LEFT JOIN users deleter ON c.deleted_by = deleter.id;

-- Função para buscar comentários hierárquicos (com replies)
CREATE OR REPLACE FUNCTION get_book_comments_hierarchical(p_book_id UUID, p_limit INTEGER DEFAULT 50, p_offset INTEGER DEFAULT 0)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    book_id UUID,
    parent_comment_id UUID,
    content TEXT,
    is_deleted BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    user_name TEXT,
    user_username TEXT,
    user_avatar TEXT,
    reply_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.user_id,
        c.book_id,
        c.parent_comment_id,
        c.content,
        c.is_deleted,
        c.created_at,
        c.updated_at,
        c.user_name,
        c.user_username,
        c.user_avatar,
        (
            SELECT COUNT(*)
            FROM book_comments_with_users replies
            WHERE replies.parent_comment_id = c.id
            AND replies.is_deleted = false
        ) as reply_count
    FROM book_comments_with_users c
    WHERE c.book_id = p_book_id
    AND c.parent_comment_id IS NULL -- Apenas comentários principais
    AND c.is_deleted = false
    ORDER BY c.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;