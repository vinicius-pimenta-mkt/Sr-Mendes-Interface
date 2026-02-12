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
  Legend
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Users,
  Download,
  Calendar,
  User
} from "lucide-react";
import { format, subDays } from 'date-fns';
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
                ultimaVisita: c.last_visit,
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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{payload[0].payload.service}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Análise de desempenho e estatísticas da barbearia</p>
        </div>
        <Button
          onClick={exportarRelatorio}
          variant="outline"
          className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <Calendar className="h-5 w-5 text-amber-600" />
            <label className="text-sm font-medium text-gray-700">Período:</label>
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="ontem">Ontem</SelectItem>
                <SelectItem value="semana">Última Semana</SelectItem>
                <SelectItem value="mes">Último Mês</SelectItem>
                <SelectItem value="ano">Último Ano</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <User className="h-5 w-5 text-amber-600" />
            <label className="text-sm font-medium text-gray-700">Barbeiro:</label>
            <Select value={barber} onValueChange={setBarber}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Geral">Geral</SelectItem>
                <SelectItem value="Lucas">Lucas</SelectItem>
                <SelectItem value="Yuri">Yuri</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="servicos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="servicos">Serviços</TabsTrigger>
          <TabsTrigger value="receita">Receita</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="servicos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <BarChart3 className="h-5 w-5 text-amber-600" />
                Serviços
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={servicosMaisVendidos} margin={{ left: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="service" type="category" tick={{ fontSize: 12 }} width={100} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {barber === 'Geral' ? (
                      <>
                        <Bar name="Lucas" dataKey="lucas_qty" fill="#FFD700" radius={[0, 4, 4, 0]} />
                        <Bar name="Yuri" dataKey="yuri_qty" fill="#4CAF50" radius={[0, 4, 4, 0]} />
                      </>
                    ) : (
                      <Bar name={barber} dataKey="total_qty" fill={barber === 'Lucas' ? '#FFD700' : '#4CAF50'} radius={[0, 4, 4, 0]} />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {servicosMaisVendidos.slice(0, Math.ceil(servicosMaisVendidos.length / 2)).map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-medium text-sm">{s.service}</h3>
                        <p className="text-[10px] text-gray-500">
                          {barber === 'Geral' ? `Lucas: ${s.lucas_qty} | Yuri: ${s.yuri_qty}` : `Total: ${s.total_qty}`}
                        </p>
                      </div>
                      <span className="font-bold text-sm">{s.total_qty}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {servicosMaisVendidos.slice(Math.ceil(servicosMaisVendidos.length / 2)).map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h3 className="font-medium text-sm">{s.service}</h3>
                        <p className="text-[10px] text-gray-500">
                          {barber === 'Geral' ? `Lucas: ${s.lucas_qty} | Yuri: ${s.yuri_qty}` : `Total: ${s.total_qty}`}
                        </p>
                      </div>
                      <span className="font-bold text-sm">{s.total_qty}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="receita" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="h-5 w-5 text-amber-600" />Evolução da Receita</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={receitaTempos}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="periodo" />
                  <YAxis tickFormatter={(v) => `R$ ${v}`} />
                  <Tooltip />
                  <Line type="monotone" dataKey="valor" stroke="#FFC107" strokeWidth={3} dot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">Serviços Prestados</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr><th className="px-4 py-3">Profissional</th><th className="px-4 py-3">Data/Hora</th><th className="px-4 py-3">Serviço</th><th className="px-4 py-3">Valor</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {agendamentosPeriodo.map((a, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{a.barber}</td>
                        <td className="px-4 py-3">{a.data.split('-').reverse().join('/')} - {a.hora.substring(0, 5)}</td>
                        <td className="px-4 py-3">{a.servico}</td>
                        <td className="px-4 py-3 font-bold">R$ {(a.preco / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clientes" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Users className="h-5 w-5 text-amber-600" />Frequência de Clientes</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr><th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Visitas</th><th className="px-4 py-3">Total Gasto</th></tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {frequenciaClientes.map((c, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{c.nome}</td>
                        <td className="px-4 py-3">{c.visitas}</td>
                        <td className="px-4 py-3 font-bold">R$ {c.gasto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Relatorios;
