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
    observacoes: ''
  });

  const servicos = [
    'Corte',
    'Barba',
    'Corte e Barba',
    'Sobrancelha',
    'Corte e Sobrancelha',
    'Corte, Barba e Sobrancelha'
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
      observacoes: ''
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
      observacoes: agendamento?.observacoes ?? ''
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
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Confirmado">Confirmado</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preco">Preço (R$)</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    value={formData.preco}
                    onChange={(e) => setFormData({...formData, preco: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Input
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                  {editingAgendamento ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtro de Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-amber-600" />
            Filtrar por Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[280px] justify-start text-left font-normal"
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "dd/MM/yyyy")
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setCalendarOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {selectedDate && (
              <Button
                variant="outline"
                onClick={limparFiltro}
                className="text-gray-600 hover:text-gray-800"
              >
                Limpar Filtro
              </Button>
            )}

            <div className="text-sm text-gray-600">
              {selectedDate ? (
                `Mostrando agendamentos de ${format(selectedDate, "dd/MM/yyyy")} (${agendamentosFiltrados.length})`
              ) : (
                `Mostrando todos os agendamentos (${agendamentos.length})`
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-600" />
            Agendamentos
            {selectedDate && (
              <span className="text-sm font-normal text-gray-600">
                - {format(selectedDate, "dd/MM/yyyy")}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {agendamentosFiltrados.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {selectedDate 
                ? `Nenhum agendamento encontrado para ${format(selectedDate, "dd/MM/yyyy")}`
                : "Nenhum agendamento encontrado"
              }
            </p>
          ) : (
            <div className="space-y-4">
              {agendamentosFiltrados.map((agendamento) => (
                <div
                  key={agendamento.id}
                  className="flex items-center justify-between p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-6">
                    <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-amber-600 font-bold text-lg">
                        {agendamento.cliente_nome?.charAt(0) || "C"}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg text-gray-900">{agendamento.cliente_nome}</h3>
                      <p className="font-semibold text-base text-gray-700">{agendamento.servico}</p>
                      <div className="inline-block bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-4 py-2 rounded-lg font-medium text-sm shadow-sm">
                        {new Date(agendamento.data + "T00:00:00").toLocaleDateString("pt-BR")} às {agendamento.hora}
                      </div>
                      {agendamento.observacoes && (
                        <p className="text-sm text-gray-600 italic mt-1">
                          Obs: {agendamento.observacoes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right space-y-2">
                      <Badge className={`${getStatusColor(agendamento.status)} flex items-center gap-1`}>
                        {getStatusIcon(agendamento.status)}
                        {agendamento.status}
                      </Badge>
                      {agendamento.preco !== undefined && agendamento.preco !== null && (
                        <p className="text-lg font-bold text-green-600">
                          R$ {formatPreco(agendamento.preco)}
                        </p>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(agendamento)}
                        className="hover:bg-amber-50 hover:border-amber-300"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(agendamento.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Agenda;
