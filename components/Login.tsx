
import React, { useState } from 'react';
import { TrendingUp, Lock, ArrowRight, Building2, ShieldCheck } from 'lucide-react';
import { AuthSession } from '../types';

interface LoginProps {
  onLogin: (session: AuthSession) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !password) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    setIsLoading(true);
    
    // Simulação de autenticação (processamento local)
    setTimeout(() => {
      const session: AuthSession = {
        companyName,
        lastLogin: new Date().toISOString(),
        token: Math.random().toString(36).substr(2)
      };
      
      // Se estiver a registar, salvamos o nome da empresa nas configs
      if (isRegistering) {
        localStorage.setItem('ga_shop_config', JSON.stringify({
          name: companyName,
          phone: '',
          address: '',
          nif: '',
          currency: 'Kz'
        }));
      }

      onLogin(session);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-50"></div>

      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl shadow-blue-100 p-10 relative z-10 border border-white/50 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200 mb-6">
            <TrendingUp size={32} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Gestor Ágil</h1>
          <p className="text-slate-400 font-medium text-sm">
            {isRegistering ? 'Configure o acesso da sua empresa' : 'Inicie sessão para gerir o seu negócio'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
              <Building2 size={12} /> Nome da Empresa
            </label>
            <input 
              type="text"
              required
              className="w-full p-4 bg-slate-50 border-none ring-1 ring-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
              placeholder="Ex: Pastelaria Central"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2">
              <Lock size={12} /> Palavra-passe de Acesso
            </label>
            <input 
              type="password"
              required
              className="w-full p-4 bg-slate-50 border-none ring-1 ring-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                {isRegistering ? 'Criar Conta e Aceder' : 'Entrar no Sistema'}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-blue-600 font-bold text-sm hover:underline"
          >
            {isRegistering ? 'Já tenho uma conta. Iniciar sessão' : 'Ainda não tem conta? Começar agora'}
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-60">
           <ShieldCheck size={12} /> Dados Guardados Localmente
        </div>
      </div>
    </div>
  );
};

export default Login;
