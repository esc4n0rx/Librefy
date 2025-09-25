-- Execute este SQL no Supabase Dashboard > SQL Editor

-- Tabela da biblioteca pessoal (salvos/favoritos)
CREATE TABLE IF NOT EXISTS user_library (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Um usuário só pode salvar o mesmo livro uma vez
    UNIQUE(user_id, book_id)
);

-- Tabela de licenças offline
CREATE TABLE IF NOT EXISTS offline_licenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'revoked', 'expired')) DEFAULT 'active',
    content_key_wrapped TEXT NOT NULL, -- Chave criptografada
    license_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Uma licença ativa por usuário/device/livro
    UNIQUE(user_id, device_id, book_id)
);

-- Tabela de manifestos offline (metadados dos pacotes)
CREATE TABLE IF NOT EXISTS offline_manifests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    manifest_path TEXT NOT NULL, -- Path no Supabase Storage
    package_path TEXT NOT NULL, -- Path do pacote criptografado
    package_size BIGINT NOT NULL DEFAULT 0,
    checksum TEXT NOT NULL, -- SHA-256 do conteúdo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Um manifesto por versão de livro
    UNIQUE(book_id, version)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_library_user_id ON user_library(user_id);
CREATE INDEX IF NOT EXISTS idx_user_library_book_id ON user_library(book_id);
CREATE INDEX IF NOT EXISTS idx_user_library_created_at ON user_library(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_offline_licenses_user_id ON offline_licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_licenses_device_id ON offline_licenses(device_id);
CREATE INDEX IF NOT EXISTS idx_offline_licenses_status ON offline_licenses(status);
CREATE INDEX IF NOT EXISTS idx_offline_licenses_expires_at ON offline_licenses(license_expires_at);

CREATE INDEX IF NOT EXISTS idx_offline_manifests_book_id ON offline_manifests(book_id);
CREATE INDEX IF NOT EXISTS idx_offline_manifests_version ON offline_manifests(book_id, version);

-- Triggers para updated_at
CREATE TRIGGER update_user_library_updated_at 
    BEFORE UPDATE ON user_library 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offline_licenses_updated_at 
    BEFORE UPDATE ON offline_licenses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Função para limpar licenças expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_licenses()
RETURNS void AS $$
BEGIN
    UPDATE offline_licenses 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active' 
    AND license_expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- View para consultas otimizadas da biblioteca
CREATE VIEW user_library_with_books AS
SELECT 
    ul.id,
    ul.user_id,
    ul.book_id,
    ul.created_at as saved_at,
    b.title,
    b.description,
    b.cover_url,
    b.status,
    b.words_count,
    b.chapters_count,
    b.likes_count,
    b.reads_count,
    b.published_at,
    u.name as author_name,
    u.username as author_username,
    u.avatar_url as author_avatar
FROM user_library ul
INNER JOIN books b ON ul.book_id = b.id
INNER JOIN users u ON b.author_id = u.id
WHERE b.status = 'published';