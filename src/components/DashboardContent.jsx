import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Scissors, 
  Clock,
  CheckCircle,
  AlertCircle,
  User
} from 'lucide-react';
import logo from '../assets/logo.png';

const DashboardContent = () => {
  const [dashboardData, setDashboardData] = useState({
    atendimentosHoje: 0,
    receitaDia: 0,
    servicosRealizados: 0,
    servicosAguardando: 0,
    agendamentos: [],
    agoraHora: "00:00"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // Atualizar a cada 5 minutos para manter o dashboard sincronizado com a agenda em tempo real
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      // Endpoint original de relatorios que agora unifica dados históricos e futuros
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/relatorios/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        console.error('Erro na resposta:', response.status);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarHorario = (hora) => {
    return hora.substring(0, 5);
  };

  const formatarData = (dataStr) => {
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmado': return 'bg-green-100 text-green-800';
      case 'Pendente':   return 'bg-yellow-100 text-yellow-800';
      case 'Cancelado':  return 'bg-red-100 text-red-800';
      default:           return 'bg-gray-100 text-gray-800';
    }
  };

  const hojeStr = new Date().toISOString().split('T')[0];

  // Os agendamentos já vêm filtrados do backend (apenas futuros nas próximas 24h)
  const agendamentosLucas = dashboardData.agendamentos.filter(a => a.barber === 'Lucas');
  const agendamentosYuri = dashboardData.agendamentos.filter(a => a.barber === 'Yuri');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Title */}
      <div className="flex items-center space-x-4">
        <img src={logo} alt="Sr. Mendes Barbearia" className="h-12 w-auto" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Agenda em Tempo Real: Histórico de Hoje + Próximos Agendamentos</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-yellow-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Agendamentos</CardTitle>
            <Users className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{dashboardData.atendimentosHoje}</div>
            <p className="text-xs text-gray-500 mt-1">marcados para hoje</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Receita do Dia</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              R$ {Number(dashboardData.receitaDia || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">de 00:00 até agora (confirmados)</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Serviços Realizados</CardTitle>
            <CheckCircle className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{dashboardData.servicosRealizados}</div>
            <p className="text-xs text-gray-500 mt-1">concluídos (horário já passou)</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Aguardando</CardTitle>
            <Clock className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {dashboardData.servicosAguardando}
            </div>
            <p className="text-xs text-gray-500 mt-1">próximas 24h (futuros)</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid - Duas Tabelas Separadas (Somente Futuros da Agenda) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lucas - Tabela */}
        <Card className="shadow-sm">
          <CardHeader className="bg-yellow-50/50 border-b">
            <CardTitle className="flex items-center gap-2 text-lg text-yellow-800">
              <User className="h-5 w-5 text-yellow-600" />
              Próximos: Lucas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {agendamentosLucas.length > 0 ? (
                agendamentosLucas.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center font-bold">
                        {a.cliente_nome?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{a.cliente_nome}</p>
                        <p className="text-sm text-gray-500">{a.servico}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-lg">
                        {formatarHorario(a.hora)} 
                        <span className="text-[10px] text-gray-400 ml-1">({a.data === hojeStr ? 'Hoje' : formatarData(a.data)})</span>
                      </p>
                      <Badge className={`${getStatusColor(a.status)} font-normal text-[10px]`}>
                        {a.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">Nenhum agendamento futuro para o Lucas nas próximas 24h.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Yuri - Tabela */}
        <Card className="shadow-sm">
          <CardHeader className="bg-green-50/50 border-b">
            <CardTitle className="flex items-center gap-2 text-lg text-green-800">
              <User className="h-5 w-5 text-green-600" />
              Próximos: Yuri
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {agendamentosYuri.length > 0 ? (
                agendamentosYuri.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
                        {a.cliente_nome?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{a.cliente_nome}</p>
                        <p className="text-sm text-gray-500">{a.servico}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-lg">
                        {formatarHorario(a.hora)}
                        <span className="text-[10px] text-gray-400 ml-1">({a.data === hojeStr ? 'Hoje' : formatarData(a.data)})</span>
                      </p>
                      <Badge className={`${getStatusColor(a.status)} font-normal text-[10px]`}>
                        {a.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">Nenhum agendamento futuro para o Yuri nas próximas 24h.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardContent;
