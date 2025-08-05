-- =====================================================
-- SCHEMA DO BANCO DE DADOS - SISTEMA DE GERENCIAMENTO
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABELA PRINCIPAL: USUÁRIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255),
    telefone VARCHAR(20),
    data_nascimento DATE,
    ativo BOOLEAN DEFAULT true,
    tipo_usuario VARCHAR(50) DEFAULT 'usuario' CHECK (tipo_usuario IN ('admin', 'usuario', 'moderador')),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ultimo_login TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- TABELA: PERFIS DE USUÁRIO
-- =====================================================
CREATE TABLE IF NOT EXISTS perfis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    avatar_url TEXT,
    bio TEXT,
    website VARCHAR(255),
    localizacao VARCHAR(100),
    preferencias JSONB DEFAULT '{}',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id)
);

-- =====================================================
-- TABELA: CATEGORIAS
-- =====================================================
CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    cor VARCHAR(7) DEFAULT '#3B82F6',
    icone VARCHAR(50),
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER DEFAULT 0,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: ITENS (Entidade principal do sistema)
-- =====================================================
CREATE TABLE IF NOT EXISTS itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT,
    categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'arquivado', 'pendente')),
    prioridade VARCHAR(20) DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_limite TIMESTAMP WITH TIME ZONE,
    data_conclusao TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- TABELA: COMENTÁRIOS
