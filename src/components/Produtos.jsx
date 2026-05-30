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

  if (loading) return <div className="flex justify-center h-64 items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DEAE60]"></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pt-8 sm:pt-4">
      {/* CABEÇALHO RESPONSIVO */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-md">Estoque e Produtos</h1>
          <p className="text-neutral-400 font-medium drop-shadow-sm mt-1">Controle vendas e compras de produtos da barbearia</p>
        </div>
        
        {/* MODAL DE CRIAÇÃO / EDIÇÃO - TELA CLARA */}
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if(!v) { setProdutoEdit(null); setFormData({nome:'', preco:'', estoque:''}); }}}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-[#DEAE60] hover:bg-[#DEAE60]/90 text-neutral-950 font-black shadow-lg uppercase tracking-wider text-xs">
              <Plus className="h-4 w-4 mr-2" /> Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-gray-200 text-gray-900">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold uppercase tracking-tight text-gray-900">
                {produtoEdit ? 'Editar Produto' : 'Cadastrar Produto'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateOrEdit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Nome do Produto</Label>
                <Input 
                  required 
                  value={formData.nome} 
                  onChange={e => setFormData({...formData, nome: e.target.value})} 
                  placeholder="Ex: Pomada Efeito Matte" 
                  className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#DEAE60]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Preço de Venda (R$)</Label>
                  <Input 
                    required 
                    value={formData.preco} 
                    onChange={e => setFormData({...formData, preco: e.target.value})} 
                    placeholder="35,00" 
                    className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#DEAE60]"
                  />
                </div>
                {!produtoEdit && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Estoque Inicial</Label>
                    <Input 
                      type="number" 
                      value={formData.estoque} 
                      onChange={e => setFormData({...formData, estoque: e.target.value})} 
                      placeholder="0" 
                      className="bg-gray-50 border-gray-200 text-gray-900 focus-visible:ring-[#DEAE60]"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50">Cancelar</Button>
                <Button type="submit" className="bg-[#DEAE60] hover:bg-[#DEAE60]/90 text-neutral-950 font-bold uppercase tracking-wider text-xs">Salvar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* TABELA DE PRODUTOS */}
      <Card className="bg-neutral-900/60 border-[0.5px] border-neutral-800 backdrop-blur-md shadow-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-neutral-950/80 text-neutral-400 uppercase text-[10px] font-bold tracking-widest border-b-[0.5px] border-neutral-800">
                <tr>
                  <th className="px-4 py-3">Prod.</th>
                  <th className="px-4 py-3 text-center">Est.</th>
                  <th className="px-4 py-3">Preço</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {produtos.map(p => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4 font-black text-white text-base tracking-tight truncate max-w-[120px] sm:max-w-none">
                      {p.nome}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <Badge variant="outline" className={`text-xs px-2 py-0.5 border-[0.5px] font-black ${p.estoque > 5 ? 'bg-neutral-950 text-[#DEAE60] border-[#DEAE60]/30' : 'bg-red-950/50 text-red-400 border-red-900/50'}`}>
                        {p.estoque} <span className="hidden sm:inline ml-1 font-medium text-[9px] uppercase tracking-widest text-neutral-500"> unid.</span>
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-[#DEAE60] font-black text-sm">
                      R$ {(p.preco / 100).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </td>
                    <td className="px-4 py-4 text-right">
                      {/* BOTÕES DE AÇÕES UNIFICADOS E RESPONSIVOS */}
                      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-2">
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="h-8 px-2 sm:h-9 sm:px-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-green-950/30 border-[0.5px] border-green-900/50 text-green-400 hover:bg-green-900/50 hover:text-green-300"
                            onClick={() => openMovDialog(p, 'venda')}
                          >
                            <ShoppingCart className="h-3 w-3 sm:mr-1.5" /> 
                            <span className="hidden sm:inline">Vender</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            className="h-8 px-2 sm:h-9 sm:px-3 text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-blue-950/30 border-[0.5px] border-blue-900/50 text-blue-400 hover:bg-blue-900/50 hover:text-blue-300"
                            onClick={() => openMovDialog(p, 'compra')}
                          >
                            <PackagePlus className="h-3 w-3 sm:mr-1.5" /> 
                            <span className="hidden sm:inline">Comprar</span>
                          </Button>
                        </div>

                        <div className="flex items-center gap-1 mt-1 sm:mt-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:bg-blue-900/30 hover:text-blue-300" onClick={() => { setProdutoEdit(p); setFormData({ nome: p.nome, preco: (p.preco/100).toString().replace('.',',')}); setDialogOpen(true); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:bg-red-950/30 hover:text-red-300" onClick={() => handleDelete(p.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {produtos.length === 0 && <div className="p-8 text-center text-neutral-500 font-bold uppercase tracking-widest text-xs">Nenhum produto cadastrado no estoque.</div>}
          </div>
        </CardContent>
      </Card>

      {/* MODAL DE COMPRA / VENDA - TELA CLARA */}
      <Dialog open={movDialogOpen} onOpenChange={setMovDialogOpen}>
        <DialogContent className="sm:max-w-[400px] bg-white border-gray-200 text-gray-900">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 font-black uppercase tracking-tight text-xl ${movType === 'venda' ? 'text-green-600' : 'text-blue-600'}`}>
              {movType === 'venda' ? <ShoppingCart /> : <PackagePlus />} 
              {movType === 'venda' ? 'Nova Venda' : 'Entrada no Estoque'}
            </DialogTitle>
          </DialogHeader>
          {produtoEdit && (
            <form onSubmit={handleMovimentacao} className="space-y-6 pt-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center shadow-inner">
                <h3 className="font-black text-xl text-gray-900">{produtoEdit.nome}</h3>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Em estoque atual: {produtoEdit.estoque} unid.</p>
              </div>

              <div className="space-y-3">
                <Label className="text-center block text-[10px] font-bold text-gray-600 uppercase tracking-widest">Selecione a Quantidade</Label>
                <div className="flex items-center justify-center gap-4">
                  <Button type="button" variant="outline" size="icon" className="h-12 w-12 border-gray-300 text-gray-600 hover:bg-gray-100" onClick={() => setMovData({...movData, quantidade: Math.max(1, movData.quantidade - 1)})}><Minus className="h-5 w-5" /></Button>
                  <Input type="number" min="1" className="text-center w-24 h-12 text-2xl font-black bg-white border-gray-300 focus-visible:ring-gray-400" value={movData.quantidade} onChange={e => setMovData({...movData, quantidade: parseInt(e.target.value) || 1})} />
                  <Button type="button" variant="outline" size="icon" className="h-12 w-12 border-gray-300 text-gray-600 hover:bg-gray-100" onClick={() => setMovData({...movData, quantidade: movData.quantidade + 1})}><Plus className="h-5 w-5" /></Button>
                </div>
              </div>

              {movType === 'venda' && (
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Forma de Pagamento</Label>
                  <Select value={movData.forma_pagamento} onValueChange={v => setMovData({...movData, forma_pagamento: v})}>
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900 h-12 font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white border-gray-200">
                      {formasPagamento.map(f => <SelectItem key={f} value={f} className="font-medium">{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="pt-6 border-t border-dashed border-gray-200">
                <div className="flex justify-between items-center bg-gray-900 text-white p-5 rounded-xl shadow-lg">
                  <span className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Valor Total</span>
                  <span className="font-black text-2xl tracking-tighter">R$ {valorTotalMov}</span>
                </div>
              </div>

              <Button type="submit" className={`w-full h-14 text-lg font-black uppercase tracking-wider shadow-lg ${movType === 'venda' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
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
