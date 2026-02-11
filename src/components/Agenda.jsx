import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  CalendarDays,
  Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Agenda = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [agendamentosFiltrados, setAgendamentosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [formData, setFormData] = useState({
    cliente_nome: '',
    servico: '',
    data: '',
    hora: '',
    status: 'Pendente',
    preco: '',
    observacoes: '',
    barber: 'Lucas'
  });

  const servicos = [
    'Sobrancelha',
    'Selagem',
    'Relaxamento',
    'Pigmentação',
    'Acabamento (Pezinho)',
    'Luzes',
    'Limpeza de pele',
    'Hidratação',
    'Finalização penteado',
    'Corte+ Sobrancelha',
    'Corte Masculino',
    'Raspar na maquina',
    'Corte infantil no carrinho',
    'Corte infantil',
    'Corte + Barba simples',
    'Combo Corte + Barboterapia',
    'Combo Corte + Barba + Sobrancelha',
    'Coloração',
    'Barboterapia',
    'Barba Simples',
    'Tratamento V.O'
  ];

  useEffect(() => {
    fetchAgendamentos();
  }, []);

  useEffect(() => {
    filtrarAgendamentos();
  }, [agendamentos, selectedDate]);

  const fetchAgendamentos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/agendamentos`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAgendamentos(data);
      }
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarAgendamentos = () => {
    if (!selectedDate) {
      setAgendamentosFiltrados(agendamentos);
      return;
    }
    const dataFiltro = format(selectedDate, 'yyyy-MM-dd');
    setAgendamentosFiltrados(
      agendamentos.filter(a => a.data === dataFiltro)
    );
  };

  const limparFiltro = () => {
    setSelectedDate(null);
    setCalendarOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingAgendamento
        ? `${import.meta.env.VITE_API_BASE_URL}/api/agendamentos/${editingAgendamento.id}`
        : `${import.meta.env.VITE_API_BASE_URL}/api/agendamentos`;

      const method = editingAgendamento ? 'PUT' : 'POST';

      // envia em centavos
      const precoEmCentavos = formData.preco
        ? Math.round(parseFloat(formData.preco) * 100)
        : null;

      const payload = { ...formData, preco: precoEmCentavos };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchAgendamentos();
        setDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/agendamentos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) fetchAgendamentos();
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      cliente_nome: '',
      servico: '',
      data: '',
      hora: '',
      status: 'Pendente',
      preco: '',
      observacoes: '',
      barber: 'Lucas'
    });
    setEditingAgendamento(null);
  };

  // ---- FORMATAÇÃO DE PREÇO ----
  const formatPreco = (precoRaw) => {
    if (precoRaw === null || precoRaw === undefined || precoRaw === '') return '';
    if (typeof precoRaw === 'string') {
      const s = precoRaw.trim();
      if (/R\$/.test(s) || /,/.test(s)) {
        const n = parseFloat(s.replace(/R\$|\s/g, '').replace(/\./g, '').replace(',', '.'));
        if (!isNaN(n)) return n.toFixed(2);
      }
      const asNum = parseFloat(s);
      if (!isNaN(asNum)) return asNum >= 1000 ? (asNum / 100).toFixed(2) : asNum.toFixed(2);
      return '';
    }
    if (typeof precoRaw === 'number') {
      return precoRaw >= 1000 ? (precoRaw / 100).toFixed(2) : precoRaw.toFixed(2);
    }
    return '';
  };

  const openEditDialog = (agendamento) => {
    setEditingAgendamento(agendamento);
    const precoFormatado = formatPreco(agendamento?.preco);
    setFormData({
      cliente_nome: agendamento?.cliente_nome ?? '',
      servico: agendamento?.servico ?? '',
      data: agendamento?.data ?? '',
      hora: agendamento?.hora ?? '',
      status: agendamento?.status ?? 'Pendente',
      preco: precoFormatado ? precoFormatado : '',
      observacoes: agendamento?.observacoes ?? '',
      barber: agendamento?.barber ?? 'Lucas'
    });
    setDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmado': return 'bg-green-100 text-green-800';
      case 'Pendente':   return 'bg-yellow-100 text-yellow-800';
      case 'Cancelado':  return 'bg-red-100 text-red-800';
      default:           return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Confirmado': return <CheckCircle className="h-4 w-4" />;
      case 'Pendente':   return <Clock className="h-4 w-4" />;
      case 'Cancelado':  return <AlertCircle className="h-4 w-4" />;
      default:           return <Clock className="h-4 w-4" />;
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600">Gerencie os agendamentos da barbearia</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-amber-600 hover:bg-amber-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingAgendamento ? "Editar Agendamento" : "Novo Agendamento"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cliente_nome">Nome do Cliente</Label>
                <Input
                  id="cliente_nome"
                  value={formData.cliente_nome}
                  onChange={(e) => setFormData({...formData, cliente_nome: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="servico">Serviço</Label>
                <Select value={formData.servico} onValueChange={(value) => setFormData({...formData, servico: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicos.map((servico) => (
                      <SelectItem key={servico} value={servico}>
                        {servico}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data">Data</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({...formData, data: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hora">Hora</Label>
                  <Input
                    id="hora"
                    type="time"
                    value={formData.hora}
                    onChange={(e) => setFormData({...formData, hora: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="barber">Barbeiro</Label>
                  <Select value={formData.barber} onValueChange={(value) => setFormData({...formData, barber: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o barbeiro" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lucas">Lucas</SelectItem>
                      <SelectItem value="Turi">Turi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Confirmado">Confirmado</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preco">Preço (R$)</Label>
                <Input
                  id="preco"
                  type="text"
                  placeholder="0,00"
                  value={formData.preco}
                  onChange={(e) => setFormData({...formData, preco: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Input
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                />
              </div>

              <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700">
                {editingAgendamento ? "Salvar Alterações" : "Criar Agendamento"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-amber-600" />
            Próximos Agendamentos
          </CardTitle>
          <div className="flex items-center gap-2">
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className={selectedDate ? "border-amber-600 text-amber-600" : ""}>
                  <Filter className="h-4 w-4 mr-2" />
                  {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : "Filtrar por Data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setCalendarOpen(false);
                  }}
                  locale={ptBR}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {selectedDate && (
              <Button variant="ghost" onClick={limparFiltro} className="text-gray-500">
                Limpar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Serviço</th>
                  <th className="px-4 py-3">Data/Hora</th>
                  <th className="px-4 py-3">Barbeiro</th>
                  <th className="px-4 py-3">Preço</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {agendamentosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                      Nenhum agendamento encontrado.
                    </td>
                  </tr>
                ) : (
                  agendamentosFiltrados.map((agendamento) => (
                    <tr key={agendamento.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {agendamento.cliente_nome}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {agendamento.servico}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <div className="flex flex-col">
                          <span>{format(new Date(agendamento.data + 'T12:00:00'), 'dd/MM/yyyy')}</span>
                          <span className="text-xs text-gray-400">{agendamento.hora}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {agendamento.barber || 'Lucas'}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-semibold">
                        R$ {formatPreco(agendamento.preco)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={getStatusColor(agendamento.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(agendamento.status)}
                            {agendamento.status}
                          </span>
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(agendamento)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(agendamento.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Agenda;
