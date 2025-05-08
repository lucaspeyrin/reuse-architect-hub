
import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { FileText, Plus, X, ArrowUp, ArrowDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createClient } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";

// Initialisation du client Supabase (à remplacer par vos vraies credentials)
// À l'idéal, ces valeurs devraient être dans des variables d'environnement
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

interface TemplateSection {
  id: string;
  title: string;
  instructions: string;
  example?: string;
  order_index: number;
}

interface Template {
  id: string;
  title: string;
  description: string;
  last_updated: string;
  sections: number;
  template_sections?: TemplateSection[];
}

const Templates: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    description: '',
  });
  const [newSection, setNewSection] = useState({
    title: '',
    instructions: '',
    example: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates_rapports')
        .select('*');
      
      if (error) throw error;
      
      // Formater les données pour correspondre à l'interface Template
      const formattedTemplates = data.map((template: any) => ({
        id: template.id,
        title: template.title,
        description: template.description,
        last_updated: new Date(template.created_at).toLocaleDateString('fr-FR'),
        sections: template.number_of_sections || 0,
      }));
      
      setTemplates(formattedTemplates);
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les templates",
        variant: "destructive"
      });
    }
  };

  const fetchTemplateSections = async (templateId: string) => {
    try {
      const { data, error } = await supabase
        .from('templates_rapports_parts')
        .select('*')
        .eq('template_rapport_id', templateId)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement des sections:', error);
      return [];
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.title) return;
    
    try {
      const { data, error } = await supabase
        .from('templates_rapports')
        .insert([
          { 
            title: newTemplate.title, 
            description: newTemplate.description,
            number_of_sections: 0
          }
        ])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Template créé avec succès"
      });
      
      setIsCreateDialogOpen(false);
      setNewTemplate({ title: '', description: '' });
      fetchTemplates();
    } catch (error) {
      console.error('Erreur lors de la création du template:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le template",
        variant: "destructive"
      });
    }
  };

  const handleEditTemplate = async (template: Template) => {
    setCurrentTemplate(template);
    
    // Charger les sections du template
    const sections = await fetchTemplateSections(template.id);
    setCurrentTemplate({
      ...template,
      template_sections: sections
    });
    
    setIsEditDialogOpen(true);
  };

  const handleAddSection = async () => {
    if (!currentTemplate || !newSection.title) return;
    
    try {
      // Trouver le prochain ordre
      const nextOrder = currentTemplate.template_sections ? 
        currentTemplate.template_sections.length : 0;
      
      const { data, error } = await supabase
        .from('templates_rapports_parts')
        .insert([
          { 
            template_rapport_id: currentTemplate.id, 
            title: newSection.title,
            instructions: newSection.instructions,
            example: newSection.example || null,
            order_index: nextOrder
          }
        ])
        .select();
      
      if (error) throw error;
      
      // Mettre à jour le nombre de sections dans le template
      await supabase
        .from('templates_rapports')
        .update({ number_of_sections: nextOrder + 1 })
        .eq('id', currentTemplate.id);
      
      // Refresh des sections
      const sections = await fetchTemplateSections(currentTemplate.id);
      setCurrentTemplate({
        ...currentTemplate,
        template_sections: sections,
        sections: sections.length
      });
      
      setNewSection({ title: '', instructions: '', example: '' });
      
      toast({
        title: "Succès",
        description: "Section ajoutée avec succès"
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la section:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la section",
        variant: "destructive"
      });
    }
  };

  const handleMoveSection = async (sectionId: string, direction: 'up' | 'down') => {
    if (!currentTemplate || !currentTemplate.template_sections) return;
    
    const sections = [...currentTemplate.template_sections];
    const currentIndex = sections.findIndex(s => s.id === sectionId);
    
    if (direction === 'up' && currentIndex > 0) {
      // Échanger avec la section précédente
      const newOrder = sections[currentIndex - 1].order_index;
      sections[currentIndex - 1].order_index = sections[currentIndex].order_index;
      sections[currentIndex].order_index = newOrder;
      
      // Mettre à jour dans Supabase
      try {
        await supabase
          .from('templates_rapports_parts')
          .update({ order_index: sections[currentIndex].order_index })
          .eq('id', sections[currentIndex].id);
        
        await supabase
          .from('templates_rapports_parts')
          .update({ order_index: sections[currentIndex - 1].order_index })
          .eq('id', sections[currentIndex - 1].id);
        
        // Refresh des sections
        const updatedSections = await fetchTemplateSections(currentTemplate.id);
        setCurrentTemplate({
          ...currentTemplate,
          template_sections: updatedSections
        });
      } catch (error) {
        console.error('Erreur lors du déplacement de la section:', error);
      }
    } else if (direction === 'down' && currentIndex < sections.length - 1) {
      // Échanger avec la section suivante
      const newOrder = sections[currentIndex + 1].order_index;
      sections[currentIndex + 1].order_index = sections[currentIndex].order_index;
      sections[currentIndex].order_index = newOrder;
      
      // Mettre à jour dans Supabase
      try {
        await supabase
          .from('templates_rapports_parts')
          .update({ order_index: sections[currentIndex].order_index })
          .eq('id', sections[currentIndex].id);
        
        await supabase
          .from('templates_rapports_parts')
          .update({ order_index: sections[currentIndex + 1].order_index })
          .eq('id', sections[currentIndex + 1].id);
        
        // Refresh des sections
        const updatedSections = await fetchTemplateSections(currentTemplate.id);
        setCurrentTemplate({
          ...currentTemplate,
          template_sections: updatedSections
        });
      } catch (error) {
        console.error('Erreur lors du déplacement de la section:', error);
      }
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!currentTemplate) return;
    
    try {
      await supabase
        .from('templates_rapports_parts')
        .delete()
        .eq('id', sectionId);
      
      // Refresh des sections
      const sections = await fetchTemplateSections(currentTemplate.id);
      
      // Mettre à jour le nombre de sections dans le template
      await supabase
        .from('templates_rapports')
        .update({ number_of_sections: sections.length })
        .eq('id', currentTemplate.id);
      
      setCurrentTemplate({
        ...currentTemplate,
        template_sections: sections,
        sections: sections.length
      });
      
      toast({
        title: "Succès",
        description: "Section supprimée avec succès"
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la section:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la section",
        variant: "destructive"
      });
    }
  };
  
  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="page-title">Templates de rapports</h1>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setIsCreateDialogOpen(true)}
        >
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
                  Mis à jour le {template.last_updated}
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-medium text-lg mb-1">{template.title}</h3>
              <p className="text-neutral-600 text-sm mb-4">{template.description}</p>
              
              <div className="flex justify-between items-center">
                <span className="text-xs text-neutral-500">{template.sections} sections</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditTemplate(template)}
                >
                  Modifier
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Dialog de création de template */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un nouveau template</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={newTemplate.title}
                onChange={(e) => setNewTemplate({...newTemplate, title: e.target.value})}
                placeholder="Rapport de diagnostic standard"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                placeholder="Description du template de rapport..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateTemplate}>
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog d'édition de template */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le template: {currentTemplate?.title}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <h3 className="font-medium mb-2">Sections du rapport</h3>
            
            {/* Liste des sections existantes */}
            <div className="space-y-4 mb-6">
              {currentTemplate?.template_sections?.map((section, index) => (
                <div key={section.id} className="border border-neutral-200 rounded-lg p-4 relative">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{section.title}</h4>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        disabled={index === 0}
                        onClick={() => handleMoveSection(section.id, 'up')}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        disabled={currentTemplate?.template_sections ? index === currentTemplate.template_sections.length - 1 : false}
                        onClick={() => handleMoveSection(section.id, 'down')}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteSection(section.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-neutral-600 mb-2">
                    <strong>Instructions:</strong> {section.instructions}
                  </div>
                  {section.example && (
                    <div className="text-sm text-neutral-600">
                      <strong>Exemple:</strong> {section.example}
                    </div>
                  )}
                </div>
              ))}
              
              {(!currentTemplate?.template_sections || currentTemplate.template_sections.length === 0) && (
                <div className="text-center text-neutral-500 py-4">
                  Aucune section définie. Ajoutez votre première section ci-dessous.
                </div>
              )}
            </div>
            
            {/* Formulaire d'ajout de section */}
            <div className="border-t border-neutral-200 pt-4">
              <h3 className="font-medium mb-4">Ajouter une nouvelle section</h3>
              
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sectionTitle">Titre de la section</Label>
                  <Input
                    id="sectionTitle"
                    value={newSection.title}
                    onChange={(e) => setNewSection({...newSection, title: e.target.value})}
                    placeholder="Introduction"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={newSection.instructions}
                    onChange={(e) => setNewSection({...newSection, instructions: e.target.value})}
                    placeholder="Instructions pour générer cette section..."
                    rows={3}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="example">Exemple (optionnel)</Label>
                  <Textarea
                    id="example"
                    value={newSection.example}
                    onChange={(e) => setNewSection({...newSection, example: e.target.value})}
                    placeholder="Exemple de contenu pour cette section..."
                    rows={3}
                  />
                </div>
                
                <Button onClick={handleAddSection} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter la section
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Templates;
