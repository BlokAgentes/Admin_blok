import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role = 'CLIENT' } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nome, email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      )
    }

    // Register user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          display_name: name,
          user_role: role
        }
      }
    })

    if (error) {
      console.error('Supabase registration error:', error)
      
      // Handle specific Supabase errors
      if (error.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'Este email já está cadastrado' },
          { status: 409 }
        )
      }
      
      if (error.message.includes('Invalid email')) {
        return NextResponse.json(
          { error: 'Email inválido' },
          { status: 400 }
        )
      }

      if (error.message.includes('Password')) {
        return NextResponse.json(
          { error: 'Senha não atende aos critérios de segurança' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Erro no cadastro. Tente novamente.' },
        { status: 500 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Falha ao criar usuário' },
        { status: 500 }
      )
    }

    // Format user data for response
    const user = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || name,
      role: data.user.user_metadata?.role || role,
      created_at: data.user.created_at,
      email_confirmed_at: data.user.email_confirmed_at
    }

    // Return user data and session
    return NextResponse.json({
      user,
      session: data.session,
      message: data.session 
        ? 'Usuário cadastrado e logado com sucesso'
        : 'Usuário cadastrado com sucesso. Verifique seu email para confirmar a conta.'
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 