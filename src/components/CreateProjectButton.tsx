import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Project } from './ProjectCard';

interface CreateProjectButtonProps {
  onProjectCreate?: (project: Project) => void;
}

const CreateProjectButton: React.FC<CreateProjectButtonProps> = ({ onProjectCreate }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    description: '',
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles([...e.target.files]);
    }
  };
  
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setSelectedFiles([...e.dataTransfer.files]);
    }
  };
  
  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast({
        title: "Erreur",
        description: "Le nom du projet est requis",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Préparation des URLs des documents pour un vrai appel API
      const documentUrls = selectedFiles.map(file => URL.createObjectURL(file));
      
      // En production, on enverrait les fichiers à un endpoint de stockage d'abord
      // puis on utiliserait les URLs retournées
      
      // Appel à l'API pour créer le projet
      const response = await fetch('https://api.ia2s.app/webhook/raedificare/project/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          client_name: formData.client,
          description: formData.description,
          document_urls: documentUrls,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      // Simuler une réponse API avec l'ID du projet
      const result = await response.json();
      const projectId = result.project_id || generateUniqueId();
      
      // Créer l'objet du nouveau projet
      const newProject = {
        id: projectId,
        title: formData.title,
        client: formData.client,
        description: formData.description,
        status: 'draft' as const,
        date: new Date().toLocaleDateString('fr-FR'),
      };
      
      // Appeler la fonction de callback pour ajouter le projet à l'état parent
      onProjectCreate(newProject);
      
      // Réinitialiser le formulaire
      setFormData({
        title: '',
        client: '',
        description: '',
      });
      setSelectedFiles([]);
      setIsDialogOpen(false);
      
      toast({
        title: "Projet créé",
        description: `Le projet "${formData.title}" a été créé avec succès.`,
      });
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le projet",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <>
      <Button 
        className="flex items-center gap-2" 
        onClick={() => setIsDialogOpen(true)}
        style={{ backgroundColor: '#eb661a' }}
      >
        <Plus className="h-4 w-4" />
        <span>Créer un projet</span>
      </Button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un nouveau projet</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Nom du projet</Label>
              <Input
                id="title"
                name="title"
                placeholder="Rénovation Immeuble Haussmannien"
                value={formData.title}
                onChange={handleChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="client">Nom du client</Label>
              <Input
                id="client"
                name="client"
                placeholder="ABC Construction"
                value={formData.client}
                onChange={handleChange}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Description du projet..."
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>Documents</Label>
              <div
                className="border-2 border-dashed border-neutral-300 rounded-md p-6 text-center"
                onDrop={handleFileDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <input
                  id="files"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label 
                  htmlFor="files"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <Plus className="h-8 w-8 text-neutral-400 mb-2" />
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
                          onClick={() => handleRemoveFile(index)}
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
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading}
              style={{ backgroundColor: '#eb661a' }}
            >
              {isLoading ? 'Création en cours...' : 'Créer le projet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateProjectButton;
