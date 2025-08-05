'use client';

import { SignUpPage } from '@/components/ui/sign-up';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewSignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Validate passwords match
    if (password !== confirmPassword) {
      alert('As senhas não coincidem');
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Auto-login after successful registration
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect to admin page
      router.push('/admin');
    } catch (error) {
      console.error('Registration error:', error);
      alert(error instanceof Error ? error.message : 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    console.log('Google Sign Up clicked');
    alert('Google Sign Up - Em desenvolvimento');
  };

  const handleSignIn = () => {
    console.log('Sign in clicked');
    router.push('/login');
  };

  return (
    <SignUpPage
      title={<span className="font-light text-white tracking-tighter">Criar Conta</span>}
      description="Cadastre-se para começar a usar a plataforma"
      heroImageSrc="/Imagem_login.png"
      onSignUp={handleSignUp}
      onGoogleSignUp={handleGoogleSignUp}
      onSignIn={handleSignIn}
    />
  );
}