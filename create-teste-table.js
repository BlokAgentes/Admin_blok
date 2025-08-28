#!/usr/bin/env node

/**
 * Script para criar a tabela "teste" no Supabase
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

// Configuração do Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    process.exit(1);
}

if (!SUPABASE_URL) {
    console.error('❌ SUPABASE_URL environment variable is required');
    process.exit(1);
}

// Criar cliente Supabase com service role key para operações admin
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createTesteTable() {
    console.log('🚀 Tentando criar tabela "teste" no Supabase...\n');

    try {
        // Tentar inserir dados diretamente na tabela teste
        console.log('📝 Tentando inserir dados na tabela "teste"...');

        const { data: insertData, error: insertError } = await supabase
            .from('teste')
            .insert([
                {
                    nome: 'Teste Inicial',
                    descricao: 'Registro de teste para criar a tabela'
                }
            ])
            .select();

        if (insertError) {
            console.log('ℹ️  Erro ao inserir dados:', insertError.message);
            console.log('💡 A tabela "teste" não existe e precisa ser criada manualmente');
            console.log('\n🔗 Para criar a tabela, acesse o painel do Supabase:');
            console.log(`   ${SUPABASE_URL}/dashboard/project/[seu-projeto]/sql`);
            console.log('\n📋 Execute este SQL no editor SQL:');
            console.log(`
CREATE TABLE public.teste (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255),
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
            `);
            console.log('\n💡 Alternativamente, você pode:');
            console.log('   1. Usar o Supabase CLI');
            console.log('   2. Usar o painel de interface do Supabase');
            console.log('   3. Executar o script setup-supabase-schema.js que já existe');
            return false;
        }

        console.log('✅ Tabela "teste" criada e registro inserido com sucesso!');
        console.log('📊 Dados inseridos:', insertData);
        return true;

    } catch (err) {
        console.error('❌ Exceção ao criar tabela:', err.message);
        return false;
    }
}

// Executar o script
createTesteTable()
    .then(success => {
        if (success) {
            console.log('\n✨ Script executado com sucesso!');
        } else {
            console.log('\n❌ Falha ao executar o script');
            console.log('💡 Você precisará criar a tabela manualmente no painel do Supabase');
        }
    })
    .catch(err => {
        console.error('❌ Erro fatal:', err);
        process.exit(1);
    });
