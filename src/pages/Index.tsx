
import React from 'react';
import MainLayout from '../layouts/MainLayout';
import ProjectGrid from '../components/ProjectGrid';
import CreateProjectButton from '../components/CreateProjectButton';
import { Project } from '../components/ProjectCard';

const Index: React.FC = () => {
  const projects: Project[] = [
    {
      id: '1',
      title: 'Rénovation Immeuble Haussmannien',
      client: 'ABC Construction',
      description: 'Diagnostic des matériaux réemployables dans un immeuble haussmannien du 9ème arrondissement avant rénovation complète.',
      status: 'in_progress',
      date: '12/05/2025',
    },
    {
      id: '2',
      title: 'Déconstruction Bâtiment Industriel',
      client: 'Groupe Vinci',
      description: 'Identification et valorisation des matériaux dans un ancien site industriel avant démolition complète.',
      status: 'completed',
      date: '08/05/2025',
    },
    {
      id: '3',
      title: 'Réhabilitation École Jules Ferry',
      client: 'Mairie de Paris',
      description: 'Étude des possibilités de réemploi dans le cadre de la réhabilitation d\'une école élémentaire.',
      status: 'pending',
      date: '05/05/2025',
    },
    {
      id: '4',
      title: 'Extension Centre Commercial',
      client: 'Carrefour Immobilier',
      description: 'Analyse des matériaux récupérables dans l\'ancien parking avant construction de l\'extension.',
      status: 'in_progress',
      date: '02/05/2025',
    },
    {
      id: '5',
      title: 'Renouvellement Campus Universitaire',
      client: 'Université Paris-Saclay',
      description: 'Diagnostic complet des bâtiments du campus avant rénovation énergétique et architecturale.',
      status: 'in_progress',
      date: '28/04/2025',
    },
  ];

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="page-title">Mes Projets</h1>
        <CreateProjectButton />
      </div>
      
      <ProjectGrid projects={projects} />
    </MainLayout>
  );
};

export default Index;
