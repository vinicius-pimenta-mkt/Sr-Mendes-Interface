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
import logo from '../assets/logo.png';

const DashboardContent = () => {
  const [dashboardData, setDashboardData] = useState({
    atendimentosHoje: 0,
    receitaDia: 0,
    proximosAgendamentos: 0,
    servicosRealizados: 0,
    agendamentos: [],
    servicos: []
  });
  const [agendamentosHoje, setAgendamentosHoje] = useState([]);
  const [servicosDoDia, setServicosDoDia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchAgendamentosHoje();
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
    }
  };

  const fetchAgendamentosHoje = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/agendamentos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const hoje = new Date().toISOString().split('T')[0];
        
        // Filtrar agendamentos de hoje
        const agendamentosDeHoje = data.filter(agendamento => 
          agendamento.data === hoje
        );
        
        // Ordenar por horário
        agendamentosDeHoje.sort((a, b) => a.hora.localeCompare(b.hora));
        
        setAgendamentosHoje(agendamentosDeHoje);
        
        // Calcular serviços do dia
        const servicosContagem = {};
        agendamentosDeHoje.forEach(agendamento => {
          if (agendamento.servico) {
            servicosContagem[agendamento.servico] = (servicosContagem[agendamento.servico] || 0) + 1;
          }
        });
        
        // Converter para array ordenado
        const servicosArray = Object.entries(servicosContagem)
          .map(([nome, quantidade]) => ({ nome, quantidade }))
          .sort((a, b) => b.quantidade - a.quantidade);
        
        setServicosDoDia(servicosArray);
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos de hoje:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarHorario = (hora) => {
    // Remove os segundos do horário (ex: "14:30:00" -> "14:30")
    return hora.substring(0, 5);
  };

  const formatarData = (data) => {
    // Converte data para formato brasileiro (ex: "2024-09-14" -> "14/09")
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}`;
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
      <div className="flex items-center space-x-4">
        <img src={logo} alt="Sr. Mendes Barbearia" className="h-12 w-auto" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Visão geral do dia - {new Date().toLocaleDateString('pt-BR')}</p>
        </div>
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
              {agendamentosHoje.filter(a => a.status === 'Confirmado').length}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              clientes confirmados
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
              R$ {(agendamentosHoje
                .filter(a => a.status === 'Confirmado' && a.preco)
                .reduce((total, a) => total + parseFloat(a.preco || 0), 0) / 100)
                .toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              {agendamentosHoje.filter(a => a.status !== 'Cancelado').length}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              para hoje
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Serviços do Dia
            </CardTitle>
            <Scissors className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {servicosDoDia.reduce((total, servico) => total + servico.quantidade, 0)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              serviços agendados
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
              {agendamentosHoje.length > 0 ? (
                agendamentosHoje
                  .filter(agendamento => agendamento.status !== 'Cancelado')
                  .slice(0, 5) // Mostrar apenas os próximos 5
                  .map((agendamento) => (
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
                        <p className="font-medium text-gray-900">
                          {formatarHorario(agendamento.hora)} 
                          <span className="font-light text-gray-500 ml-1">
                            ({formatarData(agendamento.data)})
                          </span>
                        </p>
                        <Badge className={`${getStatusColor(agendamento.status)} flex items-center gap-1 mt-1`}>
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

        {/* Serviços do Dia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Scissors className="h-5 w-5 text-purple-600" />
              Serviços do Dia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {servicosDoDia.length > 0 ? (
                servicosDoDia.map((servico, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 font-medium">{servico.nome}</span>
                    <span className="font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded-full text-sm">
                      {servico.quantidade}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Scissors className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhum serviço agendado para hoje</p>
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
