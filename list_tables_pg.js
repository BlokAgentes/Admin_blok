const { Client } = require('pg');

// Configuração de conexão PostgreSQL
const client = new Client({
  host: 'db.eslcwpuxyqopwylgzddz.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'SUA_SENHA_AQUI', // Substitua pela senha do seu projeto
});

async function listTablesPostgreSQL() {
  try {
    console.log('🔍 Conectando ao PostgreSQL...');
    await client.connect();
    console.log('✅ Conectado com sucesso!');

    // Query para listar todas as tabelas
    const query = `
      SELECT 
        table_name,
        table_type,
        table_schema
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;

    console.log('📊 Executando query...');
    const result = await client.query(query);

    if (result.rows.length === 0) {
      console.log('📝 Nenhuma tabela encontrada no schema public');
    } else {
      console.log(`✅ Encontradas ${result.rows.length} tabela(s):\n`);
      
      result.rows.forEach((row, index) => {
        console.log(`${index + 1}. ${row.table_name} (${row.table_type})`);
      });

      // Informações adicionais sobre as tabelas
      console.log('\n📋 Detalhes das tabelas:');
      for (const row of result.rows) {
        const countQuery = `SELECT COUNT(*) as count FROM "${row.table_name}";`;
        try {
          const countResult = await client.query(countQuery);
          console.log(`   ${row.table_name}: ${countResult.rows[0].count} registros`);
        } catch (err) {
          console.log(`   ${row.table_name}: Erro ao contar registros`);
        }
      }
    }

  } catch (err) {
    console.error('❌ Erro de conexão:', err.message);
    console.log('\n💡 Dicas:');
    console.log('1. Verifique se a senha está correta');
    console.log('2. Confirme se o host está correto');
    console.log('3. Verifique se o projeto Supabase está ativo');
    console.log('4. Confirme as configurações de rede/firewall');
  } finally {
    try {
      await client.end();
      console.log('\n🔌 Conexão fechada');
    } catch (err) {
      console.error('Erro ao fechar conexão:', err.message);
    }
  }
}

// Executar o script
console.log('🚀 Listando tabelas via PostgreSQL...');
listTablesPostgreSQL();