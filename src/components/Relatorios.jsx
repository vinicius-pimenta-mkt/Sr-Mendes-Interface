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
  Filter
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

        let dataLucas = null;
        let dataYuri = null;

        // Buscar dados do Lucas
        if (barbeiro === 'geral' || barbeiro === 'lucas') {
          const apiUrlLucas = `${import.meta.env.VITE_API_BASE_URL}/api/relatorios/resumo`;
          const responseLucas = await fetch(apiUrlLucas + params, {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });
          if (responseLucas.ok) {
            dataLucas = await responseLucas.json();
          }
        }

        // Buscar dados do Yuri
        if (barbeiro === 'geral' || barbeiro === 'yuri') {
          const apiUrlYuri = `${import.meta.env.VITE_API_BASE_URL}/api/relatorios-yuri/resumo`;
          const responseYuri = await fetch(apiUrlYuri + params, {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });
          if (responseYuri.ok) {
            dataYuri = await responseYuri.json();
          }
        }

        // Combinar dados se for "geral"
        if (barbeiro === 'geral' && dataLucas && dataYuri) {
          // Combinar serviços
          const servicosMap = new Map();
          
          dataLucas.by_service.forEach(s => {
            servicosMap.set(s.service, {
              nome: s.service,
              quantidade: s.qty,
              receita: s.revenue
            });
          });

          dataYuri.by_service.forEach(s => {
            if (servicosMap.has(s.service)) {
              const existing = servicosMap.get(s.service);
              servicosMap.set(s.service, {
                nome: s.service,
                quantidade: existing.quantidade + s.qty,
                receita: existing.receita + s.revenue
              });
            } else {
              servicosMap.set(s.service, {
                nome: s.service,
                quantidade: s.qty,
                receita: s.revenue
              });
            }
          });

          const servicosCombinados = Array.from(servicosMap.values())
            .sort((a, b) => b.quantidade - a.quantidade);
          setServicosMaisVendidos(servicosCombinados);

          // Combinar receita detalhada
          const receitaMap = new Map();
          dataLucas.receita_detalhada.forEach(r => {
            receitaMap.set(r.periodo, r.valor);
          });
          dataYuri.receita_detalhada.forEach(r => {
            if (receitaMap.has(r.periodo)) {
              receitaMap.set(r.periodo, receitaMap.get(r.periodo) + r.valor);
            } else {
              receitaMap.set(r.periodo, r.valor);
            }
          });
          const receitaCombinada = Array.from(receitaMap.entries()).map(([periodo, valor]) => ({
            periodo,
            valor
          }));
          setReceitaTempos(receitaCombinada);

          // Combinar clientes
          const clientesMap = new Map();
          dataLucas.top_clients.forEach(c => {
            clientesMap.set(c.name, {
              nome: c.name,
              visitas: c.visits,
              ultimaVisita: c.last_visit,
              gasto: c.spent
            });
          });
          dataYuri.top_clients.forEach(c => {
            if (clientesMap.has(c.name)) {
              const existing = clientesMap.get(c.name);
              clientesMap.set(c.name, {
                nome: c.name,
                visitas: existing.visitas + c.visits,
                ultimaVisita: c.last_visit > existing.ultimaVisita ? c.last_visit : existing.ultimaVisita,
                gasto: existing.gasto + c.spent
              });
            } else {
              clientesMap.set(c.name, {
                nome: c.name,
                visitas: c.visits,
                ultimaVisita: c.last_visit,
                gasto: c.spent
              });
            }
          });
          const clientesCombinados = Array.from(clientesMap.values())
            .sort((a, b) => b.visitas - a.visitas)
            .slice(0, 10);
          setFrequenciaClientes(clientesCombinados);

        } else if (barbeiro === 'lucas' && dataLucas) {
          // Apenas dados do Lucas
          const servicosCompletos = dataLucas.by_service.map(s => ({
            nome: s.service,
            quantidade: s.qty,
            receita: s.revenue
          })).sort((a, b) => b.quantidade - a.quantidade);
          setServicosMaisVendidos(servicosCompletos);

          setReceitaTempos(dataLucas.receita_detalhada || []);

          setFrequenciaClientes(
            dataLucas.top_clients.map(c => ({
              nome: c.name,
              visitas: c.visits,
              ultimaVisita: c.last_visit,
              gasto: c.spent
            }))
          );

        } else if (barbeiro === 'yuri' && dataYuri) {
          // Apenas dados do Yuri
          const servicosCompletos = dataYuri.by_service.map(s => ({
            nome: s.service,
            quantidade: s.qty,
            receita: s.revenue
          })).sort((a, b) => b.quantidade - a.quantidade);
          setServicosMaisVendidos(servicosCompletos);

          setReceitaTempos(dataYuri.receita_detalhada || []);

          setFrequenciaClientes(
            dataYuri.top_clients.map(c => ({
              nome: c.name,
              visitas: c.visits,
              ultimaVisita: c.last_visit,
              gasto: c.spent
            }))
          );
        }

      } catch (err) {
        console.error("Erro ao buscar relatórios:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [periodo, barbeiro]);

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

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Filtro de Barbeiro */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Filter className="h-5 w-5 text-amber-600" />
              <label className="text-sm font-medium text-gray-700">
                Barbeiro:
              </label>
              <Select value={barbeiro} onValueChange={setBarbeiro}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Selecione o barbeiro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="geral">Geral (Todos)</SelectItem>
                  <SelectItem value="lucas">Lucas</SelectItem>
                  <SelectItem value="yuri">Yuri</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Período */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Calendar className="h-5 w-5 text-amber-600" />
              <label className="text-sm font-medium text-gray-700">
                Período:
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
                      <p className="font-bold text-gray-900">R$ {servico.receita.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(value) => `R$ ${value.toFixed(2)}`} />
                  <Tooltip formatter={(value) => [`R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "Receita"]} />
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
                      <p className="text-sm text-gray-500">R$ {cliente.gasto.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} gasto</p>
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
