import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Users, 
  LogOut,
  Menu,
  X,
  UserCheck,
  Package // <-- NOVO ÍCONE DE CAIXA IMPORTADO AQUI
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import logobranca from '../assets/logobranca.png';

const Sidebar = ({ activeSection, onSectionChange, onLogout, user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Verifica se quem está logado é o Yuri
  const isYuri = user?.role === 'yuri';
  
  // LISTA DE MENUS: Estoque e Relatórios liberados. Planos restrito ao Admin.
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'produtos', label: 'Estoque', icon: Package }, // <-- NOVO BOTÃO DE ESTOQUE AQUI
    { id: 'relatorios', label: 'Relatórios', icon: FileText },
    ...(!isYuri ? [
      { id: 'planos', label: 'Planos', icon: UserCheck }
    ] : []),
  ];

  const handleMenuItemClick = (itemId) => {
    onSectionChange(itemId);
    setIsMobileMenuOpen(false); // Fecha o menu mobile após seleção
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-8 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-neutral-950/80 border-[0.5px] border-neutral-800 text-[#DEAE60] hover:bg-neutral-900 hover:text-[#DEAE60] backdrop-blur-md shadow-xl"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-45
        w-64 bg-neutral-950/80 border-r-[0.5px] border-neutral-800/80 backdrop-blur-xl shadow-2xl h-screen flex flex-col right-0 lg:right-auto
        ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-6 border-b-[0.5px] border-neutral-800/80 flex flex-col items-center justify-center">
          <img src={logobranca} alt="Beleza Masculina" className="h-20 w-auto object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]" />
        </div>

        {/* Menu Principal */}
        <div className="flex-1 py-6 overflow-y-auto">
          <div className="px-3">
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-3 ml-2">
              Menu Principal
            </p>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuItemClick(item.id)}
                    className={`w-full flex items-center px-4 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-[#DEAE60] text-neutral-950 shadow-lg scale-[1.02]'
                        : 'text-neutral-400 hover:bg-neutral-900/50 hover:text-neutral-100'
                    }`}
                  >
                    <Icon className={`mr-3 h-4 w-4 ${isActive ? 'text-neutral-950' : 'text-neutral-500'}`} />
                    {item.label}
                    {isActive && (
                      <div className="ml-auto w-1.5 h-1.5 bg-neutral-950 rounded-full shadow-sm"></div>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t-[0.5px] border-neutral-800/80">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-9 h-9 bg-neutral-950 rounded-full flex items-center justify-center border-[0.5px] border-[#DEAE60]/30 shadow-inner">
              <span className="text-[#DEAE60] font-black text-xs uppercase">
                {isYuri ? 'Y' : 'BM'}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-white truncate uppercase tracking-tighter">
                {isYuri ? 'Yuri Mendes' : 'Beleza Masculina'}
              </p>
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
                {isYuri ? 'Barbeiro' : 'Administrador'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="w-full bg-transparent border-[0.5px] border-neutral-800 text-neutral-400 hover:bg-red-950/30 hover:text-red-400 hover:border-red-900/30 transition-colors gap-2 font-bold uppercase tracking-wider text-xs"
          >
            <LogOut className="h-3 w-3" />
            Sair do Sistema
          </Button>
        </div>
      </div>
      
      {/* Overlay Escuro para Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
