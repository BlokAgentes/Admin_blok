import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
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

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      console.error('Supabase login error:', error)
      
      // Handle specific authentication errors
      if (error.message.includes('Invalid login credentials')) {
        return NextResponse.json(
          { error: 'Email ou senha incorretos' },
          { status: 401 }
        )
      }
      
      if (error.message.includes('Email not confirmed')) {
        return NextResponse.json(
          { error: 'Por favor, confirme seu email antes de fazer login' },
          { status: 401 }
        )
      }

      if (error.message.includes('Too many requests')) {
        return NextResponse.json(
          { error: 'Muitas tentativas de login. Tente novamente mais tarde.' },
          { status: 429 }
        )
      }

      return NextResponse.json(
        { error: 'Erro no login. Tente novamente.' },
        { status: 500 }
      )
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        { error: 'Falha na autenticação' },
        { status: 401 }
      )
    }

    // Format user data for response
    const user = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || data.user.user_metadata?.display_name || data.user.email?.split('@')[0],
      role: data.user.user_metadata?.role || data.user.user_metadata?.user_role || 'CLIENT',
      created_at: data.user.created_at,
      email_confirmed_at: data.user.email_confirmed_at,
      last_sign_in_at: data.user.last_sign_in_at
    }

    return NextResponse.json({
      user,
      session: data.session,
      message: 'Login realizado com sucesso'
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 