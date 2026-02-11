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
  Calendar
} from "lucide-react";
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Relatorios = () => {
  const [periodo, setPeriodo] = useState("mes");
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
        let params = `?periodo=${periodo}`;
        const today = format(new Date(), 'yyyy-MM-dd');
        const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

        if (periodo === 'hoje') params = `?data_inicio=${today}&data_fim=${today}`;
        else if (periodo === 'ontem') params = `?data_inicio=${yesterday}&data_fim=${yesterday}`;

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/relatorios/resumo${params}`, {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setServicosMaisVendidos(data.by_service || []);
          setReceitaTempos(data.receita_detalhada || []);
          setAgendamentosPeriodo(data.agendamentos || []);
          setFrequenciaClientes(data.top_clients ? data.top_clients.map(c => ({
            nome: c.name, visitas: c.visits, ultimaVisita: c.last_visit, gasto: c.spent
          })) : []);
        }
      } catch (err) {
        console.error("Erro ao buscar relatórios:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [periodo]);

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Análise de desempenho da barbearia</p>
        </div>
        <Button onClick={() => window.print()} variant="outline" className="bg-amber-600 hover:bg-amber-700 text-white">
          <Download className="h-4 w-4 mr-2" /> Exportar
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 flex items-center gap-4">
          <Calendar className="h-5 w-5 text-amber-600" />
          <Label className="text-sm font-medium">Período:</Label>
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

      <Tabs defaultValue="servicos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="servicos">Serviços</TabsTrigger>
          <TabsTrigger value="receita">Receita</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="servicos" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><BarChart3 className="h-5 w-5 text-amber-600" />Serviços</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={servicosMaisVendidos} margin={{ left: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="service" type="category" width={100} tick={{fontSize: 12}} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar name="Lucas" dataKey="lucas_qty" fill="#FFD700" radius={[0, 4, 4, 0]} />
                    <Bar name="Yuri" dataKey="yuri_qty" fill="#4CAF50" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Ranking Detalhado</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {servicosMaisVendidos.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-600">{i+1}</div>
                      <div>
                        <h3 className="font-medium">{s.service}</h3>
                        <p className="text-sm text-gray-500">Total: {s.total_qty} (Lucas: {s.lucas_qty} | Yuri: {s.yuri_qty})</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">R$ {s.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receita" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="h-5 w-5 text-amber-600" />Evolução</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={receitaTempos}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="periodo" />
                    <YAxis tickFormatter={v => `R$${v}`} />
                    <Tooltip />
                    <Line type="monotone" dataKey="valor" stroke="#FFC107" strokeWidth={3} dot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">Serviços Prestados</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">Profissional</th>
                      <th className="px-4 py-3">Data/Hora</th>
                      <th className="px-4 py-3">Serviço</th>
                      <th className="px-4 py-3">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {agendamentosPeriodo.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{item.barber}</td>
                        <td className="px-4 py-3">{format(new Date(item.data + 'T12:00:00'), 'dd/MM/yyyy')} - {item.hora}</td>
                        <td className="px-4 py-3">{item.servico}</td>
                        <td className="px-4 py-3 font-bold">R$ {(item.preco / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
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
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Users className="h-5 w-5 text-amber-600" />Frequência</CardTitle></CardHeader>
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

const Label = ({ children, className }) => <span className={`text-sm font-medium text-gray-700 ${className}`}>{children}</span>;

export default Relatorios;