-- =====================================================
CREATE TABLE IF NOT EXISTS comentarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES itens(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    conteudo TEXT NOT NULL,
    tipo VARCHAR(50) DEFAULT 'comentario' CHECK (tipo IN ('comentario', 'nota', 'atualizacao')),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: ANEXOS
-- =====================================================
CREATE TABLE IF NOT EXISTS anexos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES itens(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nome_arquivo VARCHAR(255) NOT NULL,
    tipo_mime VARCHAR(100),
    tamanho_bytes BIGINT,
    url_arquivo TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: LOGS DE ATIVIDADE
-- =====================================================
CREATE TABLE IF NOT EXISTS logs_atividade (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    acao VARCHAR(100) NOT NULL,
    tabela_afetada VARCHAR(100),
    registro_id UUID,
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_address INET,
    user_agent TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA: SESSÕES
-- =====================================================
CREATE TABLE IF NOT EXISTS sessoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    dispositivo VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    expira_em TIMESTAMP WITH TIME ZONE NOT NULL,
    ativo BOOLEAN DEFAULT true,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA OTIMIZAÇÃO
-- =====================================================

-- Índices para tabela usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_nome ON usuarios(nome);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo_usuario);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);
CREATE INDEX IF NOT EXISTS idx_usuarios_criado_em ON usuarios(criado_em);

-- Índices para tabela perfis
CREATE INDEX IF NOT EXISTS idx_perfis_usuario_id ON perfis(usuario_id);

-- Índices para tabela categorias
CREATE INDEX IF NOT EXISTS idx_categorias_nome ON categorias(nome);
CREATE INDEX IF NOT EXISTS idx_categorias_ativo ON categorias(ativo);
CREATE INDEX IF NOT EXISTS idx_categorias_ordem ON categorias(ordem);

-- Índices para tabela itens
CREATE INDEX IF NOT EXISTS idx_itens_usuario_id ON itens(usuario_id);
CREATE INDEX IF NOT EXISTS idx_itens_categoria_id ON itens(categoria_id);
CREATE INDEX IF NOT EXISTS idx_itens_status ON itens(status);
CREATE INDEX IF NOT EXISTS idx_itens_prioridade ON itens(prioridade);
CREATE INDEX IF NOT EXISTS idx_itens_criado_em ON itens(criado_em);
CREATE INDEX IF NOT EXISTS idx_itens_data_limite ON itens(data_limite);
CREATE INDEX IF NOT EXISTS idx_itens_tags ON itens USING GIN(tags);

-- Índices para tabela comentarios
CREATE INDEX IF NOT EXISTS idx_comentarios_item_id ON comentarios(item_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_usuario_id ON comentarios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_criado_em ON comentarios(criado_em);

-- Índices para tabela anexos
CREATE INDEX IF NOT EXISTS idx_anexos_item_id ON anexos(item_id);
CREATE INDEX IF NOT EXISTS idx_anexos_usuario_id ON anexos(usuario_id);

-- Índices para tabela logs_atividade
CREATE INDEX IF NOT EXISTS idx_logs_usuario_id ON logs_atividade(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_acao ON logs_atividade(acao);
CREATE INDEX IF NOT EXISTS idx_logs_tabela_afetada ON logs_atividade(tabela_afetada);
CREATE INDEX IF NOT EXISTS idx_logs_criado_em ON logs_atividade(criado_em);

-- Índices para tabela sessoes
CREATE INDEX IF NOT EXISTS idx_sessoes_usuario_id ON sessoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_token_hash ON sessoes(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessoes_expira_em ON sessoes(expira_em);
CREATE INDEX IF NOT EXISTS idx_sessoes_ativo ON sessoes(ativo);

-- =====================================================
-- TRIGGERS E FUNÇÕES
-- =====================================================

-- Função para atualizar automaticamente o campo atualizado_em
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas que têm atualizado_em
CREATE TRIGGER set_timestamp_usuarios
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_perfis
    BEFORE UPDATE ON perfis
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_categorias
    BEFORE UPDATE ON categorias
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_itens
    BEFORE UPDATE ON itens
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

CREATE TRIGGER set_timestamp_comentarios
    BEFORE UPDATE ON comentarios
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Função para registrar logs de atividade automaticamente
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO logs_atividade (usuario_id, acao, tabela_afetada, registro_id, dados_novos)
        VALUES (NEW.usuario_id, 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO logs_atividade (usuario_id, acao, tabela_afetada, registro_id, dados_anteriores, dados_novos)
        VALUES (NEW.usuario_id, 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO logs_atividade (usuario_id, acao, tabela_afetada, registro_id, dados_anteriores)
        VALUES (OLD.usuario_id, 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de log nas tabelas principais
CREATE TRIGGER log_usuarios_activity
    AFTER INSERT OR UPDATE OR DELETE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_itens_activity
    AFTER INSERT OR UPDATE OR DELETE ON itens
    FOR EACH ROW
    EXECUTE FUNCTION log_activity();

-- Função para limpar sessões expiradas
CREATE OR REPLACE FUNCTION limpar_sessoes_expiradas()
RETURNS void AS $$
BEGIN
    DELETE FROM sessoes WHERE expira_em < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir categorias padrão
INSERT INTO categorias (nome, descricao, cor, icone, ordem) VALUES
('Tarefas', 'Tarefas e atividades do dia a dia', '#3B82F6', 'task', 1),
('Projetos', 'Projetos em andamento', '#10B981', 'project', 2),
('Ideias', 'Ideias e brainstormings', '#F59E0B', 'lightbulb', 3),
('Lembretes', 'Lembretes e notificações', '#EF4444', 'bell', 4),
('Pessoal', 'Itens pessoais', '#8B5CF6', 'user', 5)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE usuarios IS 'Tabela principal de usuários do sistema';
COMMENT ON TABLE perfis IS 'Perfis detalhados dos usuários';
COMMENT ON TABLE categorias IS 'Categorias para organização dos itens';
COMMENT ON TABLE itens IS 'Entidade principal - itens gerenciados pelo sistema';
COMMENT ON TABLE comentarios IS 'Comentários e notas nos itens';
COMMENT ON TABLE anexos IS 'Arquivos anexados aos itens';
COMMENT ON TABLE logs_atividade IS 'Log de todas as atividades do sistema';
COMMENT ON TABLE sessoes IS 'Sessões ativas dos usuários';

COMMENT ON COLUMN usuarios.tipo_usuario IS 'Tipo de usuário: admin, usuario, moderador';
COMMENT ON COLUMN itens.status IS 'Status do item: ativo, inativo, arquivado, pendente';
COMMENT ON COLUMN itens.prioridade IS 'Prioridade: baixa, media, alta, urgente';
COMMENT ON COLUMN itens.tags IS 'Array de tags para categorização';
COMMENT ON COLUMN itens.metadata IS 'Dados adicionais em formato JSON'; 