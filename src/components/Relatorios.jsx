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
  Calendar
} from "lucide-react";
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Relatorios = () => {
  const [periodo, setPeriodo] = useState("mes");
  const [servicosMaisVendidos, setServicosMaisVendidos] = useState([]);
  const [receitaTempos, setReceitaTempos] = useState([]);
  const [frequenciaClientes, setFrequenciaClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        let apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/relatorios/resumo`;
        let params = `?periodo=${periodo}`;

        const today = format(new Date(), 'yyyy-MM-dd');
        const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

        if (periodo === 'hoje') {
          params = `?data_inicio=${today}&data_fim=${today}`;
        } else if (periodo === 'ontem') {
          params = `?data_inicio=${yesterday}&data_fim=${yesterday}`;
        } else {
          params = `?periodo=${periodo}`;
        }

        const response = await fetch(apiUrl + params, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();

          // Processar serviços mais vendidos - agora com dados por barbeiro
          const apiServicos = Array.isArray(data.by_service) ? data.by_service : [];
          setServicosMaisVendidos(apiServicos);

          // Processar dados de receita detalhada
          if (data.receita_detalhada && Array.isArray(data.receita_detalhada)) {
            setReceitaTempos(data.receita_detalhada);
          }

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
  }, [periodo]);

  const CORES_GRAFICO = [
    "#FFD700", // amarelo (Lucas/Mendes)
    "#4CAF50", // verde (Turi)
    "#1A1A1A", 
    "#333333", 
    "#FFA500", 
    "#000000"
  ];

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">
            Análise de desempenho e estatísticas da barbearia
          </p>
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

      {/* Filtro de Período */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-amber-600" />
            <label className="text-sm font-medium text-gray-700">
              Período dos Relatórios:
            </label>
            <Select value={periodo} onValueChange={setPeriodo}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="ontem">Ontem</SelectItem>
                <SelectItem value="semana">Última Semana</SelectItem>
                <SelectItem value="ultimos15dias">Últimos 15 Dias</SelectItem>
                <SelectItem value="mes">Último Mês</SelectItem>
                <SelectItem value="trimestre">Último Trimestre</SelectItem>
                <SelectItem value="semestre">Último Semestre</SelectItem>
                <SelectItem value="ano">Último Ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="servicos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="servicos">Serviços</TabsTrigger>
          <TabsTrigger value="receita">Receita</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
        </TabsList>

        {/* --- SERVIÇOS --- */}
        <TabsContent value="servicos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <BarChart3 className="h-5 w-5 text-amber-600" />
                Serviços por Barbeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[600px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={servicosMaisVendidos}
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      dataKey="service" 
                      type="category" 
                      tick={{ fontSize: 12 }}
                      width={100}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar name="Lucas" dataKey="lucas_qty" fill="#FFD700" radius={[0, 4, 4, 0]} />
                    <Bar name="Turi" dataKey="turi_qty" fill="#4CAF50" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Ranking Detalhado */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Ranking Detalhado de Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {servicosMaisVendidos.map((servico, index) => (
                  <div key={servico.service} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-600">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{servico.service}</h3>
                        <p className="text-sm text-gray-500">
                          Total: {servico.total_qty} (Lucas: {servico.lucas_qty} | Turi: {servico.turi_qty})
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-gray-900">R$ {servico.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <p className="text-sm text-gray-500">receita total</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- RECEITA --- */}
        <TabsContent value="receita" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <TrendingUp className="h-5 w-5 text-amber-600" />
                Evolução da Receita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={receitaTempos}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="periodo" />
                  <YAxis tickFormatter={(value) => `R$ ${value}`} />
                  <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, "Receita"]} />
                  <Line
                    type="monotone"
                    dataKey="valor"
                    stroke="#FFC107"
                    strokeWidth={3}
                    dot={{ r: 6, fill: "#FFC107" }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- CLIENTES --- */}
        <TabsContent value="clientes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Users className="h-5 w-5 text-amber-600" />
                Frequência de Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">Cliente</th>
                      <th className="px-4 py-3">Visitas</th>
                      <th className="px-4 py-3">Última Visita</th>
                      <th className="px-4 py-3">Total Gasto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {frequenciaClientes.map((cliente, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{cliente.nome}</td>
                        <td className="px-4 py-3 text-gray-600">{cliente.visitas}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {format(new Date(cliente.ultimaVisita + 'T12:00:00'), 'dd/MM/yyyy')}
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900">
                          R$ {cliente.gasto.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
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
