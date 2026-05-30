import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Cell,
  PieChart,
  Pie
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Users,
  Download,
  Calendar,
  User,
  Scissors,
  CreditCard,
  DollarSign,
  Package 
} from "lucide-react";
import { format, subDays } from 'date-fns';

const Relatorios = ({ user }) => {
  const isYuri = user?.role === 'yuri';
  const [periodo, setPeriodo] = useState("mes");
  const [barber, setBarber] = useState(isYuri ? "Yuri" : "Geral");
  
  const [servicosMaisVendidos, setServicosMaisVendidos] = useState([]);
  const [receitaTempos, setReceitaTempos] = useState([]);
  const [frequenciaClientes, setFrequenciaClientes] = useState([]);
  const [agendamentosPeriodo, setAgendamentosPeriodo] = useState([]);
  const [byPayment, setByPayment] = useState([]);
  const [produtosVendidos, setProdutosVendidos] = useState([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        let apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/relatorios/resumo`;
        let params = `?periodo=${periodo}&barber=${barber}`;

        const today = format(new Date(), 'yyyy-MM-dd');
        const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

        if (periodo === 'hoje') {
          params = `?data_inicio=${today}&data_fim=${today}&barber=${barber}`;
        } else if (periodo === 'ontem') {
          params = `?data_inicio=${yesterday}&data_fim=${yesterday}&barber=${barber}`;
        }

        const response = await fetch(apiUrl + params, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setServicosMaisVendidos(Array.isArray(data.by_service) ? data.by_service : []);
          setReceitaTempos(Array.isArray(data.receita_detalhada) ? data.receita_detalhada : []);
          setAgendamentosPeriodo(Array.isArray(data.agendamentos) ? data.agendamentos : []);
          setByPayment(Array.isArray(data.by_payment) ? data.by_payment : []);
          setProdutosVendidos(Array.isArray(data.produtos_vendidos) ? data.produtos_vendidos : []);
          
          if (Array.isArray(data.top_clients)) {
            const clientesOrdenados = data.top_clients
              .map(c => ({
                nome: c.name,
                visitas: c.visits,
                gasto: c.spent
              }))
              .sort((a, b) => b.gasto - a.gasto);
            setFrequenciaClientes(clientesOrdenados);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar relatórios:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [periodo, barber]);

  const exportarRelatorio = () => {
    window.print();
  };

  const COLORS = ['#DEAE60', '#4CAF50', '#3b82f6', '#FF5722', '#9C27B0', '#00BCD4'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-neutral-900/95 backdrop-blur-md p-3 border-[0.5px] border-neutral-800 rounded-lg shadow-xl">
          <p className="font-black text-white mb-1 uppercase tracking-wider text-xs">{label || payload[0].payload.service || payload[0].payload.forma}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm flex items-center gap-2 font-bold" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {entry.name.includes('Receita') || entry.name.includes('Valor') || entry.name.includes('Gasto') ? `R$ ${entry.value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderTabelaServicos = (barbeiroNome, data) => {
    const filtrados = data.filter(s => barbeiroNome === 'Lucas' ? s.lucas_qty > 0 : s.yuri_qty > 0);
    
    return (
      <div className="space-y-3">
        <h3 className={`font-black text-xs uppercase tracking-widest flex items-center gap-2 p-2.5 rounded-lg border-[0.5px] ${barbeiroNome === 'Lucas' ? 'bg-[#DEAE60]/10 text-[#DEAE60] border-[#DEAE60]/20' : 'bg-green-900/20 text-green-400 border-green-900/30'}`}>
          <User className="h-4 w-4" /> {barbeiroNome}
        </h3>
        <div className="space-y-2">
          {filtrados.length > 0 ? (
            filtrados.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-neutral-950/50 border-[0.5px] border-neutral-800 rounded-lg hover:bg-white/5 transition-colors">
                <div>
                  <h4 className="font-bold text-sm text-neutral-200">{s.service}</h4>
                  <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-0.5">Quantidade: {barbeiroNome === 'Lucas' ? s.lucas_qty : s.yuri_qty}</p>
                </div>
                <div className="text-right">
                  <span className="font-black text-lg text-white">
                    {barbeiroNome === 'Lucas' ? s.lucas_qty : s.yuri_qty}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-neutral-600 py-4 text-sm font-bold uppercase tracking-widest">Sem serviços para {barbeiroNome}</p>
          )}
        </div>
      </div>
    );
  };

  // MATEMÁTICA ATUALIZADA: totalReceita agora soma apenas Serviços (O Backend já separou os produtos)
  const totalReceita = byPayment.reduce((acc, curr) => acc + curr.valor, 0);
  
  // A COMISSÃO AGORA É VISÍVEL PARA O YURI E PARA O ADMIN (Quando filtra pelo Yuri)
  const mostrarComissao = isYuri || barber === 'Yuri';
  const comissaoYuri = totalReceita * 0.45;
  
  // TOTAL DE PRODUTOS PARA O RODAPÉ DA TABELA
  const totalProdutos = produtosVendidos.reduce((acc, p) => acc + p.revenue, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DEAE60]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pt-8 sm:pt-4">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-md">Relatórios Profissionais</h1>
          <p className="text-neutral-400 text-sm font-medium mt-1">Análise detalhada de performance e faturamento</p>
        </div>
        <Button onClick={exportarRelatorio} className="bg-[#DEAE60] hover:bg-[#DEAE60]/90 text-neutral-950 font-black shadow-lg uppercase tracking-wider text-xs">
          <Download className="h-4 w-4 mr-2" /> Exportar PDF
        </Button>
      </div>

      {/* FILTROS SUPERIORES */}
      <div className={`grid grid-cols-1 ${!isYuri ? 'md:grid-cols-2' : ''} gap-4 no-print`}>
        <Card className="bg-neutral-900/60 border-[0.5px] border-neutral-800 backdrop-blur-md shadow-xl">
          <CardContent className="pt-6 flex items-center gap-4">
            <Calendar className="h-6 w-6 text-[#DEAE60]" />
            <div className="flex-1">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Período</label>
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger className="border-none shadow-none p-0 h-auto font-black text-white text-lg focus:ring-0 focus:ring-offset-0 bg-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-[0.5px] border-neutral-800 text-white">
                  <SelectItem value="hoje">Hoje</SelectItem>
                  <SelectItem value="ontem">Ontem</SelectItem>
                  <SelectItem value="semana">Última Semana</SelectItem>
                  <SelectItem value="mes">Último Mês</SelectItem>
                  <SelectItem value="ano">Último Ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        {!isYuri && (
          <Card className="bg-neutral-900/60 border-[0.5px] border-neutral-800 backdrop-blur-md shadow-xl">
            <CardContent className="pt-6 flex items-center gap-4">
              <User className="h-6 w-6 text-[#DEAE60]" />
              <div className="flex-1">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest ml-1">Barbeiro</label>
                <Select value={barber} onValueChange={setBarber}>
                  <SelectTrigger className="border-none shadow-none p-0 h-auto font-black text-white text-lg focus:ring-0 focus:ring-offset-0 bg-transparent">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-[0.5px] border-neutral-800 text-white">
                    <SelectItem value="Geral">Geral (Todos)</SelectItem>
                    <SelectItem value="Lucas">Lucas</SelectItem>
                    <SelectItem value="Yuri">Yuri</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs defaultValue="receita" className="space-y-6">
        <TabsList className="bg-neutral-900/80 border-[0.5px] border-neutral-800 p-1.5 rounded-xl no-print backdrop-blur-md h-auto">
          <TabsTrigger value="servicos" className="rounded-lg data-[state=active]:bg-[#DEAE60] data-[state=active]:text-neutral-950 text-neutral-400 font-bold uppercase tracking-widest text-[10px] py-2.5 px-4 transition-all">Serviços</TabsTrigger>
          <TabsTrigger value="receita" className="rounded-lg data-[state=active]:bg-[#DEAE60] data-[state=active]:text-neutral-950 text-neutral-400 font-bold uppercase tracking-widest text-[10px] py-2.5 px-4 transition-all">Faturamento</TabsTrigger>
          <TabsTrigger value="clientes" className="rounded-lg data-[state=active]:bg-[#DEAE60] data-[state=active]:text-neutral-950 text-neutral-400 font-bold uppercase tracking-widest text-[10px] py-2.5 px-4 transition-all">Clientes</TabsTrigger>
        </TabsList>

        {/* TABS DE SERVIÇOS */}
        <TabsContent value="servicos" className="space-y-6">
          <Card className="bg-neutral-900/60 border-[0.5px] border-neutral-800 backdrop-blur-md shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-white font-black uppercase tracking-tight">
                <BarChart3 className="h-5 w-5 text-[#DEAE60]" /> Desempenho por Serviço
              </CardTitle>
            </CardHeader>
            <CardContent>
              {servicosMaisVendidos.length > 0 ? (
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={servicosMaisVendidos} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                      <XAxis dataKey="service" tick={{ fill: '#737373', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#737373', fontSize: 11, fontWeight: 700 }} />
                      <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                      <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '12px', fontWeight: 'bold', color: '#fff'}} />
                      
                      {(barber === 'Geral' || barber === 'Lucas') && (
                        <Bar name="Lucas" dataKey="lucas_qty" fill="#DEAE60" radius={[4, 4, 0, 0]} barSize={barber === 'Geral' ? 30 : 50} />
                      )}
                      {(barber === 'Geral' || barber === 'Yuri') && (
                        <Bar name="Yuri" dataKey="yuri_qty" fill="#4CAF50" radius={[4, 4, 0, 0]} barSize={barber === 'Geral' ? 30 : 50} />
                      )}

                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[350px] flex flex-col items-center justify-center text-neutral-600">
                  <Scissors className="h-12 w-12 mb-2 opacity-30" />
                  <p className="font-bold uppercase tracking-widest text-xs">Sem dados para exibir o gráfico</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-neutral-900/60 border-[0.5px] border-neutral-800 backdrop-blur-md shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg text-white font-black uppercase tracking-tight">Detalhamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`grid grid-cols-1 ${!isYuri ? 'md:grid-cols-2' : ''} gap-8`}>
                {!isYuri && renderTabelaServicos('Lucas', servicosMaisVendidos)}
                {renderTabelaServicos('Yuri', servicosMaisVendidos)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TABS DE FATURAMENTO */}
        <TabsContent value="receita" className="space-y-6">
          <Card className="bg-neutral-900/60 border-[0.5px] border-neutral-800 backdrop-blur-md shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-white font-black uppercase tracking-tight">
                <TrendingUp className="h-5 w-5 text-green-500" /> Evolução da Receita de Serviços {periodo === 'hoje' ? '(Por Hora)' : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {receitaTempos.length > 0 ? (
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={receitaTempos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                      <XAxis dataKey="periodo" tick={{ fill: '#737373', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#737373', fontSize: 11, fontWeight: 700 }} tickFormatter={(val) => `R$${val}`} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
                      <Line 
                        type="monotone" 
                        dataKey="valor" 
                        stroke="#10b981" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#171717' }}
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#DEAE60' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[350px] flex flex-col items-center justify-center text-neutral-600 font-bold uppercase tracking-widest text-xs">
                  Nenhum faturamento registrado no período.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-neutral-900/60 border-[0.5px] border-neutral-800 backdrop-blur-md shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg text-white font-black uppercase tracking-tight">Resumo Financeiro (Serviços)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {byPayment.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-neutral-950/50 border-[0.5px] border-neutral-800 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shadow-md" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                        <span className="text-sm font-bold text-white uppercase tracking-wider">{p.forma}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-white text-base">R$ {p.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                        {p.quantidade > 0 && <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-0.5">{p.quantidade} serviços</p>}
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 mt-2 border-t-[0.5px] border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between p-4 bg-[#DEAE60]/10 rounded-xl border-[0.5px] border-[#DEAE60]/30 shadow-inner">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-[#DEAE60]" />
                        <span className="text-xs font-black text-[#DEAE60] uppercase tracking-widest">
                          TOTAL BRUTO (SERVIÇOS)
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-xl text-[#DEAE60]">R$ {totalReceita.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                      </div>
                    </div>

                    {/* CAIXINHA DA COMISSÃO APARECE PARA YURI E PARA O ADMIN (FILTRADO) */}
                    {mostrarComissao && (
                      <div className="flex items-center justify-between p-4 bg-green-900/20 rounded-xl border-[0.5px] border-green-900/50 shadow-inner">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-green-600 text-white border-none font-bold">45%</Badge>
                          <span className="text-xs font-black text-green-400 uppercase tracking-widest">COMISSÃO YURI LÍQUIDA</span>
                        </div>
                        <div className="text-right">
                          <p className="font-black text-xl text-green-400">R$ {comissaoYuri.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-neutral-900/60 border-[0.5px] border-neutral-800 backdrop-blur-md shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-white font-black uppercase tracking-tight">
                  <CreditCard className="h-5 w-5 text-blue-500" /> Pagamentos (Serviços)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {byPayment.length > 0 ? (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={byPayment}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="valor"
                          nameKey="forma"
                          stroke="none"
                        >
                          {byPayment.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{fontSize: '12px', fontWeight: 'bold', color: '#fff'}} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-center text-neutral-600 font-bold uppercase tracking-widest text-xs py-10">Sem dados de pagamento.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-neutral-900/60 border-[0.5px] border-neutral-800 backdrop-blur-md shadow-xl mt-6">
            <CardHeader className="bg-neutral-950/40 border-b-[0.5px] border-neutral-800">
              <CardTitle className="text-lg flex items-center gap-2 text-white font-black uppercase tracking-tight">
                <Package className="h-5 w-5 text-[#DEAE60]" /> Produtos Vendidos no Período
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {produtosVendidos.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] font-bold tracking-widest border-b-[0.5px] border-neutral-800">
                      <tr>
                        <th className="px-6 py-4">Produto</th>
                        <th className="px-6 py-4 text-center">Pagamento</th>
                        <th className="px-6 py-4 text-center">Unidades Vendidas</th>
                        <th className="px-6 py-4 text-right">Receita Gerada</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                      {produtosVendidos.map((p, i) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 font-bold text-white">{p.produto}</td>
                          <td className="px-6 py-4 text-center">
                            <Badge variant="secondary" className="bg-neutral-800 text-neutral-300 border-[0.5px] border-neutral-700 font-bold tracking-widest uppercase text-[9px]">{p.forma_pagamento}</Badge>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Badge variant="outline" className="bg-neutral-950 text-[#DEAE60] border-[0.5px] border-[#DEAE60]/30 font-black">{p.qty}</Badge>
                          </td>
                          <td className="px-6 py-4 text-right font-black text-green-400">
                            R$ {p.revenue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-[#DEAE60]/10 font-bold border-t-[0.5px] border-[#DEAE60]/30">
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-right text-[#DEAE60] text-xs uppercase tracking-widest">TOTAL EM VENDAS DE PRODUTOS:</td>
                        <td className="px-6 py-4 text-right text-[#DEAE60] text-lg font-black">
                          R$ {totalProdutos.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <p className="text-center text-neutral-600 font-bold uppercase tracking-widest text-xs py-8">Nenhum produto foi vendido neste período.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TABS DE CLIENTES */}
        <TabsContent value="clientes" className="space-y-6">
          <Card className="bg-neutral-900/60 border-[0.5px] border-neutral-800 backdrop-blur-md shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-white font-black uppercase tracking-tight">
                <Users className="h-5 w-5 text-[#DEAE60]" /> Top 10 Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {frequenciaClientes.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-neutral-950/50 border-[0.5px] border-neutral-800 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-neutral-950 border-[0.5px] border-[#DEAE60]/30 rounded-full flex items-center justify-center text-[#DEAE60] font-black shadow-inner">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="font-black text-white">{c.nome}</h4>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-0.5">{c.visitas} visitas no período</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Total Gasto</p>
                      <p className="text-xl font-black text-[#DEAE60]">R$ {c.gasto.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    </div>
                  </div>
                ))}
                {frequenciaClientes.length === 0 && (
                  <div className="text-center py-10 text-neutral-600 font-bold uppercase tracking-widest text-xs">Nenhum cliente registrado no período.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Relatorios;
