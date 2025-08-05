const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://eslcwpuxyqopwylgzddz.supabase.co';

// INSTRUÇÕES: Substitua esta chave pela sua anon public key ou service role key
// Para obter a chave: https://supabase.com/dashboard/project/eslcwpuxyqopwylgzddz/settings/api
const supabaseKey = 'SUA_CHAVE_AQUI'; // Substitua pela chave correta

async function createTesteTable() {
    console.log('🚀 Criando tabela "Teste" no Supabase...\n');
    
    if (supabaseKey === 'SUA_CHAVE_AQUI') {
        console.log('❌ ERRO: Você precisa configurar a chave do Supabase!');
        console.log('\n📋 Como obter a chave:');
        console.log('1. Acesse: https://supabase.com/dashboard/project/eslcwpuxyqopwylgzddz/settings/api');
        console.log('2. Copie a "anon public" key ou "service_role" key');
        console.log('3. Substitua "SUA_CHAVE_AQUI" pela chave copiada');
        console.log('4. Execute o script novamente');
        return;
    }
    
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        console.log('1. Verificando se a tabela já existe...');
        
        // Tentar inserir dados para ver se a tabela existe
        const { data: existingData, error: existingError } = await supabase
            .from('Teste')
            .select('*')
            .limit(1);
        
        if (existingError && existingError.message.includes('does not exist')) {
            console.log('✅ Tabela "Teste" não existe. Criando...');
            
            // Como não podemos criar tabelas via REST API, vamos mostrar o SQL
            console.log('\n📋 Para criar a tabela, execute este SQL no dashboard do Supabase:');
            console.log('\n' + '='.repeat(60));
            console.log(`
-- Criar tabela "Teste"
CREATE TABLE IF NOT EXISTS "Teste" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ativo BOOLEAN DEFAULT true
);

-- Adicionar comentário
COMMENT ON TABLE "Teste" IS 'Tabela de teste criada via script Node.js';

-- Inserir dados de exemplo
INSERT INTO "Teste" (nome, descricao) VALUES 
    ('Teste 1', 'Primeiro registro de teste'),
    ('Teste 2', 'Segundo registro de teste'),
    ('Teste 3', 'Terceiro registro de teste');
            `);
            console.log('='.repeat(60));
            
            console.log('\n📋 Como executar:');
            console.log('1. Acesse: https://supabase.com/dashboard/project/eslcwpuxyqopwylgzddz');
            console.log('2. Vá para "SQL Editor"');
            console.log('3. Cole o SQL acima e execute');
            
        } else if (existingError) {
            console.log('❌ Erro ao verificar tabela:', existingError.message);
            console.log('\n💡 Verifique se a chave API está correta');
        } else {
            console.log('✅ Tabela "Teste" já existe!');
            console.log('📊 Dados encontrados:', existingData?.length || 0, 'registros');
            
            // Listar dados existentes
            const { data: allData, error: listError } = await supabase
                .from('Teste')
                .select('*')
                .order('data_criacao', { ascending: false });
            
            if (!listError && allData) {
                console.log('\n📋 Registros na tabela:');
                allData.forEach((item, index) => {
                    console.log(`${index + 1}. ${item.nome} - ${item.descricao} (${item.ativo ? 'Ativo' : 'Inativo'})`);
                });
            }
        }
        
    } catch (error) {
        console.error('❌ Erro geral:', error.message);
        console.log('\n💡 Sugestões:');
        console.log('1. Verifique se a chave API está correta');
        console.log('2. Verifique se o projeto está ativo');
        console.log('3. Tente acessar o dashboard do Supabase');
    }
}

// Função para listar todas as tabelas (se a chave tiver permissões)
async function listAllTables() {
    console.log('\n📋 Tentando listar todas as tabelas...');
    
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Tentar diferentes métodos para listar tabelas
        const methods = [
            { name: 'pg_tables', query: 'pg_tables', filter: 'schemaname', value: 'public' },
            { name: 'information_schema', query: 'information_schema.tables', filter: 'table_schema', value: 'public' }
        ];
        
        for (const method of methods) {
            try {
                const { data, error } = await supabase
                    .from(method.query)
                    .select('*')
                    .eq(method.filter, method.value);
                
                if (!error && data) {
                    console.log(`✅ Tabelas encontradas via ${method.name}:`);
                    data.forEach(item => {
                        const tableName = item.table_name || item.tablename;
                        console.log(`- ${tableName}`);
                    });
                    return;
                }
            } catch (e) {
                console.log(`❌ Método ${method.name} falhou:`, e.message);
            }
        }
        
        console.log('❌ Não foi possível listar as tabelas com a chave atual');
        
    } catch (error) {
        console.log('❌ Erro ao listar tabelas:', error.message);
    }
}

// Executar as funções
createTesteTable().then(() => {
    if (supabaseKey !== 'SUA_CHAVE_AQUI') {
        return listAllTables();
    }
}); 