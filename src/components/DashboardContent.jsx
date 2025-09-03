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
  AlertCircle
} from 'lucide-react';

const DashboardContent = () => {
  const [dashboardData, setDashboardData] = useState({
    atendimentosHoje: 0,
    receitaDia: 0,
    proximosAgendamentos: 0,
    servicosRealizados: 0,
    agendamentos: [],
    servicos: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/relatorios/dashboard', {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmado':
        return 'bg-green-100 text-green-800';
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Confirmado':
        return <CheckCircle className="h-4 w-4" />;
      case 'Pendente':
        return <Clock className="h-4 w-4" />;
      case 'Cancelado':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do dia - {new Date().toLocaleDateString('pt-BR')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Atendimentos Hoje
            </CardTitle>
            <Users className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {dashboardData.atendimentosHoje}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              clientes atendidos
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Receita do Dia
            </CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              R$ {dashboardData.receitaDia?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              faturamento hoje
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Próximos Agendamentos
            </CardTitle>
            <Calendar className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {dashboardData.proximosAgendamentos}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              para hoje
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Serviços Realizados
            </CardTitle>
            <Scissors className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {dashboardData.servicosRealizados}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              serviços hoje
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Próximos Agendamentos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5 text-yellow-600" />
              Próximos Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.agendamentos?.length > 0 ? (
                dashboardData.agendamentos.map((agendamento) => (
                  <div key={agendamento.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-yellow-600 font-semibold text-sm">
                          {agendamento.cliente_nome?.charAt(0) || 'C'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{agendamento.cliente_nome}</p>
                        <p className="text-sm text-gray-600">{agendamento.servico}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{agendamento.hora}</p>
                      <Badge className={`${getStatusColor(agendamento.status)} flex items-center gap-1`}>
                        {getStatusIcon(agendamento.status)}
                        {agendamento.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">Nenhum agendamento para hoje</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Serviços Realizados Hoje */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Scissors className="h-5 w-5 text-purple-600" />
              Serviços Realizados Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.servicos?.length > 0 ? (
                dashboardData.servicos.map((servico, index) => (
                  <div key={index} className="flex justify-between items-center p-2 border-b border-gray-100 last:border-b-0">
                    <span className="text-gray-700">{servico.nome}</span>
                    <span className="font-semibold text-gray-900">{servico.quantidade}</span>
                  </div>
                ))
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 border-b border-gray-100">
                    <span className="text-gray-700">Barba</span>
                    <span className="font-semibold text-gray-900">3</span>
                  </div>
                  <div className="flex justify-between items-center p-2 border-b border-gray-100">
                    <span className="text-gray-700">Corte e Barba</span>
                    <span className="font-semibold text-gray-900">5</span>
                  </div>
                  <div className="flex justify-between items-center p-2 border-b border-gray-100">
                    <span className="text-gray-700">Corte</span>
                    <span className="font-semibold text-gray-900">2</span>
                  </div>
                  <div className="flex justify-between items-center p-2 border-b border-gray-100">
                    <span className="text-gray-700">Sobrancelha</span>
                    <span className="font-semibold text-gray-900">1</span>
                  </div>
                  <div className="flex justify-between items-center p-2 border-b border-gray-100">
                    <span className="text-gray-700">Corte e Sobrancelha</span>
                    <span className="font-semibold text-gray-900">1</span>
                  </div>
                  <div className="flex justify-between items-center p-2">
                    <span className="text-gray-700">Corte, Barba e Sobrancelha</span>
                    <span className="font-semibold text-gray-900">0</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardContent;

