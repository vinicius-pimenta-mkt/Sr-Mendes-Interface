import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Scissors } from 'lucide-react';
import logobranca from '../assets/logobranca.png';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    nome: string;
    username: string;
  };
}

interface ErrorResponse {
  error: string | { message: string };
}

const Login = ({ onLogin }: { onLogin: (user: LoginResponse['user']) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data: LoginResponse | ErrorResponse = await response.json();

      if (response.ok) {
        const responseData = data as LoginResponse;
        localStorage.setItem('token', responseData.token);
        onLogin(responseData.user);
      } else {
        const errorData = data as ErrorResponse;
        const errorMessage = typeof errorData.error === 'object' 
          ? errorData.error.message 
          : errorData.error;
        setError(errorMessage || 'Erro ao fazer login');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor. Verifique sua rede.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center relative p-4 sm:p-6 bg-neutral-950">
      <img src="/fundologin.png" className="absolute inset-0 w-full h-full object-cover z-0 opacity-40" alt="Fundo" />
      <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-[3px] z-10" />

      <Card className="w-full max-w-[400px] shadow-2xl z-20 bg-neutral-900/90 border-[0.5px] border-neutral-800 backdrop-blur-md overflow-hidden rounded-xl">
        <CardHeader className="text-center space-y-4 pt-8 pb-4">
          <div className="flex justify-center mb-2">
            <div className="p-3">
              <img src={logobranca} alt="Beleza Masculina" className="h-20 sm:h-24 w-auto object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]" />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl sm:text-2xl font-black text-white uppercase flex items-center justify-center gap-2 tracking-tight">
              <Scissors className="h-5 w-5 text-[#DEAE60]" />
              Beleza Masculina
            </CardTitle>
            <p className="text-xs font-bold text-[#DEAE60] uppercase tracking-widest">Painel Administrativo</p>
          </div>
        </CardHeader>
        <CardContent className="px-6 sm:px-8 pb-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Usuário</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                required
                className="w-full h-11 bg-neutral-950 border-[0.5px] border-neutral-800 text-white placeholder:text-neutral-600 focus-visible:ring-[#DEAE60] focus-visible:border-[#DEAE60] rounded-xl transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
                className="w-full h-11 bg-neutral-950 border-[0.5px] border-neutral-800 text-white placeholder:text-neutral-600 focus-visible:ring-[#DEAE60] focus-visible:border-[#DEAE60] rounded-xl transition-all"
              />
            </div>
            
            {error && (
              <Alert variant="destructive" className="bg-red-950/30 border border-red-900/30 text-red-400 rounded-xl py-3">
                <AlertDescription className="text-xs font-bold text-center">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-[#DEAE60] hover:bg-[#DEAE60]/90 text-neutral-950 font-black rounded-xl shadow-xl uppercase tracking-tighter transition-all active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-neutral-950/30 border-t-neutral-950 rounded-full animate-spin" />
                  <span>Entrando...</span>
                </div>
              ) : 'Entrar no Painel'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
