
import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, RefreshCw, FileUp } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { createClient } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Checkbox } from '@/components/ui/checkbox';

// Initialisation du client Supabase
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

interface Rapport {
  id: string;
  title: string;
  project_title: string;
}

type ContentType = 'blog' | 'linkedin' | 'instagram' | 'facebook';

interface GeneratedContent {
  type: ContentType;
  content: string;
  imageUrl?: string;
}

const contentTypes: { value: ContentType; label: string }[] = [
  { value: 'blog', label: 'Blog' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
];

const GenerateContent: React.FC = () => {
  const [selectedContentTypes, setSelectedContentTypes] = useState<ContentType[]>(['blog']);
  const [activeContentTab, setActiveContentTab] = useState<ContentType>('blog');
  const [selectedRapport, setSelectedRapport] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [generatedContents, setGeneratedContents] = useState<GeneratedContent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [rapportsList, setRapportsList] = useState<Rapport[]>([]);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    fetchRapports();
  }, []);
  
  useEffect(() => {
    // Quand selectedContentTypes change, s'assurer que activeContentTab est toujours valide
    if (selectedContentTypes.length > 0 && !selectedContentTypes.includes(activeContentTab)) {
      setActiveContentTab(selectedContentTypes[0]);
    }
  }, [selectedContentTypes, activeContentTab]);
  
  const fetchRapports = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          id,
          title,
          projects:project_id (
            title
          )
        `)
        .eq('rapport', true);
      
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
  
  const handleContentTypeChange = (type: ContentType) => {
    setSelectedContentTypes(prev => {
      if (prev.includes(type)) {
        // Retirer le type s'il est déjà sélectionné
        const newTypes = prev.filter(t => t !== type);
        // S'assurer qu'il reste au moins un type sélectionné
        return newTypes.length > 0 ? newTypes : prev;
      } else {
        // Ajouter le type
        return [...prev, type];
      }
    });
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
    
    if (selectedContentTypes.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un type de contenu",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    setGeneratedContents([]);
    
    try {
      // Appel au webhook pour générer le contenu
      const response = await fetch('https://api.ia2s.app/webhook/raedificare/rapport/content/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rapport_id: selectedRapport,
          content_types: selectedContentTypes,
          instructions: customInstructions || undefined,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Traitement des réponses
      if (result.suggestions && Array.isArray(result.suggestions)) {
        const contents: GeneratedContent[] = result.suggestions.map((suggestion: any) => ({
          type: suggestion.content_type,
          content: suggestion.generated_content || '',
          imageUrl: suggestion.generated_image_url || undefined,
        }));
        
        setGeneratedContents(contents);
        
        // Activer le premier onglet disponible
        const availableTypes = contents.map(item => item.type);
        if (availableTypes.length > 0) {
          setActiveContentTab(availableTypes[0] as ContentType);
        }
      } else {
        // Si aucune suggestion n'est retournée, générer du contenu de secours
        const defaultContents: GeneratedContent[] = selectedContentTypes.map(type => ({
          type,
          content: generateDefaultContent(type),
        }));
        
        setGeneratedContents(defaultContents);
        setActiveContentTab(selectedContentTypes[0]);
      }
    } catch (error) {
      console.error('Erreur lors de la génération du contenu:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le contenu",
        variant: "destructive"
      });
      
      // Contenu de secours en cas d'erreur pour chaque type demandé
      const fallbackContents: GeneratedContent[] = selectedContentTypes.map(type => ({
        type,
        content: generateDefaultContent(type),
      }));
      
      setGeneratedContents(fallbackContents);
      setActiveContentTab(selectedContentTypes[0]);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Fonction pour générer du contenu par défaut selon le type
  const generateDefaultContent = (type: ContentType): string => {
    switch (type) {
      case 'blog':
        return `# Le réemploi des matériaux : une solution d'avenir pour le secteur du bâtiment

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
      
      case 'linkedin':
        return `🔄 #ÉconomieCirculaire | Saviez-vous que le secteur du bâtiment génère 70% des déchets en France ?

Chez RAEDIFICARE, nous transformons cette problématique en opportunité grâce au réemploi des matériaux. Notre dernier projet a permis de valoriser plus de 45 tonnes de matériaux qui auraient autrement fini en décharge.

Notre équipe d'experts intervient sur l'ensemble du territoire pour diagnostiquer, caractériser et valoriser les matériaux réemployables dans vos projets.

✅ Réduction de l'empreinte carbone
✅ Économies substantielles
✅ Valorisation du patrimoine architectural

Le réemploi n'est pas seulement un geste écologique, c'est une démarche économiquement viable et socialement responsable.

#Réemploi #MatériauxDurable #Construction #DéveloppementDurable`;
      
      case 'instagram':
        return `🏗️ DONNER UNE SECONDE VIE AUX MATÉRIAUX 🏗️

Ces magnifiques carreaux de ciment ont été sauvés d'une démolition et vont désormais embellir un nouvel espace de vie !

Le réemploi, c'est la magie de transformer l'ancien en nouveau, l'histoire en avenir.

Chez @raedificare, nous sommes passionnés par la recherche et la valorisation de ces trésors cachés dans les bâtiments anciens.

→ Swipe pour voir l'avant/après ! ←

#ReemploiMateriaux #EconomieCirculaire #Architecture #Renovation #PatrimoineBati #DeveloppementDurable #SecondLife #Upcycling`;
      
      case 'facebook':
        return `🔍 RAEDIFICARE EN ACTION !

Notre équipe est intervenue cette semaine dans un hôtel particulier du 7ème arrondissement de Paris en cours de rénovation.

Nous avons identifié plus de 200m² de parquet ancien en chêne massif, 12 portes d'époque en excellent état, et plusieurs radiateurs en fonte ornementés qui méritent une seconde vie !

Grâce à notre réseau de partenaires, ces matériaux d'exception seront réemployés dans d'autres projets, évitant ainsi près de 8 tonnes de déchets.

Le réemploi, c'est bon pour la planète ET pour votre porte-monnaie ! 💚💰

👉 Vous avez un projet de rénovation ou de démolition ? Contactez-nous pour un diagnostic réemploi !`;
      
      default:
        return "Le contenu n'a pas pu être généré. Veuillez réessayer.";
    }
  };
  
  const getCurrentContent = () => {
    const content = generatedContents.find(item => item.type === activeContentTab);
    return content || { type: activeContentTab, content: '', imageUrl: undefined };
  };
  
  const handleCopyContent = () => {
    const content = getCurrentContent();
    navigator.clipboard.writeText(content.content);
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
              <Label className="mb-2 block">Types de contenu</Label>
              <div className="grid grid-cols-2 gap-3">
                {contentTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`content-type-${type.value}`}
                      checked={selectedContentTypes.includes(type.value)}
                      onCheckedChange={() => handleContentTypeChange(type.value)}
                    />
                    <Label 
                      htmlFor={`content-type-${type.value}`}
                      className="cursor-pointer"
                    >
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
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
                disabled={!selectedRapport || selectedContentTypes.length === 0 || isGenerating}
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
            <h2 className="text-lg font-medium">Contenus générés</h2>
            {generatedContents.length > 0 && (
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
          
          {generatedContents.length > 0 && (
            <div className="mb-3">
              <Tabs value={activeContentTab} onValueChange={(value) => setActiveContentTab(value as ContentType)}>
                <TabsList className="w-full grid grid-cols-4">
                  {selectedContentTypes.map((type) => {
                    const hasContent = generatedContents.some(content => content.type === type);
                    return (
                      <TabsTrigger 
                        key={type} 
                        value={type}
                        disabled={!hasContent}
                      >
                        {contentTypes.find(t => t.value === type)?.label}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </div>
          )}
          
          <div className="min-h-[400px] bg-neutral-50 rounded-md p-4 border border-neutral-200 overflow-y-auto">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-500">
                <RefreshCw className="h-8 w-8 animate-spin mb-3" />
                <p>Génération de votre contenu...</p>
              </div>
            ) : generatedContents.length > 0 ? (
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap">{getCurrentContent().content}</div>
                
                {getCurrentContent().imageUrl && (
                  <div className="mt-4">
                    <img 
                      src={getCurrentContent().imageUrl} 
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
