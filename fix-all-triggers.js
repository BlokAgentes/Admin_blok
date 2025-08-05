const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 Corrigindo todos os triggers...')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Credenciais do Supabase não configuradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function fixAllTriggers() {
  try {
    console.log('🗑️ Removendo todos os triggers problemáticos...')
    
    // Lista de todos os triggers que podem estar causando problemas
    const triggersToRemove = [
      'DROP TRIGGER IF EXISTS log_usuarios_activity ON usuarios;',
      'DROP TRIGGER IF EXISTS log_itens_activity ON itens;',
      'DROP TRIGGER IF EXISTS set_timestamp_usuarios ON usuarios;',
      'DROP TRIGGER IF EXISTS set_timestamp_perfis ON perfis;',
      'DROP TRIGGER IF EXISTS set_timestamp_categorias ON categorias;',
      'DROP TRIGGER IF EXISTS set_timestamp_itens ON itens;',
      'DROP TRIGGER IF EXISTS set_timestamp_comentarios ON comentarios;'
    ]
    
    for (const triggerSQL of triggersToRemove) {
      try {
        await supabase.rpc('exec_sql', { sql: triggerSQL })
        console.log(`✅ ${triggerSQL}`)
      } catch (err) {
        console.log(`⚠️ ${triggerSQL} - ${err.message}`)
      }
    }
    
    console.log('\n🔧 Recriando função de log corrigida...')
    
    const logFunctionSQL = `
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
    `
    
    try {
      await supabase.rpc('exec_sql', { sql: logFunctionSQL })
      console.log('✅ Função de log recriada')
    } catch (err) {
      console.log('⚠️ Erro ao recriar função de log:', err.message)
    }
    
    console.log('\n🎉 Correção de triggers concluída!')
    
  } catch (error) {
    console.error('❌ Erro durante correção:', error.message)
  }
}

fixAllTriggers().catch(console.error) 