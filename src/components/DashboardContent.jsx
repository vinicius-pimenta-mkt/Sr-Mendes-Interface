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
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/relatorios/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmado': return 'bg-green-100 text-green-800';
      case 'Pendente':   return 'bg-yellow-100 text-yellow-800';
      case 'Cancelado':  return 'bg-red-100 text-red-800';
      default:           return 'bg-gray-100 text-gray-800';
    }
  };

  // Filtragem inteligente: Somente agendamentos a partir da hora atual (Futuros)
  const agendamentosFuturos = dashboardData.agendamentos.filter(a => a.status !== 'Cancelado' && a.hora >= dashboardData.agoraHora);
  
  const agendamentosLucas = agendamentosFuturos.filter(a => a.barber === 'Lucas');
  const agendamentosYuri = agendamentosFuturos.filter(a => a.barber === 'Yuri');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <img src={logo} alt="Sr. Mendes Barbearia" className="h-12 w-auto" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral de hoje - {new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-yellow-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 uppercase font-bold">Total Hoje</CardTitle>
            <Users className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{dashboardData.atendimentosHoje}</div>
            <p className="text-xs text-gray-500 mt-1">agendamentos marcados</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 uppercase font-bold">Receita Realizada</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              R$ {Number(dashboardData.receitaDia || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">serviços já passados</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 uppercase font-bold">Realizados</CardTitle>
            <CheckCircle className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{dashboardData.servicosRealizados}</div>
            <p className="text-xs text-gray-500 mt-1">horário anterior a agora</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 uppercase font-bold">Aguardando</CardTitle>
            <Clock className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{dashboardData.servicosAguardando}</div>
            <p className="text-xs text-gray-500 mt-1">próximos do dia</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-lg border-none overflow-hidden">
          <CardHeader className="bg-amber-500 text-white p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl font-black uppercase">
                <User className="h-6 w-6" /> Próximos: Lucas
              </CardTitle>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
                {agendamentosLucas.length} Pendentes
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {agendamentosLucas.length > 0 ? (
                agendamentosLucas.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-4 hover:bg-amber-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center font-bold uppercase">
                        {a.cliente_nome?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{a.cliente_nome}</p>
                        <p className="text-xs text-gray-500 uppercase font-bold">{a.servico}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-amber-600 text-lg">{formatarHorario(a.hora)}</p>
                      <Badge className={`${getStatusColor(a.status)} font-bold text-[10px] uppercase`}>
                        {a.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-400 italic font-medium">Nenhum agendamento futuro para Lucas hoje.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none overflow-hidden">
          <CardHeader className="bg-green-600 text-white p-6">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-xl font-black uppercase">
                <User className="h-6 w-6" /> Próximos: Yuri
              </CardTitle>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
                {agendamentosYuri.length} Pendentes
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {agendamentosYuri.length > 0 ? (
                agendamentosYuri.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-4 hover:bg-green-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold uppercase">
                        {a.cliente_nome?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{a.cliente_nome}</p>
                        <p className="text-xs text-gray-500 uppercase font-bold">{a.servico}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-green-600 text-lg">{formatarHorario(a.hora)}</p>
                      <Badge className={`${getStatusColor(a.status)} font-bold text-[10px] uppercase`}>
                        {a.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-400 italic font-medium">Nenhum agendamento futuro para Yuri hoje.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardContent;
