
import React from 'react';
import ProjectCard, { Project } from './ProjectCard';
import { ProjectStatus } from '../types/Project';

interface ProjectGridProps {
  projects: Project[];
  onStatusChange?: (projectId: string, newStatus: ProjectStatus) => void;
}

const ProjectGrid: React.FC<ProjectGridProps> = ({ projects, onStatusChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard 
          key={project.id} 
          project={project}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
};

export default ProjectGrid;
