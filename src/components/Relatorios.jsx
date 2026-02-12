import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { BarChart3, TrendingUp, Users, Download, Calendar, User } from "lucide-react";
import { format, subDays } from 'date-fns';

const Relatorios = () => {
  const [periodo, setPeriodo] = useState("mes");
  const [barber, setBarber] = useState("Geral");
  const [data, setData] = useState({ by_service: [], receita_detalhada: [], agendamentos: [], top_clients: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumo = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        let params = `?periodo=${periodo}&barber=${barber}`;
        const today = format(new Date(), 'yyyy-MM-dd');
        const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

        if (periodo === 'hoje') params = `?data_inicio=${today}&data_fim=${today}&barber=${barber}`;
        else if (periodo === 'ontem') params = `?data_inicio=${yesterday}&data_fim=${yesterday}&barber=${barber}`;

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/relatorios/resumo${params}`, {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (response.ok) {
          const resJson = await response.json();
          setData(resJson);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchResumo();
  }, [periodo, barber]);

  if (loading) return <div className="flex justify-center p-10"><div className="animate-spin h-10 w-10 border-b-2 border-amber-600 rounded-full"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <Button onClick={() => window.print()} className="bg-amber-600"><Download className="h-4 w-4 mr-2" /> Exportar</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card><CardContent className="pt-6 flex items-center gap-4"><Calendar className="h-5 w-5 text-amber-600" /><Label>Período:</Label><Select value={periodo} onValueChange={setPeriodo}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="hoje">Hoje</SelectItem><SelectItem value="ontem">Ontem</SelectItem><SelectItem value="semana">Semana</SelectItem><SelectItem value="mes">Mês</SelectItem></SelectContent></Select></CardContent></Card>
        <Card><CardContent className="pt-6 flex items-center gap-4"><User className="h-5 w-5 text-amber-600" /><Label>Barbeiro:</Label><Select value={barber} onValueChange={setBarber}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Geral">Geral</SelectItem><SelectItem value="Lucas">Lucas</SelectItem><SelectItem value="Yuri">Yuri</SelectItem></SelectContent></Select></CardContent></Card>
      </div>

      <Tabs defaultValue="servicos">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="servicos">Serviços</TabsTrigger>
          <TabsTrigger value="receita">Receita</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
        </TabsList>

        <TabsContent value="servicos" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Ranking de Serviços</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer>
                  <BarChart data={data.by_service} layout="vertical" margin={{ left: 30, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="service" type="category" width={120} tick={{fontSize: 12}} />
                    <Tooltip />
                    <Legend />
                    {barber === 'Geral' ? (
                      <>
                        <Bar name="Lucas" dataKey="lucas_qty" fill="#FFD700" />
                        <Bar name="Yuri" dataKey="yuri_qty" fill="#4CAF50" />
                      </>
                    ) : (
                      <Bar name={barber} dataKey="total_qty" fill={barber === 'Lucas' ? '#FFD700' : '#4CAF50'} />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0, 1].map(col => (
              <Card key={col}><CardContent className="pt-6 space-y-2">
                {data.by_service.slice(col === 0 ? 0 : Math.ceil(data.by_service.length/2), col === 0 ? Math.ceil(data.by_service.length/2) : undefined).map((s, i) => (
                  <div key={i} className="flex justify-between border-b pb-1 text-sm">
                    <div>
                      <span className="font-medium">{s.service}</span>
                      <p className="text-[10px] text-gray-500">
                        {barber === 'Geral' ? `Lucas: ${s.lucas_qty} | Yuri: ${s.yuri_qty}` : `Total: ${s.total_qty}`}
                      </p>
                    </div>
                    <span className="font-bold">{s.total_qty}</span>
                  </div>
                ))}
              </CardContent></Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="receita" className="space-y-4">
          <Card><CardHeader><CardTitle>Evolução da Receita</CardTitle></CardHeader><CardContent><div className="h-[300px]"><ResponsiveContainer><LineChart data={data.receita_detalhada}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="periodo" /><YAxis /><Tooltip /><Line type="monotone" dataKey="valor" stroke="#FFC107" strokeWidth={2} /></LineChart></ResponsiveContainer></div></CardContent></Card>
          <Card>
            <CardHeader><CardTitle>Lista de Serviços</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50"><tr><th className="p-2">Profissional</th><th className="p-2">Data/Hora</th><th className="p-2">Serviço</th><th className="p-2">Valor</th></tr></thead>
                <tbody>
                  {data.agendamentos.map((a, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{a.barber}</td>
                      <td className="p-2">{a.data.split('-').reverse().join('/')} {a.hora.substring(0,5)}</td>
                      <td className="p-2">{a.servico}</td>
                      <td className="p-2 font-bold">R$ {(a.preco/100).toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clientes">
          <Card><CardHeader><CardTitle>Top Clientes</CardTitle></CardHeader><CardContent><table className="w-full text-sm text-left"><thead><tr className="bg-gray-50"><th className="p-2">Cliente</th><th className="p-2">Visitas</th><th className="p-2">Total Gasto</th></tr></thead><tbody>{data.top_clients.map((c, i) => (<tr key={i} className="border-b"><td className="p-2">{c.name}</td><td className="p-2">{c.visits}</td><td className="p-2 font-bold">R$ {c.spent.toLocaleString('pt-BR', {minimumFractionDigits:2})}</td></tr>))}</tbody></table></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Relatorios;
