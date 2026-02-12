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
  PieChart as PieChartIcon
} from "lucide-react";
import { format, subDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Relatorios = () => {
  const [periodo, setPeriodo] = useState("mes");
  const [barber, setBarber] = useState("Geral");
  const [servicosMaisVendidos, setServicosMaisVendidos] = useState([]);
  const [receitaTempos, setReceitaTempos] = useState([]);
  const [frequenciaClientes, setFrequenciaClientes] = useState([]);
  const [agendamentosPeriodo, setAgendamentosPeriodo] = useState([]);
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
          if (Array.isArray(data.top_clients)) {
            setFrequenciaClientes(
              data.top_clients.map(c => ({
                nome: c.name,
                visitas: c.visits,
                gasto: c.spent
              }))
            );
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

  const COLORS = ['#FFD700', '#4CAF50', '#2196F3', '#FF5722', '#9C27B0', '#00BCD4'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-gray-900 mb-1">{label || payload[0].payload.service}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm flex items-center gap-2" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {entry.name.includes('Receita') ? `R$ ${entry.value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : entry.value}
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
        <h3 className={`font-bold text-sm flex items-center gap-2 p-2 rounded ${barbeiroNome === 'Lucas' ? 'bg-yellow-50 text-yellow-800' : 'bg-green-50 text-green-800'}`}>
          <User className="h-4 w-4" /> {barbeiroNome}
        </h3>
        <div className="space-y-2">
          {filtrados.length > 0 ? (
            filtrados.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="font-medium text-sm">{s.service}</h4>
                  <p className="text-[10px] text-gray-500">Quantidade: {barbeiroNome === 'Lucas' ? s.lucas_qty : s.yuri_qty}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sm text-gray-900">
                    {barbeiroNome === 'Lucas' ? s.lucas_qty : s.yuri_qty}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 py-4 text-sm italic">Sem serviços para {barbeiroNome}</p>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios Profissionais</h1>
          <p className="text-gray-600">Análise detalhada de performance e faturamento</p>
        </div>
        <Button onClick={exportarRelatorio} variant="outline" className="bg-amber-600 hover:bg-amber-700 text-white border-none">
          <Download className="h-4 w-4 mr-2" /> Exportar PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardContent className="pt-6 flex items-center gap-4">
            <Calendar className="h-5 w-5 text-amber-600" />
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Período</label>
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger className="border-none shadow-none p-0 h-auto font-semibold focus:ring-0"><SelectValue /></SelectTrigger>
                <SelectContent>
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
        <Card className="shadow-sm">
          <CardContent className="pt-6 flex items-center gap-4">
            <User className="h-5 w-5 text-amber-600" />
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Barbeiro</label>
              <Select value={barber} onValueChange={setBarber}>
                <SelectTrigger className="border-none shadow-none p-0 h-auto font-semibold focus:ring-0"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Geral">Geral (Todos)</SelectItem>
                  <SelectItem value="Lucas">Lucas</SelectItem>
                  <SelectItem value="Yuri">Yuri</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="servicos" className="space-y-6">
        <TabsList className="bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="servicos" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Serviços</TabsTrigger>
          <TabsTrigger value="receita" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Faturamento</TabsTrigger>
          <TabsTrigger value="clientes" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="servicos" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-amber-600" /> Desempenho por Serviço
                </CardTitle>
              </CardHeader>
              <CardContent>
                {servicosMaisVendidos.length > 0 ? (
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={servicosMaisVendidos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="service" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8f8f8'}} />
                        <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                        {barber === 'Geral' ? (
                          <>
                            <Bar name="Lucas" dataKey="lucas_qty" fill="#FFD700" radius={[4, 4, 0, 0]} barSize={30} />
                            <Bar name="Yuri" dataKey="yuri_qty" fill="#4CAF50" radius={[4, 4, 0, 0]} barSize={30} />
                          </>
                        ) : (
                          <Bar name={barber} dataKey="total_qty" fill={barber === 'Lucas' ? '#FFD700' : '#4CAF50'} radius={[4, 4, 0, 0]} barSize={50} />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[350px] flex flex-col items-center justify-center text-gray-400">
                    <Scissors className="h-12 w-12 mb-2 opacity-20" />
                    <p>Sem dados para exibir o gráfico</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-amber-600" /> Distribuição
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={servicosMaisVendidos}
                        dataKey="total_qty"
                        nameKey="service"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                      >
                        {servicosMaisVendidos.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {servicosMaisVendidos.slice(0, 3).map((s, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                        <span className="text-gray-600">{s.service}</span>
                      </div>
                      <span className="font-bold">{((s.total_qty / servicosMaisVendidos.reduce((acc, curr) => acc + curr.total_qty, 0)) * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Detalhamento por Barbeiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {(barber === 'Geral' || barber === 'Lucas') && renderTabelaServicos('Lucas', servicosMaisVendidos)}
                {(barber === 'Geral' || barber === 'Yuri') && renderTabelaServicos('Yuri', servicosMaisVendidos)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receita" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-green-600" /> Evolução da Receita
              </CardTitle>
            </CardHeader>
            <CardContent>
              {receitaTempos.length > 0 ? (
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={receitaTempos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="periodo" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={(val) => `R$${val}`} />
                      <Tooltip 
                        formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`, 'Receita']}
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="valor" 
                        stroke="#10b981" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        animationDuration={1500}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[350px] flex flex-col items-center justify-center text-gray-400 italic">
                  Nenhum faturamento registrado no período selecionado.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b">
              <CardTitle className="text-lg">Histórico de Receitas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-4 font-bold">Cliente</th>
                      <th className="px-6 py-4 font-bold">Serviço</th>
                      <th className="px-6 py-4 font-bold">Data/Hora</th>
                      <th className="px-6 py-4 font-bold">Barbeiro</th>
                      <th className="px-6 py-4 font-bold text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {agendamentosPeriodo.length > 0 ? (
                      agendamentosPeriodo.map((a, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900">{a.cliente_nome}</td>
                          <td className="px-6 py-4 text-gray-600">{a.servico}</td>
                          <td className="px-6 py-4 text-gray-500">{format(parseISO(a.data), 'dd/MM/yyyy')} - {a.hora.substring(0, 5)}</td>
                          <td className="px-6 py-4">
                            <Badge className={`${a.barber === 'Yuri' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} border-none font-normal`}>
                              {a.barber}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-gray-900">
                            R$ {(a.preco / 100).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">Nenhum serviço prestado no período selecionado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clientes" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" /> Top Clientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {frequenciaClientes.length > 0 ? (
                    frequenciaClientes.map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                            {i + 1}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{c.nome}</p>
                            <p className="text-xs text-gray-500">{c.visitas} visitas realizadas</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">R$ {c.gasto.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total Gasto</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-8">Nenhum dado de cliente disponível.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm bg-amber-600 text-white border-none">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">Resumo Geral</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-amber-100 text-xs font-bold uppercase">Total de Serviços</p>
                  <p className="text-4xl font-bold">{servicosMaisVendidos.reduce((acc, curr) => acc + curr.total_qty, 0)}</p>
                </div>
                <div>
                  <p className="text-amber-100 text-xs font-bold uppercase">Receita Total Bruta</p>
                  <p className="text-4xl font-bold">R$ {servicosMaisVendidos.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                </div>
                <div className="pt-4 border-t border-amber-500">
                  <p className="text-amber-100 text-[10px] italic">Relatório gerado em {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Relatorios;
