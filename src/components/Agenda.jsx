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
  User,
  Phone,
  Lock
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Agenda = () => {
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    cliente_nome: '',
    cliente_telefone: '',
    servico: '',
    data: format(new Date(), 'yyyy-MM-dd'),
    hora: '',
    status: 'Pendente',
    preco: '',
    forma_pagamento: 'Dinheiro',
    observacoes: '',
    barber: 'Lucas'
  });

  const [blockData, setBlockData] = useState({
    barber: 'Ambos',
    data_inicio: format(new Date(), 'yyyy-MM-dd'),
    data_fim: format(new Date(), 'yyyy-MM-dd'),
    hora_inicio: '12:00',
    hora_fim: '14:00',
    intervalo: '30'
  });

  const tabelaPrecos = {
    'Sobrancelha': 15, 'Selagem': 65, 'Relaxamento': 45, 'Pigmentação': 30,
    'Acabamento (Pezinho)': 25, 'Luzes': 100, 'Limpeza de pele': 40,
    'Hidratação': 40, 'Finalização penteado': 25, 'Corte + Sobrancelha': 60,
    'Corte Masculino': 45, 'Raspar na maquina': 35, 'Corte infantil no carrinho': 50,
    'Corte infantil': 50, 'Corte + Barba simples': 80, 'Combo Corte + Barboterapia': 90,
    'Combo Corte + Barba + Sobrancelha': 90, 'Coloração': 35, 'Barboterapia': 50,
    'Barba Simples': 40, 'Tratamento V.O': 90
  };

  const servicos = Object.keys(tabelaPrecos);
  const formasPagamento = ['Pix', 'Dinheiro', 'Cartão de Débito', 'Cartão de Crédito'];

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

    // TRAVA: Impede de salvar agendamentos aos domingos e segundas
    const [ano, mes, dia] = formData.data.split('-');
    const dataObj = new Date(ano, mes - 1, dia);
    const diaSemana = dataObj.getDay();
    if (diaSemana === 0 || diaSemana === 1) {
      alert('A barbearia é fechada aos Domingos e Segundas-feiras. Selecione outra data.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const isYuri = formData.barber === 'Yuri';
      const baseUrl = isYuri 
        ? `${import.meta.env.VITE_API_BASE_URL}/api/agendamentos-yuri`
        : `${import.meta.env.VITE_API_BASE_URL}/api/agendamentos`;

      const url = editingAgendamento ? `${baseUrl}/${editingAgendamento.id}` : baseUrl;
      const method = editingAgendamento ? 'PUT' : 'POST';

      const precoEmCentavos = formData.preco
        ? Math.round(parseFloat(formData.preco.replace(',', '.')) * 100) : null;

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
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Erro ao salvar agendamento.');
      }
    } catch (error) {
      console.error('Erro ao salvar agendamento:', error);
    }
  };

  const gerarSlotsBloqueio = (blockId) => {
    const slots = [];
    const [yearIni, monthIni, dayIni] = blockData.data_inicio.split('-').map(Number);
    const [yearFim, monthFim, dayFim] = blockData.data_fim.split('-').map(Number);
    
    const dIni = new Date(yearIni, monthIni - 1, dayIni, 12, 0, 0);
    const dFim = new Date(yearFim, monthFim - 1, dayFim, 12, 0, 0);
    
    for (let d = new Date(dIni); d <= dFim; d.setDate(d.getDate() + 1)) {
      const dataStr = format(d, 'yyyy-MM-dd');
      const [hIni, mIni] = blockData.hora_inicio.split(':').map(Number);
      const [hFim, mFim] = blockData.hora_fim.split(':').map(Number);
      
      let minAtual = hIni * 60 + mIni;
      const minFim = hFim * 60 + mFim;
      
      while (minAtual <= minFim) {
        const h = Math.floor(minAtual / 60).toString().padStart(2, '0');
        const m = (minAtual % 60).toString().padStart(2, '0');
        slots.push({ data: dataStr, hora: `${h}:${m}`, blockId });
        minAtual += parseInt(blockData.intervalo);
      }
    }
    return slots;
  };

  const handleBlockSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const blockId = 'block_' + Date.now();
      const slots = gerarSlotsBloqueio(blockId);
      
      if (slots.length === 0) {
        alert("Nenhum horário selecionado. Verifique os horários e datas.");
        return;
      }

      const requests = [];
      
      for (const slot of slots) {
        const payload = {
          cliente_nome: 'Bloqueio de Agenda',
          cliente_telefone: '',
          servico: 'Horário Bloqueado',
          data: slot.data,
          hora: slot.hora,
          status: 'Bloqueado',
          preco: 0,
          forma_pagamento: '-',
          observacoes: slot.blockId
        };

        if (blockData.barber === 'Lucas' || blockData.barber === 'Ambos') {
          requests.push(fetch(`${import.meta.env.VITE_API_BASE_URL}/api/agendamentos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
          }));
        }
        if (blockData.barber === 'Yuri' || blockData.barber === 'Ambos') {
          requests.push(fetch(`${import.meta.env.VITE_API_BASE_URL}/api/agendamentos-yuri`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(payload)
          }));
        }
      }

      await Promise.all(requests);
      alert(`${slots.length} horários foram bloqueados com sucesso!`);
      
      fetchAgendamentos();
      setBlockDialogOpen(false);
    } catch (error) {
      console.error('Erro ao bloquear agenda:', error);
      alert("Erro de conexão ao tentar bloquear a agenda.");
    }
  };

  const handleDelete = async (agendamento) => {
    const token = localStorage.getItem('token');
    
    if (agendamento.status === 'Bloqueado' && agendamento.observacoes?.startsWith('block_')) {
      const deleteGroup = confirm('ATENÇÃO: Este horário faz parte de um BLOQUEIO EM LOTE.\n\nClique em [OK] para excluir a rotina completa.\n\nClique em [Cancelar] se quiser excluir APENAS este horário específico.');
      
      if (deleteGroup) {
        try {
          const blockId = agendamento.observacoes;
          const itemsToDelete = agendamentos.filter(a => a.observacoes === blockId);
          
          const deleteRequests = itemsToDelete.map(item => {
            const baseUrl = item.barber === 'Yuri' 
              ? `${import.meta.env.VITE_API_BASE_URL}/api/agendamentos-yuri` 
              : `${import.meta.env.VITE_API_BASE_URL}/api/agendamentos`;
              
            return fetch(`${baseUrl}/${item.id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` },
            });
          });

          await Promise.all(deleteRequests);
          fetchAgendamentos();
          alert('Bloqueio removido!');
        } catch (error) { 
          alert('Erro ao tentar remover o bloqueio.');
        }
        return;
      } else {
        if (!confirm('Confirmar liberação APENAS deste horário específico?')) return;
      }
    } else {
      if (!confirm('Tem certeza que deseja cancelar/excluir este registro?')) return;
    }

    const isYuri = agendamento.barber === 'Yuri';
    const baseUrl = isYuri 
      ? `${import.meta.env.VITE_API_BASE_URL}/api/agendamentos-yuri`
      : `${import.meta.env.VITE_API_BASE_URL}/api/agendamentos`;

    try {
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
      cliente_nome: '', cliente_telefone: '', servico: '',
      data: format(selectedDate || new Date(), 'yyyy-MM-dd'),
      hora: '', status: 'Pendente', preco: '',
      forma_pagamento: 'Dinheiro', observacoes: '', barber: 'Lucas'
    });
    setEditingAgendamento(null);
  };

  const openEditDialog = (agendamento) => {
    setEditingAgendamento(agendamento);
    setFormData({
      cliente_nome: agendamento?.cliente_nome ?? '',
      cliente_telefone: agendamento?.cliente_telefone ?? '',
      servico: agendamento?.servico ?? '',
      data: agendamento?.data ?? '',
      hora: agendamento?.hora ?? '',
      status: agendamento?.status ?? 'Pendente',
      preco: agendamento?.preco ? (agendamento.preco / 100).toString().replace('.', ',') : '',
      forma_pagamento: agendamento?.forma_pagamento ?? 'Dinheiro',
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
      case 'Bloqueado':  return 'bg-gray-800 text-white';
      default:           return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Confirmado': return <CheckCircle className="h-4 w-4" />;
      case 'Pendente':   return <Clock className="h-4 w-4" />;
      case 'Cancelado':  return <AlertCircle className="h-4 w-4" />;
      case 'Bloqueado':  return <Lock className="h-4 w-4" />;
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
      <Card className="flex-1 shadow-sm">
        <CardHeader className={`${barbeiroNome === 'Lucas' ? 'bg-amber-50/50' : 'bg-green-50/50'} border-b`}>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className={`h-5 w-5 ${barbeiroNome === 'Lucas' ? 'text-amber-600' : 'text-green-600'}`} />
            Agenda: {barbeiroNome}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                <tr>
                  <th className="px-4 py-3">Hora</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Serviço</th>
                  <th className="px-4 py-3">Pagamento</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-12 text-center text-gray-400 italic">
                      Nenhum agendamento para este dia.
                    </td>
                  </tr>
                ) : (
                  filtrados.map((a) => (
                    <tr key={a.id} className={`hover:bg-gray-50 transition-colors ${a.status === 'Bloqueado' ? 'bg-gray-100 opacity-80' : ''}`}>
                      <td className="px-4 py-3 font-bold text-gray-900">{a.hora.substring(0, 5)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className={`font-medium ${a.status === 'Bloqueado' ? 'text-gray-500' : 'text-gray-700'}`}>{a.cliente_nome}</span>
                          {a.status !== 'Bloqueado' && (
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Phone className="h-2 w-2" /> {a.cliente_telefone || 'Sem tel.'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{a.servico}</td>
                      <td className="px-4 py-3">
                        {a.status !== 'Bloqueado' ? (
                           <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                             {a.forma_pagamento || 'Não def.'}
                           </span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`${getStatusColor(a.status)} font-normal text-[10px]`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(a.status)}
                            {a.status}
                          </span>
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right space-x-1">
                        {a.status !== 'Bloqueado' && (
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(a)} className="h-8 w-8 text-blue-600">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agenda de Atendimentos</h1>
          <p className="text-gray-600">Gerencie os horários da barbearia</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50">
                <CalendarDays className="h-4 w-4 mr-2 text-amber-600" />
                {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : "Filtrar Data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setCalendarOpen(false);
                  }
                }}
                // TRAVA NO CALENDÁRIO VISUAL: Desativa clique nos domingos (0) e segundas (1)
                disabled={(date) => date.getDay() === 0 || date.getDay() === 1}
                locale={ptBR}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" className="bg-gray-800 hover:bg-gray-900 text-white">
                <Lock className="h-4 w-4 mr-2" /> Bloquear Horários
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Bloquear Horários na Agenda</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleBlockSubmit} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Agenda(s) a bloquear</Label>
                  <Select value={blockData.barber} onValueChange={(v) => setBlockData({...blockData, barber: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ambos">Geral (Lucas e Yuri)</SelectItem>
                      <SelectItem value="Lucas">Apenas Lucas</SelectItem>
                      <SelectItem value="Yuri">Apenas Yuri</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data de Início</Label>
                    <Input type="date" required value={blockData.data_inicio} onChange={(e) => setBlockData({...blockData, data_inicio: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Final</Label>
                    <Input type="date" required value={blockData.data_fim} onChange={(e) => setBlockData({...blockData, data_fim: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Hora Inicial</Label>
                    <Input type="time" required value={blockData.hora_inicio} onChange={(e) => setBlockData({...blockData, hora_inicio: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Hora Final</Label>
                    <Input type="time" required value={blockData.hora_fim} onChange={(e) => setBlockData({...blockData, hora_fim: e.target.value})} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Gerar bloqueios a cada:</Label>
                    <Select value={blockData.intervalo} onValueChange={(v) => setBlockData({...blockData, intervalo: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 Minutos</SelectItem>
                        <SelectItem value="30">30 Minutos</SelectItem>
                        <SelectItem value="60">1 Hora</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button type="button" variant="outline" onClick={() => setBlockDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit" className="bg-gray-800 hover:bg-gray-900 text-white">Aplicar Bloqueio</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if(!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                <Plus className="h-4 w-4 mr-2" /> Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingAgendamento ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>Barbeiro</Label>
                    <Select value={formData.barber} onValueChange={(v) => setFormData({...formData, barber: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Lucas">Lucas</SelectItem>
                        <SelectItem value="Yuri">Yuri</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Nome do Cliente</Label>
                    <Input required value={formData.cliente_nome} onChange={(e) => setFormData({...formData, cliente_nome: e.target.value})} placeholder="Nome completo" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Telefone do Cliente</Label>
                    <Input value={formData.cliente_telefone} onChange={(e) => setFormData({...formData, cliente_telefone: e.target.value})} placeholder="(00) 00000-0000" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Serviço</Label>
                    <Select value={formData.servico} onValueChange={handleServicoChange}>
                      <SelectTrigger><SelectValue placeholder="Selecione o serviço" /></SelectTrigger>
                      <SelectContent>
                        {servicos.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input type="date" required value={formData.data} onChange={(e) => setFormData({...formData, data: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Hora</Label>
                    <Input type="time" required value={formData.hora} onChange={(e) => setFormData({...formData, hora: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Preço (R$)</Label>
                    <Input value={formData.preco} onChange={(e) => setFormData({...formData, preco: e.target.value})} placeholder="0,00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Forma de Pagamento</Label>
                    <Select value={formData.forma_pagamento} onValueChange={(v) => setFormData({...formData, forma_pagamento: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {formasPagamento.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Confirmado">Confirmado</SelectItem>
                        <SelectItem value="Cancelado">Cancelado</SelectItem>
                        <SelectItem value="Bloqueado">Bloqueado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
                    {editingAgendamento ? 'Salvar Alterações' : 'Criar Agendamento'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {renderTable('Lucas')}
        {renderTable('Yuri')}
      </div>
    </div>
  );
};

export default Agenda;
