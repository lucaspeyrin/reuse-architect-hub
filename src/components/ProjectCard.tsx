
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Folder, Clock, Edit, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { createClient } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { Project, ProjectStatus, projectStatusLabels, projectStatusColors } from '../types/Project';

// Initialisation du client Supabase
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

interface ProjectCardProps {
  project: Project;
  onStatusChange?: (projectId: string, newStatus: ProjectStatus) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onStatusChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  
  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (project.status === newStatus) {
      setIsEditing(false);
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Mise à jour dans Supabase
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', project.id);
      
      if (error) throw error;
      
      // Notification de succès
      toast({
        title: "Statut modifié",
        description: `Le statut du projet a été modifié avec succès.`
      });
      
      // Mise à jour locale via le callback parent
      if (onStatusChange) {
        onStatusChange(project.id, newStatus);
      }
    } catch (error) {
      console.error('Erreur lors de la modification du statut:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du projet",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
      setIsEditing(false);
    }
  };
  
  return (
    <div className="card-project block group">
      <div className="flex justify-between items-start mb-3">
        <div className="p-2 rounded-md bg-primary-50 text-primary">
          <Folder className="h-5 w-5" />
        </div>
        {isEditing ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                disabled={isUpdating}
                className="h-7 px-2 text-xs"
              >
                {isUpdating ? (
                  <div className="flex items-center gap-1">
                    <div className="animate-spin h-3 w-3 border-2 border-neutral-500 rounded-full border-t-transparent"></div>
                    <span>Modification...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    {projectStatusLabels[project.status]}
                    <Check className="h-3 w-3 ml-1" />
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(projectStatusLabels).map(([status, label]) => (
                <DropdownMenuItem 
                  key={status} 
                  onClick={() => handleStatusChange(status as ProjectStatus)}
                  disabled={project.status === status}
                >
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div 
            className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 cursor-pointer ${projectStatusColors[project.status]}`}
            onClick={(e) => {
              e.preventDefault();
              setIsEditing(true);
            }}
          >
            {projectStatusLabels[project.status]}
            <Edit className="h-3 w-3 ml-1" />
          </div>
        )}
      </div>
      
      <Link to={`/project/${project.id}`}>
        <h3 className="font-medium text-lg text-neutral-800 mb-1 group-hover:text-primary transition-colors">
          {project.title}
        </h3>
        <p className="text-neutral-500 text-sm mb-3">{project.client}</p>
        <p className="text-neutral-600 text-sm line-clamp-2 mb-4">{project.description}</p>
        
        <div className="flex items-center text-neutral-500 text-xs">
          <Clock className="h-3.5 w-3.5 mr-1" />
          <span>Mis à jour le {project.date}</span>
        </div>
      </Link>
    </div>
  );
};

export default ProjectCard;
