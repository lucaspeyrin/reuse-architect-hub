
export interface Document {
  id: string;
  name: string;
  type: string;
  date: string;
  url?: string;
  project_id?: string;
  rapport: boolean;
}

export interface Rapport extends Document {
  rapport: true;
  project_title?: string;
  client_name?: string;
}
