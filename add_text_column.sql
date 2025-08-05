-- Script para adicionar coluna 'text' na tabela audit_log_entries
-- Execute este script no SQL Editor do Supabase

-- Adicionar coluna text na tabela audit_log_entries
ALTER TABLE auth.audit_log_entries 
ADD COLUMN IF NOT EXISTS text TEXT;

-- Verificar se a coluna foi adicionada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'auth' 
AND table_name = 'audit_log_entries' 
AND column_name = 'text';

-- Inserir um registro de teste
INSERT INTO auth.audit_log_entries (id, instance_id, payload, created_at, ip_address, text)
VALUES (
    gen_random_uuid(),
    gen_random_uuid(),
    '{"test": "data"}'::json,
    NOW(),
    '127.0.0.1',
    'Esta é uma coluna de texto criada via SQL'
); 