import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Users, 
  LogOut 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import logo from '../assets/logo.png';

const Sidebar = ({ activeSection, onSectionChange, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'relatorios', label: 'Relatórios', icon: FileText },
    { id: 'clientes', label: 'Clientes', icon: Users },
  ];

  return (
    <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Sr. Mendes Barbearia" className="h-10 w-auto" />
          <div>
            <h2 className="font-bold text-gray-900">Sr. Mendes</h2>
            <p className="text-sm text-gray-600">Barbearia</p>
          </div>
        </div>
      </div>

      {/* Menu Principal */}
      <div className="flex-1 py-6">
        <div className="px-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            MENU PRINCIPAL
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-amber-100 text-amber-900 border-r-2 border-amber-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-amber-600' : 'text-gray-400'}`} />
                  {item.label}
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-amber-600 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
            <span className="text-amber-600 font-semibold text-sm">SM</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Sr. Mendes</p>
            <p className="text-xs text-gray-600">Administrador</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;

