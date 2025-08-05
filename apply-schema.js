const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Configuração do Supabase com service role key
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🚀 Aplicando schema do banco de dados...')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Credenciais do Supabase não configuradas!')
  process.exit(1)
}

// Criação do cliente Supabase com service role
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Função para executar SQL
async function executeSQL(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql })
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Função para aplicar schema em partes
async function applySchema() {
  console.log('📋 Aplicando schema em partes...\n')

  // Parte 1: Extensões
  console.log('1️⃣ Aplicando extensões...')
  const extensionsSQL = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
  `
  const extensionsResult = await executeSQL(extensionsSQL)
  if (extensionsResult.success) {
    console.log('   ✅ Extensões aplicadas')
  } else {
    console.log(`   ❌ Erro nas extensões: ${extensionsResult.error}`)
  }

  // Parte 2: Tabela usuarios
  console.log('\n2️⃣ Criando tabela usuarios...')
  const usuariosSQL = `
    CREATE TABLE IF NOT EXISTS usuarios (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nome VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      senha_hash VARCHAR(255),
      telefone VARCHAR(20),
      data_nascimento DATE,
      ativo BOOLEAN DEFAULT true,
      tipo_usuario VARCHAR(50) DEFAULT 'usuario' CHECK (tipo_usuario IN ('admin', 'usuario', 'moderador')),
      criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      ultimo_login TIMESTAMP WITH TIME ZONE
    );
  `
  const usuariosResult = await executeSQL(usuariosSQL)
  if (usuariosResult.success) {
    console.log('   ✅ Tabela usuarios criada')
  } else {
    console.log(`   ❌ Erro na tabela usuarios: ${usuariosResult.error}`)
  }

  // Parte 3: Tabela categorias
  console.log('\n3️⃣ Criando tabela categorias...')
  const categoriasSQL = `
    CREATE TABLE IF NOT EXISTS categorias (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nome VARCHAR(100) NOT NULL,
      descricao TEXT,
      cor VARCHAR(7) DEFAULT '#3B82F6',
      icone VARCHAR(50),
      ativo BOOLEAN DEFAULT true,
      ordem INTEGER DEFAULT 0,
      criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `
  const categoriasResult = await executeSQL(categoriasSQL)
  if (categoriasResult.success) {
    console.log('   ✅ Tabela categorias criada')
  } else {
    console.log(`   ❌ Erro na tabela categorias: ${categoriasResult.error}`)
  }

  // Parte 4: Tabela itens
  console.log('\n4️⃣ Criando tabela itens...')
  const itensSQL = `
    CREATE TABLE IF NOT EXISTS itens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      titulo VARCHAR(200) NOT NULL,
      descricao TEXT,
      categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
      usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      status VARCHAR(50) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'arquivado', 'pendente')),
      prioridade VARCHAR(20) DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),
      tags TEXT[],
      metadata JSONB DEFAULT '{}',
      criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      data_limite TIMESTAMP WITH TIME ZONE,
      data_conclusao TIMESTAMP WITH TIME ZONE
    );
  `
  const itensResult = await executeSQL(itensSQL)
  if (itensResult.success) {
    console.log('   ✅ Tabela itens criada')
  } else {
    console.log(`   ❌ Erro na tabela itens: ${itensResult.error}`)
  }

  // Parte 5: Índices básicos
  console.log('\n5️⃣ Criando índices básicos...')
  const indicesSQL = `
    CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
    CREATE INDEX IF NOT EXISTS idx_usuarios_nome ON usuarios(nome);
    CREATE INDEX IF NOT EXISTS idx_categorias_nome ON categorias(nome);
    CREATE INDEX IF NOT EXISTS idx_itens_usuario_id ON itens(usuario_id);
    CREATE INDEX IF NOT EXISTS idx_itens_categoria_id ON itens(categoria_id);
    CREATE INDEX IF NOT EXISTS idx_itens_status ON itens(status);
  `
  const indicesResult = await executeSQL(indicesSQL)
  if (indicesResult.success) {
    console.log('   ✅ Índices básicos criados')
  } else {
    console.log(`   ❌ Erro nos índices: ${indicesResult.error}`)
  }

  // Parte 6: Dados iniciais
  console.log('\n6️⃣ Inserindo dados iniciais...')
  const dadosIniciaisSQL = `
    INSERT INTO categorias (nome, descricao, cor, icone, ordem) VALUES
    ('Tarefas', 'Tarefas e atividades do dia a dia', '#3B82F6', 'task', 1),
    ('Projetos', 'Projetos em andamento', '#10B981', 'project', 2),
    ('Ideias', 'Ideias e brainstormings', '#F59E0B', 'lightbulb', 3),
    ('Lembretes', 'Lembretes e notificações', '#EF4444', 'bell', 4),
    ('Pessoal', 'Itens pessoais', '#8B5CF6', 'user', 5)
    ON CONFLICT DO NOTHING;
  `
  const dadosResult = await executeSQL(dadosIniciaisSQL)
  if (dadosResult.success) {
    console.log('   ✅ Dados iniciais inseridos')
  } else {
    console.log(`   ❌ Erro nos dados iniciais: ${dadosResult.error}`)
  }

  console.log('\n🎉 Schema aplicado com sucesso!')
}

// Executa a aplicação do schema
applySchema().catch(console.error) 