
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

const CreateProjectButton: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    client: '',
    description: '',
    files: [] as File[],
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...Array.from(e.target.files as FileList)]
      }));
    }
  };
  
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...Array.from(e.dataTransfer.files)]
      }));
    }
  };
  
  const handleSubmit = () => {
    console.log('Creating project:', formData);
    // Here we would normally make an API call
    setIsDialogOpen(false);
    setFormData({ title: '', client: '', description: '', files: [] });
  };
  
  return (
    <>
      <Button 
        className="flex items-center gap-2" 
        onClick={() => setIsDialogOpen(true)}
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
              
              {formData.files.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-neutral-600 mb-1">
                    {formData.files.length} fichier(s) sélectionné(s)
                  </p>
                  <ul className="text-xs text-neutral-500 space-y-1">
                    {formData.files.slice(0, 3).map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                    {formData.files.length > 3 && (
                      <li>+ {formData.files.length - 3} autres fichiers</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmit}>
              Créer le projet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateProjectButton;
