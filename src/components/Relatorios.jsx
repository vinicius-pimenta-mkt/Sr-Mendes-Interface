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
  const [receitaPorHora, setReceitaPorHora] = useState([]);
  const [receitaPorDiaSemana, setReceitaPorDiaSemana] = useState([]);
  const [receitaPorSemana, setReceitaPorSemana] = useState([]);
  const [receitaUltimos15Dias, setReceitaUltimos15Dias] = useState([]);
  const [frequenciaClientes, setFrequenciaClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        
        // Buscar dados principais do resumo
        let apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/relatorios/resumo`;
        let params = `?periodo=${periodo}`;

        const today = format(new Date(), 'yyyy-MM-dd');
        const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

        if (periodo === 'hoje') {
          params = `?data_inicio=${today}&data_fim=${today}`;
        } else if (periodo === 'ontem') {
          params = `?data_inicio=${yesterday}&data_fim=${yesterday}`;
        }

        const response = await fetch(apiUrl + params, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();

          // Processar serviços mais vendidos
          const apiServicos = Array.isArray(data.by_service) ? data.by_service : [];
          const servicosCompletos = apiServicos.map(s => ({
            nome: s.service,
            quantidade: s.qty,
            receita: s.revenue / 100
          })).sort((a, b) => b.quantidade - a.quantidade);
          setServicosMaisVendidos(servicosCompletos);

          // Processar dados de receita por tempo (estático para comparação)
          if (data.totals) {
            setReceitaTempos([
              { periodo: "Hoje", valor: data.totals.daily / 100 || 0 },
              { periodo: "Semana", valor: data.totals.weekly / 100 || 0 },
              { periodo: "Mês", valor: data.totals.monthly / 100 || 0 }
            ]);
          }

          // Processar receita por hora (dados dinâmicos baseados no período)
          if (Array.isArray(data.revenue_by_hour)) {
            const horasCompletas = [];
            for (let i = 8; i <= 18; i++) {
              const horaStr = `${i.toString().padStart(2, '0')}:00`;
              const dadosHora = data.revenue_by_hour.find(h => h.hour === horaStr);
              horasCompletas.push({
                hora: horaStr,
                receita: dadosHora ? dadosHora.revenue / 100 : 0
              });
            }
            setReceitaPorHora(horasCompletas);
          }

          // Processar receita por dia da semana (dados dinâmicos)
          if (Array.isArray(data.revenue_by_day_of_week)) {
            const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            const diasCompletos = diasSemana.map(dia => {
              const dadosDia = data.revenue_by_day_of_week.find(d => d.day_of_week === dia);
              return {
                dia: dia,
                receita: dadosDia ? dadosDia.revenue / 100 : 0
              };
            });
            setReceitaPorDiaSemana(diasCompletos);
          }

          // Processar receita por semana (dados dinâmicos)
          if (Array.isArray(data.revenue_by_week)) {
            setReceitaPorSemana(data.revenue_by_week.map(s => ({
              semana: s.week_number,
              receita: s.revenue / 100
            })));
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

        // Buscar dados específicos baseados no período selecionado
        await fetchSpecificData(token, periodo);

      } catch (err) {
        console.error("Erro ao buscar relatórios:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [periodo]);

  const fetchSpecificData = async (token, periodoSelecionado) => {
    try {
      // Buscar receita por hora do dia (apenas para hoje)
      if (periodoSelecionado === 'hoje') {
        const receitaHoraResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/relatorios/receita-por-hora`,
          {
            headers: { "Authorization": `Bearer ${token}` },
          }
        );
        if (receitaHoraResponse.ok) {
          const horaData = await receitaHoraResponse.json();
          setReceitaPorHora(horaData);
        }
      }

      // Buscar receita por dia da semana
      if (periodoSelecionado === 'semana') {
        const receitaDiaResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/relatorios/receita-por-dia-semana?periodo=semana`,
          {
            headers: { "Authorization": `Bearer ${token}` },
          }
        );
        if (receitaDiaResponse.ok) {
          const diaData = await receitaDiaResponse.json();
          setReceitaPorDiaSemana(diaData);
        }
      }

      // Buscar receita por semana do mês
      if (periodoSelecionado === 'mes') {
        const receitaSemanaResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/relatorios/receita-por-semana`,
          {
            headers: { "Authorization": `Bearer ${token}` },
          }
        );
        if (receitaSemanaResponse.ok) {
          const semanaData = await receitaSemanaResponse.json();
          setReceitaPorSemana(semanaData);
        }
      }

      // Buscar receita dos últimos 15 dias
      if (periodoSelecionado === 'ultimos_15_dias') {
        const receita15DiasResponse = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/relatorios/receita-ultimos-15-dias`,
          {
            headers: { "Authorization": `Bearer ${token}` },
          }
        );
        if (receita15DiasResponse.ok) {
          const dias15Data = await receita15DiasResponse.json();
          setReceitaUltimos15Dias(dias15Data);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dados específicos:", error);
    }
  };

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

  const CustomTooltipReceita = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-600">
            Receita: R$ {data.value.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

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

  const renderReceitaChart = () => {
    switch (periodo) {
      case 'hoje':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <TrendingUp className="h-5 w-5 text-amber-600" />
                Receita por Horário (Hoje)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={receitaPorHora}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="hora" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltipReceita />} />
                  <Bar dataKey="receita" fill="#FFC107" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );
      
      case 'semana':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <TrendingUp className="h-5 w-5 text-amber-600" />
                Receita por Dia da Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={receitaPorDiaSemana}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="dia" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltipReceita />} />
                  <Bar dataKey="receita" fill="#FFC107" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );
      
      case 'mes':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <TrendingUp className="h-5 w-5 text-amber-600" />
                Receita por Semana do Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={receitaPorSemana}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="semana" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltipReceita />} />
                  <Bar dataKey="receita" fill="#FFC107" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );
      
      case 'ultimos_15_dias':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <TrendingUp className="h-5 w-5 text-amber-600" />
                Receita dos Últimos 15 Dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={receitaUltimos15Dias}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="dia" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip content={<CustomTooltipReceita />} />
                  <Line type="monotone" dataKey="receita" stroke="#FFC107" strokeWidth={3} dot={{ fill: "#000", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );
      
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <TrendingUp className="h-5 w-5 text-amber-600" />
                Receita Comparativa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={receitaTempos}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="periodo" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, "Receita"]} />
                  <Line type="monotone" dataKey="valor" stroke="#FFC107" strokeWidth={3} dot={{ fill: "#000", r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );
    }
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
                <SelectItem value="mes">Último Mês</SelectItem>
                <SelectItem value="ultimos_15_dias">Últimos 15 Dias</SelectItem>
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
                      data={servicosMaisVendidos.filter(s => s.quantidade > 0)}
                      cx="50%"
                      cy="40%"
                      outerRadius={80}
                      dataKey="quantidade"
                    >
                      {servicosMaisVendidos.filter(s => s.quantidade > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CORES_GRAFICO[index % CORES_GRAFICO.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      content={renderLegend}
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
          {/* Gráfico de Receita Geral (Comparativo) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <TrendingUp className="h-5 w-5 text-amber-600" />
                Receita Comparativa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={receitaTempos}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="periodo" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => [`R$ ${value.toFixed(2)}`, "Receita"]} />
                  <Line type="monotone" dataKey="valor" stroke="#FFC107" strokeWidth={3} dot={{ fill: "#000", r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico Dinâmico baseado no período */}
          {renderReceitaChart()}
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
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-600">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{cliente.nome}</h3>
                        <p className="text-sm text-gray-500">{cliente.visitas} visitas</p>
                        <p className="text-xs text-gray-400">Última visita: {cliente.ultimaVisita}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-gray-900">R$ {cliente.gasto.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">gasto total</p>
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

