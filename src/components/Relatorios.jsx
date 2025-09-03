import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Download, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Users
} from 'lucide-react';

const Relatorios = () => {
  const [relatorioData, setRelatorioData] = useState({
    totalAgendamentos: 0,
    receitaTotal: 0,
    clientesAtivos: 0,
    servicosMaisRealizados: []
  });
  const [loading, setLoading] = useState(true);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  useEffect(() => {
    // Definir datas padrão (último mês)
    const hoje = new Date();
    const umMesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 1, hoje.getDate());
    
    setDataFim(hoje.toISOString().split('T')[0]);
    setDataInicio(umMesAtras.toISOString().split('T')[0]);
    
    fetchRelatorioData();
  }, []);

  const fetchRelatorioData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/relatorios/mensal', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRelatorioData(data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportarRelatorio = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (dataInicio) params.append('dataInicio', dataInicio);
      if (dataFim) params.append('dataFim', dataFim);

      const response = await fetch(`http://localhost:3000/api/relatorios/exportar?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `relatorio_barbearia_${dataInicio}_${dataFim}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
    }
  };

  const gerarRelatorio = () => {
    fetchRelatorioData();
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Análise de desempenho da barbearia</p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-600" />
            Filtros do Relatório
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
            
            <div className="flex items-end space-x-2">
              <Button onClick={gerarRelatorio} className="bg-amber-600 hover:bg-amber-700">
                <TrendingUp className="h-4 w-4 mr-2" />
                Gerar Relatório
              </Button>
              <Button onClick={exportarRelatorio} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Agendamentos
            </CardTitle>
            <Calendar className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {relatorioData.totalAgendamentos || 0}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              no período selecionado
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Receita Total
            </CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              R$ {(relatorioData.receitaTotal || 0).toFixed(2)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              faturamento no período
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Clientes Ativos
            </CardTitle>
            <Users className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {relatorioData.clientesAtivos || 0}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              clientes únicos
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Ticket Médio
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              R$ {relatorioData.totalAgendamentos > 0 
                ? ((relatorioData.receitaTotal || 0) / relatorioData.totalAgendamentos).toFixed(2)
                : '0.00'
              }
            </div>
            <p className="text-xs text-gray-600 mt-1">
              por atendimento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Serviços Mais Realizados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-600" />
            Serviços Mais Realizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {relatorioData.servicosMaisRealizados?.length > 0 ? (
            <div className="space-y-4">
              {relatorioData.servicosMaisRealizados.map((servico, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-amber-600 font-semibold text-sm">
                        {index + 1}
                      </span>
                    </div>
                    <span className="font-medium text-gray-900">{servico.nome}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">{servico.quantidade}</span>
                    <p className="text-xs text-gray-600">atendimentos</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-amber-600 font-semibold text-sm">1</span>
                  </div>
                  <span className="font-medium text-gray-900">Corte e Barba</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-900">15</span>
                  <p className="text-xs text-gray-600">atendimentos</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-amber-600 font-semibold text-sm">2</span>
                  </div>
                  <span className="font-medium text-gray-900">Corte</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-900">12</span>
                  <p className="text-xs text-gray-600">atendimentos</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-amber-600 font-semibold text-sm">3</span>
                  </div>
                  <span className="font-medium text-gray-900">Barba</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-900">8</span>
                  <p className="text-xs text-gray-600">atendimentos</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações sobre N8N */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-600" />
            Integração N8N
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Webhook para N8N</h4>
            <p className="text-sm text-blue-700 mb-3">
              Use este endpoint para enviar agendamentos via N8N:
            </p>
            <code className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
              POST http://localhost:3000/api/relatorios/n8n
            </code>
            <div className="mt-3">
              <p className="text-xs text-blue-600 font-medium mb-1">Exemplo de payload:</p>
              <pre className="bg-blue-100 text-blue-800 p-2 rounded text-xs overflow-x-auto">
{`{
  "tipo": "novo_agendamento",
  "cliente": "Nome do Cliente",
  "telefone": "(11) 99999-9999",
  "servico": "Corte e Barba",
  "data": "2025-09-03",
  "hora": "14:30"
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Relatorios;

