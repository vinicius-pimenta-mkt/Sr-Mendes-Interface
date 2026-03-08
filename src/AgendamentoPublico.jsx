import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Calendar, Scissors, User } from 'lucide-react';
import logo from '../assets/logo.png'; 

// LISTA OFICIAL DE SERVIÇOS E PREÇOS (Atualizada e em ordem alfabética)
const SERVICOS_TABELA = [
  { nome: 'Acabamento (Pezinho)', preco: 25.00 },
  { nome: 'Barba Simples', preco: 40.00 },
  { nome: 'Barboterapia', preco: 50.00 },
  { nome: 'Coloração', preco: 35.00 },
  { nome: 'Combo Corte + Barba + Sobrancelha', preco: 90.00 },
  { nome: 'Combo Corte + Barboterapia', preco: 90.00 },
  { nome: 'Corte + Barba simples', preco: 80.00 },
  { nome: 'Corte + Sobrancelha', preco: 60.00 },
  { nome: 'Corte infantil', preco: 50.00 },
  { nome: 'Corte infantil no carrinho', preco: 50.00 },
  { nome: 'Corte Masculino', preco: 45.00 },
  { nome: 'Finalização penteado', preco: 25.00 },
  { nome: 'Hidratação', preco: 40.00 },
  { nome: 'Limpeza de pele', preco: 40.00 },
  { nome: 'Luzes', preco: 100.00 },
  { nome: 'Pigmentação', preco: 30.00 },
  { nome: 'Raspar na maquina', preco: 35.00 },
  { nome: 'Relaxamento', preco: 45.00 },
  { nome: 'Selagem', preco: 65.00 },
  { nome: 'Sobrancelha', preco: 15.00 },
  { nome: 'Tratamento V.O', preco: 90.00 }
];

