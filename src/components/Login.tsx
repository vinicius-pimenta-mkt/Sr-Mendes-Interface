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
    // adicione outras propriedades do usuário se houver
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
        // Passa o objeto de usuário para a função onLogin
        onLogin(responseData.user);
      } else {
        const errorData = data as ErrorResponse;
        // Garante que o erro seja sempre uma string
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
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={logo} alt="Beleza Masculina Barbearia" className="h-20 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <Scissors className="h-6 w-6 text-amber-600" />
            Beleza Masculina Barbearia
          </CardTitle>
          <p className="text-gray-600">Painel Administrativo</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
                className="w-full"
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
