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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* CABEÇALHO RESPONSIVO */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gerencie os clientes da barbearia</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  placeholder="(11) 99999-9999"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="cliente@email.com"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700">
                  {editingCliente ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Pesquisar clientes por nome, telefone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Users className="h-5 w-5 text-amber-600" />
            Lista de Clientes ({filteredClientes.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          {filteredClientes.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              {searchTerm ? 'Nenhum cliente encontrado para a pesquisa' : 'Nenhum cliente cadastrado'}
            </p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {filteredClientes.map((cliente) => (
                <div key={cliente.id} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-purple-600 font-semibold text-sm sm:text-base">
                        {cliente.nome?.charAt(0) || 'C'}
                      </span>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 truncate text-sm sm:text-base">{cliente.nome}</h3>
                      
                      {/* INFOS DE CONTATO RESPONSIVAS */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                        {cliente.telefone && (
                          <div className="flex items-center text-xs sm:text-sm text-gray-600">
                            <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1 shrink-0 text-amber-600" />
                            <span className="whitespace-nowrap">{cliente.telefone}</span>
                          </div>
                        )}
                        {cliente.email && (
                          <div className="flex items-center text-xs sm:text-sm text-gray-600 break-all">
                            <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1 shrink-0 text-amber-600" />
                            <span className="leading-tight">{cliente.email}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1 sm:mt-1.5">
                        Cadastrado em {new Date(cliente.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  {!isYuri && (
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 ml-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 sm:h-9 sm:w-auto px-0 sm:px-3"
                      onClick={() => openEditDialog(cliente)}
                    >
                      <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 sm:h-9 sm:w-auto px-0 sm:px-3 text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(cliente.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
