import { LayoutDashboard, Calendar, Layers, BarChart, Settings, PlusCircle, PenTool, Mail, Mic, FileText, CreditCard, LogOut, MessageSquare } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: PenTool, label: 'Create Post', path: '/create' },
  { icon: MessageSquare, label: 'Inbox', path: '/inbox' },
  { icon: Mail, label: 'Newsletters', path: '/newsletters' },
  { icon: Mic, label: 'Podcasts', path: '/podcasts' },
  { icon: Calendar, label: 'Calendar', path: '/calendar' },
  { icon: Layers, label: 'Brands', path: '/brands' },
  { icon: BarChart, label: 'Analytics', path: '/analytics' },
  { icon: FileText, label: 'Reports', path: '/reports' },
  { icon: CreditCard, label: 'Billing', path: '/billing' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('authToken');
        navigate('/login');
    }
  };

  return (
    <div className="w-64 bg-white border-r h-screen flex flex-col">
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-blue-600">OWOO</h1>
        <p className="text-xs text-gray-500">Social AI Scheduler</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-2">
        <Link 
          to="/brands/new"
          className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Brand
        </Link>
        
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full bg-white text-red-600 border border-red-200 py-2 px-4 rounded-md hover:bg-red-50 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </div>
  );
}
