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
  Download,
  Calendar
} from "lucide-react";

const Relatorios = () => {
  const [servicosMaisVendidos, setServicosMaisVendidos] = useState([
    { nome: "Corte e Barba", quantidade: 45, receita: 2025 },
    { nome: "Corte", quantidade: 32, receita: 960 },
    { nome: "Barba", quantidade: 28, receita: 560 },
    { nome: "Corte, Barba e Sobrancelha", quantidade: 15, receita: 975 },
    { nome: "Sobrancelha", quantidade: 12, receita: 180 },
    { nome: "Corte e Sobrancelha", quantidade: 8, receita: 320 }
  ]);

  const [receitaTempos] = useState([
    { periodo: "Dom", valor: 380 },
    { periodo: "Seg", valor: 520 },
    { periodo: "Ter", valor: 680 },
    { periodo: "Qua", valor: 590 },
    { periodo: "Qui", valor: 720 },
    { periodo: "Sex", valor: 850 },
    { periodo: "Sáb", valor: 920 }
  ]);

  const [frequenciaClientes] = useState([
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
      const res = await api.get("/api/relatorios/resumo");

      if (res.data) {
        // Serviços mais vendidos
        if (Array.isArray(res.data.by_service)) {
          setServicosMaisVendidos(
            res.data.by_service.map(s => ({
              nome: s.service,
              quantidade: s.qty,
              receita: s.revenue / 100
            }))
          );
        }

        // Receita (usa totals -> transforma em períodos)
        if (res.data.totals) {
          setReceitaTempos([
            { periodo: "Hoje", valor: res.data.totals.daily },
            { periodo: "Semana", valor: res.data.totals.weekly },
            { periodo: "Mês", valor: res.data.totals.monthly }
          ]);
        }

        // Clientes frequentes -> ainda não tem endpoint no backend
        // mantém mock
      }
    } catch (err) {
      console.error("Erro ao buscar relatórios:", err);
      // Se der erro, continua exibindo os mocks
    }
  };

  fetchData();
}, []);
  
  const CORES_GRAFICO = [
    '#FFD700', // Amarelo ouro
    '#8A2BE2', // Azul violeta
    '#FF6347', // Vermelho tomate
    '#3CB371', // Verde mar
    '#1E90FF', // Azul dodger
    '#FF4500'  // Laranja avermelhado
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
          <TabsTrigger value="servicos" className="text-xs sm:text-sm">Serviços</TabsTrigger>
          <TabsTrigger value="receita" className="text-xs sm:text-sm">Receita</TabsTrigger>
          <TabsTrigger value="clientes" className="text-xs sm:text-sm">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="servicos" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Gráfico de Barras - Serviços Mais Vendidos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <BarChart3 className="h-5 w-5 text-accent" />
                  Serviços Mais Vendidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={servicosMaisVendidos}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="nome" 
                      tick={{ fontSize: 10 }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Bar dataKey="quantidade" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Pizza - Distribuição de Serviços */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Distribuição de Serviços</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={servicosMaisVendidos}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="hsl(var(--accent))"
                      dataKey="quantidade"
                      label={({ nome, percent }) => `${nome.length > 10 ? nome.substring(0, 10) + '...' : nome} ${(percent * 100).toFixed(0)}%`}
                    >
                      {servicosMaisVendidos.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CORES_GRAFICO[index % CORES_GRAFICO.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Ranking */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Ranking Detalhado de Serviços</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {servicosMaisVendidos.map((servico, index) => (
                  <div key={servico.nome} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{servico.nome}</h3>
                        <p className="text-sm text-muted-foreground">{servico.quantidade} atendimentos</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-foreground">R$ {servico.receita.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">receita total</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receita" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Receita Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={receitaTempos}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="periodo" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                    formatter={(value) => [`R$ ${value}`, 'Receita']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="valor" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Receita Diária</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-green-600">R$ 582,00</div>
                <p className="text-sm text-muted-foreground">média dos últimos 7 dias</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Receita Semanal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-blue-600">R$ 4.074,00</div>
                <p className="text-sm text-muted-foreground">esta semana</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 sm:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Receita Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-purple-600">R$ 16.850,00</div>
                <p className="text-sm text-muted-foreground">este mês</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clientes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Users className="h-5 w-5 text-accent" />
                Frequência dos Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {frequenciaClientes.map((cliente, index) => (
                  <div key={cliente.nome} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center font-bold text-accent">
                        #{index + 1}
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{cliente.nome}</h3>
                        <p className="text-sm text-muted-foreground">
                          Última visita: {new Date(cliente.ultimaVisita).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-foreground">{cliente.visitas} visitas</p>
                      <p className="text-sm text-muted-foreground">R$ {cliente.gasto.toFixed(2)} gasto</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Total de Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-foreground">127</div>
                <p className="text-sm text-muted-foreground">clientes cadastrados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Clientes Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-foreground">89</div>
                <p className="text-sm text-muted-foreground">últimos 30 dias</p>
              </CardContent>
            </Card>

            <Card className="sm:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Ticket Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-foreground">R$ 42,50</div>
                <p className="text-sm text-muted-foreground">por atendimento</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Relatorios;
