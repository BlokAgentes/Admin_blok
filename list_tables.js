const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://eslcwpuxyqopwylgzddz.supabase.co';
const supabaseKey = 'SUA_CHAVE_AQUI'; // Substitua pela sua chave anon public

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  try {
    console.log('🔍 Conectando ao Supabase...');
    
    // Query para listar todas as tabelas do schema public
    const { data, error } = await supabase.rpc('list_tables_function');
    
    if (error) {
      console.error('❌ Erro ao executar função:', error);
      
      // Fallback: tentar query direta
      console.log('🔄 Tentando query direta...');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('information_schema.tables')
        .select('table_name, table_type')
        .eq('table_schema', 'public');
        
      if (fallbackError) {
        console.error('❌ Erro na query direta:', fallbackError);
        return;
      }
      
      console.log('✅ Tabelas encontradas (fallback):');
      fallbackData.forEach((table, index) => {
        console.log(`${index + 1}. ${table.table_name} (${table.table_type})`);
      });
      return;
    }

    console.log('✅ Tabelas encontradas:');
    if (data && data.length > 0) {
      data.forEach((table, index) => {
        console.log(`${index + 1}. ${table.table_name} (${table.table_type || 'TABLE'})`);
      });
    } else {
      console.log('📝 Nenhuma tabela encontrada no schema public');
    }

  } catch (err) {
    console.error('❌ Erro inesperado:', err.message);
    console.log('\n💡 Dicas:');
    console.log('1. Verifique se a chave API está correta');
    console.log('2. Confirme se o projeto Supabase está ativo');
    console.log('3. Verifique as permissões da chave API');
  }
}

// Executar o script
console.log('🚀 Listando tabelas do Supabase...');
listTables();