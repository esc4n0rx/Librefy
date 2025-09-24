-- Execute este SQL no Supabase Dashboard > SQL Editor

-- Criar tabela de livros
CREATE TABLE IF NOT EXISTS books (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    cover_url TEXT, -- URL do Cloudinary
    status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    visibility TEXT NOT NULL CHECK (visibility IN ('public', 'unlisted', 'private')) DEFAULT 'public',
    tags TEXT[] DEFAULT '{}',
    words_count INTEGER DEFAULT 0,
    chapters_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    reads_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- Índices para performance
    CONSTRAINT books_title_not_empty CHECK (length(trim(title)) > 0)
);

-- Criar tabela de capítulos
CREATE TABLE IF NOT EXISTS chapters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chapter_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    content_md TEXT NOT NULL,
    words_count INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    
    -- Garantir ordem sequencial por livro
    UNIQUE(book_id, chapter_number),
    CONSTRAINT chapters_title_not_empty CHECK (length(trim(title)) > 0),
    CONSTRAINT chapters_content_not_empty CHECK (length(trim(content_md)) > 0),
    CONSTRAINT chapters_number_positive CHECK (chapter_number > 0)
);

-- Tabela de curtidas
CREATE TABLE IF NOT EXISTS book_likes (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, book_id)
);

-- Tabela de favoritos
CREATE TABLE IF NOT EXISTS book_favorites (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, book_id)
);

-- Tabela de leituras (para analytics)
CREATE TABLE IF NOT EXISTS book_reads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevenir spam de leituras (1 por IP por hora por capítulo)
    UNIQUE(ip_address, book_id, chapter_id, date_trunc('hour', created_at))
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_books_author_id ON books(author_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_visibility ON books(visibility);
CREATE INDEX IF NOT EXISTS idx_books_published_at ON books(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_tags ON books USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_books_slug ON books(slug);

CREATE INDEX IF NOT EXISTS idx_chapters_book_id ON chapters(book_id, chapter_number);
CREATE INDEX IF NOT EXISTS idx_chapters_author_id ON chapters(author_id);
CREATE INDEX IF NOT EXISTS idx_chapters_published ON chapters(book_id, is_published, chapter_number);

CREATE INDEX IF NOT EXISTS idx_book_likes_book_id ON book_likes(book_id);
CREATE INDEX IF NOT EXISTS idx_book_favorites_user_id ON book_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_book_reads_book_id ON book_reads(book_id);
CREATE INDEX IF NOT EXISTS idx_book_reads_created_at ON book_reads(created_at);

-- Triggers para updated_at
CREATE TRIGGER update_books_updated_at 
    BEFORE UPDATE ON books 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at 
    BEFORE UPDATE ON chapters 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Função para atualizar contadores do livro
CREATE OR REPLACE FUNCTION update_book_counters()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar contagem de capítulos e palavras
    UPDATE books SET
        chapters_count = (
            SELECT COUNT(*) 
            FROM chapters 
            WHERE book_id = COALESCE(NEW.book_id, OLD.book_id)
        ),
        words_count = (
            SELECT COALESCE(SUM(words_count), 0) 
            FROM chapters 
            WHERE book_id = COALESCE(NEW.book_id, OLD.book_id) 
            AND is_published = true
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.book_id, OLD.book_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar contadores automaticamente
CREATE TRIGGER update_book_counters_trigger
    AFTER INSERT OR UPDATE OR DELETE ON chapters
    FOR EACH ROW
    EXECUTE FUNCTION update_book_counters();

-- Função para contar palavras em markdown
CREATE OR REPLACE FUNCTION count_words_in_text(content TEXT)
RETURNS INTEGER AS $$
BEGIN
    -- Remove markdown, HTML e conta palavras
    RETURN array_length(
        string_to_array(
            trim(regexp_replace(
                regexp_replace(content, '<[^>]*>', '', 'g'), -- remove HTML
                '[#*`_\[\]()~]', '', 'g') -- remove markdown básico
            )),
            ' '
        ),
        1
    );
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular words_count automaticamente em capítulos
CREATE OR REPLACE FUNCTION calculate_chapter_words()
RETURNS TRIGGER AS $$
BEGIN
    NEW.words_count = count_words_in_text(NEW.content_md);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_chapter_words_trigger
    BEFORE INSERT OR UPDATE OF content_md ON chapters
    FOR EACH ROW
    EXECUTE FUNCTION calculate_chapter_words();

-- View materializada para busca full-text
CREATE MATERIALIZED VIEW IF NOT EXISTS book_search AS
SELECT
    b.id as book_id,
    b.title,
    b.description,
    b.author_id,
    b.cover_url,
    b.tags,
    b.likes_count,
    b.reads_count,
    b.published_at,
    setweight(to_tsvector('portuguese', coalesce(b.title,'')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(b.description,'')), 'B') ||
    setweight(to_tsvector('portuguese', array_to_string(b.tags, ' ')), 'B') ||
    setweight(to_tsvector('portuguese', string_agg(coalesce(c.title,''), ' ')), 'C') ||
    setweight(to_tsvector('portuguese', string_agg(coalesce(c.content_md,''), ' ')), 'D')
    as search_vector
FROM books b
LEFT JOIN chapters c ON c.book_id = b.id AND c.is_published = true
WHERE b.status = 'published' AND b.visibility = 'public'
GROUP BY b.id, b.title, b.description, b.author_id, b.cover_url, b.tags, b.likes_count, b.reads_count, b.published_at;

-- Índice GIN para busca
CREATE INDEX IF NOT EXISTS idx_book_search_vector ON book_search USING GIN (search_vector);

-- Função para refresh da view de busca
CREATE OR REPLACE FUNCTION refresh_book_search()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY book_search;
END;
$$ LANGUAGE plpgsql;