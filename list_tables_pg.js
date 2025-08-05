const { Client } = require('pg');

// URL de conexão completa do pooler
const connectionString = 'postgresql://postgres.eslcwpuxyqopwylgzddz:RuqnGWa82N1MFKh7@aws-0-sa-east-1.pooler.supabase.com:6543/postgres';

async function listTables() {
    const client = new Client({
        connectionString: connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    });
    
    try {
        console.log('🔌 Conectando ao PostgreSQL via pooler...');
        await client.connect();
        console.log('✅ Conectado com sucesso!');
        
        console.log('\n📋 Listando tabelas do schema public:');
        
        // Query para listar tabelas
        const query = `
            SELECT 
                table_name,
                table_type
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `;
        
        const result = await client.query(query);
        
        if (result.rows.length > 0) {
            console.log('\n✅ Tabelas encontradas:');
            result.rows.forEach(row => {
                console.log(`- ${row.table_name} (${row.table_type})`);
            });
        } else {
            console.log('\n📭 Nenhuma tabela encontrada no schema public');
        }
        
        console.log('\n📊 Informações adicionais:');
        
        // Contar tabelas por tipo
        const countQuery = `
            SELECT 
                table_type,
                COUNT(*) as count
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            GROUP BY table_type;
        `;
        
        const countResult = await client.query(countQuery);
        countResult.rows.forEach(row => {
            console.log(`- ${row.table_type}: ${row.count} tabela(s)`);
        });
        
        // Listar schemas disponíveis
        console.log('\n🗂️ Schemas disponíveis:');
        const schemaQuery = `
            SELECT DISTINCT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
            ORDER BY schema_name;
        `;
        
        const schemaResult = await client.query(schemaQuery);
        schemaResult.rows.forEach(row => {
            console.log(`- ${row.schema_name}`);
        });
        
    } catch (error) {
        console.error('❌ Erro:', error.message);
        console.log('\n💡 Sugestões:');
        console.log('1. Verifique se a senha está correta');
        console.log('2. Verifique se o projeto está ativo');
        console.log('3. Tente acessar o dashboard: https://supabase.com/dashboard/project/eslcwpuxyqopwylgzddz');
        console.log('4. O erro SASL pode indicar problemas de autenticação');
    } finally {
        await client.end();
    }
}

listTables(); 