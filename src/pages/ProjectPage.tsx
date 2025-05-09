import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FilePlus, FileText, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface Document {
  id: string;
  name: string;
  type: string;
  date: string;
  url?: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
}

interface Template {
  id: string;
  title: string;
}

interface TemplateSection {
  id: string;
  title: string;
  instructions: string;
}

const ProjectPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('documents');
  const [chatMessage, setChatMessage] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateSections, setTemplateSections] = useState<TemplateSection[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [customInstructions, setCustomInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // Mock project data - en production, serait récupéré depuis Supabase
  const project = {
    id,
    title: 'Rénovation Immeuble Haussmannien',
    client: 'ABC Construction',
    description: 'Diagnostic des matériaux réemployables dans un immeuble haussmannien du 9ème arrondissement avant rénovation complète.',
    status: 'in_progress',
    date: '12/05/2025',
  };
  
  useEffect(() => {
    fetchProjectData();
    fetchTemplates();
  }, [id]);
  
  const fetchProjectData = async () => {
    setIsLoading(true);
    try {
      // En production, appel à Supabase pour récupérer les données du projet
      // Pour l'exemple, on utilise des données fictives
      
      const mockDocuments = [
        { id: 'd1', name: 'Photos initiales.zip', type: 'zip', date: '12/05/2025' },
        { id: 'd2', name: 'Plans architecte.pdf', type: 'pdf', date: '12/05/2025' },
        { id: 'd3', name: 'Inventaire préliminaire.xlsx', type: 'excel', date: '12/05/2025' },
      ];
      
      const mockChatMessages: ChatMessage[] = [
        { id: 'm1', sender: 'user', text: 'Quels sont les matériaux principaux identifiés dans ce projet ?', time: '14:25' },
        { id: 'm2', sender: 'bot', text: 'Dans ce projet de rénovation, les principaux matériaux identifiés pour le réemploi sont : des parquets en chêne massif (environ 120m²), des portes anciennes en bois (15 unités), des radiateurs en fonte (12 unités), des carreaux de ciment dans les parties communes, et plusieurs luminaires en laiton. L\'inventaire préliminaire estime une valeur de réemploi potentielle d\'environ 45 000€.', time: '14:26' },
      ];
      
      setDocuments(mockDocuments);
      setChatMessages(mockChatMessages);
    } catch (error) {
      console.error('Erreur lors du chargement des données du projet:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du projet",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates_rapports')
        .select('id, title');
      
      if (error) throw error;
      setTemplates(data);
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error);
      // Templates de secours
      setTemplates([
        { id: 't1', title: 'Rapport de diagnostic standard' },
        { id: 't2', title: 'Rapport express' },
        { id: 't3', title: 'Rapport détaillé bâtiment historique' },
      ]);
    }
  };
  
  const fetchTemplateSections = async (templateId: string) => {
    if (!templateId) return;
    
    try {
      const { data, error } = await supabase
        .from('templates_rapports_parts')
        .select('id, title, instructions')
        .eq('template_rapport_id', templateId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      setTemplateSections(data);
    } catch (error) {
      console.error('Erreur lors du chargement des sections:', error);
      // Sections de secours
      setTemplateSections([
        { id: 's1', title: 'Introduction', instructions: 'Présenter le contexte du projet' },
        { id: 's2', title: 'Méthodologie', instructions: 'Décrire l\'approche utilisée' },
        { id: 's3', title: 'Analyse des matériaux', instructions: 'Détailler les matériaux identifiés' },
        { id: 's4', title: 'Conclusion', instructions: 'Synthèse et recommandations' },
      ]);
    }
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    const newUserMessage = {
      id: `m${Date.now()}`,
      sender: 'user' as const,
      text: chatMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setChatMessages(prev => [...prev, newUserMessage]);
    setChatMessage('');
    
    try {
      // Récupérer les IDs des sources (documents) pour le webhook
      const sourceIds = documents.map(doc => doc.id);
      
      // Appel au webhook de chat
      const response = await fetch('https://api.ia2s.app/webhook/raedificare/project/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: id,
          query: chatMessage,
          response: '', // Sera rempli par le serveur
          source_ids: sourceIds,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Ajouter la réponse du bot
      const botResponse = {
        id: `m${Date.now() + 1}`,
        sender: 'bot' as const,
        text: result.response || "Je n'ai pas pu générer de réponse pour cette question.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setChatMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      
      // Message d'erreur du bot
      const errorMessage = {
        id: `m${Date.now() + 1}`,
        sender: 'bot' as const,
        text: "Désolé, une erreur est survenue lors du traitement de votre message.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    }
  };
  
  const handleTemplateChange = async (templateId: string) => {
    setSelectedTemplate(templateId);
    setSelectedSections([]);
    await fetchTemplateSections(templateId);
  };
  
  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };
  
  const handleUploadDocuments = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un fichier",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('project_id', id || '');
      
      selectedFiles.forEach(file => {
        formData.append('documents', file);
      });
      
      // Appel au webhook d'ajout de documents
      const response = await fetch('https://api.ia2s.app/webhook/raedificare/project/documents/add', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      // Ajouter les documents à l'affichage local
      const newDocuments = selectedFiles.map((file, index) => ({
        id: `new${Date.now() + index}`,
        name: file.name,
        type: file.type.split('/')[1] || 'document',
        date: new Date().toLocaleDateString('fr-FR'),
      }));
      
      setDocuments(prev => [...newDocuments, ...prev]);
      setSelectedFiles([]);
      setIsDocumentDialogOpen(false);
      
      toast({
        title: "Succès",
        description: `${selectedFiles.length} document(s) importé(s) avec succès`,
      });
    } catch (error) {
      console.error('Erreur lors de l\'upload des documents:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'importer les documents",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGenerateReport = async () => {
    if (selectedSections.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins une section",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Appel au webhook de génération de rapport
      const response = await fetch('https://api.ia2s.app/webhook/raedificare/rapport/part/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          project_id: id,
          part_ids: selectedSections,
          instructions: customInstructions || undefined,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      
      setIsGenerateDialogOpen(false);
      setSelectedTemplate('');
      setSelectedSections([]);
      setCustomInstructions('');
      
      toast({
        title: "Succès",
        description: "Les sections ont été générées avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer les sections du rapport",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteDocument = async (docId: string) => {
    try {
      // Appel au webhook de suppression de document
      const response = await fetch('https://api.ia2s.app/webhook/raedificare/projects/documents/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          document_id: docId,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      // Supprimer le document de l'affichage local
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
      
      toast({
        title: "Succès",
        description: "Document supprimé avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le document",
        variant: "destructive"
      });
    }
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
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setIsDocumentDialogOpen(true)}
          >
            <FilePlus className="h-4 w-4" />
            <span>Importer document</span>
          </Button>
          <Button 
            className="flex items-center gap-2"
            style={{ backgroundColor: '#eb661a' }}
            onClick={() => setIsGenerateDialogOpen(true)}
          >
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
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse text-neutral-500">Chargement des documents...</div>
            </div>
          ) : documents.length === 0 ? (
            <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
              <h3 className="text-lg font-medium mb-2">Aucun document</h3>
              <p className="text-neutral-500 mb-6">
                Importez des documents pour commencer à travailler sur ce projet.
              </p>
              <Button 
                onClick={() => setIsDocumentDialogOpen(true)}
                style={{ backgroundColor: '#eb661a' }}
              >
                <FilePlus className="h-4 w-4 mr-2" />
                Importer un document
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => (
                <div key={doc.id} className="bg-white p-4 rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-blue-50 text-blue-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-800">{doc.name}</p>
                        <p className="text-xs text-neutral-500">Ajouté le {doc.date}</p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="h-8 w-8 text-neutral-500 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                        ? 'bg-[#eb661a] text-white rounded-tr-none' 
                        : 'bg-neutral-100 text-neutral-800 rounded-tl-none'
                    }`}
                  >
                    <p>{message.text}</p>
                    <span className={`text-xs block mt-1 ${message.sender === 'user' ? 'text-[#ffffff80]' : 'text-neutral-500'}`}>
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
              <Button 
                type="submit"
                style={{ backgroundColor: '#eb661a' }}
              >
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
              Sélectionnez le template et les sections que vous souhaitez générer pour ce projet.
            </p>
            
            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="template-select">Template de rapport</Label>
                <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Sélectionner un template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {templateSections.length > 0 && (
                <div>
                  <Label className="mb-2 block">Sections à générer</Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    {templateSections.map((section) => (
                      <div 
                        key={section.id}
                        className={`border rounded-md p-4 cursor-pointer transition-colors ${
                          selectedSections.includes(section.id) 
                            ? 'border-[#eb661a] bg-orange-50' 
                            : 'border-neutral-200 hover:border-[#eb661a]'
                        }`}
                        onClick={() => handleSectionToggle(section.id)}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{section.title}</h4>
                          <input 
                            type="checkbox"
                            checked={selectedSections.includes(section.id)}
                            onChange={() => {}} // Géré par le onClick du parent
                            className="h-4 w-4 text-[#eb661a]"
                          />
                        </div>
                        <p className="text-sm text-neutral-600">{section.instructions}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <Label htmlFor="instructions">Instructions complémentaires (optionnel)</Label>
                <Textarea
                  id="instructions"
                  placeholder="Ajoutez des instructions spécifiques pour la génération..."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                disabled={!selectedTemplate || selectedSections.length === 0}
                onClick={handleGenerateReport}
                style={{ backgroundColor: '#eb661a' }}
              >
                Générer les sections
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Dialog d'importation de documents */}
      <Dialog open={isDocumentDialogOpen} onOpenChange={setIsDocumentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Importer des documents</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Fichiers</Label>
                <div
                  className="border-2 border-dashed border-neutral-300 rounded-md p-6 text-center"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (e.dataTransfer.files) {
                      setSelectedFiles(Array.from(e.dataTransfer.files));
                    }
                  }}
                >
                  <input
                    id="document-files"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <label 
                    htmlFor="document-files"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <FilePlus className="h-8 w-8 text-neutral-400 mb-2" />
                    <span className="text-sm text-neutral-600 mb-1">
                      Glissez-déposez vos fichiers ici
                    </span>
                    <span className="text-xs text-neutral-500">
                      ou cliquez pour parcourir
                    </span>
                  </label>
                </div>
                
                {selectedFiles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-neutral-600 mb-1">
                      {selectedFiles.length} fichier(s) sélectionné(s)
                    </p>
                    <ul className="text-xs text-neutral-500 space-y-1">
                      {selectedFiles.map((file, index) => (
                        <li key={index} className="flex justify-between items-center">
                          <span>{file.name}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              const newFiles = [...selectedFiles];
                              newFiles.splice(index, 1);
                              setSelectedFiles(newFiles);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <span className="sr-only">Supprimer</span>
                            <span aria-hidden="true">×</span>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDocumentDialogOpen(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button 
              onClick={handleUploadDocuments} 
              disabled={selectedFiles.length === 0 || isSubmitting}
              style={{ backgroundColor: '#eb661a' }}
            >
              {isSubmitting ? 'Importation...' : 'Importer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de génération de rapport */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Générer un rapport</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="report-template">Template de rapport</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger className="w-full mt-1" id="report-template">
                  <SelectValue placeholder="Sélectionner un template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {templateSections.length > 0 && (
              <div>
                <Label className="mb-2 block">Sections à générer</Label>
                <div className="max-h-[200px] overflow-y-auto space-y-2 border rounded-md p-2">
                  {templateSections.map((section) => (
                    <div 
                      key={section.id}
                      className="flex items-center space-x-2"
                    >
                      <input 
                        type="checkbox"
                        id={`section-${section.id}`}
                        checked={selectedSections.includes(section.id)}
                        onChange={() => handleSectionToggle(section.id)}
                        className="h-4 w-4 text-[#eb661a] rounded"
                      />
                      <Label htmlFor={`section-${section.id}`} className="cursor-pointer">
                        {section.title}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="report-instructions">Instructions spécifiques (optionnel)</Label>
              <Textarea
                id="report-instructions"
                placeholder="Ajoutez des instructions spécifiques pour la génération..."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button 
              onClick={handleGenerateReport} 
              disabled={!selectedTemplate || selectedSections.length === 0 || isSubmitting}
              style={{ backgroundColor: '#eb661a' }}
            >
              {isSubmitting ? 'Génération...' : 'Générer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ProjectPage;
