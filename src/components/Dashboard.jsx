import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import DashboardContent from './DashboardContent';
import Agenda from './Agenda';
import Clientes from './Clientes';
import Relatorios from './Relatorios';
import Planos from './Planos';
import Produtos from './Produtos'; // <-- NOVA TELA IMPORTADA AQUI

const Dashboard = ({ user, onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'agenda':
        return <Agenda user={user} />;
      case 'clientes':
        return <Clientes user={user} />;
      case 'relatorios':
        return <Relatorios user={user} />;
      case 'planos':
        return <Planos user={user} />;
      case 'produtos':               // <-- ROTEAMENTO DA NOVA TELA AQUI
        return <Produtos user={user} />;
      default:
        return <DashboardContent user={user} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onLogout={onLogout}
        user={user}
      />
      <main className="flex-1 overflow-auto lg:ml-0">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