const AgendamentoPublico = () => {
  const [horariosLivres, setHorariosLivres] = useState([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const [formData, setFormData] = useState({
    barbeiro: 'Lucas',
    cliente_nome: '',
    cliente_telefone: '',
    servicoObj: null, 
    data: '',
    hora: '',
    forma_pagamento: 'Dinheiro'
  });

  // Busca os horários livres sempre que a data ou barbeiro mudar
  useEffect(() => {
    if (formData.data && formData.barbeiro) {
      buscarHorarios();
    }
  }, [formData.data, formData.barbeiro]);

  const buscarHorarios = async () => {
    setLoadingHorarios(true);
    setFormData(prev => ({ ...prev, hora: '' })); // Limpa a hora escolhida
    try {
      const endpoint = formData.barbeiro === 'Yuri' ? 'agendamentos-yuri' : 'agendamentos';
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/${endpoint}/disponibilidade?data=${formData.data}`);
      if (response.ok) {
        const data = await response.json();
        setHorariosLivres(data.livres || []);
      }
    } catch (error) {
      console.error('Erro ao buscar horários:', error);
    } finally {
      setLoadingHorarios(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const endpoint = formData.barbeiro === 'Yuri' ? 'agendamentos-yuri' : 'agendamentos';
      
      const payload = {
        cliente_nome: formData.cliente_nome,
        cliente_telefone: formData.cliente_telefone,
        servico: formData.servicoObj.nome,
        preco: formData.servicoObj.preco, // Envia o preço fixo tabelado
        data: formData.data,
        hora: formData.hora,
        forma_pagamento: formData.forma_pagamento,
        status: 'Pendente' // Entra como pendente por padrão
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setSucesso(true);
      } else {
        alert('Ops! Alguém acabou de reservar esse horário. Por favor, escolha outro.');
        buscarHorarios();
      }
    } catch (error) {
      alert('Erro ao agendar. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  // Pega a data de hoje para impedir agendamento no passado
  const hojeStr = new Date().toISOString().split('T')[0];

  if (sucesso) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center py-12 shadow-xl border-t-4 border-t-green-500">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Agendamento Confirmado!</h2>
          <p className="text-gray-600 mb-6 px-4">Sua vaga está garantida. Te esperamos no dia {formData.data.split('-').reverse().join('/')} às {formData.hora}.</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="w-full max-w-xs">Fazer outro agendamento</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full shadow-2xl overflow-hidden border-0">
        <div className="bg-amber-600 p-6 flex flex-col items-center justify-center text-white">
          <img src={logo} alt="Beleza Masculina" className="h-16 mb-2 brightness-0 invert" />
          <h1 className="text-xl font-bold tracking-wider uppercase">Agende seu Horário</h1>
        </div>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Escolha do Profissional */}
            <div className="space-y-3">
              <Label className="text-gray-500 font-bold flex items-center gap-2"><User className="h-4 w-4"/> 1. Escolha o Profissional</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button type="button" variant={formData.barbeiro === 'Lucas' ? 'default' : 'outline'} className={formData.barbeiro === 'Lucas' ? 'bg-amber-600 hover:bg-amber-700' : ''} onClick={() => setFormData({...formData, barbeiro: 'Lucas'})}>
                  Lucas
                </Button>
                <Button type="button" variant={formData.barbeiro === 'Yuri' ? 'default' : 'outline'} className={formData.barbeiro === 'Yuri' ? 'bg-amber-600 hover:bg-amber-700' : ''} onClick={() => setFormData({...formData, barbeiro: 'Yuri'})}>
                  Yuri
                </Button>
              </div>
            </div>

            {/* Dados do Cliente */}
            <div className="space-y-4 pt-4 border-t">
              <Label className="text-gray-500 font-bold flex items-center gap-2"><User className="h-4 w-4"/> 2. Seus Dados</Label>
              <Input required placeholder="Seu Nome Completo" value={formData.cliente_nome} onChange={e => setFormData({...formData, cliente_nome: e.target.value})} className="bg-gray-50" />
              <Input required placeholder="Telefone / WhatsApp" value={formData.cliente_telefone} onChange={e => setFormData({...formData, cliente_telefone: e.target.value})} className="bg-gray-50" />
            </div>

            {/* Serviço e Pagamento (Preço Fixo) */}
            <div className="space-y-4 pt-4 border-t">
              <Label className="text-gray-500 font-bold flex items-center gap-2"><Scissors className="h-4 w-4"/> 3. Serviço</Label>
              <Select required onValueChange={(v) => setFormData({...formData, servicoObj: SERVICOS_TABELA[v]})}>
                <SelectTrigger className="bg-gray-50 text-left h-auto py-3">
                  <SelectValue placeholder="Selecione o Serviço" />
                </SelectTrigger>
                <SelectContent>
                  {SERVICOS_TABELA.map((s, index) => (
                    <SelectItem key={index} value={index}>
                      {s.nome} - R$ {s.preco.toFixed(2).replace('.', ',')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={formData.forma_pagamento} onValueChange={(v) => setFormData({...formData, forma_pagamento: v})}>
                <SelectTrigger className="bg-gray-50"><SelectValue placeholder="Como deseja pagar?" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="Pix">Pix</SelectItem>
                  <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                  <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data e Hora */}
            <div className="space-y-4 pt-4 border-t">
              <Label className="text-gray-500 font-bold flex items-center gap-2"><Calendar className="h-4 w-4"/> 4. Data e Hora</Label>
              <Input required type="date" min={hojeStr} value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} className="bg-gray-50" />
              
              {formData.data && (
                <div className="pt-2">
                  <Label className="text-xs text-gray-500 mb-2 block">Horários Disponíveis:</Label>
                  {loadingHorarios ? (
                    <div className="text-sm text-amber-600 animate-pulse">Buscando agenda...</div>
                  ) : horariosLivres.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {horariosLivres.map(h => (
                        <button
                          key={h} type="button"
                          onClick={() => setFormData({...formData, hora: h})}
                          className={`p-2 rounded-lg text-sm font-bold border transition-all ${formData.hora === h ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-gray-700 border-gray-200 hover:border-amber-600'}`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">Nenhum horário livre para este dia. Selecione outra data.</div>
                  )}
                </div>
              )}
            </div>

            {/* Resumo e Botão */}
            <Button 
              type="submit" 
              disabled={salvando || !formData.hora || !formData.servicoObj || !formData.cliente_nome} 
              className="w-full bg-amber-600 hover:bg-amber-700 text-white h-12 text-lg font-bold shadow-lg mt-4"
            >
              {salvando ? 'Confirmando...' : 'Confirmar Agendamento'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgendamentoPublico;
