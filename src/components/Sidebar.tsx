
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Folder, 
  FileText, 
  Book, 
  MessageSquare, 
  Menu, 
  X 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  toggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, toggleCollapse }) => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', label: 'Projets', icon: <Folder className="h-5 w-5" /> },
    { path: '/generate-content', label: 'Générer du contenu', icon: <FileText className="h-5 w-5" /> },
    { path: '/templates', label: 'Templates rapports', icon: <Book className="h-5 w-5" /> },
    { path: '/chat-reports', label: 'Discuter avec les rapports', icon: <MessageSquare className="h-5 w-5" /> },
  ];
  
  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-full bg-white border-r border-neutral-200 transition-all duration-300 z-20",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200">
        {!collapsed && (
          <div className="font-semibold text-lg">RAEDIFICARE</div>
        )}
        <button
          onClick={toggleCollapse}
          className="p-2 rounded-md hover:bg-neutral-100 transition-colors"
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </button>
      </div>
      
      <nav className="p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  cn(
                    "sidebar-link",
                    isActive ? "active" : "",
                    "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
                    {
                      "justify-center": collapsed
                    }
                  )
                }
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
