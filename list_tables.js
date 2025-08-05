const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://eslcwpuxyqopwylgzddz.supabase.co';

// Diferentes tipos de chaves para testar
const keys = [
    { name: 'Access Token (sbp_)', key: 'sbp_46e5a236078736ec10f54f67927e29d5d02f5c4d' },
    { name: 'Anon Key (eyJ)', key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzbGN3cHV4eW9wd3lsZ3pkZHoiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNTQ5NzI5MSwiZXhwIjoyMDUxMDczMjkxfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8' }, // Placeholder
    { name: 'Service Role Key (eyJ)', key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzbGN3cHV4eW9wd3lsZ3pkZHoiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNzM1NDk3MjkxLCJleHAiOjIwNTEwNzMyOTF9.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8' } // Placeholder
];

async function listTables() {
    console.log('Tentando conectar ao Supabase e listar tabelas...\n');
    console.log(`URL: ${supabaseUrl}`);
    console.log(`Project Ref: eslcwpuxyqopwylgzddz`);
    
    for (const keyInfo of keys) {
        console.log(`\n🔑 Testando: ${keyInfo.name}`);
        console.log(`Chave: ${keyInfo.key.substring(0, 20)}...`);
        
        try {
            const supabase = createClient(supabaseUrl, keyInfo.key);
            
            // Teste simples de conexão
            const { data: testData, error: testError } = await supabase
                .from('_supabase_migrations')
                .select('*')
                .limit(1);
            
            if (testError) {
                console.log(`❌ Erro: ${testError.message}`);
                continue;
            }
            
            console.log('✅ Conexão bem-sucedida!');
            
            // Agora tentar listar tabelas
            console.log('📋 Listando tabelas...');
            
            // Método 1: Usando pg_tables
            const { data: pgTables, error: pgError } = await supabase
                .from('pg_tables')
                .select('tablename, schemaname')
                .eq('schemaname', 'public')
                .order('tablename');
            
            if (pgError) {
                console.log(`Erro ao acessar pg_tables: ${pgError.message}`);
            } else {
                console.log('✅ Tabelas encontradas:');
                if (pgTables && pgTables.length > 0) {
                    pgTables.forEach(table => {
                        console.log(`- ${table.tablename} (schema: ${table.schemaname})`);
                    });
                } else {
                    console.log('Nenhuma tabela encontrada no schema public');
                }
            }
            
            // Se chegou aqui, encontrou uma chave válida
            return;
            
        } catch (error) {
            console.log(`❌ Erro geral: ${error.message}`);
        }
    }
    
    console.log('\n❌ Não foi possível conectar com nenhuma das chaves testadas');
    console.log('\n📋 Para obter as chaves corretas:');
    console.log('1. Acesse: https://supabase.com/dashboard/project/eslcwpuxyqopwylgzddz');
    console.log('2. Vá em Settings > API');
    console.log('3. Copie a "anon public" key ou "service_role" key');
    console.log('4. Atualize o script com a chave correta');
}

listTables(); 