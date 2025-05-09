
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Upload, File, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';  // Importation correcte de uuid v4
import { useToast } from '@/hooks/use-toast';
import { Project } from '../types/Project';  // Utilisation du type Project depuis types/Project.ts
import { Progress } from '@/components/ui/progress';

// Initialisation du client Supabase
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

interface CreateProjectButtonProps {
  onProjectCreate: (project: Project) => void;
}

const CreateProjectButton: React.FC<CreateProjectButtonProps> = ({ onProjectCreate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  
  const resetForm = () => {
    setTitle('');
    setClient('');
    setDescription('');
    setSelectedFiles([]);
    setProgress(0);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };
  
  const handleFileRemove = (index: number) => {
    setSelectedFiles(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !client) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    setProgress(10); // Démarre le progrès
    
    try {
      // Création du projet dans Supabase
      const projectId = uuidv4();
      const documentUrls = [];
      
      // Upload des documents si présents
      if (selectedFiles.length > 0) {
        setProgress(20); // Avancement
        
        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          const filePath = `documents/${projectId}/${file.name}`;
          
          // Upload du fichier
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file);
            
          if (uploadError) throw uploadError;
          
          // Récupérer l'URL du document
          const { data: urlData } = await supabase.storage
            .from('documents')
            .getPublicUrl(filePath);
            
          if (urlData) {
            documentUrls.push(urlData.publicUrl);
          }
          
          // Mise à jour du progrès
          setProgress(20 + Math.floor(60 * (i + 1) / selectedFiles.length));
        }
      }
      
      setProgress(80); // Avancement
      
      // Appel au webhook de création de projet
      const response = await fetch('https://api.ia2s.app/webhook/raedificare/project/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          client_name: client,
          description,
          document_urls: documentUrls,
        }),
      });
      
      setProgress(90);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const result = await response.json();
      
      setProgress(100);
      
      // Créer l'objet projet pour l'affichage
      const newProject: Project = {
        id: result.project_id || projectId,
        title,
        client,
        description,
        status: 'draft',
        date: new Date().toLocaleDateString('fr-FR'),
      };
      
      // Notification réussie
      onProjectCreate(newProject);
      
      // Réinitialiser et fermer
      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le projet",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
        style={{ backgroundColor: '#eb661a' }}
      >
        <Plus className="h-4 w-4" />
        <span>Créer un projet</span>
      </Button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un nouveau projet</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="project-title">Titre du projet *</Label>
                <Input
                  id="project-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Rénovation immeuble..."
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="project-client">Nom du client *</Label>
                <Input
                  id="project-client"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="ABC Construction..."
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="project-description">Description</Label>
                <Textarea
                  id="project-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez le projet..."
                  rows={3}
                />
              </div>
              
              <div className="grid gap-2">
                <Label className="mb-2">Documents (optionnel)</Label>
                <div
                  className="border-2 border-dashed border-neutral-300 rounded-md p-4 text-center cursor-pointer"
                  onClick={() => document.getElementById('project-documents')?.click()}
                >
                  <input
                    id="project-documents"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Upload className="h-6 w-6 mx-auto text-neutral-400 mb-2" />
                  <p className="text-sm text-neutral-600">
                    Cliquez pour ajouter des documents
                  </p>
                  <p className="text-xs text-neutral-500">
                    ou déposez les fichiers ici
                  </p>
                </div>
              </div>
              
              {selectedFiles.length > 0 && (
                <div className="mt-2">
                  <Label className="mb-2 block">
                    {selectedFiles.length} fichier{selectedFiles.length > 1 ? 's' : ''} sélectionné{selectedFiles.length > 1 ? 's' : ''}
                  </Label>
                  <div className="max-h-40 overflow-y-auto space-y-1 border rounded-md p-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex justify-between items-center py-1 px-2 hover:bg-neutral-50 rounded">
                        <div className="flex items-center space-x-2">
                          <File className="h-4 w-4 text-neutral-400" />
                          <span className="text-sm truncate">{file.name}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileRemove(index);
                          }}
                          className="h-6 w-6 p-0 text-neutral-500 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {isSubmitting && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Création du projet en cours...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                type="button"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !title || !client}
                style={{ backgroundColor: '#eb661a' }}
              >
                {isSubmitting ? 'Création...' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateProjectButton;
