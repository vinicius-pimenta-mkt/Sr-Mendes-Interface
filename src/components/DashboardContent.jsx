import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, Clock, CheckCircle, User } from 'lucide-react';
import logobranca from '../assets/logobranca.png';

const DashboardContent = ({ user }) => {
  // LÓGICA DE PERMISSÕES
  const isYuri = user?.role === 'yuri'; 
  const isLucas = !isYuri; // Admin / Lucas

  const [dashboardData, setDashboardData] = useState({
    atendimentosHoje: 0, receitaDia: 0, servicosRealizados: 0, pendentesFuturos: 0, agendamentos: [], agoraHora: "00:00"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      let endpoint = 'relatorios';
      if (isYuri) endpoint = 'relatorios-yuri';

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/${endpoint}/dashboard`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.agendamentos) {
          data.agendamentos = data.agendamentos.map(a => ({
            ...a,
            barber: a.barber || (isYuri ? 'Yuri' : 'Lucas')
          }));
        }
        setDashboardData(data);
      }
    } catch (error) { 
      console.error('Erro ao carregar dados:', error); 
    } finally { 
      setLoading(false); 
    }
  };

  const formatarHorario = (hora) => hora?.substring(0, 5) || "";
  const formatarData = (dataStr) => { if (!dataStr) return ""; const [, mes, dia] = dataStr.split('-'); return `${dia}/${mes}`; };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmado': return 'bg-green-950/50 text-green-400 border-green-900/50';
      case 'Pendente':   return 'bg-yellow-950/50 text-yellow-400 border-yellow-900/50';
      case 'Cancelado':  return 'bg-red-950/50 text-red-400 border-red-900/50';
      default:           return 'bg-neutral-800 text-neutral-400 border-neutral-700';
    }
  };

  const hojeStr = new Date().toISOString().split('T')[0];
  
  const agendamentosLucasLista = dashboardData.agendamentos.filter(a => a.barber === 'Lucas' && a.status !== 'Bloqueado');
  const agendamentosYuriLista = dashboardData.agendamentos.filter(a => a.barber === 'Yuri' && a.status !== 'Bloqueado');

  const cards = [
    { title: 'Agendamentos', value: dashboardData.atendimentosHoje, icon: Users, color: 'text-[#DEAE60]', label: 'marcados para hoje' },
    { title: 'Receita do Dia', value: `R$ ${Number(dashboardData.receitaDia || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-green-500', label: 'faturamento confirmado' },
    { title: 'Realizados', value: dashboardData.servicosRealizados, icon: CheckCircle, color: 'text-blue-500', label: 'concluídos hoje' },
    { title: 'Pendentes', value: dashboardData.pendentesFuturos, icon: Clock, color: 'text-amber-500', label: 'próximas horas' },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DEAE60] mx-auto"></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pt-8 sm:pt-4">
      <div className="flex items-center space-x-4 mb-6">
        <img src={logobranca} alt="Beleza Masculina" className="h-12 w-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />
        <div>
          <h1 className="text-3xl font-bold text-white uppercase tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Painel de Controle</h1>
          <p className="text-neutral-200 text-sm font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] mt-1">
            {isLucas ? 'Gestão Geral' : 'Gestão Pessoal - Yuri'} | {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => (
          <Card key={idx} className="bg-neutral-900/60 border-neutral-800 backdrop-blur-md shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[11px] font-semibold text-neutral-400 uppercase tracking-widest">{card.title}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{card.value}</div>
              <p className="text-xs text-neutral-500 mt-1">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* RENDERIZAÇÃO EM COLUNAS LADO A LADO PARA DESKTOP */}
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        
        {/* CARD DO LUCAS */}
        {isLucas && (
          <Card className="bg-neutral-900/60 border-neutral-800 backdrop-blur-md shadow-xl overflow-hidden flex-1 w-full">
            <CardHeader className="border-b border-neutral-800 bg-neutral-900/40">
              <CardTitle className="flex items-center gap-2 text-lg text-white font-semibold uppercase tracking-tight">
                <User className="h-5 w-5 text-[#DEAE60]" /> Próximos: Lucas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-neutral-800">
                {agendamentosLucasLista.length > 0 ? agendamentosLucasLista.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-neutral-950 text-[#DEAE60] rounded-full flex items-center justify-center font-bold border border-[#DEAE60]/30 shadow-inner">{a.cliente_nome?.charAt(0).toUpperCase()}</div>
                      <div><p className="font-semibold text-neutral-100">{a.cliente_nome}</p><p className="text-xs text-neutral-400">{a.servico}</p></div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="font-bold text-white text-lg">{formatarHorario(a.hora)} <span className="text-[10px] text-neutral-500 ml-1 font-normal">({a.data === hojeStr ? 'Hoje' : formatarData(a.data)})</span></p>
                      <Badge variant="outline" className={`${getStatusColor(a.status)} text-[9px] mt-1 uppercase font-medium`}>{a.status}</Badge>
                    </div>
                  </div>
                )) : <div className="p-8 text-center text-neutral-500 text-sm italic">Nenhum agendamento para hoje.</div>}
              </div>
            </CardContent>
          </Card>
        )}

        {/* CARD DO YURI */}
        {(isLucas || isYuri) && (
          <Card className="bg-neutral-900/60 border-neutral-800 backdrop-blur-md shadow-xl overflow-hidden flex-1 w-full">
            <CardHeader className="border-b border-neutral-800 bg-neutral-900/40">
              <CardTitle className="flex items-center gap-2 text-lg text-white font-semibold uppercase tracking-tight">
                <User className="h-5 w-5 text-neutral-400" /> Próximos: Yuri
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-neutral-800">
                {agendamentosYuriLista.length > 0 ? agendamentosYuriLista.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-neutral-950 text-neutral-300 rounded-full flex items-center justify-center font-bold border border-neutral-700 shadow-inner">{a.cliente_nome?.charAt(0).toUpperCase()}</div>
                      <div><p className="font-semibold text-neutral-100">{a.cliente_nome}</p><p className="text-xs text-neutral-400">{a.servico}</p></div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="font-bold text-white text-lg">{formatarHorario(a.hora)} <span className="text-[10px] text-neutral-500 ml-1 font-normal">({a.data === hojeStr ? 'Hoje' : formatarData(a.data)})</span></p>
                      <Badge variant="outline" className={`${getStatusColor(a.status)} text-[9px] mt-1 uppercase font-medium`}>{a.status}</Badge>
                    </div>
                  </div>
                )) : <div className="p-8 text-center text-neutral-500 text-sm italic">Nenhum agendamento para hoje.</div>}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
};

export default DashboardContent;
