
import React from 'react';
import MainLayout from '../layouts/MainLayout';
import ProjectGrid from '../components/ProjectGrid';
import CreateProjectButton from '../components/CreateProjectButton';
import ProjectsFilters from '../components/projects/ProjectsFilters';
import ProjectsLoading from '../components/projects/ProjectsLoading';
import ProjectsEmpty from '../components/projects/ProjectsEmpty';
import { useProjects } from '../hooks/useProjects';

const Index: React.FC = () => {
  const {
    filteredProjects,
    statusFilter,
    setStatusFilter,
    sortOrder,
    setSortOrder,
    isLoading,
    addProject
  } = useProjects();

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="page-title">Mes Projets</h1>
        <CreateProjectButton onProjectCreate={addProject} />
      </div>
      
      <ProjectsFilters 
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        projectCount={filteredProjects.length}
      />
      
      {isLoading ? (
        <ProjectsLoading />
      ) : filteredProjects.length === 0 ? (
        <ProjectsEmpty statusFilter={statusFilter} onProjectCreate={addProject} />
      ) : (
        <ProjectGrid projects={filteredProjects} />
      )}
    </MainLayout>
  );
};

export default Index;
