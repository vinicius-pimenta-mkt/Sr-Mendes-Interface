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

  // Dicionário de cores clarinhas e transparentes para cada plano
  const coresPorPlano = {
    'PLANO MENSAL DE CORTE E BARBA': 'bg-green-50/60',
    'PLANO CORTE QUINZENAL': 'bg-blue-50/60',
    'PLANO CORTE MENSAL': 'bg-purple-50/60',
    'PLANO CORTE E BARBA QUINZENAL': 'bg-yellow-50/60',
    'PLANO BARBA ILIMITADO': 'bg-slate-100/60' // Cinza claro
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
        // Carrega 100% de dados reais da API. Se for array vazio, zera a lista.
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

  if (loading) return <div className="p-8 text-center">Carregando assinantes...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planos de Assinatura</h1>
          <p className="text-gray-600">Gestão de assinantes oficiais e mensalidades</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Buscar por nome, CPF ou Tel..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if(!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                <Plus className="h-4 w-4 mr-2" /> Novo Assinante
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingAssinante ? 'Editar Assinante' : 'Novo Assinante'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>Nome Completo</Label>
                    <Input required value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} />
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label>CPF</Label>
                    <Input placeholder="000.000.000-00" value={formData.cpf} onChange={(e) => setFormData({...formData, cpf: e.target.value})} />
                  </div>
                  <div className="space-y-2 col-span-2 sm:col-span-1">
                    <Label>Telefone</Label>
                    <Input placeholder="(00) 00000-0000" value={formData.telefone} onChange={(e) => setFormData({...formData, telefone: e.target.value})} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Plano</Label>
                    <Select value={formData.plano} onValueChange={(v) => setFormData({...formData, plano: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {planosDisponiveis.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Vencimento (Dia/Mês)</Label>
                    <Input placeholder="Ex: 15/02" value={formData.data_vencimento} onChange={(e) => setFormData({...formData, data_vencimento: e.target.value})} />
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
                  <div className="space-y-2">
                    <Label>Último Pagamento</Label>
                    <Input type="date" value={formData.ultimo_pagamento} onChange={(e) => setFormData({...formData, ultimo_pagamento: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                  {editingAssinante ? 'Salvar Alterações' : 'Cadastrar Assinante'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-8">
        {planosDisponiveis.map(plano => (
          <Card key={plano} className={`shadow-sm border-none overflow-hidden ${coresPorPlano[plano] || 'bg-white'}`}>
            <CardHeader className="bg-gray-50 border-b py-4">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-amber-600" />
                  <span className="font-bold">{plano} (SOBRANCELHA INCLUSO)</span>
                </div>
                <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                  {assinantesPorPlano[plano].length} {assinantesPorPlano[plano].length === 1 ? 'assinante' : 'assinantes'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50/30 border-b">
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
                  <tbody className="divide-y divide-gray-100/50">
                    {assinantesPorPlano[plano].length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-10 text-center text-gray-400 italic">Nenhum assinante ativo neste plano.</td>
                      </tr>
                    ) : (
                      assinantesPorPlano[plano].map((a) => (
                        <tr key={a.id} className="hover:bg-white/40 transition-colors group">
                          <td className="px-6 py-4">
                            <span className="font-bold text-gray-900 block">{a.nome}</span>
                            <span className="text-[10px] text-gray-500">Cadastrado em: {new Date(a.data_cadastro).toLocaleDateString('pt-BR')}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="flex items-center gap-1 text-gray-700">
                              <IdCard className="h-3 w-3 text-gray-400" /> {a.cpf || '--'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="flex items-center gap-1 text-gray-700">
                              <Phone className="h-3 w-3 text-gray-400" /> {a.telefone || '--'}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-amber-600">{a.data_vencimento || '--'}</td>
                          <td className="px-6 py-4">
                            {a.ultima_visita ? (
                              <div className="flex flex-col">
                                <span className="flex items-center gap-1 text-xs text-gray-700"><Clock className="h-3 w-3" /> {a.ultima_visita}</span>
                              </div>
                            ) : (
                              <span className="text-gray-500 text-xs italic">Sem registros</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={a.status === 'Ativo' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200'} variant="outline">
                              {a.status === 'Ativo' ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                              {a.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEditDialog(a)} className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)} className="h-8 w-8 text-red-600 hover:bg-red-50">
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
