
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Project } from '../components/ProjectCard';
import { useToast } from "@/hooks/use-toast";

// Initialisation du client Supabase
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('newest');
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchProjects();
  }, []);
  
  useEffect(() => {
    applyFiltersAndSort();
  }, [projects, statusFilter, sortOrder]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*');
      
      if (error) throw error;
      
      // Formatage des données pour correspondre à l'interface Project
      const formattedProjects: Project[] = data.map((project: any) => ({
        id: project.id,
        title: project.title,
        client: project.client_name,
        description: project.description,
        status: project.status || 'in_progress',
        date: new Date(project.last_update || project.created_at).toLocaleDateString('fr-FR'),
      }));
      
      setProjects(formattedProjects);
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les projets",
        variant: "destructive"
      });
      
      // Utiliser des données de démo en cas d'erreur
      setProjects([
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
          status: 'archived' as 'archived',
          date: '28/04/2025',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const applyFiltersAndSort = () => {
    let result = [...projects];
    
    // Appliquer le filtre de statut
    if (statusFilter !== 'all') {
      result = result.filter(project => project.status === statusFilter);
    }
    
    // Appliquer le tri
    if (sortOrder === 'newest') {
      result.sort((a, b) => new Date(b.date.split('/').reverse().join('-')).getTime() - 
                           new Date(a.date.split('/').reverse().join('-')).getTime());
    } else if (sortOrder === 'oldest') {
      result.sort((a, b) => new Date(a.date.split('/').reverse().join('-')).getTime() - 
                           new Date(b.date.split('/').reverse().join('-')).getTime());
    }
    
    setFilteredProjects(result);
  };
  
  // Fonction pour ajouter un nouveau projet
  const addProject = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev]);
    toast({
      title: "Projet créé",
      description: `Le projet "${newProject.title}" a été créé avec succès.`
    });
  };

  return {
    projects,
    filteredProjects,
    statusFilter,
    setStatusFilter,
    sortOrder,
    setSortOrder,
    isLoading,
    addProject
  };
};
