import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Line
} from "recharts";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Download
} from "lucide-react";

import api from "@/services/api";

const Relatorios = () => {
  const [servicosMaisVendidos, setServicosMaisVendidos] = useState([]);
  const [receitaTempos, setReceitaTempos] = useState([]);
  const [frequenciaClientes, setFrequenciaClientes] = useState([]);

  // 🔥 Buscar dados reais da API (mantém mocks como fallback)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/api/relatorios/resumo");

        if (res.data) {
          // Serviços mais vendidos
          if (Array.isArray(res.data.by_service) && res.data.by_service.length > 0) {
            setServicosMaisVendidos(
              res.data.by_service.map(s => ({
                nome: s.service,
                quantidade: s.qty,
                receita: s.revenue / 100
              }))
            );
          } else {
            setServicosMaisVendidos([
              { nome: "Corte e Barba", quantidade: 45, receita: 2025 },
              { nome: "Corte", quantidade: 32, receita: 960 },
              { nome: "Barba", quantidade: 28, receita: 560 }
            ]);
          }

          // Receita
          if (res.data.totals) {
            setReceitaTempos([
              { periodo: "Hoje", valor: res.data.totals.daily },
              { periodo: "Semana", valor: res.data.totals.weekly },
              { periodo: "Mês", valor: res.data.totals.monthly }
            ]);
          } else {
            setReceitaTempos([
              { periodo: "Dom", valor: 380 },
              { periodo: "Seg", valor: 520 },
              { periodo: "Ter", valor: 680 }
            ]);
          }

          // Clientes frequentes
          if (Array.isArray(res.data.top_clients) && res.data.top_clients.length > 0) {
            setFrequenciaClientes(
              res.data.top_clients.map(c => ({
                nome: c.name,
                visitas: c.visits,
                ultimaVisita: c.last_visit,
                gasto: c.total_spent / 100
              }))
            );
          } else {
            setFrequenciaClientes([
              { nome: "João Silva", visitas: 12, ultimaVisita: "2024-08-20", gasto: 540 },
              { nome: "Pedro Santos", visitas: 8, ultimaVisita: "2024-08-18", gasto: 360 }
            ]);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar relatórios:", err);
        // fallback mocks se der erro
        setServicosMaisVendidos([
          { nome: "Corte e Barba", quantidade: 45, receita: 2025 },
          { nome: "Corte", quantidade: 32, receita: 960 },
          { nome: "Barba", quantidade: 28, receita: 560 }
        ]);
        setReceitaTempos([
          { periodo: "Dom", valor: 380 },
          { periodo: "Seg", valor: 520 },
          { periodo: "Ter", valor: 680 }
        ]);
        setFrequenciaClientes([
          { nome: "João Silva", visitas: 12, ultimaVisita: "2024-08-20", gasto: 540 }
        ]);
      }
    };

    fetchData();
  }, []);

  // 🎨 Cores (preto e amarelo)
  const CORES_GRAFICO = [
    "#FFD700", // Amarelo ouro
    "#000000", // Preto
    "#333333", // Cinza escuro
    "#808080", // Cinza médio
    "#B8860B", // Dourado escuro
    "#696969"  // Cinza chumbo
  ];

  const exportarRelatorio = () => {
    window.print(); 
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">
            Análise de desempenho e estatísticas da barbearia
          </p>
        </div>
        <Button onClick={exportarRelatorio} variant="outline" className="w-full sm:w-auto">
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      <Tabs defaultValue="servicos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="servicos">Serviços</TabsTrigger>
          <TabsTrigger value="receita">Receita</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
        </TabsList>

        {/* Serviços */}
        <TabsContent value="servicos" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Gráfico de Barras */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-accent" />
                  Serviços Mais Vendidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={servicosMaisVendidos}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="nome" tick={{ fontSize: 10 }} interval={0} angle={-45} textAnchor="end" height={80} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="quantidade" fill="#FFD700" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Pizza */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Serviços</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={servicosMaisVendidos}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="quantidade"
                      label={({ nome, percent }) => `${nome} ${(percent * 100).toFixed(0)}%`}
                    >
                      {servicosMaisVendidos.map((_, index) => (
                        <Cell key={index} fill={CORES_GRAFICO[index % CORES_GRAFICO.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Receita */}
        <TabsContent value="receita">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                Receita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={receitaTempos}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="periodo" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${value}`, "Receita"]} />
                  <Line type="monotone" dataKey="valor" stroke="#FFD700" strokeWidth={3} dot={{ fill: "#000000", r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clientes */}
        <TabsContent value="clientes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                Frequência de Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {frequenciaClientes.map((cliente, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{cliente.nome}</h3>
                      <p className="text-sm text-muted-foreground">
                        Última visita: {new Date(cliente.ultimaVisita).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{cliente.visitas} visitas</p>
                      <p className="text-sm text-muted-foreground">R$ {cliente.gasto.toFixed(2)}</p>
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
