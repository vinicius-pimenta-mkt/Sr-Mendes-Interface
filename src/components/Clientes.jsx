import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  Mail,
  Search
} from 'lucide-react';

const Clientes = ({ user }) => {
  const isYuri = user?.role === 'yuri';
  
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    email: ''
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clientes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClientes(data);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const url = editingCliente 
        ? `${import.meta.env.VITE_API_BASE_URL}/api/clientes/${editingCliente.id}`
        : `${import.meta.env.VITE_API_BASE_URL}/api/clientes`;
      
      const method = editingCliente ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchClientes();
        setDialogOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja remover este cliente?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/clientes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchClientes();
      }
    } catch (error) {
      console.error('Erro ao remover cliente:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      telefone: '',
      email: ''
    });
    setEditingCliente(null);
  };

  const openEditDialog = (cliente) => {
    setEditingCliente(cliente);
    setFormData({
      nome: cliente.nome,
      telefone: cliente.telefone || '',
      email: cliente.email || ''
    });
    setDialogOpen(true);
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefone?.includes(searchTerm) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DEAE60]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pt-8 sm:pt-4">
      
      {/* CABEÇALHO RESPONSIVO */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-md">Clientes</h1>
          <p className="text-neutral-400 font-medium drop-shadow-sm mt-1">Gerencie a base de clientes da barbearia</p>
        </div>
        
        {/* MODAL DE CRIAÇÃO / EDIÇÃO - TELA CLARA */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="w-full sm:w-auto bg-[#DEAE60] hover:bg-[#DEAE60]/90 text-neutral-950 font-black shadow-lg uppercase tracking-wider text-xs px-5">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-white text-gray-900 border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold uppercase tracking-tight text-gray-900">
                {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Nome Completo</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  required
                  className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#DEAE60]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  placeholder="(11) 99999-9999"
                  className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#DEAE60]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="cliente@email.com"
                  className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#DEAE60]"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-6 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50">
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#DEAE60] hover:bg-[#DEAE60]/90 text-neutral-950 font-black uppercase tracking-wider text-xs px-6">
                  {editingCliente ? 'Atualizar' : 'Salvar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* BARRA DE PESQUISA */}
      <Card className="bg-neutral-900/60 border-[0.5px] border-neutral-800 backdrop-blur-md shadow-xl">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#DEAE60] h-5 w-5" />
            <Input
              placeholder="Pesquisar clientes por nome, telefone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 bg-neutral-950/50 border-[0.5px] border-neutral-800 text-white placeholder:text-neutral-500 font-medium focus-visible:ring-[#DEAE60] text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* LISTAGEM DE CLIENTES */}
      <Card className="bg-neutral-900/60 border-[0.5px] border-neutral-800 backdrop-blur-md shadow-xl overflow-hidden">
        <CardHeader className="bg-neutral-950/40 border-b-[0.5px] border-neutral-800 p-6">
          <CardTitle className="flex items-center gap-2 text-xl font-black text-white uppercase tracking-tight">
            <Users className="h-6 w-6 text-[#DEAE60]" />
            Lista de Clientes <span className="text-[#DEAE60]">({filteredClientes.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          {filteredClientes.length === 0 ? (
            <div className="text-center text-neutral-500 py-12">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-20 text-[#DEAE60]" />
              <p className="font-bold uppercase tracking-widest text-xs">
                {searchTerm ? 'Nenhum cliente encontrado para a pesquisa' : 'Nenhum cliente cadastrado'}
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredClientes.map((cliente) => (
                <div key={cliente.id} className="flex items-center justify-between p-4 bg-neutral-950/50 border-[0.5px] border-neutral-800/80 rounded-xl hover:bg-white/5 transition-colors group">
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className="w-12 h-12 bg-neutral-950 border-[0.5px] border-[#DEAE60]/30 shadow-inner rounded-full flex items-center justify-center shrink-0">
                      <span className="text-[#DEAE60] font-black text-lg">
                        {cliente.nome?.charAt(0).toUpperCase() || 'C'}
                      </span>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <h3 className="font-black text-white truncate text-base sm:text-lg">{cliente.nome}</h3>
                      
                      {/* INFOS DE CONTATO RESPONSIVAS */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-5 mt-1.5">
                        {cliente.telefone && (
                          <div className="flex items-center text-xs sm:text-sm text-neutral-400 font-medium">
                            <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 shrink-0 text-[#DEAE60]" />
                            <span className="whitespace-nowrap">{cliente.telefone}</span>
                          </div>
                        )}
                        {cliente.email && (
                          <div className="flex items-center text-xs sm:text-sm text-neutral-400 font-medium break-all">
                            <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 shrink-0 text-[#DEAE60]" />
                            <span className="leading-tight">{cliente.email}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest mt-2">
                        Cadastrado em {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  {/* AÇÕES DE EDIÇÃO E EXCLUSÃO (Admin / Lucas apenas) */}
                  {!isYuri && (
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 ml-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 sm:h-10 sm:w-10 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded-lg"
                      onClick={() => openEditDialog(cliente)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 sm:h-10 sm:w-10 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg"
                      onClick={() => handleDelete(cliente.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Clientes;
