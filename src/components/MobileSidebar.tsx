
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Book, 
  FileText, 
  Folder, 
  MessageSquare 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MobileSidebar: React.FC = () => {
  const menuItems = [
    { path: '/', label: 'Projets', icon: <Folder className="h-5 w-5" /> },
    { path: '/reports', label: 'Rapports', icon: <FileText className="h-5 w-5" /> },
    { path: '/generate-content', label: 'Générer du contenu', icon: <FileText className="h-5 w-5" /> },
    { path: '/templates', label: 'Templates rapports', icon: <Book className="h-5 w-5" /> },
    { path: '/chat-reports', label: 'Discuter avec les rapports', icon: <MessageSquare className="h-5 w-5" /> },
  ];

  return (
    <div className="h-full bg-white">
      <div className="flex items-center h-16 px-4 border-b border-neutral-200">
        <div className="font-semibold text-lg">RAEDIFICARE</div>
      </div>
      
      <nav className="p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) => 
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
                    isActive 
                      ? "bg-neutral-100 text-primary" 
                      : "hover:bg-neutral-50"
                  )
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default MobileSidebar;
