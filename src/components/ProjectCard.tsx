
import React from 'react';
import { Link } from 'react-router-dom';
import { Folder, Clock } from 'lucide-react';

export interface Project {
  id: string;
  title: string;
  client: string;
  description: string;
  status: 'in_progress' | 'completed' | 'pending';
  date: string;
}

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const statusColors = {
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-amber-100 text-amber-800',
  };
  
  const statusLabels = {
    in_progress: 'En cours',
    completed: 'Terminé',
    pending: 'En attente',
  };
  
  return (
    <Link to={`/project/${project.id}`} className="card-project block group">
      <div className="flex justify-between items-start mb-3">
        <div className="p-2 rounded-md bg-primary-50 text-primary">
          <Folder className="h-5 w-5" />
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${statusColors[project.status]}`}>
          {statusLabels[project.status]}
        </div>
      </div>
      
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
  );
};

export default ProjectCard;
