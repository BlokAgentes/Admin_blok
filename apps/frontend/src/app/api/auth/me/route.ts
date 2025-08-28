import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Token de autorização necessário' },
        { status: 401 }
      )
    }

    // Get user from Supabase using the access token
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      console.error('Supabase get user error:', error)
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    // Format user data for response
    const userData = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.user_metadata?.display_name || user.email?.split('@')[0],
      role: user.user_metadata?.role || user.user_metadata?.user_role || 'CLIENT',
      created_at: user.created_at,
      email_confirmed_at: user.email_confirmed_at,
      last_sign_in_at: user.last_sign_in_at
    }

    return NextResponse.json({
      user: userData
    })

  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}