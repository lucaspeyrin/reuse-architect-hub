
import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, RefreshCw } from 'lucide-react';

const GenerateContent: React.FC = () => {
  const [selectedType, setSelectedType] = useState('blog');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('professional');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerate = () => {
    if (!topic) return;
    
    setIsGenerating(true);
    setGeneratedContent('');
    
    // Simulate API call
    setTimeout(() => {
      const content = `# Le réemploi des matériaux : une solution d'avenir pour le secteur du bâtiment

Le secteur du bâtiment est responsable de près de 70% des déchets produits en France. Face à ce constat alarmant, le réemploi des matériaux s'impose comme une solution innovante et durable. Chez RAEDIFICARE, nous nous engageons quotidiennement dans cette démarche.

## Pourquoi privilégier le réemploi ?

Le réemploi des matériaux présente de nombreux avantages :
- Réduction significative de l'empreinte carbone
- Économies financières conséquentes
- Préservation de matériaux souvent de meilleure qualité
- Valorisation du patrimoine bâti

## Notre expertise au service de votre projet

Notre équipe de diagnostiqueurs spécialisés intervient sur l'ensemble du territoire pour identifier, caractériser et valoriser les matériaux réemployables dans vos projets de rénovation ou de démolition.

Contactez-nous pour découvrir comment RAEDIFICARE peut vous accompagner dans votre démarche d'économie circulaire.`;
      
      setGeneratedContent(content);
      setIsGenerating(false);
    }, 2000);
  };
  
  const handleCopyContent = () => {
    navigator.clipboard.writeText(generatedContent);
    // Add toast notification here in a real app
  };
  
  return (
    <MainLayout>
      <h1 className="page-title">Générer du contenu</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Paramètres du contenu</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="content-type">Type de contenu</Label>
              <Tabs 
                id="content-type"
                value={selectedType} 
                onValueChange={setSelectedType}
                className="w-full mt-2"
              >
                <TabsList className="grid grid-cols-2 md:grid-cols-4">
                  <TabsTrigger value="blog">Blog</TabsTrigger>
                  <TabsTrigger value="instagram">Instagram</TabsTrigger>
                  <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
                  <TabsTrigger value="facebook">Facebook</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div>
              <Label htmlFor="topic">Sujet</Label>
              <Input
                id="topic"
                placeholder="Le réemploi des matériaux dans le secteur du bâtiment..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="tone">Ton</Label>
              <select
                id="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full rounded-md border border-neutral-200 p-2 mt-1"
              >
                <option value="professional">Professionnel</option>
                <option value="casual">Décontracté</option>
                <option value="enthusiastic">Enthousiaste</option>
                <option value="informative">Informatif</option>
              </select>
            </div>
            
            <div className="pt-2">
              <Button 
                onClick={handleGenerate} 
                disabled={!topic || isGenerating}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Génération en cours...
                  </>
                ) : 'Générer le contenu'}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Contenu généré</h2>
            {generatedContent && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyContent}
                className="flex items-center gap-2"
              >
                <Copy className="h-3.5 w-3.5" />
                Copier
              </Button>
            )}
          </div>
          
          <div className="min-h-[400px] bg-neutral-50 rounded-md p-4 border border-neutral-200">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                <RefreshCw className="h-8 w-8 animate-spin mb-3" />
                <p>Génération de votre contenu...</p>
              </div>
            ) : generatedContent ? (
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap">{generatedContent}</div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                <p>Le contenu généré apparaîtra ici</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default GenerateContent;
