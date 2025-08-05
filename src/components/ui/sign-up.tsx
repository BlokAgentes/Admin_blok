import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import GridDistortion from './GridDistortion';

// --- HELPER COMPONENTS (ICONS) ---

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
    </svg>
);

// --- TYPE DEFINITIONS ---

interface SignUpPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  onSignUp?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignUp?: () => void;
  onSignIn?: () => void;
}

// --- SUB-COMPONENTS ---

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur-sm transition-colors focus-within:border-violet-300/70 focus-within:bg-violet-500/10">
    {children}
  </div>
);

// --- MAIN COMPONENT ---

export const SignUpPage: React.FC<SignUpPageProps> = ({
  title = <span className="font-light text-foreground tracking-tighter">Criar Conta</span>,
  description = "Cadastre-se para começar a usar a plataforma",
  heroImageSrc,
  onSignUp,
  onGoogleSignUp,
  onSignIn,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row font-geist w-[100dvw] bg-[hsl(240_5.9%_13.3%)]">
      {/* Left column: sign-up form */}
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-semibold leading-tight text-white">{title}</h1>
            <p className="animate-element animate-delay-200 text-white/80">{description}</p>

            <form className="space-y-5" onSubmit={onSignUp}>
              <div className="animate-element animate-delay-300">
                <label className="text-sm font-medium text-white/90">Nome Completo</label>
                <GlassInputWrapper>
                  <input name="name" type="text" placeholder="Digite seu nome completo" className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-white placeholder-white/60" required />
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-400">
                <label className="text-sm font-medium text-white/90">Endereço de Email</label>
                <GlassInputWrapper>
                  <input name="email" type="email" placeholder="Digite seu endereço de email" className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-white placeholder-white/60" required />
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-500">
                <label className="text-sm font-medium text-white/90">Senha</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Digite sua senha" className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none text-white placeholder-white/60" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center">
                      {showPassword ? <EyeOff className="w-5 h-5 text-white/60 hover:text-white transition-colors" /> : <Eye className="w-5 h-5 text-white/60 hover:text-white transition-colors" />}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-600">
                <label className="text-sm font-medium text-white/90">Confirmar Senha</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirme sua senha" className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none text-white placeholder-white/60" required />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-3 flex items-center">
                      {showConfirmPassword ? <EyeOff className="w-5 h-5 text-white/60 hover:text-white transition-colors" /> : <Eye className="w-5 h-5 text-white/60 hover:text-white transition-colors" />}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-700 flex items-center text-sm">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="custom-checkbox" required />
                  <span className="text-white/90">Concordo com os termos de serviço</span>
                </label>
              </div>

              <button type="submit" className="animate-element animate-delay-800 w-full rounded-2xl bg-white/10 text-white py-4 font-medium hover:bg-white/20 transition-colors">
                Criar Conta
              </button>
            </form>

            <div className="animate-element animate-delay-900 relative flex items-center justify-center">
              <span className="w-full border-t border-border"></span>
              <span className="px-4 text-sm text-white/70 bg-[hsl(240_5.9%_13.3%)] absolute">Ou continue com</span>
            </div>

            <button onClick={onGoogleSignUp} className="animate-element animate-delay-1000 w-full flex items-center justify-center gap-3 border border-white/20 rounded-2xl py-4 hover:bg-white/10 text-white transition-colors">
                <GoogleIcon />
                Cadastrar com Google
            </button>

            <p className="animate-element animate-delay-[1100ms] text-center text-sm text-white/70">
              Já tem uma conta? <a href="#" onClick={(e) => { e.preventDefault(); onSignIn?.(); }} className="text-violet-300 hover:underline transition-colors">Entrar</a>
            </p>
          </div>
        </div>
      </section>

      {/* Right column: hero image with distortion */}
      {heroImageSrc && (
        <section className="hidden md:block flex-1 relative p-4">
          <div className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl overflow-hidden bg-cover bg-center">
            <GridDistortion imageSrc={heroImageSrc} />
          </div>
        </section>
      )}
    </div>
  );
};