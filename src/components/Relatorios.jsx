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
  PieChart,
  Pie,
  Cell,
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
  const [barbeiro, setBarbeiro] = useState("geral");
  const [servicosMaisVendidos, setServicosMaisVendidos] = useState([]);
  const [receitaTempos, setReceitaTempos] = useState([]);
  const [frequenciaClientes, setFrequenciaClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { "Authorization": `Bearer ${token}` };
        
        const today = format(new Date(), 'yyyy-MM-dd');
        const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
        
        let params = `?periodo=${periodo}`;
        if (periodo === 'hoje') params = `?data_inicio=${today}&data_fim=${today}`;
        else if (periodo === 'ontem') params = `?data_inicio=${yesterday}&data_fim=${yesterday}`;

        let data;
        if (barbeiro === 'geral') {
          // Buscar dados de ambos e somar
          const [resLucas, resYuri] = await Promise.all([
            fetch(`${import.meta.env.VITE_API_BASE_URL}/api/relatorios/resumo${params}`, { headers }),
            fetch(`${import.meta.env.VITE_API_BASE_URL}/api/relatorios-yuri/resumo${params}`, { headers })
          ]);
          
          const dataLucas = resLucas.ok ? await resLucas.json() : { by_service: [], receita_detalhada: [], top_clients: [] };
          const dataYuri = resYuri.ok ? await resYuri.json() : { by_service: [], receita_detalhada: [], top_clients: [] };
          
          // Somar serviços
          const servicosMap = {};
          [...(dataLucas.by_service || []), ...(dataYuri.by_service || [])].forEach(s => {
            if (!servicosMap[s.service]) servicosMap[s.service] = { service: s.service, qty: 0, revenue: 0 };
            servicosMap[s.service].qty += s.qty;
            servicosMap[s.service].revenue += s.revenue;
          });
          
          // Somar receita por tempo
          const receitaMap = {};
          [...(dataLucas.receita_detalhada || []), ...(dataYuri.receita_detalhada || [])].forEach(r => {
            if (!receitaMap[r.periodo]) receitaMap[r.periodo] = { periodo: r.periodo, valor: 0 };
            receitaMap[r.periodo].valor += r.valor;
          });

          // Combinar top clientes
          const clientesMap = {};
          [...(dataLucas.top_clients || []), ...(dataYuri.top_clients || [])].forEach(c => {
            if (!clientesMap[c.name]) clientesMap[c.name] = { name: c.name, visits: 0, spent: 0, last_visit: c.last_visit };
            clientesMap[c.name].visits += c.visits;
            clientesMap[c.name].spent += c.spent;
            if (new Date(c.last_visit) > new Date(clientesMap[c.name].last_visit)) clientesMap[c.name].last_visit = c.last_visit;
          });

          data = {
            by_service: Object.values(servicosMap),
            receita_detalhada: Object.values(receitaMap),
            top_clients: Object.values(clientesMap).sort((a, b) => b.spent - a.spent).slice(0, 10)
          };
        } else {
          const endpoint = barbeiro === 'yuri' ? '/api/relatorios-yuri/resumo' : '/api/relatorios/resumo';
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}${params}`, { headers });
          data = await res.json();
        }

        // Atualizar estados
        setServicosMaisVendidos((data.by_service || []).map(s => ({
          nome: s.service,
          quantidade: s.qty,
          receita: s.revenue
        })).sort((a, b) => b.quantidade - a.quantidade));
        
        setReceitaTempos(data.receita_detalhada || []);
        
        setFrequenciaClientes((data.top_clients || []).map(c => ({
          nome: c.name,
          visitas: c.visits,
          ultimaVisita: c.last_visit,
          gasto: c.spent
        })));

      } catch (err) {
        console.error("Erro ao buscar relatórios:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [periodo, barbeiro]);

  const CORES_GRAFICO = ["#FFD700", "#1A1A1A", "#333333", "#FFA500", "#000000", "#FFFF00"];

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
          <p className="text-gray-600">Análise de desempenho (Apenas dados até hoje)</p>
        </div>
        <Button onClick={() => window.print()} variant="outline" className="bg-amber-600 hover:bg-amber-700 text-white">
          <Download className="h-4 w-4 mr-2" /> Exportar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <User className="h-5 w-5 text-amber-600" />
            <label className="text-sm font-medium">Barbeiro:</label>
            <Select value={barbeiro} onValueChange={setBarbeiro}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="geral">Geral (Todos)</SelectItem>
                <SelectItem value="lucas">Lucas</SelectItem>
                <SelectItem value="yuri">Yuri</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-4">
            <Calendar className="h-5 w-5 text-amber-600" />
            <label className="text-sm font-medium">Período:</label>
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="ontem">Ontem</SelectItem>
                <SelectItem value="semana">Última Semana</SelectItem>
                <SelectItem value="ultimos15dias">Últimos 15 Dias</SelectItem>
                <SelectItem value="mes">Último Mês</SelectItem>
                <SelectItem value="trimestre">Último Trimestre</SelectItem>
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
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-lg">Serviços Mais Vendidos</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={servicosMaisVendidos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" tick={{fontSize: 10}} interval={0} angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantidade" fill="#FFC107" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Distribuição</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={servicosMaisVendidos.filter(s => s.quantidade > 0)} cx="50%" cy="50%" outerRadius={80} dataKey="quantidade" nameKey="nome">
                      {servicosMaisVendidos.map((_, i) => <Cell key={i} fill={CORES_GRAFICO[i % CORES_GRAFICO.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="receita">
          <Card>
            <CardHeader><CardTitle className="text-lg">Evolução da Receita (R$)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={receitaTempos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="periodo" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="valor" stroke="#FFC107" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clientes">
          <Card>
            <CardHeader><CardTitle className="text-lg">Ranking de Clientes</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Visitas</th>
                      <th className="px-4 py-3">Total Gasto</th>
                      <th className="px-4 py-3">Última Visita</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {frequenciaClientes.map((c, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 font-medium">{c.nome}</td>
                        <td className="px-4 py-3">{c.visitas}</td>
                        <td className="px-4 py-3 text-green-600 font-bold">R$ {c.gasto.toFixed(2)}</td>
                        <td className="px-4 py-3 text-gray-500">{c.ultimaVisita}</td>
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
