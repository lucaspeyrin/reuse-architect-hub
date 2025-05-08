
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FilePlus, FileText, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('documents');
  const [chatMessage, setChatMessage] = useState('');
  
  // Mock project data - in a real app, would be fetched based on ID
  const project = {
    id,
    title: 'Rénovation Immeuble Haussmannien',
    client: 'ABC Construction',
    description: 'Diagnostic des matériaux réemployables dans un immeuble haussmannien du 9ème arrondissement avant rénovation complète.',
    status: 'in_progress',
    date: '12/05/2025',
  };
  
  // Mock documents
  const documents = [
    { id: 'd1', name: 'Photos initiales.zip', type: 'zip', date: '12/05/2025' },
    { id: 'd2', name: 'Plans architecte.pdf', type: 'pdf', date: '12/05/2025' },
    { id: 'd3', name: 'Inventaire préliminaire.xlsx', type: 'excel', date: '12/05/2025' },
  ];
  
  // Mock chat messages
  const chatMessages = [
    { id: 'm1', sender: 'user', text: 'Quels sont les matériaux principaux identifiés dans ce projet ?', time: '14:25' },
    { id: 'm2', sender: 'bot', text: 'Dans ce projet de rénovation, les principaux matériaux identifiés pour le réemploi sont : des parquets en chêne massif (environ 120m²), des portes anciennes en bois (15 unités), des radiateurs en fonte (12 unités), des carreaux de ciment dans les parties communes, et plusieurs luminaires en laiton. L\'inventaire préliminaire estime une valeur de réemploi potentielle d\'environ 45 000€.', time: '14:26' },
  ];
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    console.log('Sending message:', chatMessage);
    // Here we would make an API call to the chat endpoint
    setChatMessage('');
  };
  
  return (
    <MainLayout>
      <div className="flex items-center gap-3 mb-6">
        <a href="/" className="p-2 rounded-md hover:bg-neutral-100 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </a>
        <div>
          <h1 className="text-2xl font-semibold text-neutral-800">{project.title}</h1>
          <p className="text-neutral-500">{project.client}</p>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <p className="text-neutral-600">{project.description}</p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <FilePlus className="h-4 w-4" />
            <span>Importer document</span>
          </Button>
          <Button className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Générer un rapport</span>
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="documents">Documents importés</TabsTrigger>
          <TabsTrigger value="chat">Discussion</TabsTrigger>
          <TabsTrigger value="report">Générer une partie du rapport</TabsTrigger>
        </TabsList>
        
        <TabsContent value="documents">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-md bg-blue-50 text-blue-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800">{doc.name}</p>
                    <p className="text-xs text-neutral-500">Ajouté le {doc.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="chat">
          <div className="bg-white rounded-lg border border-neutral-200 h-[500px] flex flex-col">
            <div className="flex-1 p-4 overflow-y-auto">
              {chatMessages.map((message) => (
                <div 
                  key={message.id} 
                  className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-3/4 p-3 rounded-lg ${
                      message.sender === 'user' 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-neutral-100 text-neutral-800 rounded-tl-none'
                    }`}
                  >
                    <p>{message.text}</p>
                    <span className={`text-xs block mt-1 ${message.sender === 'user' ? 'text-primary-50' : 'text-neutral-500'}`}>
                      {message.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <form onSubmit={handleSendMessage} className="border-t border-neutral-200 p-4 flex gap-2">
              <Input
                placeholder="Posez une question sur ce projet..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Send className="h-4 w-4 mr-2" />
                Envoyer
              </Button>
            </form>
          </div>
        </TabsContent>
        
        <TabsContent value="report">
          <div className="bg-white rounded-lg border border-neutral-200 p-6">
            <h3 className="text-lg font-medium mb-4">Générer une section du rapport</h3>
            <p className="text-neutral-600 mb-4">
              Sélectionnez le type de section que vous souhaitez générer pour ce projet.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="border border-neutral-200 rounded-md p-4 hover:border-primary cursor-pointer transition-colors">
                <h4 className="font-medium mb-2">Introduction du projet</h4>
                <p className="text-sm text-neutral-500">
                  Génère une introduction contextuelle du projet basée sur les documents disponibles.
                </p>
              </div>
              
              <div className="border border-neutral-200 rounded-md p-4 hover:border-primary cursor-pointer transition-colors">
                <h4 className="font-medium mb-2">Analyse des matériaux</h4>
                <p className="text-sm text-neutral-500">
                  Crée une analyse détaillée des matériaux identifiés et leur potentiel de réemploi.
                </p>
              </div>
              
              <div className="border border-neutral-200 rounded-md p-4 hover:border-primary cursor-pointer transition-colors">
                <h4 className="font-medium mb-2">Recommandations</h4>
                <p className="text-sm text-neutral-500">
                  Propose des recommandations concrètes pour la valorisation des matériaux.
                </p>
              </div>
              
              <div className="border border-neutral-200 rounded-md p-4 hover:border-primary cursor-pointer transition-colors">
                <h4 className="font-medium mb-2">Conclusion</h4>
                <p className="text-sm text-neutral-500">
                  Synthétise les points clés et les prochaines étapes du projet.
                </p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button>Générer la section</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default ProjectPage;
