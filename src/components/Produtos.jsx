import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estoque e Produtos</h1>
          <p className="text-gray-600">Controle vendas e compras de produtos da barbearia</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if(!v) { setProdutoEdit(null); setFormData({nome:'', preco:'', estoque:''}); }}}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white">
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

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Produto</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3 text-center">Em Estoque</th>
                <th className="px-4 py-3 text-center">Movimentação</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {produtos.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-gray-900">{p.nome}</td>
                  <td className="px-4 py-3 text-amber-600 font-semibold">R$ {(p.preco / 100).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={p.estoque > 5 ? 'outline' : 'destructive'} className="text-sm">
                      {p.estoque} unid.
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <Button size="sm" onClick={() => openMovDialog(p, 'venda')} className="bg-green-600 hover:bg-green-700 text-white">
                      <ShoppingCart className="h-4 w-4 mr-1" /> Vender
                    </Button>
                    <Button size="sm" onClick={() => openMovDialog(p, 'compra')} className="bg-blue-600 hover:bg-blue-700 text-white">
                      <PackagePlus className="h-4 w-4 mr-1" /> Comprar
                    </Button>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => { setProdutoEdit(p); setFormData({ nome: p.nome, preco: (p.preco/100).toString().replace('.',',')}); setDialogOpen(true); }}><Edit className="h-4 w-4 text-gray-500" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {produtos.length === 0 && <div className="p-8 text-center text-gray-400">Nenhum produto cadastrado.</div>}
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
