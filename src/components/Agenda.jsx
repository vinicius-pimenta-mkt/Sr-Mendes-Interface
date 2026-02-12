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
  Filter,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Agenda = () => {
  const [agendamentos, setAgendamentos] = useState([]);
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

  const tabelaPrecos = {
    'Sobrancelha': 20,
    'Selagem': 100,
    'Relaxamento': 80,
    'Pigmentação': 30,
    'Acabamento (Pezinho)': 15,
    'Luzes': 120,
    'Limpeza de pele': 40,
    'Hidratação': 35,
    'Finalização penteado': 25,
    'Corte+ Sobrancelha': 55,
    'Corte Masculino': 45,
    'Raspar na maquina': 30,
    'Corte infantil no carrinho': 40,
    'Corte infantil': 35,
    'Corte + Barba simples': 75,
    'Combo Corte + Barboterapia': 90,
    'Combo Corte + Barba + Sobrancelha': 100,
    'Coloração': 60,
    'Barboterapia': 50,
    'Barba Simples': 35,
    'Tratamento V.O': 70
  };

  const servicos = Object.keys(tabelaPrecos);

  useEffect(() => {
    fetchAgendamentos();
  }, []);

  const fetchAgendamentos = async () => {
    try {
      const token = localStorage.getItem('token');
      const [resLucas, resYuri] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/agendamentos`, {
          headers: { 'Authorization': `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/agendamentos-yuri`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
      ]);

      let allAgendamentos = [];
      if (resLucas.ok) {
        const dataLucas = await resLucas.json();
        allAgendamentos = [...allAgendamentos, ...dataLucas.map(a => ({ ...a, barber: 'Lucas' }))];
      }
      if (resYuri.ok) {
        const dataYuri = await resYuri.json();
        allAgendamentos = [...allAgendamentos, ...dataYuri.map(a => ({ ...a, barber: 'Yuri' }))];
      }

      setAgendamentos(allAgendamentos);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleServicoChange = (value) => {
    const precoSugerido = tabelaPrecos[value] || 0;
    setFormData({
      ...formData,
      servico: value,
      preco: precoSugerido.toString().replace('.', ',')
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const isYuri = formData.barber === 'Yuri';
      const baseUrl = isYuri 
        ? `${import.meta.env.VITE_API_BASE_URL}/api/agendamentos-yuri`
        : `${import.meta.env.VITE_API_BASE_URL}/api/agendamentos`;

      const url = editingAgendamento
        ? `${baseUrl}/${editingAgendamento.id}`
        : baseUrl;

      const method = editingAgendamento ? 'PUT' : 'POST';

      // envia em centavos
      const precoEmCentavos = formData.preco
        ? Math.round(parseFloat(formData.preco.replace(',', '.')) * 100)
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

  const handleDelete = async (agendamento) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;
    try {
      const token = localStorage.getItem('token');
      const isYuri = agendamento.barber === 'Yuri';
      const baseUrl = isYuri 
        ? `${import.meta.env.VITE_API_BASE_URL}/api/agendamentos-yuri`
        : `${import.meta.env.VITE_API_BASE_URL}/api/agendamentos`;

      const response = await fetch(`${baseUrl}/${agendamento.id}`, {
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

  const formatPreco = (precoRaw) => {
    if (precoRaw === null || precoRaw === undefined || precoRaw === '') return '0,00';
    const val = typeof precoRaw === 'number' ? precoRaw / 100 : parseFloat(precoRaw);
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const openEditDialog = (agendamento) => {
    setEditingAgendamento(agendamento);
    setFormData({
      cliente_nome: agendamento?.cliente_nome ?? '',
      servico: agendamento?.servico ?? '',
      data: agendamento?.data ?? '',
      hora: agendamento?.hora ?? '',
      status: agendamento?.status ?? 'Pendente',
      preco: agendamento?.preco ? (agendamento.preco / 100).toString().replace('.', ',') : '',
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

  const renderTable = (barbeiroNome) => {
    const filtrados = agendamentos.filter(a => {
      const matchBarber = a.barber === barbeiroNome;
      const matchDate = selectedDate ? a.data === format(selectedDate, 'yyyy-MM-dd') : true;
      return matchBarber && matchDate;
    }).sort((a, b) => a.hora.localeCompare(b.hora));

    return (
      <Card className="flex-1">
        <CardHeader className="bg-gray-50/50 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className={`h-5 w-5 ${barbeiroNome === 'Lucas' ? 'text-amber-600' : 'text-green-600'}`} />
            Agenda: {barbeiroNome}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-100/50">
                <tr>
                  <th className="px-4 py-3">Hora</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Serviço</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                      Nenhum agendamento encontrado para {barbeiroNome}.
                    </td>
                  </tr>
                ) : (
                  filtrados.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-700">{a.hora.substring(0, 5)}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{a.cliente_nome}</td>
                      <td className="px-4 py-3 text-gray-600">{a.servico}</td>
                      <td className="px-4 py-3">
                        <Badge className={`${getStatusColor(a.status)} font-normal`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(a.status)}
                            {a.status}
                          </span>
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(a)} className="h-8 w-8 text-blue-600">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(a)} className="h-8 w-8 text-red-600">
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
    );
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-600">Gerencie os horários da barbearia</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className={`flex-1 sm:flex-none ${selectedDate ? "border-amber-600 text-amber-600" : ""}`}>
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
              />
            </PopoverContent>
          </Popover>
          {selectedDate && (
            <Button variant="ghost" onClick={() => setSelectedDate(null)} className="text-gray-500">
              Limpar
            </Button>
          )}
          
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
                  <Select value={formData.servico} onValueChange={handleServicoChange}>
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
                        <SelectItem value="Yuri">Yuri</SelectItem>
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
                    readOnly
                    className="bg-gray-50"
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderTable('Lucas')}
        {renderTable('Yuri')}
      </div>
    </div>
  );
};

export default Agenda;
