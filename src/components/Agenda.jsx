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
    cliente_nome: '', servico: '', data: '', hora: '', status: 'Pendente', preco: '', observacoes: '', barber: 'Lucas'
  });

  const tabelaPrecos = {
    'Sobrancelha': 20, 'Selagem': 100, 'Relaxamento': 80, 'Pigmentação': 30, 'Acabamento (Pezinho)': 15,
    'Luzes': 120, 'Limpeza de pele': 40, 'Hidratação': 35, 'Finalização penteado': 25, 'Corte+ Sobrancelha': 55,
    'Corte Masculino': 45, 'Raspar na maquina': 30, 'Corte infantil no carrinho': 40, 'Corte infantil': 35,
    'Corte + Barba simples': 75, 'Combo Corte + Barboterapia': 90, 'Combo Corte + Barba + Sobrancelha': 100,
    'Coloração': 60, 'Barboterapia': 50, 'Barba Simples': 35, 'Tratamento V.O': 70
  };

  const servicos = Object.keys(tabelaPrecos);

  useEffect(() => { fetchAgendamentos(); }, []);

  const fetchAgendamentos = async () => {
    try {
      const token = localStorage.getItem('token');
      const [resLucas, resYuri] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/agendamentos`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/api/agendamentos-yuri`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      let all = [];
      if (resLucas.ok) { const d = await resLucas.json(); all = [...all, ...d.map(a => ({ ...a, barber: 'Lucas' }))]; }
      if (resYuri.ok) { const d = await resYuri.json(); all = [...all, ...d.map(a => ({ ...a, barber: 'Yuri' }))]; }
      setAgendamentos(all);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleServicoChange = (val) => {
    setFormData({ ...formData, servico: val, preco: (tabelaPrecos[val] || 0).toString().replace('.', ',') });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const isYuri = formData.barber === 'Yuri';
      const baseUrl = isYuri ? `${import.meta.env.VITE_API_BASE_URL}/api/agendamentos-yuri` : `${import.meta.env.VITE_API_BASE_URL}/api/agendamentos`;
      const url = editingAgendamento ? `${baseUrl}/${editingAgendamento.id}` : baseUrl;
      const method = editingAgendamento ? 'PUT' : 'POST';
      const precoCentavos = Math.round(parseFloat(formData.preco.replace(',', '.')) * 100);
      const response = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...formData, preco: precoCentavos }),
      });
      if (response.ok) { fetchAgendamentos(); setDialogOpen(false); resetForm(); }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (a) => {
    if (!confirm('Excluir?')) return;
    try {
      const token = localStorage.getItem('token');
      const baseUrl = a.barber === 'Yuri' ? `${import.meta.env.VITE_API_BASE_URL}/api/agendamentos-yuri` : `${import.meta.env.VITE_API_BASE_URL}/api/agendamentos`;
      const response = await fetch(`${baseUrl}/${a.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) fetchAgendamentos();
    } catch (e) { console.error(e); }
  };

  const resetForm = () => {
    setFormData({ cliente_nome: '', servico: '', data: '', hora: '', status: 'Pendente', preco: '', observacoes: '', barber: 'Lucas' });
    setEditingAgendamento(null);
  };

  const openEdit = (a) => {
    setEditingAgendamento(a);
    setFormData({ ...a, preco: (a.preco / 100).toString().replace('.', ',') });
    setDialogOpen(true);
  };

  const renderTable = (name) => {
    const list = agendamentos.filter(a => a.barber === name && (selectedDate ? a.data === format(selectedDate, 'yyyy-MM-dd') : true)).sort((a,b) => a.hora.localeCompare(b.hora));
    return (
      <Card className="flex-1">
        <CardHeader className="bg-gray-50/50 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className={`h-5 w-5 ${name === 'Lucas' ? 'text-amber-600' : 'text-green-600'}`} /> {name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-100/50 text-xs uppercase">
              <tr><th className="p-3 text-left">Hora</th><th className="p-3 text-left">Cliente</th><th className="p-3 text-left">Serviço</th><th className="p-3 text-right">Ações</th></tr>
            </thead>
            <tbody className="divide-y">
              {list.map(a => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="p-3 font-semibold">{a.hora.substring(0,5)}</td>
                  <td className="p-3">{a.cliente_nome}</td>
                  <td className="p-3">{a.servico}</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(a)} className="h-8 w-8 text-blue-600"><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(a)} className="h-8 w-8 text-red-600"><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    );
  };

  if (loading) return <div className="flex justify-center p-10"><div className="animate-spin h-10 w-10 border-b-2 border-amber-600 rounded-full"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Agenda</h1>
        <div className="flex gap-2">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild><Button variant="outline">{selectedDate ? format(selectedDate, 'dd/MM/yyyy') : "Filtrar Data"}</Button></PopoverTrigger>
            <PopoverContent className="w-auto p-0"><CalendarComponent mode="single" selected={selectedDate} onSelect={(d) => { setSelectedDate(d); setCalendarOpen(false); }} locale={ptBR} /></PopoverContent>
          </Popover>
          {selectedDate && <Button variant="ghost" onClick={() => setSelectedDate(null)}>Limpar</Button>}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild><Button onClick={resetForm} className="bg-amber-600"><Plus className="h-4 w-4 mr-2" /> Novo</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editingAgendamento ? "Editar" : "Novo"} Agendamento</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Label>Cliente</Label><Input value={formData.cliente_nome} onChange={e => setFormData({...formData, cliente_nome: e.target.value})} required />
                <Label>Serviço</Label>
                <Select value={formData.servico} onValueChange={handleServicoChange}>
                  <SelectTrigger><SelectValue placeholder="Serviço" /></SelectTrigger>
                  <SelectContent>{servicos.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Data</Label><Input type="date" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} required /></div>
                  <div><Label>Hora</Label><Input type="time" value={formData.hora} onChange={e => setFormData({...formData, hora: e.target.value})} required /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Barbeiro</Label><Select value={formData.barber} onValueChange={v => setFormData({...formData, barber: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Lucas">Lucas</SelectItem><SelectItem value="Yuri">Yuri</SelectItem></SelectContent></Select></div>
                  <div><Label>Preço</Label><Input value={formData.preco} readOnly className="bg-gray-50" /></div>
                </div>
                <Button type="submit" className="w-full bg-amber-600">Salvar</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">{renderTable('Lucas')}{renderTable('Yuri')}</div>
    </div>
  );
};

export default Agenda;
