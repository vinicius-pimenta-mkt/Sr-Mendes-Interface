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
// IMPORTAÇÃO DA LOGO BRANCA
import logobranca from '../assets/logobranca.png';

const DashboardContent = () => {
  const [dashboardData, setDashboardData] = useState({
    atendimentosHoje: 0,
    receitaDia: 0,
    servicosRealizados: 0,
    pendentesFuturos: 0,
    agendamentos: [],
    agoraHora: "00:00"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      // MANTÉM SUA ROTA ORIGINAL INTACTA
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
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatarPreco = (valor) => {
    const num = Number(valor);
    if (isNaN(num)) return 'R$ 0,00';
    return (num / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatarData = (dataStr) => {
    if (!dataStr) return '';
    const partes = dataStr.split('-');
    if (partes.length !== 3) return dataStr;
    return `${partes[2]}/${partes[1]}`;
  };

  const formatarHorario = (horaStr) => {
    if (!horaStr) return '';
    return horaStr.substring(0, 5);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmado': return 'bg-green-950/50 text-green-400 border-[0.5px] border-green-900/50';
      case 'Pendente': return 'bg-yellow-950/50 text-yellow-400 border-[0.5px] border-yellow-900/50';
      case 'Cancelado': return 'bg-red-950/50 text-red-400 border-[0.5px] border-red-900/50';
      default: return 'bg-neutral-800 text-neutral-400 border-[0.5px] border-neutral-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DEAE60]"></div>
      </div>
    );
  }

  const hojeStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pt-8 lg:pt-4">
      
      {/* CABEÇALHO COM LOGO BRANCA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-neutral-900/60 backdrop-blur-md p-6 rounded-xl border-[0.5px] border-neutral-800/80 shadow-xl gap-4">
        <div className="flex items-center gap-4">
          <img src={logobranca} alt="Logo" className="h-16 w-auto object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter">Painel de Controle</h1>
            <p className="text-neutral-400 text-sm font-medium mt-0.5">Visão geral e desempenho do seu negócio</p>
          </div>
        </div>
        <div className="bg-neutral-950/80 border-[0.5px] border-neutral-800 px-4 py-2 rounded-xl text-center sm:text-right w-full sm:w-auto">
          <p className="text-[10px] font-bold text-[#DEAE60] uppercase tracking-widest">Hora Atual do Sistema</p>
          <p className="text-2xl font-black text-white tracking-tight mt-0.5">{dashboardData.agoraHora || "00:00"}</p>
        </div>
      </div>

      {/* QUADRADO DE STATS REESTRUTURADOS EM TEMA DARK */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="bg-neutral-900/60 border-[0.5px] border-neutral-800 backdrop-blur-md shadow-xl rounded-xl overflow-hidden">
          <CardContent className="p-4 sm:p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Atendimentos Hoje</p>
              <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">{dashboardData.atendimentosHoje || 0}</p>
            </div>
            <div className="p-2 sm:p-3 bg-neutral-950 rounded-xl border-[0.5px] border-neutral-800 text-[#DEAE60]"><Calendar className="h-5 w-5" /></div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900/60 border-[0.5px] border-neutral-800 backdrop-blur-md shadow-xl rounded-xl overflow-hidden">
          <CardContent className="p-4 sm:p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Receita do Dia</p>
              <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">{formatarPreco(dashboardData.receitaDia)}</p>
            </div>
            <div className="p-2 sm:p-3 bg-neutral-950 rounded-xl border-[0.5px] border-neutral-800 text-green-400"><DollarSign className="h-5 w-5" /></div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900/60 border-[0.5px] border-neutral-800 backdrop-blur-md shadow-xl rounded-xl overflow-hidden">
          <CardContent className="p-4 sm:p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Serviços Feitos</p>
              <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">{dashboardData.servicosRealizados || 0}</p>
            </div>
            <div className="p-2 sm:p-3 bg-neutral-950 rounded-xl border-[0.5px] border-neutral-800 text-[#DEAE60]"><Scissors className="h-5 w-5" /></div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900/60 border-[0.5px] border-neutral-800 backdrop-blur-md shadow-xl rounded-xl overflow-hidden">
          <CardContent className="p-4 sm:p-6 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Agendados (24h)</p>
              <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">{dashboardData.pendentesFuturos || 0}</p>
            </div>
            <div className="p-2 sm:p-3 bg-neutral-950 rounded-xl border-[0.5px] border-neutral-800 text-yellow-400"><Clock className="h-5 w-5" /></div>
          </CardContent>
        </Card>
      </div>

      {/* LISTAGEM DOS PRÓXIMOS REGISTROS */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-neutral-900/60 border-[0.5px] border-neutral-800 backdrop-blur-md shadow-xl rounded-xl overflow-hidden">
          <CardHeader className="border-b border-neutral-800 bg-neutral-950/30 px-6 py-4">
            <CardTitle className="text-lg text-white font-bold uppercase tracking-tight flex items-center gap-2">
              <Users className="h-5 w-5 text-[#DEAE60]" />
              Próximos Atendimentos (Próximas 24 horas)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-neutral-800">
              {dashboardData.agendamentos && dashboardData.agendamentos.length > 0 ? (
                dashboardData.agendamentos.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-neutral-950 text-[#DEAE60] border-[0.5px] border-neutral-800 rounded-full flex items-center justify-center font-black uppercase text-sm">
                        {a.cliente_nome?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <p className="font-bold text-neutral-100 text-sm sm:text-base">{a.cliente_nome}</p>
                        <p className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5">
                          <Scissors className="h-3 w-3 text-[#DEAE60]" /> {a.servico}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-black text-white text-base sm:text-lg tracking-tight">
                        {formatarHorario(a.hora)}
                        <span className="text-[10px] text-neutral-500 font-bold ml-1.5 uppercase tracking-wide">
                          ({a.data === hojeStr ? 'Hoje' : formatarData(a.data)})
                        </span>
                      </p>
                      <Badge variant="outline" className={`${getStatusColor(a.status)} text-[9px] uppercase font-bold tracking-widest px-2 py-0.5`}>
                        {a.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-neutral-500 italic font-medium">Nenhum agendamento futuro nas próximas 24h.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardContent;
