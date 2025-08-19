'use client';

import { SignInPage } from '@/components/ui/sign-in';
import { TypingText } from '@/components/ui/typing-text';
import { useRouter } from 'next/navigation';
import { useState } from 'react';


export default function NewLoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const rememberMe = formData.get('rememberMe') as string;

    // Client-side validation
    if (!email || !password) {
      alert('Por favor, preencha todos os campos obrigatórios');
      setIsLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      alert('Por favor, insira um email válido');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

      // Redirect to admin page
      router.push('/admin');
    } catch (error) {
      console.error('Login error:', error);
      alert(error instanceof Error ? error.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    console.log('Google Sign In clicked');
    // Implementar integração com Google OAuth futuramente
    alert('Google Sign In - Em desenvolvimento');
  };

  const handleResetPassword = () => {
    console.log('Reset password clicked');
    router.push('/reset-password');
  };

  const handleCreateAccount = () => {
    console.log('Create account clicked');
    router.push('/signup');
  };

  return (
    <SignInPage
      title={
        <TypingText 
          text="Bem-vindo de volta" 
          className="font-light text-white tracking-tighter"
          speed={80}
          showCursor={false}
          startOnView={true}
          once={true}
        />
      }
      description=""
      heroImageSrc="/Imagem_login.png"
      onSignIn={handleSignIn}
      onGoogleSignIn={handleGoogleSignIn}
      onResetPassword={handleResetPassword}
      onCreateAccount={handleCreateAccount}
    />
  );
}