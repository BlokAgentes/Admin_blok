import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
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

    // Set the session for the logout
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: '' // We don't have the refresh token from the header
    })

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Supabase logout error:', error)
      return NextResponse.json(
        { error: 'Erro ao fazer logout' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Logout realizado com sucesso'
    })

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}