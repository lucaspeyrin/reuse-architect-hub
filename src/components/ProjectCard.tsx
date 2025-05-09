
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

export interface Project {
  id: string;
  title: string;
  client: string;
  description: string;
  status: 'draft' | 'in_progress' | 'completed' | 'pending' | 'archived';
  date: string;
}

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const navigate = useNavigate();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-neutral-200 text-neutral-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'archived':
        return 'bg-neutral-100 text-neutral-500';
      default:
        return 'bg-neutral-200 text-neutral-700';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return 'Brouillon';
      case 'in_progress':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      case 'pending':
        return 'En attente';
      case 'archived':
        return 'Archivé';
      default:
        return 'Inconnu';
    }
  };
  
  const handleClick = () => {
    navigate(`/project/${project.id}`);
  };
  
  return (
    <Card 
      className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg">{project.title}</h3>
          <Badge className={getStatusColor(project.status)}>
            {getStatusLabel(project.status)}
          </Badge>
        </div>
        <p className="text-neutral-500 text-sm mb-3">{project.client}</p>
        <p className="text-neutral-700">{project.description}</p>
      </CardContent>
      <CardFooter className="px-6 py-3 bg-neutral-50 text-xs text-neutral-500">
        Dernière mise à jour: {project.date}
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
