-- Execute este SQL no Supabase Dashboard > SQL Editor

-- Criar tabela de planos
CREATE TABLE IF NOT EXISTS plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    stripe_price_id VARCHAR(100),
    features JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir planos padrão
INSERT INTO plans (name, display_name, description, price_monthly, stripe_price_id, features) VALUES
('free', 'Plano Gratuito', 'Funcionalidades básicas gratuitas', 0.00, NULL, '{
    "reading_unlimited": true,
    "publishing_unlimited": true,
    "offline_library_limit": 3,
    "ads_enabled": true,
    "community_access": true,
    "contests_access": true,
    "book_highlight": false,
    "statistics": false,
    "custom_covers": false
}'),
('premium', 'Autor Premium', 'Para quem escreve e quer mais alcance', 19.90, NULL, '{
    "reading_unlimited": true,
    "publishing_unlimited": true,
    "offline_library_limit": 20,
    "ads_enabled": false,
    "community_access": true,
    "contests_access": true,
    "book_highlight": true,
    "statistics": true,
    "custom_covers": true
}');

-- Criar tabela de assinaturas
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id),
    stripe_subscription_id VARCHAR(100) UNIQUE,
    stripe_customer_id VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'canceled', 'past_due', 'unpaid')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id) -- Um usuário pode ter apenas uma assinatura ativa
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_plans_name ON plans(name);

-- Trigger para atualizar updated_at nas tabelas
CREATE TRIGGER update_plans_updated_at 
    BEFORE UPDATE ON plans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Função para verificar plano do usuário
CREATE OR REPLACE FUNCTION get_user_current_plan(p_user_id UUID)
RETURNS TABLE (
    plan_name VARCHAR,
    plan_features JSONB,
    subscription_status VARCHAR,
    expires_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.name as plan_name,
        p.features as plan_features,
        COALESCE(s.status, 'inactive') as subscription_status,
        s.current_period_end as expires_at
    FROM users u
    LEFT JOIN subscriptions s ON u.id = s.user_id AND s.status = 'active'
    LEFT JOIN plans p ON COALESCE(s.plan_id, (SELECT id FROM plans WHERE name = 'free')) = p.id
    WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql;