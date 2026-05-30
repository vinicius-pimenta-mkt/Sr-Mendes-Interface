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
  Plus, 
  Search, 
  Calendar, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle,
  Trash2,
  Edit,
  UserCheck,
  IdCard,
  Phone
} from 'lucide-react';

const Planos = () => {
  const [assinantes, setAssinantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAssinante, setEditingAssinante] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    plano: 'PLANO CORTE MENSAL',
    data_vencimento: '',
    ultimo_pagamento: '',
    forma_pagamento: 'Pix',
    status: 'Ativo'
  });

  const planosDisponiveis = [
    'PLANO MENSAL DE CORTE E BARBA',
    'PLANO CORTE QUINZENAL',
    'PLANO CORTE MENSAL',
    'PLANO CORTE E BARBA QUINZENAL',
    'PLANO BARBA ILIMITADO'
  ];

  // Dicionário de cores ajustado para o Dark Mode (fundos super escuros/translúcidos)
  const coresPorPlano = {
    'PLANO MENSAL DE CORTE E BARBA': 'bg-green-950/20 border-green-900/30',
    'PLANO CORTE QUINZENAL': 'bg-blue-950/20 border-blue-900/30',
    'PLANO CORTE MENSAL': 'bg-purple-950/20 border-purple-900/30',
    'PLANO CORTE E BARBA QUINZENAL': 'bg-yellow-950/20 border-yellow-900/30',
    'PLANO BARBA ILIMITADO': 'bg-neutral-900/40 border-neutral-800' 
  };

  const formasPagamento = ['Pix', 'Dinheiro', 'Cartão de Débito', 'Cartão de Crédito'];

  useEffect(() => {
    fetchAssinantes();
  }, []);

  const fetchAssinantes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/assinantes`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAssinantes(Array.isArray(data) ? data : []);
      } else {
        setAssinantes([]);
      }
    } catch (error) {
      console.error('Erro ao carregar assinantes:', error);
      setAssinantes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingAssinante 
        ? `${import.meta.env.VITE_API_BASE_URL}/api/assinantes/${editingAssinante.id}`
        : `${import.meta.env.VITE_API_BASE_URL}/api/assinantes`;
      
      const method = editingAssinante ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchAssinantes();
        setDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Erro ao salvar assinante:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deseja remover este assinante?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/assinantes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) fetchAssinantes();
    } catch (error) {
      console.error('Erro ao deletar assinante:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      cpf: '',
      telefone: '',
      plano: 'PLANO CORTE MENSAL',
      data_vencimento: '',
      ultimo_pagamento: '',
      forma_pagamento: 'Pix',
      status: 'Ativo'
    });
    setEditingAssinante(null);
  };

  const openEditDialog = (assinante) => {
    setEditingAssinante(assinante);
    setFormData({
      nome: assinante.nome,
      cpf: assinante.cpf || '',
      telefone: assinante.telefone || '',
      plano: assinante.plano,
      data_vencimento: assinante.data_vencimento,
      ultimo_pagamento: assinante.ultimo_pagamento || '',
      forma_pagamento: assinante.forma_pagamento || 'Pix',
      status: assinante.status
    });
    setDialogOpen(true);
  };

  const filtrados = assinantes.filter(a => 
    a.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (a.cpf && a.cpf.includes(searchTerm)) ||
    (a.telefone && a.telefone.includes(searchTerm))
  );

  const assinantesPorPlano = planosDisponiveis.reduce((acc, plano) => {
    acc[plano] = filtrados.filter(a => a.plano === plano);
    return acc;
  }, {});

  if (loading) return <div className="flex justify-center h-64 items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DEAE60]"></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pt-8 sm:pt-4">
      
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-md">Planos de Assinatura</h1>
          <p className="text-neutral-400 text-sm font-medium mt-1">Gestão de assinantes oficiais e mensalidades</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* BARRA DE PESQUISA */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#DEAE60]" />
            <Input 
              placeholder="Buscar por nome, CPF ou Tel..." 
              className="pl-10 bg-neutral-900/60 border-[0.5px] border-neutral-800 text-white placeholder:text-neutral-500 backdrop-blur-md focus-visible:ring-[#DEAE60]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* MODAL DE CRIAÇÃO / EDIÇÃO - TELA CLARA */}
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if(!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-[#DEAE60] hover:bg-[#DEAE60]/90 text-neutral-950 font-black shadow-lg uppercase tracking-wider text-xs px-3 sm:px-4">
                <Plus className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Novo Assinante</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white text-gray-900 border-gray-200">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold uppercase tracking-tight text-gray-900">{editingAssinante ? 'Editar Assinante' : 'Novo Assinante'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Nome Completo</Label>
                    <Input required value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#DEAE60]" />
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">CPF</Label>
                    <Input placeholder="000.000.000-00" value={formData.cpf} onChange={(e) => setFormData({...formData, cpf: e.target.value})} className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#DEAE60]" />
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Telefone</Label>
                    <Input placeholder="(00) 00000-0000" value={formData.telefone} onChange={(e) => setFormData({...formData, telefone: e.target.value})} className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#DEAE60]" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Plano</Label>
                    <Select value={formData.plano} onValueChange={(v) => setFormData({...formData, plano: v})}>
                      <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 font-bold focus-visible:ring-[#DEAE60]"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 text-gray-900">
                        {planosDisponiveis.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Vencimento (Dia/Mês)</Label>
                    <Input placeholder="Ex: 15/02" value={formData.data_vencimento} onChange={(e) => setFormData({...formData, data_vencimento: e.target.value})} className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#DEAE60]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Forma de Pagamento</Label>
                    <Select value={formData.forma_pagamento} onValueChange={(v) => setFormData({...formData, forma_pagamento: v})}>
                      <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#DEAE60]"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 text-gray-900">
                        {formasPagamento.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Último Pagamento</Label>
                    <Input type="date" value={formData.ultimo_pagamento} onChange={(e) => setFormData({...formData, ultimo_pagamento: e.target.value})} className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#DEAE60]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                      <SelectTrigger className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#DEAE60]"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 text-gray-900">
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50">Cancelar</Button>
                  <Button type="submit" className="bg-[#DEAE60] hover:bg-[#DEAE60]/90 text-neutral-950 font-black uppercase tracking-wider">
                    {editingAssinante ? 'Salvar Alterações' : 'Cadastrar Assinante'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* RENDERIZAÇÃO DOS PLANOS */}
      <div className="space-y-8">
        {planosDisponiveis.map(plano => (
          <Card key={plano} className={`shadow-xl border-[0.5px] overflow-hidden backdrop-blur-md ${coresPorPlano[plano]}`}>
            <CardHeader className="bg-neutral-950/50 border-b-[0.5px] border-neutral-800/50 py-4">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-5 w-5 text-[#DEAE60]" />
                  <span className="font-black text-white uppercase tracking-tight">{plano} <span className="text-[10px] text-neutral-400 font-bold ml-2">(SOBRANCELHA INCLUSO)</span></span>
                </div>
                <Badge variant="outline" className="bg-neutral-900/80 text-[#DEAE60] border-[0.5px] border-[#DEAE60]/30 font-bold">
                  {assinantesPorPlano[plano].length} {assinantesPorPlano[plano].length === 1 ? 'assinante' : 'assinantes'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] text-neutral-400 uppercase tracking-widest bg-neutral-950/30 border-b-[0.5px] border-neutral-800/50 font-bold">
                    <tr>
                      <th className="px-6 py-4">Assinante</th>
                      <th className="px-6 py-4">CPF</th>
                      <th className="px-6 py-4">Telefone</th>
                      <th className="px-6 py-4">Vencimento</th>
                      <th className="px-6 py-4">Última Visita</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/30">
                    {assinantesPorPlano[plano].length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-10 text-center text-neutral-500 font-bold uppercase tracking-widest text-xs">Nenhum assinante ativo neste plano.</td>
                      </tr>
                    ) : (
                      assinantesPorPlano[plano].map((a) => (
                        <tr key={a.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4">
                            <span className="font-black text-white block">{a.nome}</span>
                            <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest">Cadastrado em: {new Date(a.data_cadastro).toLocaleDateString('pt-BR')}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="flex items-center gap-1.5 text-neutral-300 font-medium">
                              <IdCard className="h-3 w-3 text-[#DEAE60]" /> {a.cpf || '--'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="flex items-center gap-1.5 text-neutral-300 font-medium">
                              <Phone className="h-3 w-3 text-[#DEAE60]" /> {a.telefone || '--'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-black text-[#DEAE60]">{a.data_vencimento || '--'}</td>
                          <td className="px-6 py-4">
                            {a.ultima_visita ? (
                              <div className="flex flex-col">
                                <span className="flex items-center gap-1.5 text-xs text-neutral-300 font-medium"><Clock className="h-3 w-3 text-neutral-500" /> {a.ultima_visita}</span>
                              </div>
                            ) : (
                              <span className="text-neutral-600 text-[10px] uppercase font-bold tracking-widest">Sem registros</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={`border-[0.5px] text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 ${a.status === 'Ativo' ? 'bg-green-950/50 text-green-400 border-green-900/50' : 'bg-red-950/50 text-red-400 border-red-900/50'}`} variant="outline">
                              {a.status === 'Ativo' ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                              {a.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditDialog(a)} className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)} className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/30">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Planos;
