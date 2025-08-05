-- =====================================================
-- CORREÇÃO DOS TRIGGERS DE LOG
-- =====================================================

-- Função corrigida para registrar logs de atividade automaticamente
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO logs_atividade (usuario_id, acao, tabela_afetada, registro_id, dados_novos)
        VALUES (
            CASE 
                WHEN TG_TABLE_NAME = 'usuarios' THEN NEW.id
                WHEN TG_TABLE_NAME = 'itens' THEN NEW.usuario_id
                ELSE NULL
            END,
            'INSERT', 
            TG_TABLE_NAME, 
            NEW.id, 
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO logs_atividade (usuario_id, acao, tabela_afetada, registro_id, dados_anteriores, dados_novos)
        VALUES (
            CASE 
                WHEN TG_TABLE_NAME = 'usuarios' THEN NEW.id
                WHEN TG_TABLE_NAME = 'itens' THEN NEW.usuario_id
                ELSE NULL
            END,
            'UPDATE', 
            TG_TABLE_NAME, 
            NEW.id, 
            to_jsonb(OLD), 
            to_jsonb(NEW)
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO logs_atividade (usuario_id, acao, tabela_afetada, registro_id, dados_anteriores)
        VALUES (
            CASE 
                WHEN TG_TABLE_NAME = 'usuarios' THEN OLD.id
                WHEN TG_TABLE_NAME = 'itens' THEN OLD.usuario_id
                ELSE NULL
            END,
            'DELETE', 
            TG_TABLE_NAME, 
            OLD.id, 
            to_jsonb(OLD)
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Remover triggers existentes (se existirem)
DROP TRIGGER IF EXISTS log_usuarios_activity ON usuarios;
DROP TRIGGER IF EXISTS log_itens_activity ON itens;

-- Reaplicar triggers corrigidos
CREATE TRIGGER log_usuarios_activity
    AFTER INSERT OR UPDATE OR DELETE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_itens_activity
    AFTER INSERT OR UPDATE OR DELETE ON itens
    FOR EACH ROW
    EXECUTE FUNCTION log_activity();
