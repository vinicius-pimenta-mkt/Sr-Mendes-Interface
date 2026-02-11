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
  const [agendamentosLucas, setAgendamentosLucas] = useState([]);
  const [agendamentosYuri, setAgendamentosYuri] = useState([]);
  const [filtradosLucas, setFiltradosLucas] = useState([]);
  const [filtradosYuri, setFiltradosYuri] = useState([]);
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
    barbeiro: 'Lucas'
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
    'CORTE+ SOBRANCELHA',
    'Corte Masculino',
    'Raspar na maquina',
    'Corte infantil no carrinho',
    'corte infantil',
    'CORTE + BARBA SIMPLES',
    'COMBO CORTE+BARBOTERAPIA',
    'COMBO CORTE+BARBA + SOBRANCELHA',
    'Coloração',
    'Barboterapia',
    'Barba Simples',
    'Tratamento V.O'
  ];

  useEffect(() => {
    fetchAllAgendamentos();
  }, []);

  useEffect(() => {
    filtrarTudo();
  }, [agendamentosLucas, agendamentosYuri, selectedDate]);

  const fetchAllAgendamentos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [resLucas, resYuri] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/agendamentos`, { headers }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/agendamentos-yuri`, { headers })
      ]);

      if (resLucas.ok) setAgendamentosLucas(await resLucas.json());
      if (resYuri.ok) setAgendamentosYuri(await resYuri.json());
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtrarTudo = () => {
    if (!selectedDate) {
      setFiltradosLucas(agendamentosLucas);
      setFiltradosYuri(agendamentosYuri);
      return;
    }
    const dataFiltro = format(selectedDate, 'yyyy-MM-dd');
    setFiltradosLucas(agendamentosLucas.filter(a => a.data === dataFiltro));
    setFiltradosYuri(agendamentosYuri.filter(a => a.data === dataFiltro));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const isYuri = formData.barbeiro === 'Yuri';
      const endpoint = isYuri ? '/api/agendamentos-yuri' : '/api/agendamentos';
      
      const url = editingAgendamento
        ? `${import.meta.env.VITE_API_BASE_URL}${endpoint}/${editingAgendamento.id}`
        : `${import.meta.env.VITE_API_BASE_URL}${endpoint}`;

      const method = editingAgendamento ? 'PUT' : 'POST';
      const precoEmCentavos = formData.preco ? Math.round(parseFloat(formData.preco) * 100) : null;
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
        fetchAllAgendamentos();
        setDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
    }
  };

  const handleDelete = async (id, barbeiro) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;
    try {
      const token = localStorage.getItem('token');
      const endpoint = barbeiro === 'Yuri' ? '/api/agendamentos-yuri' : '/api/agendamentos';
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) fetchAllAgendamentos();
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
      barbeiro: 'Lucas'
    });
    setEditingAgendamento(null);
  };

  const openEditDialog = (agendamento, barbeiro) => {
    setEditingAgendamento(agendamento);
    const precoFormatado = agendamento.preco ? (agendamento.preco / 100).toFixed(2) : '';
    setFormData({
      cliente_nome: agendamento.cliente_nome,
      servico: agendamento.servico,
      data: agendamento.data,
      hora: agendamento.hora,
      status: agendamento.status,
      preco: precoFormatado,
      observacoes: agendamento.observacoes || '',
      barbeiro: barbeiro
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

  const renderTabela = (lista, titulo, corDestaque, barbeiroNome) => (
    <Card className={`border-t-4 ${corDestaque}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <User className="h-5 w-5 mr-2" />
          Agenda do {barbeiroNome}
        </CardTitle>
        <Badge variant="outline" className="font-normal">
          {lista.length} agendamentos
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-4 py-3">Horário</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Serviço</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lista.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    Nenhum agendamento encontrado para esta data.
                  </td>
                </tr>
              ) : (
                lista.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1 text-gray-400" />
                        {a.hora.substring(0, 5)}
                      </div>
                      <div className="text-xs text-gray-400">{format(new Date(a.data + 'T12:00:00'), 'dd/MM/yyyy')}</div>
                    </td>
                    <td className="px-4 py-3">{a.cliente_nome}</td>
                    <td className="px-4 py-3">{a.servico}</td>
                    <td className="px-4 py-3">
                      <Badge className={`${getStatusColor(a.status)} border-none font-normal`}>
                        {a.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(a, barbeiroNome)}>
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id, barbeiroNome)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
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
          <h1 className="text-3xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-gray-600">Visualize e gerencie os horários de todos os barbeiros</p>
        </div>

        <div className="flex items-center gap-2">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className={selectedDate ? "border-amber-600 text-amber-600" : ""}>
                <CalendarDays className="h-4 w-4 mr-2" />
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
              {selectedDate && (
                <div className="p-2 border-t border-gray-100">
                  <Button variant="ghost" className="w-full text-xs" onClick={() => setSelectedDate(null)}>
                    Limpar Filtro
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-amber-600 hover:bg-amber-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingAgendamento ? "Editar Agendamento" : "Novo Agendamento"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="barbeiro">Barbeiro</Label>
                  <Select 
                    value={formData.barbeiro} 
                    onValueChange={(v) => setFormData({...formData, barbeiro: v})}
                    disabled={!!editingAgendamento}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lucas">Lucas</SelectItem>
                      <SelectItem value="Yuri">Yuri</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cliente_nome">Nome do Cliente</Label>
                  <Input id="cliente_nome" value={formData.cliente_nome} onChange={(e) => setFormData({...formData, cliente_nome: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servico">Serviço</Label>
                  <Select value={formData.servico} onValueChange={(v) => setFormData({...formData, servico: v})}>
                    <SelectTrigger><SelectValue placeholder="Selecione o serviço" /></SelectTrigger>
                    <SelectContent>{servicos.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data">Data</Label>
                    <Input id="data" type="date" value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hora">Hora</Label>
                    <Input id="hora" type="time" value={formData.hora} onChange={(e) => setFormData({...formData, hora: e.target.value})} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preco">Preço (R$)</Label>
                    <Input id="preco" type="number" step="0.01" value={formData.preco} onChange={(e) => setFormData({...formData, preco: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Confirmado">Confirmado</SelectItem>
                        <SelectItem value="Cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700">Salvar Agendamento</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderTabela(filtradosLucas, "Agenda do Lucas", "border-t-amber-500", "Lucas")}
        {renderTabela(filtradosYuri, "Agenda do Yuri", "border-t-green-500", "Yuri")}
      </div>
    </div>
  );
};

export default Agenda;
