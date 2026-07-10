import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Calendar, Scissors, User, DollarSign, CalendarDays, ArrowRight, ArrowLeft, Clock } from 'lucide-react';
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

const hojeStr = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];

const AgendamentoPublico = () => {
  const [step, setStep] = useState(1);
  const [horariosLivres, setHorariosLivres] = useState([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const [formData, setFormData] = useState({
    barbeiro: '',
    cliente_nome: '',
    cliente_telefone: '',
    servicoObj: null, 
    data: hojeStr,
    hora: '',
    forma_pagamento: 'Dinheiro'
  });

  // VERIFICA SE O CLIENTE JÁ TEM AGENDAMENTO SALVO NO CELULAR
  useEffect(() => {
    const agendamentoSalvo = localStorage.getItem('meuAgendamentoBM');
    if (agendamentoSalvo) {
      try {
        const parsed = JSON.parse(agendamentoSalvo);
        if (parsed.data >= hojeStr) {
          setFormData(parsed);
          setSucesso(true);
        } else {
          localStorage.removeItem('meuAgendamentoBM');
        }
      } catch (e) {
        localStorage.removeItem('meuAgendamentoBM');
      }
    }
  }, []);

  // BUSCA OS HORÁRIOS QUANDO CHEGA NO PASSO 3 (OU MUDA A DATA)
  useEffect(() => {
    if (step === 3 && formData.data && formData.barbeiro) {
      buscarHorarios();
    }
  }, [step, formData.data, formData.barbeiro]);

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
    if (salvando) return; 

    const telLimpo = formData.cliente_telefone.replace(/\D/g, '');
    if (telLimpo.length < 10) {
      alert('Por favor, informe um número de telefone ou WhatsApp válido com o DDD.');
      return;
    }

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
        // Salva no localStorage para reconhecer o cliente na próxima visita
        localStorage.setItem('meuAgendamentoBM', JSON.stringify(payload));
        setSucesso(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || 'Ops! Alguém acabou de reservar esse horário ou ocorreu um erro. Por favor, escolha outro.');
        setStep(3); // Volta pra tela de horários
        buscarHorarios();
      }
    } catch (error) {
      alert('Erro de conexão ao agendar. Verifique sua internet e tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  const handleNovoAgendamento = () => {
    localStorage.removeItem('meuAgendamentoBM');
    setFormData({ barbeiro: '', cliente_nome: '', cliente_telefone: '', servicoObj: null, data: hojeStr, hora: '', forma_pagamento: 'Dinheiro' });
    setSucesso(false);
    setStep(1);
  };

  // FILTRO DE 1 HORA
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

  // TELA DE SUCESSO (OU RETORNO DO CLIENTE)
  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center relative p-4 bg-neutral-950">
        <img src="/fundologin.png" className="absolute inset-0 w-full h-full object-cover z-0 opacity-40" alt="Fundo" />
        <Card className="max-w-md w-full text-center py-12 shadow-2xl z-10 bg-neutral-900/90 border-0 backdrop-blur-md rounded-md animate-in zoom-in duration-300">
          <CheckCircle className="h-20 w-20 text-[#DEAE60] mx-auto mb-6 drop-shadow-lg" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Agendamento Confirmado!</h2>
          <p className="text-neutral-400 mb-6 px-4">Sua vaga está garantida. Te esperamos no dia <strong className="text-white">{formData.data ? formData.data.split('-').reverse().join('/') : ''}</strong> às <strong className="text-white">{formData.hora}</strong> com o profissional <strong className="text-white">{formData.barbeiro}</strong>.</p>
          <Button onClick={handleNovoAgendamento} className="w-full max-w-xs mx-auto bg-[#DEAE60] hover:bg-[#DEAE60]/90 text-neutral-950 font-bold rounded-md uppercase tracking-widest text-xs h-12">
            Fazer outro agendamento
          </Button>
        </Card>
      </div>
    );
  }

  // RENDERIZAÇÃO CONDICIONAL DOS PASSOS
  return (
    <div className="min-h-screen flex flex-col relative bg-neutral-950 overflow-x-hidden">
      <img src="/fundologin.png" alt="Fundo" className="fixed inset-0 w-full h-full object-cover z-0 opacity-40" />
      <div className="fixed inset-0 bg-neutral-950/60 backdrop-blur-[2px] z-10" />
      
      <main className="flex-1 flex flex-col items-center p-4 py-8 z-20 relative w-full max-w-2xl mx-auto">
        
        {/* CABEÇALHO DA BARBEARIA */}
        <div className="w-full text-center mb-6">
          <img src={logobranca} alt="Beleza Masculina" className="h-24 w-auto mx-auto mb-2 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]" />
          <h1 className="text-xl font-black text-white uppercase tracking-tighter leading-tight">
            Beleza Masculina
          </h1>
          <p className="text-[#DEAE60] font-bold text-xs uppercase tracking-widest mt-1">Agendamento Online</p>
        </div>

        <Card className="w-full shadow-2xl bg-neutral-900/90 border-0 backdrop-blur-md rounded-md overflow-hidden">
          
          {/* INDICADOR DE PASSOS */}
          <div className="bg-neutral-950/50 p-4 border-b border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {step > 1 && (
                <Button variant="ghost" size="icon" onClick={() => setStep(step - 1)} className="h-8 w-8 text-neutral-400 hover:text-white hover:bg-white/10 rounded-md">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <span className="text-xs font-bold text-white uppercase tracking-widest">
                {step === 1 && 'Passo 1: Serviço'}
                {step === 2 && 'Passo 2: Profissional'}
                {step === 3 && 'Passo 3: Data e Hora'}
                {step === 4 && 'Passo 4: Seus Dados'}
              </span>
            </div>
            <span className="text-[#DEAE60] font-black text-sm">{step} / 4</span>
          </div>

          <CardContent className="p-4 sm:p-6 min-h-[400px]">
            
            {/* PASSO 1: ESCOLHER SERVIÇO */}
            {step === 1 && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <Label className="text-neutral-400 font-bold uppercase tracking-widest text-[10px] block mb-2 text-center">Selecione o que deseja fazer</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-2 pb-2">
                  {SERVICOS_TABELA.map((s) => {
                    const isLongo = s.nome.toLowerCase().includes('corte + barba') || s.nome.toLowerCase().includes('combo') || s.nome.toLowerCase().includes('luzes');
                    return (
                      <button
                        key={s.nome}
                        onClick={() => { setFormData({ ...formData, servicoObj: s, hora: '' }); setStep(2); }}
                        className={`p-4 rounded-md border-0 text-left transition-all ${formData.servicoObj?.nome === s.nome ? 'bg-[#DEAE60] text-neutral-950 scale-[1.02]' : 'bg-neutral-950/50 text-white hover:bg-neutral-800'}`}
                      >
                        <div className="font-bold text-sm mb-1 leading-tight">{s.nome}</div>
                        <div className="flex justify-between items-center mt-2">
                          <span className={`text-xs font-black ${formData.servicoObj?.nome === s.nome ? 'text-neutral-900' : 'text-[#DEAE60]'}`}>R$ {s.preco.toFixed(2).replace('.', ',')}</span>
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${formData.servicoObj?.nome === s.nome ? 'text-neutral-800' : 'text-neutral-500'}`}>
                            <Clock className="h-3 w-3 inline mr-1" />{isLongo ? '1 Hora' : '30 Min'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PASSO 2: ESCOLHER PROFISSIONAL */}
            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <Label className="text-neutral-400 font-bold uppercase tracking-widest text-[10px] block mb-4 text-center">Quem vai te atender?</Label>
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* CARD LUCAS */}
                  <button
                    onClick={() => { setFormData({ ...formData, barbeiro: 'Lucas', hora: '' }); setStep(3); }}
                    className={`p-6 rounded-md border-0 text-center transition-all flex flex-col items-center justify-center ${formData.barbeiro === 'Lucas' ? 'bg-[#DEAE60] text-neutral-950 scale-[1.02] shadow-xl' : 'bg-neutral-950/50 text-neutral-300 hover:bg-neutral-800'}`}
                  >
                    <div className="w-20 h-20 bg-neutral-900 rounded-full mb-3 flex items-center justify-center overflow-hidden border border-neutral-700">
                      {/* BASTA JOGAR A FOTO lucas.png NA PASTA PUBLIC */}
                      <img src="/foto-lucas.png" alt="Lucas" className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
                      <User className="h-8 w-8 text-neutral-600 hidden" />
                    </div>
                    <span className="font-black text-lg uppercase tracking-tight">Lucas</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${formData.barbeiro === 'Lucas' ? 'text-neutral-800' : 'text-[#DEAE60]'}`}>Barbeiro</span>
                  </button>

                  {/* CARD YURI */}
                  <button
                    onClick={() => { setFormData({ ...formData, barbeiro: 'Yuri', hora: '' }); setStep(3); }}
                    className={`p-6 rounded-md border-0 text-center transition-all flex flex-col items-center justify-center ${formData.barbeiro === 'Yuri' ? 'bg-[#DEAE60] text-neutral-950 scale-[1.02] shadow-xl' : 'bg-neutral-950/50 text-neutral-300 hover:bg-neutral-800'}`}
                  >
                    <div className="w-20 h-20 bg-neutral-900 rounded-full mb-3 flex items-center justify-center overflow-hidden border border-neutral-700">
                      {/* BASTA JOGAR A FOTO yuri.png NA PASTA PUBLIC */}
                      <img src="/foto-yuri.png" alt="Yuri" className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
                      <User className="h-8 w-8 text-neutral-600 hidden" />
                    </div>
                    <span className="font-black text-lg uppercase tracking-tight">Yuri</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${formData.barbeiro === 'Yuri' ? 'text-neutral-800' : 'text-[#DEAE60]'}`}>Barbeiro</span>
                  </button>

                </div>
              </div>
            )}

            {/* PASSO 3: DATA E HORA */}
            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 flex flex-col h-full">
                <div>
                  <Label className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest ml-1 mb-2 block">Escolha o Dia</Label>
                  <Input 
                    type="date" 
                    min={hojeStr} 
                    value={formData.data} 
                    onChange={e => setFormData({...formData, data: e.target.value})} 
                    className="bg-neutral-950 border-0 rounded-md text-white h-14 px-4 font-bold text-lg focus-visible:ring-1 focus-visible:ring-[#DEAE60] w-full" 
                    style={{ colorScheme: 'dark' }} 
                  />
                </div>
                
                <div className="flex-1">
                  <Label className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest ml-1 mb-3 flex items-center justify-between">
                    <span>Horários Disponíveis</span>
                    {isServicoLongo && <span className="text-[#DEAE60]">Requer 1h livre</span>}
                  </Label>
                  
                  {loadingHorarios ? (
                    <div className="text-xs text-[#DEAE60] animate-pulse font-bold uppercase tracking-widest bg-neutral-950 p-6 rounded-md text-center border-0">Buscando agenda...</div>
                  ) : horariosFiltrados.length > 0 ? (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[40vh] overflow-y-auto pr-2 pb-2">
                      {horariosFiltrados.map(h => (
                        <button
                          key={h} type="button"
                          onClick={() => { setFormData({...formData, hora: h}); setStep(4); }}
                          className="p-3 rounded-md text-sm font-black transition-all bg-neutral-950 text-white border-0 hover:bg-[#DEAE60] hover:text-neutral-950 shadow-sm"
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  ) : horariosLivres.length > 0 ? (
                    <div className="text-xs text-[#DEAE60] bg-neutral-950 p-4 rounded-md border-0 text-center font-bold uppercase tracking-widest leading-relaxed">
                      Não há blocos de 1 hora inteira disponíveis hoje.<br/>Selecione outra data.
                    </div>
                  ) : (
                    <div className="text-xs text-red-400 bg-red-950/30 p-4 rounded-md border-0 text-center font-bold uppercase tracking-widest leading-relaxed">
                      Nenhum horário livre para este dia.<br/>Selecione outra data.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PASSO 4: DADOS E CONFIRMAÇÃO */}
            {step === 4 && (
              <form onSubmit={handleSubmit} className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                
                <div className="bg-[#DEAE60]/10 border border-[#DEAE60]/20 p-4 rounded-md mb-6">
                  <p className="text-[10px] text-[#DEAE60] font-bold uppercase tracking-widest mb-1">Resumo do Agendamento</p>
                  <p className="text-white font-bold text-sm">{formData.servicoObj?.nome}</p>
                  <p className="text-neutral-400 text-xs mt-1">Dia <strong className="text-white">{formData.data.split('-').reverse().join('/')}</strong> às <strong className="text-white">{formData.hora}</strong> com <strong className="text-white">{formData.barbeiro}</strong></p>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Seu Nome</Label>
                  <Input 
                    required 
                    placeholder="Nome Completo" 
                    value={formData.cliente_nome} 
                    onChange={e => setFormData({...formData, cliente_nome: e.target.value})} 
                    className="bg-neutral-950 border-0 rounded-md text-white h-12 focus-visible:ring-1 focus-visible:ring-[#DEAE60]" 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Telefone (WhatsApp)</Label>
                  <Input 
                    required 
                    type="tel"
                    placeholder="(00) 00000-0000" 
                    value={formData.cliente_telefone} 
                    onChange={e => setFormData({...formData, cliente_telefone: e.target.value})} 
                    className="bg-neutral-950 border-0 rounded-md text-white h-12 focus-visible:ring-1 focus-visible:ring-[#DEAE60]" 
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Como deseja pagar?</Label>
                  <Select value={formData.forma_pagamento} onValueChange={(v) => setFormData({...formData, forma_pagamento: v})}>
                    <SelectTrigger className="bg-neutral-950 border-0 rounded-md text-white h-12 focus-visible:ring-1 focus-visible:ring-[#DEAE60]">
                      <SelectValue placeholder="Forma de Pagamento" />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-0 rounded-md text-white">
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="Pix">Pix</SelectItem>
                      <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                      <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  disabled={salvando || !formData.cliente_nome || formData.cliente_telefone.length < 10} 
                  className="w-full bg-[#DEAE60] hover:bg-[#DEAE60]/90 text-neutral-950 rounded-md h-14 text-sm font-black shadow-xl mt-4 uppercase tracking-widest"
                >
                  {salvando ? 'Confirmando...' : 'Confirmar Agendamento'}
                </Button>
              </form>
            )}

          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AgendamentoPublico;
