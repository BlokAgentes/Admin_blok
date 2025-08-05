-- =====================================================
-- DESABILITAR TODOS OS TRIGGERS TEMPORARIAMENTE
-- =====================================================

-- Desabilitar todos os triggers que podem estar causando problemas
DROP TRIGGER IF EXISTS log_usuarios_activity ON usuarios;
DROP TRIGGER IF EXISTS log_itens_activity ON itens;
DROP TRIGGER IF EXISTS log_perfis_activity ON perfis;
DROP TRIGGER IF EXISTS log_categorias_activity ON categorias;
DROP TRIGGER IF EXISTS log_comentarios_activity ON comentarios;
DROP TRIGGER IF EXISTS log_anexos_activity ON anexos;
DROP TRIGGER IF EXISTS log_sessoes_activity ON sessoes;

DROP TRIGGER IF EXISTS set_timestamp_usuarios ON usuarios;
DROP TRIGGER IF EXISTS set_timestamp_perfis ON perfis;
DROP TRIGGER IF EXISTS set_timestamp_categorias ON categorias;
DROP TRIGGER IF EXISTS set_timestamp_itens ON itens;
DROP TRIGGER IF EXISTS set_timestamp_comentarios ON comentarios;
DROP TRIGGER IF EXISTS set_timestamp_anexos ON anexos;
DROP TRIGGER IF EXISTS set_timestamp_sessoes ON sessoes;

-- Remover qualquer outro trigger que possa existir
DROP TRIGGER IF EXISTS trigger_set_timestamp ON usuarios;
DROP TRIGGER IF EXISTS trigger_set_timestamp ON perfis;
DROP TRIGGER IF EXISTS trigger_set_timestamp ON categorias;
DROP TRIGGER IF EXISTS trigger_set_timestamp ON itens;
DROP TRIGGER IF EXISTS trigger_set_timestamp ON comentarios;
DROP TRIGGER IF EXISTS trigger_set_timestamp ON anexos;
DROP TRIGGER IF EXISTS trigger_set_timestamp ON sessoes;
