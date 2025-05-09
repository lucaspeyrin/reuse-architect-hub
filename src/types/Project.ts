
export interface Project {
  id: string;
  title: string;
  client: string;
  description: string;
  status: 'draft' | 'in_progress' | 'completed' | 'pending' | 'archived';
  date: string;
}

export type ProjectStatus = 'draft' | 'in_progress' | 'completed' | 'pending' | 'archived';

export const projectStatusLabels: Record<ProjectStatus, string> = {
  draft: 'Brouillon',
  in_progress: 'En cours',
  completed: 'Terminé',
  pending: 'En attente',
  archived: 'Archivé',
};

export const projectStatusColors: Record<ProjectStatus, string> = {
  draft: 'bg-neutral-100 text-neutral-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-amber-100 text-amber-800',
  archived: 'bg-gray-100 text-gray-800',
};
