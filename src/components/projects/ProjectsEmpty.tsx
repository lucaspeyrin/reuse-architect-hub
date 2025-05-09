
import React from 'react';
import { Button } from '@/components/ui/button';
import CreateProjectButton from '../CreateProjectButton';
import { Project } from '../ProjectCard';

interface ProjectsEmptyProps {
  statusFilter: string;
  onProjectCreate: (project: Project) => void;
}

const ProjectsEmpty: React.FC<ProjectsEmptyProps> = ({ statusFilter, onProjectCreate }) => {
  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
      <h3 className="text-lg font-medium mb-2">Aucun projet trouvé</h3>
      <p className="text-neutral-500 mb-6">
        {statusFilter !== 'all' 
          ? `Aucun projet avec le statut "${statusFilter}" n'a été trouvé.`
          : "Commencez par créer votre premier projet."}
      </p>
      {statusFilter === 'all' && (
        <CreateProjectButton onProjectCreate={onProjectCreate} />
      )}
    </div>
  );
};

export default ProjectsEmpty;
