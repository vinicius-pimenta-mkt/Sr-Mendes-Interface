import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Calendar, Scissors, User, DollarSign, CalendarDays } from 'lucide-react';
import logobranca from '../assets/logobranca.png'; 

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

  useEffect(() => {
    if (formData.data && formData.barbeiro) {
      buscarHorarios();
    }
  }, [formData.data, formData.barbeiro]);

  const buscarHorarios = async () => {
    setLoadingHorarios(true);
    setFormData(prev => ({ ...prev, hora: '' })); 
    try {
      const endpoint = formData.barbeiro === 'Yuri' ? 'agendamentos-yuri' : 'agendamentos';
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/${endpoint}/disponibilidade?data=${formData.data}`);
      if (response.ok) {
        const data = await response.json();
        setHorariosLivres(Array.isArray(data?.livres) ? data.livres : []);
      } else {
        setHorariosLivres([]);
      }
    } catch (error) {
      console.error('Erro ao buscar horários:', error);
      setHorariosLivres([]);
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
        preco: formData.servicoObj.preco,
        data: formData.data,
        hora: formData.hora,
        forma_pagamento: formData.forma_pagamento,
        status: 'Pendente' 
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

  const hojeStr = new Date().toISOString().split('T')[0];

  let horariosFiltrados = Array.isArray(horariosLivres) ? horariosLivres : [];
  let isServicoLongo = false;

  if (formData.servicoObj && horariosFiltrados.length > 0) {
    const sLower = formData.servicoObj.nome.toLowerCase();
    isServicoLongo = sLower.includes('corte + barba') || sLower.includes('combo corte') || sLower.includes('luzes');
    
    if (isServicoLongo) {
      horariosFiltrados = horariosFiltrados.filter(hora => {
        let [h, m] = hora.split(':').map(Number);
        m += 30;
        if (m >= 60) { m -= 60; h += 1; }
        let proximaHora = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        return horariosLivres.includes(proximaHora);
      });
    }
  }

  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center relative p-4 bg-neutral-950">
        <img src="/fundologin.png" className="absolute inset-0 w-full h-full object-cover z-0 opacity-40" alt="Fundo" />
        <Card className="max-w-md w-full text-center py-12 shadow-2xl z-10 bg-neutral-900/90 border-[0.5px] border-neutral-800 backdrop-blur-md">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Agendamento Confirmado!</h2>
          <p className="text-neutral-400 mb-6 px-4">Sua vaga está garantida. Te esperamos no dia <strong className="text-white">{formData.data ? formData.data.split('-').reverse().join('/') : ''}</strong> às <strong className="text-white">{formData.hora}</strong>.</p>
          <Button onClick={() => window.location.reload()} className="w-full max-w-xs mx-auto bg-[#DEAE60] hover:bg-[#DEAE60]/90 text-neutral-950 font-bold">
            Fazer outro agendamento
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative bg-neutral-950 overflow-x-hidden">
      <img src="/fundologin.png" alt="Fundo" className="fixed inset-0 w-full h-full object-cover z-0 opacity-40" />
      <div className="fixed inset-0 bg-neutral-950/40 backdrop-blur-[3px] z-10" />
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 py-8 z-20 relative">
        <Card className="max-w-lg w-full shadow-2xl bg-neutral-900/90 border-[0.5px] border-neutral-800/80 backdrop-blur-md rounded-xl">
          
          <div className="p-6 text-center border-b border-neutral-800">
            <img src={logobranca} alt="Beleza Masculina" className="w-32 h-auto mx-auto mb-4 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]" />
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight flex items-center justify-center gap-2">
              <CalendarDays className="h-6 w-6 text-[#DEAE60]" /> Agende seu Horário
            </h1>
            <p className="text-neutral-400 font-medium mt-1 text-sm">Siga os passos abaixo</p>
          </div>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-3">
                <Label className="text-neutral-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <User className="h-4 w-4 text-[#DEAE60]"/> 1. Escolha o Profissional
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button type="button" variant="outline" className={formData.barbeiro === 'Lucas' ? 'bg-[#DEAE60] hover:bg-[#DEAE60]/90 text-neutral-950 font-bold border-0' : 'bg-neutral-950 border-[0.5px] border-neutral-800 text-neutral-400 font-bold'} onClick={() => setFormData({...formData, barbeiro: 'Lucas', servicoObj: null})}>
                    Lucas
                  </Button>
                  <Button type="button" variant="outline" className={formData.barbeiro === 'Yuri' ? 'bg-[#DEAE60] hover:bg-[#DEAE60]/90 text-neutral-950 font-bold border-0' : 'bg-neutral-950 border-[0.5px] border-neutral-800 text-neutral-400 font-bold'} onClick={() => setFormData({...formData, barbeiro: 'Yuri', servicoObj: null})}>
                    Yuri
                  </Button>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-neutral-800">
                <Label className="text-neutral-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <User className="h-4 w-4 text-[#DEAE60]"/> 2. Seus Dados
                </Label>
                <Input required placeholder="Seu Nome Completo" value={formData.cliente_nome} onChange={e => setFormData({...formData, cliente_nome: e.target.value})} className="bg-neutral-950 border-0 rounded-md text-white h-12 focus-visible:ring-1 focus-visible:ring-[#DEAE60]" />
                <Input required placeholder="Telefone / WhatsApp" value={formData.cliente_telefone} onChange={e => setFormData({...formData, cliente_telefone: e.target.value})} className="bg-neutral-950 border-0 rounded-md text-white h-12 focus-visible:ring-1 focus-visible:ring-[#DEAE60]" />
              </div>

              <div className="space-y-4 pt-4 border-t border-neutral-800">
                <Label className="text-neutral-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-[#DEAE60]"/> 3. Serviço
                </Label>
                
                <Select required onValueChange={(nomeServico) => {
                  const servicoEncontrado = SERVICOS_TABELA.find(s => s.nome === nomeServico);
                  setFormData({...formData, servicoObj: servicoEncontrado, hora: ''});
                }}>
                  <SelectTrigger className="bg-neutral-950 border-0 rounded-md text-white h-12 focus-visible:ring-1 focus-visible:ring-[#DEAE60]">
                    <SelectValue placeholder="Selecione o Serviço" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-0 rounded-md text-white">
                    {SERVICOS_TABELA.map((s) => (
                      <SelectItem key={s.nome} value={s.nome}>
                        {s.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest ml-1">Valor (R$)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                      <Input 
                        readOnly 
                        value={formData.servicoObj ? Number(formData.servicoObj.preco || 0).toFixed(2).replace('.', ',') : '0,00'} 
                        className="bg-neutral-950/50 text-white font-black pl-9 border-0 rounded-md cursor-not-allowed h-12 focus-visible:ring-1 focus-visible:ring-[#DEAE60]" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest ml-1">Pagamento</Label>
                    <Select value={formData.forma_pagamento} onValueChange={(v) => setFormData({...formData, forma_pagamento: v})}>
                      <SelectTrigger className="bg-neutral-950 border-0 rounded-md text-white h-12 focus-visible:ring-1 focus-visible:ring-[#DEAE60]"><SelectValue placeholder="Forma" /></SelectTrigger>
                      <SelectContent className="bg-neutral-900 border-0 rounded-md text-white">
                        <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="Pix">Pix</SelectItem>
                        <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                        <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-neutral-800">
                <Label className="text-neutral-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#DEAE60]"/> 4. Data e Hora
                </Label>
                <Input required type="date" min={hojeStr} value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} className="bg-neutral-950 border-0 rounded-md text-white h-12 px-4 focus-visible:ring-1 focus-visible:ring-[#DEAE60]" style={{ colorScheme: 'dark' }} />
                
                {formData.data && (
                  <div className="pt-2 animate-in fade-in duration-300">
                    <Label className="text-[10px] text-neutral-500 mb-2 block font-bold uppercase tracking-widest ml-1">
                      Horários Disponíveis {isServicoLongo && "(Mínimo 1 hora)"}:
                    </Label>
                    
                    {loadingHorarios ? (
                      <div className="text-xs text-[#DEAE60] animate-pulse font-medium bg-neutral-950 p-3 rounded-lg text-center border border-neutral-800">Buscando agenda livre...</div>
                    ) : horariosFiltrados.length > 0 ? (
                      <div className="grid grid-cols-4 gap-2">
                        {horariosFiltrados.map(h => (
                          <button
                            key={h} type="button"
                            onClick={() => setFormData({...formData, hora: h})}
                            className={`p-2 rounded-md text-sm font-bold transition-all ${formData.hora === h ? 'bg-[#DEAE60] text-neutral-950 shadow-md scale-[1.02]' : 'bg-neutral-950 text-neutral-400 border-0 hover:text-[#DEAE60]'}`}
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                    ) : horariosLivres.length > 0 ? (
                      <div className="text-xs text-[#DEAE60] bg-neutral-950 p-3 rounded-lg border border-neutral-800 text-center font-medium">
                        Não há blocos de 1 hora inteira disponíveis para este serviço hoje. Tente outra data.
                      </div>
                    ) : (
                      <div className="text-xs text-red-400 bg-red-950/30 p-3 rounded-lg border border-neutral-800 text-center font-bold">
                        Nenhum horário livre para este dia. Selecione outra data.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={salvando || !formData.hora || !formData.servicoObj || !formData.cliente_nome} 
                className="w-full bg-[#DEAE60] hover:bg-[#DEAE60]/90 text-neutral-950 h-14 text-lg font-black shadow-xl shadow-black/30 mt-6 uppercase tracking-tighter"
              >
                {salvando ? 'Confirmando...' : 'Confirmar Agendamento'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AgendamentoPublico;
