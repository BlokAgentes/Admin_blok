const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://dtzvehgdfhywdbooduug.supabase.co';
const supabaseKey = 'sbp_46e5a236078736ec10f54f67927e29d5d02f5c4d';

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function createTesteTable() {
    try {
        console.log('Tentando criar tabela "Teste" no Supabase...');
        
        // First, let's try to insert data to see if the table exists
        const { data: insertData, error: insertError } = await supabase
            .from('Teste')
            .insert([
                { nome: 'Teste 1', descricao: 'Primeiro registro de teste' },
                { nome: 'Teste 2', descricao: 'Segundo registro de teste' },
                { nome: 'Teste 3', descricao: 'Terceiro registro de teste' }
            ])
            .select();
        
        if (insertError) {
            console.log('Erro ao inserir dados. A tabela pode não existir ainda.');
            console.log('Erro:', insertError.message);
            
            // Let's try to create the table using a different approach
            console.log('\nPara criar a tabela "Teste", você pode:');
            console.log('1. Acessar o dashboard do Supabase: https://supabase.com/dashboard/project/dtzvehgdfhywdbooduug');
            console.log('2. Ir para SQL Editor');
            console.log('3. Executar o seguinte SQL:');
            console.log('\n' + '='.repeat(50));
            console.log(`
CREATE TABLE IF NOT EXISTS "Teste" (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ativo BOOLEAN DEFAULT true
);

COMMENT ON TABLE "Teste" IS 'Tabela de teste criada via MCP Supabase';

INSERT INTO "Teste" (nome, descricao) VALUES 
    ('Teste 1', 'Primeiro registro de teste'),
    ('Teste 2', 'Segundo registro de teste'),
    ('Teste 3', 'Terceiro registro de teste');
            `);
            console.log('='.repeat(50));
            
            return;
        }
        
        console.log('Tabela "Teste" criada com sucesso!');
        console.log('Dados inseridos:', insertData);
        
    } catch (error) {
        console.error('Erro:', error);
    }
}

createTesteTable(); 