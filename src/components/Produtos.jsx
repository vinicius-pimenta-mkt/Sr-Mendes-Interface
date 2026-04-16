import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Plus, Minus, Edit, Trash2, ShoppingCart, PackagePlus, DollarSign } from 'lucide-react';

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [movDialogOpen, setMovDialogOpen] = useState(false);
  
  const [produtoEdit, setProdutoEdit] = useState(null);
  const [movType, setMovType] = useState('venda'); // 'venda' ou 'compra'
  
  const [formData, setFormData] = useState({ nome: '', preco: '', estoque: '' });
  const [movData, setMovData] = useState({ quantidade: 1, forma_pagamento: 'Dinheiro' });

  const formasPagamento = ['Pix', 'Dinheiro', 'Cartão de Débito', 'Cartão de Crédito'];

  useEffect(() => { fetchProdutos(); }, []);

  const fetchProdutos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/produtos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setProdutos(await res.json());
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleCreateOrEdit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = produtoEdit ? `${import.meta.env.VITE_API_BASE_URL}/api/produtos/${produtoEdit.id}` : `${import.meta.env.VITE_API_BASE_URL}/api/produtos`;
      const res = await fetch(url, {
        method: produtoEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) { fetchProdutos(); setDialogOpen(false); setFormData({nome:'', preco:'', estoque:''}); setProdutoEdit(null); }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deseja excluir este produto?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/produtos/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      fetchProdutos();
    } catch (e) { console.error(e); }
  };

  const handleMovimentacao = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/produtos/${produtoEdit.id}/movimentar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ tipo: movType, quantidade: movData.quantidade, forma_pagamento: movData.forma_pagamento })
      });
      
      if (res.ok) {
        fetchProdutos();
        setMovDialogOpen(false);
        alert(`${movType === 'venda' ? 'Venda' : 'Compra'} registrada!`);
      } else {
        const error = await res.json();
        alert(error.error);
      }
    } catch (e) { console.error(e); }
  };

  const openMovDialog = (produto, tipo) => {
    setProdutoEdit(produto);
    setMovType(tipo);
    setMovData({ quantidade: 1, forma_pagamento: 'Dinheiro' });
    setMovDialogOpen(true);
  };

  const valorTotalMov = produtoEdit ? ((produtoEdit.preco / 100) * movData.quantidade).toLocaleString('pt-BR', {minimumFractionDigits:2}) : '0,00';

  if (loading) return <div className="flex justify-center h-64 items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div></div>;

  return (
    <div className="space-y-6">
      {/* CABEÇALHO RESPONSIVO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estoque e Produtos</h1>
          <p className="text-gray-600">Controle vendas e compras de produtos da barbearia</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if(!v) { setProdutoEdit(null); setFormData({nome:'', preco:'', estoque:''}); }}}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white shadow-md">
              <Plus className="h-4 w-4 mr-2" /> Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{produtoEdit ? 'Editar Produto' : 'Cadastrar Produto'}</DialogTitle></DialogHeader>
            <form onSubmit={handleCreateOrEdit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nome do Produto</Label>
                <Input required value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} placeholder="Ex: Pomada Efeito Matte" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Preço de Venda (R$)</Label>
                  <Input required value={formData.preco} onChange={e => setFormData({...formData, preco: e.target.value})} placeholder="35,00" />
                </div>
                {!produtoEdit && (
                  <div className="space-y-2">
                    <Label>Estoque Inicial</Label>
                    <Input type="number" value={formData.estoque} onChange={e => setFormData({...formData, estoque: e.target.value})} placeholder="0" />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm overflow-hidden border-0 sm:border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 uppercase text-[10px] sm:text-xs">
                <tr>
                  <th className="px-2 sm:px-4 py-3">Prod.</th>
                  <th className="px-2 sm:px-4 py-3 text-center">Est.</th>
                  <th className="px-2 sm:px-4 py-3">Preço</th>
                  <th className="px-1 sm:px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {produtos.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 sm:px-4 py-4 font-bold text-gray-900 truncate max-w-[80px] sm:max-w-none">
                      {p.nome}
                    </td>
                    <td className="px-2 sm:px-4 py-4 text-center">
                      <Badge variant={p.estoque > 5 ? 'outline' : 'destructive'} className="text-[9px] sm:text-sm px-1 sm:px-2">
                        {p.estoque} <span className="hidden sm:inline"> unid.</span>
                      </Badge>
                    </td>
                    <td className="px-2 sm:px-4 py-4 text-amber-600 font-semibold text-[11px] sm:text-sm">
                      R$ {(p.preco / 100).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </td>
                    <td className="px-1 sm:px-4 py-4 text-right">
                      {/* BOTÕES DE AÇÕES UNIFICADOS E RESPONSIVOS */}
                      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-1 sm:gap-2">
                        
                        <div className="flex gap-1">
                          <Button 
                            variant="outline" 
                            className="h-7 px-1.5 sm:h-9 sm:px-3 text-[10px] sm:text-xs border-green-200 text-green-700 hover:bg-green-50"
                            onClick={() => openMovDialog(p, 'venda')}
                          >
                            <ShoppingCart className="h-3 w-3 sm:mr-1" /> 
                            <span className="hidden sm:inline">Vender</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            className="h-7 px-1.5 sm:h-9 sm:px-3 text-[10px] sm:text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                            onClick={() => openMovDialog(p, 'compra')}
                          >
                            <PackagePlus className="h-3 w-3 sm:mr-1" /> 
                            <span className="hidden sm:inline">Comprar</span>
                          </Button>
                        </div>

                        <div className="flex items-center gap-0 sm:gap-1 mt-1 sm:mt-0">
                          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" onClick={() => { setProdutoEdit(p); setFormData({ nome: p.nome, preco: (p.preco/100).toString().replace('.',',')}); setDialogOpen(true); }}>
                            <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-red-600" onClick={() => handleDelete(p.id)}>
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                        
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {produtos.length === 0 && <div className="p-8 text-center text-gray-400">Nenhum produto cadastrado.</div>}
          </div>
        </CardContent>
      </Card>

      {/* MODAL DE COMPRA / VENDA */}
      <Dialog open={movDialogOpen} onOpenChange={setMovDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${movType === 'venda' ? 'text-green-600' : 'text-blue-600'}`}>
              {movType === 'venda' ? <ShoppingCart /> : <PackagePlus />} 
              {movType === 'venda' ? 'Nova Venda' : 'Entrada no Estoque'}
            </DialogTitle>
          </DialogHeader>
          {produtoEdit && (
            <form onSubmit={handleMovimentacao} className="space-y-6 pt-4">
              <div className="bg-gray-50 p-4 rounded-lg border text-center">
                <h3 className="font-bold text-lg">{produtoEdit.nome}</h3>
                <p className="text-gray-500">Em estoque: {produtoEdit.estoque}</p>
              </div>

              <div className="space-y-3">
                <Label className="text-center block">Quantidade</Label>
                <div className="flex items-center justify-center gap-4">
                  <Button type="button" variant="outline" size="icon" onClick={() => setMovData({...movData, quantidade: Math.max(1, movData.quantidade - 1)})}><Minus className="h-4 w-4" /></Button>
                  <Input type="number" min="1" className="text-center w-24 text-xl font-bold" value={movData.quantidade} onChange={e => setMovData({...movData, quantidade: parseInt(e.target.value) || 1})} />
                  <Button type="button" variant="outline" size="icon" onClick={() => setMovData({...movData, quantidade: movData.quantidade + 1})}><Plus className="h-4 w-4" /></Button>
                </div>
              </div>

              {movType === 'venda' && (
                <div className="space-y-2">
                  <Label>Forma de Pagamento</Label>
                  <Select value={movData.forma_pagamento} onValueChange={v => setMovData({...movData, forma_pagamento: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {formasPagamento.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="pt-4 border-t border-dashed">
                <div className="flex justify-between items-center bg-gray-900 text-white p-4 rounded-lg">
                  <span className="font-semibold text-gray-300 uppercase text-xs">Valor Total</span>
                  <span className="font-black text-2xl">R$ {valorTotalMov}</span>
                </div>
              </div>

              <Button type="submit" className={`w-full h-12 text-lg font-bold ${movType === 'venda' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                Finalizar {movType === 'venda' ? 'Venda' : 'Compra'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Produtos;
