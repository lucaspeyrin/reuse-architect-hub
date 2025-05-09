
import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, RefreshCw, FileUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { createClient } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

// Initialisation du client Supabase
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

interface Rapport {
  id: string;
  title: string;
  project_title: string;
}

const GenerateContent: React.FC = () => {
  const [selectedType, setSelectedType] = useState('blog');
  const [selectedRapport, setSelectedRapport] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [rapportsList, setRapportsList] = useState<Rapport[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchRapports();
  }, []);
  
  const fetchRapports = async () => {
    try {
      const { data, error } = await supabase
        .from('rapports')
        .select(`
          id,
          title,
          projects (
            title
          )
        `);
      
      if (error) throw error;
      
      // Formatage des données pour la liste de rapports
      const formattedRapports: Rapport[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        project_title: item.projects?.title || 'Projet inconnu',
      }));
      
      setRapportsList(formattedRapports);
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error);
      
      // Données de secours
      setRapportsList([
        { id: 'r1', title: 'Diagnostic Réemploi - Immeuble Haussmannien', project_title: 'Rénovation Immeuble Haussmannien' },
        { id: 'r2', title: 'Étude préliminaire - Site industriel', project_title: 'Déconstruction Bâtiment Industriel' },
        { id: 'r3', title: 'Diagnostic matériaux - École Jules Ferry', project_title: 'Réhabilitation École Jules Ferry' },
      ]);
    }
  };
  
  const handleGenerate = async () => {
    if (!selectedRapport) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un rapport",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    setGeneratedContent('');
    setGeneratedImageUrl('');
    
    try {
      // Appel au webhook pour générer le contenu
      const response = await fetch('https://api.ia2s.app/webhook/raedificare/rapport/content/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rapport_id: selectedRapport,
          content_type: selectedType,
          instructions: customInstructions || undefined,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      
      setGeneratedContent(result.content || '');
      setGeneratedImageUrl(result.image_url || '');
    } catch (error) {
      console.error('Erreur lors de la génération du contenu:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le contenu",
        variant: "destructive"
      });
      
      // Contenu de secours en cas d'erreur
      setGeneratedContent(`# Le réemploi des matériaux : une solution d'avenir pour le secteur du bâtiment

Le secteur du bâtiment est responsable de près de 70% des déchets produits en France. Face à ce constat alarmant, le réemploi des matériaux s'impose comme une solution innovante et durable. Chez RAEDIFICARE, nous nous engageons quotidiennement dans cette démarche.

## Pourquoi privilégier le réemploi ?

Le réemploi des matériaux présente de nombreux avantages :
- Réduction significative de l'empreinte carbone
- Économies financières conséquentes
- Préservation de matériaux souvent de meilleure qualité
- Valorisation du patrimoine bâti

## Notre expertise au service de votre projet

Notre équipe de diagnostiqueurs spécialisés intervient sur l'ensemble du territoire pour identifier, caractériser et valoriser les matériaux réemployables dans vos projets de rénovation ou de démolition.

Contactez-nous pour découvrir comment RAEDIFICARE peut vous accompagner dans votre démarche d'économie circulaire.`);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleCopyContent = () => {
    navigator.clipboard.writeText(generatedContent);
    toast({
      title: "Copié !",
      description: "Le contenu a été copié dans le presse-papier",
    });
  };
  
  const handleUploadRapport = async () => {
    if (!selectedFile || !uploadTitle) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un fichier et entrer un titre",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('rapports', selectedFile);
      formData.append('title', uploadTitle);
      
      // Appel au webhook d'ajout de rapport
      const response = await fetch('https://api.ia2s.app/webhook/raedificare/rapport/add', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Ajouter le rapport à la liste locale
      const newRapport = {
        id: result.rapport_id || `new${Date.now()}`,
        title: uploadTitle,
        project_title: 'Nouveau projet',
      };
      
      setRapportsList(prev => [newRapport, ...prev]);
      setSelectedFile(null);
      setUploadTitle('');
      setIsUploadDialogOpen(false);
      
      toast({
        title: "Succès",
        description: "Le rapport a été importé avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de l\'upload du rapport:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'importer le rapport",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="page-title">Générer du contenu</h1>
        <Button 
          onClick={() => setIsUploadDialogOpen(true)}
          variant="outline" 
          className="flex items-center gap-2"
        >
          <FileUp className="h-4 w-4" />
          <span>Importer un rapport</span>
        </Button>
      </div>
      
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
              <Label htmlFor="rapport-select">Rapport source</Label>
              <Select value={selectedRapport} onValueChange={setSelectedRapport}>
                <SelectTrigger className="w-full mt-1" id="rapport-select">
                  <SelectValue placeholder="Sélectionner un rapport" />
                </SelectTrigger>
                <SelectContent>
                  {rapportsList.map((rapport) => (
                    <SelectItem key={rapport.id} value={rapport.id}>
                      {rapport.title} ({rapport.project_title})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="instructions">Instructions personnalisées</Label>
              <Textarea
                id="instructions"
                placeholder="Instructions spécifiques pour la génération du contenu..."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div className="pt-2">
              <Button 
                onClick={handleGenerate} 
                disabled={!selectedRapport || isGenerating}
                className="w-full"
                style={{ backgroundColor: '#eb661a' }}
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
          
          <div className="min-h-[400px] bg-neutral-50 rounded-md p-4 border border-neutral-200 overflow-y-auto">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                <RefreshCw className="h-8 w-8 animate-spin mb-3" />
                <p>Génération de votre contenu...</p>
              </div>
            ) : generatedContent ? (
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap">{generatedContent}</div>
                
                {generatedImageUrl && (
                  <div className="mt-4">
                    <img 
                      src={generatedImageUrl} 
                      alt="Illustration générée" 
                      className="max-w-full h-auto rounded-md" 
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                <p>Le contenu généré apparaîtra ici</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Dialog d'importation de rapport */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Importer un rapport</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="rapport-title">Titre du rapport</Label>
                <Input
                  id="rapport-title"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Rapport de diagnostic - Projet X"
                />
              </div>
              
              <div className="grid gap-2">
                <Label>Fichier du rapport</Label>
                <div
                  className="border-2 border-dashed border-neutral-300 rounded-md p-6 text-center"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      setSelectedFile(e.dataTransfer.files[0]);
                    }
                  }}
                >
                  <input
                    id="rapport-file"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                  />
                  <label 
                    htmlFor="rapport-file"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <FileUp className="h-8 w-8 text-neutral-400 mb-2" />
                    <span className="text-sm text-neutral-600 mb-1">
                      Glissez-déposez votre fichier ici
                    </span>
                    <span className="text-xs text-neutral-500">
                      ou cliquez pour parcourir
                    </span>
                  </label>
                </div>
                
                {selectedFile && (
                  <div className="text-sm text-neutral-600 mt-1">
                    <span className="font-medium">Fichier sélectionné:</span> {selectedFile.name}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)} disabled={isUploading}>
              Annuler
            </Button>
            <Button 
              onClick={handleUploadRapport} 
              disabled={!selectedFile || !uploadTitle || isUploading}
              style={{ backgroundColor: '#eb661a' }}
            >
              {isUploading ? 'Importation...' : 'Importer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default GenerateContent;
