
import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';

const Templates: React.FC = () => {
  const templates = [
    {
      id: 't1',
      name: 'Rapport de diagnostic standard',
      description: 'Template complet pour les diagnostics de réemploi standard.',
      lastUpdated: '10/05/2025',
      sections: 6,
    },
    {
      id: 't2',
      name: 'Rapport express',
      description: 'Version simplifiée pour les petits projets avec délai court.',
      lastUpdated: '08/05/2025',
      sections: 4,
    },
    {
      id: 't3',
      name: 'Rapport détaillé bâtiment historique',
      description: 'Template spécifique pour les bâtiments à valeur patrimoniale.',
      lastUpdated: '05/05/2025',
      sections: 8,
    },
    {
      id: 't4',
      name: 'Audit préliminaire',
      description: 'Pour les visites initiales et estimations rapides de potentiel.',
      lastUpdated: '01/05/2025',
      sections: 3,
    },
  ];
  
  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="page-title">Templates de rapports</h1>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Créer un template</span>
        </Button>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div 
            key={template.id}
            className="bg-white rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
          >
            <div className="bg-neutral-50 p-4 border-b border-neutral-200">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-md bg-blue-50 text-blue-600">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="text-xs text-neutral-500">
                  Mis à jour le {template.lastUpdated}
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-medium text-lg mb-1">{template.name}</h3>
              <p className="text-neutral-600 text-sm mb-4">{template.description}</p>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-500">{template.sections} sections</span>
                <Button variant="outline" size="sm">Modifier</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </MainLayout>
  );
};

export default Templates;
