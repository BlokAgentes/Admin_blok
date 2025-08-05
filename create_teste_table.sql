-- Criar tabela "Teste" no Supabase
CREATE TABLE IF NOT EXISTS "Teste" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ativo BOOLEAN DEFAULT true
);

-- Adicionar comentário na tabela
COMMENT ON TABLE "Teste" IS 'Tabela de teste criada via MCP Supabase';

-- Inserir alguns dados de exemplo
INSERT INTO "Teste" (nome, descricao) VALUES 
    ('Teste 1', 'Primeiro registro de teste'),
    ('Teste 2', 'Segundo registro de teste'),
    ('Teste 3', 'Terceiro registro de teste'); 