import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  PieChart as PieChartIcon,
  CreditCard,
  DollarSign
} from "lucide-react";
import { format, subDays } from 'date-fns';

const Relatorios = () => {
  const [periodo, setPeriodo] = useState("mes");
  const [barber, setBarber] = useState("Geral");
  const [servicosMaisVendidos, setServicosMaisVendidos] = useState([]);
  const [receitaTempos, setReceitaTempos] = useState([]);
  const [frequenciaClientes, setFrequenciaClientes] = useState([]);
  const [agendamentosPeriodo, setAgendamentosPeriodo] = useState([]);
  const [byPayment, setByPayment] = useState([]);
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
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setServicosMaisVendidos(Array.isArray(data.by_service) ? data.by_service : []);
          setReceitaTempos(Array.isArray(data.receita_detalhada) ? data.receita_detalhada : []);
          setAgendamentosPeriodo(Array.isArray(data.agendamentos) ? data.agendamentos : []);
          setByPayment(Array.isArray(data.by_payment) ? data.by_payment : []);
          setFrequenciaClientes(Array.isArray(data.top_clients) ? data.top_clients : []);
        }
      } catch (err) {
        console.error("Erro ao buscar relatórios:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [periodo, barber]);

  const exportarRelatorio = () => window.print();

  const COLORS = ['#FFD700', '#4CAF50', '#2196F3', '#FF5722', '#9C27B0', '#00BCD4'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-gray-900 mb-1">{label || payload[0].payload.service || payload[0].payload.forma}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm flex items-center gap-2" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {entry.name.includes('Receita') || entry.name.includes('Valor') ? `R$ ${entry.value.toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const totalFaturamento = byPayment.reduce((acc, curr) => acc + curr.valor, 0);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 no-print">
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
        <TabsList className="bg-gray-100 p-1 rounded-xl no-print">
          <TabsTrigger value="servicos" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Serviços</TabsTrigger>
          <TabsTrigger value="receita" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Faturamento</TabsTrigger>
          <TabsTrigger value="clientes" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="servicos" className="space-y-6">
          <Card className="shadow-sm">
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
        </TabsContent>

        <TabsContent value="receita" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-green-600" /> Evolução da Receita {periodo === 'hoje' ? '(Por Hora)' : ''}
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
                      <Line type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[350px] flex flex-col items-center justify-center text-gray-400 italic">Sem faturamento no período.</div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader><CardTitle className="text-lg">Resumo Financeiro</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {byPayment.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">{p.forma}</span>
                      <div className="text-right">
                        <p className="font-bold text-sm">R$ {p.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                        <p className="text-[10px] text-gray-500">{p.quantidade} serviços</p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t flex items-center justify-between">
                    <span className="font-bold text-gray-900">FATURAMENTO TOTAL</span>
                    <span className="font-black text-lg text-green-600">R$ {totalFaturamento.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clientes" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Users className="h-5 w-5 text-amber-600" /> Top 10 Clientes (Por Gasto)</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {frequenciaClientes.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold">{i + 1}</div>
                      <div>
                        <h4 className="font-bold text-gray-900">{c.name}</h4>
                        <p className="text-xs text-gray-500">{c.visits} visitas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-amber-600">R$ {c.spent.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Relatorios;
