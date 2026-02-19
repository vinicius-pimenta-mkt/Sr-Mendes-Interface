import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Scissors } from 'lucide-react';
import logo from '../assets/logo.png';

// Definindo a interface para os dados da API para melhor tipagem
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
    <div className="min-h-[100dvh] bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-[400px] shadow-2xl border-none overflow-hidden">
        <CardHeader className="text-center space-y-4 pt-8 pb-4">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-amber-100">
              <img src={logo} alt="Sr. Mendes Barbearia" className="h-16 sm:h-20 w-auto object-contain" />
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center justify-center gap-2 tracking-tight">
              <Scissors className="h-6 w-6 text-amber-600" />
              SR. MENDES
            </CardTitle>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Painel Administrativo</p>
          </div>
        </CardHeader>
        <CardContent className="px-6 sm:px-8 pb-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-xs font-bold text-gray-700 uppercase ml-1">Usuário</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                required
                className="w-full h-12 bg-gray-50 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-bold text-gray-700 uppercase ml-1">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
                className="w-full h-12 bg-gray-50 border-gray-200 focus:border-amber-500 focus:ring-amber-500 rounded-xl transition-all"
              />
            </div>
            
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 rounded-xl py-3">
                <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-lg shadow-amber-200 transition-all active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
