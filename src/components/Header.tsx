
import React, { useState } from 'react';
import { Menu, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import MobileSidebar from './MobileSidebar';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(segment => segment !== '');
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Map path segments to human-readable names
  const pathNames: Record<string, string> = {
    '': 'Projets',
    'generate-content': 'Générer du contenu',
    'templates': 'Templates rapports',
    'chat-reports': 'Discuter avec les rapports',
    'reports': 'Rapports'
  };

  const handleRoleChange = (role: string) => {
    toast({
      title: `Rôle changé`,
      description: `Vous êtes maintenant connecté en tant que ${role}`,
    });
  };
  
  return (
    <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between">
      <div className="flex items-center">
        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-4">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <MobileSidebar />
            </SheetContent>
          </Sheet>
        ) : (
          <button
            onClick={toggleSidebar}
            className="mr-4 p-2 rounded-md hover:bg-neutral-100 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        
        <div className="breadcrumb">
          {pathSegments.length === 0 ? (
            <span>Projets</span>
          ) : (
            <>
              <a href="/" className="hover:text-primary">Projets</a>
              <span>/</span>
              {pathSegments.map((segment, index) => {
                const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
                const isLast = index === pathSegments.length - 1;
                
                return (
                  <React.Fragment key={path}>
                    {isLast ? (
                      <span className={cn(isLast && 'font-medium text-neutral-800')}>
                        {pathNames[segment] || segment}
                      </span>
                    ) : (
                      <>
                        <a href={path} className="hover:text-primary">
                          {pathNames[segment] || segment}
                        </a>
                        <span>/</span>
                      </>
                    )}
                  </React.Fragment>
                );
              })}
            </>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-sm font-medium">Julien Dubois</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
              <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 text-sm font-medium">
                JD
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => handleRoleChange('Admin')}>
                <User className="mr-2 h-4 w-4" />
                <span>Admin</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleChange('Ambassadeur')}>
                <User className="mr-2 h-4 w-4" />
                <span>Ambassadeur</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
