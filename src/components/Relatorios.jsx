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

const Relatorios = () => {
  const [periodo, setPeriodo] = useState("mes");
  const [servicosMaisVendidos, setServicosMaisVendidos] = useState([
    { nome: "Corte e Barba", quantidade: 45, receita: 2025 },
    { nome: "Corte", quantidade: 32, receita: 960 },
    { nome: "Barba", quantidade: 28, receita: 560 },
    { nome: "Corte, Barba e Sobrancelha", quantidade: 15, receita: 975 },
    { nome: "Sobrancelha", quantidade: 12, receita: 180 },
    { nome: "Corte e Sobrancelha", quantidade: 8, receita: 320 }
  ]);

  const [receitaTempos, setReceitaTempos] = useState([
    { periodo: "Dom", valor: 380 },
    { periodo: "Seg", valor: 520 },
    { periodo: "Ter", valor: 680 },
    { periodo: "Qua", valor: 590 },
    { periodo: "Qui", valor: 720 },
    { periodo: "Sex", valor: 850 },
    { periodo: "Sáb", valor: 920 }
  ]);

  const [frequenciaClientes, setFrequenciaClientes] = useState([
    { nome: "João Silva", visitas: 12, ultimaVisita: "2024-08-20", gasto: 540 },
    { nome: "Pedro Santos", visitas: 8, ultimaVisita: "2024-08-18", gasto: 360 },
    { nome: "Carlos Lima", visitas: 6, ultimaVisita: "2024-08-15", gasto: 270 },
    { nome: "Marcus Oliveira", visitas: 5, ultimaVisita: "2024-08-22", gasto: 325 },
    { nome: "Rafael Costa", visitas: 4, ultimaVisita: "2024-08-19", gasto: 180 }
  ]);

  // 🔥 Buscar dados reais da API (mantém mocks como fallback)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/relatorios/resumo?periodo=${periodo}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();

          if (Array.isArray(data.by_service)) {
            setServicosMaisVendidos(
              data.by_service.map(s => ({
                nome: s.service,
                quantidade: s.qty,
                receita: s.revenue / 100
              }))
            );
          }

          if (data.totals) {
            setReceitaTempos([
              { periodo: "Hoje", valor: data.totals.daily },
              { periodo: "Semana", valor: data.totals.weekly },
              { periodo: "Mês", valor: data.totals.monthly }
            ]);
          }

          if (Array.isArray(data.top_clients)) {
            setFrequenciaClientes(
              data.top_clients.map(c => ({
                nome: c.name,
                visitas: c.visits,
                ultimaVisita: c.last_visit,
                gasto: c.spent / 100
              }))
            );
          }
        }
      } catch (err) {
        console.error("Erro ao buscar relatórios:", err);
      }
    };

    fetchData();
  }, [periodo]);

  // 🎨 Paleta preto + amarelo com mais contraste
  const CORES_GRAFICO = [
    "#FFD700", // amarelo mais vibrante
    "#1A1A1A", // preto mais escuro
    "#333333", // cinza escuro
    "#FFA500", // laranja dourado
    "#000000", // preto puro
    "#FFFF00"  // amarelo puro
  ];

  const exportarRelatorio = () => {
    window.print();
  };

  // Tooltip customizado para o gráfico de pizza (sem porcentagem)
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.payload.nome}</p>
          <p className="text-sm text-gray-600">
            Quantidade: {data.value}
          </p>
        </div>
      );
    }
    return null;
  };

  // Renderizar legenda customizada
  const renderLegend = (props) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {payload.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center gap-1 text-xs">
            <div 
              className="w-3 h-3 rounded-sm" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-700">
              {entry.payload.nome.length > 15 
                ? entry.payload.nome.substring(0, 15) + "..." 
                : entry.payload.nome}
            </span>
          </div>
        ))}
      </div>
    );
  };

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
                <SelectItem value="semana">Última Semana</SelectItem>
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
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Gráfico de Barras */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <BarChart3 className="h-5 w-5 text-amber-600" />
                  Serviços Mais Vendidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={servicosMaisVendidos}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="nome" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={80}/>
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="quantidade" fill="#FFC107" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Pizza */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Distribuição de Serviços</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={servicosMaisVendidos}
                      cx="50%"
                      cy="40%"
                      outerRadius={80}
                      dataKey="quantidade"
                    >
                      {servicosMaisVendidos.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CORES_GRAFICO[index % CORES_GRAFICO.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      content={renderLegenda}
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Ranking Detalhado */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Ranking Detalhado de Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {servicosMaisVendidos.map((servico, index) => (
                  <div key={servico.nome} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-600">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{servico.nome}</h3>
                        <p className="text-sm text-gray-500">{servico.quantidade} atendimentos</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-gray-900">R$ {servico.receita.toFixed(2)}</p>
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
                Receita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={receitaTempos}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="periodo" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => [`R$ ${value}`, "Receita"]} />
                  <Line type="monotone" dataKey="valor" stroke="#FFC107" strokeWidth={3} dot={{ fill: "#000", r: 6 }} />
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
                Frequência dos Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {frequenciaClientes.map((cliente, index) => (
                  <div key={cliente.nome} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-600">
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{cliente.nome}</h3>
                        <p className="text-sm text-gray-500">
                          Última visita: {new Date(cliente.ultimaVisita).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-gray-900">{cliente.visitas} visitas</p>
                      <p className="text-sm text-gray-500">R$ {cliente.gasto.toFixed(2)} gasto</p>
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
