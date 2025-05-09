
import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { FileText, Search, SlidersHorizontal } from 'lucide-react';
import { Rapport } from '../types/Document';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

// Initialisation du client Supabase
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

const Reports: React.FC = () => {
  const [reports, setReports] = useState<Rapport[]>([]);
  const [filteredReports, setFilteredReports] = useState<Rapport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<string>('newest');
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    fetchReports();
  }, []);
  
  useEffect(() => {
    applyFiltersAndSort();
  }, [reports, searchQuery, sortOrder]);
  
  const fetchReports = async () => {
    setIsLoading(true);
    try {
      // Récupérer les documents avec rapport = true
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          projects:project_id (
            title,
            client_name
          )
        `)
        .eq('rapport', true);
      
      if (error) throw error;
      
      // Formatage des données
      const formattedReports: Rapport[] = data.map((item: any) => ({
        id: item.id,
        name: item.title,
        type: item.document_type || 'pdf',
        date: new Date(item.created_at).toLocaleDateString('fr-FR'),
        url: item.url,
        project_id: item.project_id,
        rapport: true,
        project_title: item.projects?.title || 'Non associé',
        client_name: item.projects?.client_name || 'N/A',
      }));
      
      setReports(formattedReports);
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les rapports",
        variant: "destructive"
      });
      
      // Données de secours
      setReports([
        {
          id: 'r1',
          name: 'Diagnostic Réemploi - Immeuble Haussmannien',
          type: 'pdf',
          date: '12/05/2025',
          rapport: true,
          project_title: 'Rénovation Immeuble Haussmannien',
          client_name: 'ABC Construction',
        },
        {
          id: 'r2',
          name: 'Étude préliminaire - Site industriel',
          type: 'pdf',
          date: '08/05/2025',
          rapport: true,
          project_title: 'Déconstruction Bâtiment Industriel',
          client_name: 'Groupe Vinci',
        },
        {
          id: 'r3',
          name: 'Diagnostic matériaux - École Jules Ferry',
          type: 'pdf',
          date: '05/05/2025',
          rapport: true,
          project_title: 'Réhabilitation École Jules Ferry',
          client_name: 'Mairie de Paris',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const applyFiltersAndSort = () => {
    let result = [...reports];
    
    // Appliquer la recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(report => 
        report.name.toLowerCase().includes(query) || 
        report.project_title?.toLowerCase().includes(query) || 
        report.client_name?.toLowerCase().includes(query)
      );
    }
    
    // Appliquer le tri
    if (sortOrder === 'newest') {
      result.sort((a, b) => new Date(b.date.split('/').reverse().join('-')).getTime() - 
                            new Date(a.date.split('/').reverse().join('-')).getTime());
    } else if (sortOrder === 'oldest') {
      result.sort((a, b) => new Date(a.date.split('/').reverse().join('-')).getTime() - 
                            new Date(b.date.split('/').reverse().join('-')).getTime());
    }
    
    setFilteredReports(result);
  };
  
  // Vue mobile: composant de filtres pour le sheet
  const FiltersContent = () => (
    <div className="space-y-4 p-2">
      <h3 className="text-sm font-medium">Filtres et tri</h3>
      <div className="space-y-2">
        <p className="text-xs text-neutral-500">Tri par date</p>
        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Trier par date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Plus récents d'abord</SelectItem>
            <SelectItem value="oldest">Plus anciens d'abord</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
  
  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-title">Rapports</h1>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Rechercher un rapport..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle>Filtres</SheetTitle>
                </SheetHeader>
                <FiltersContent />
              </SheetContent>
            </Sheet>
          ) : (
            <div className="w-48">
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Plus récents d'abord</SelectItem>
                  <SelectItem value="oldest">Plus anciens d'abord</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        <div className="text-sm text-neutral-500">
          {filteredReports.length} rapport{filteredReports.length > 1 ? 's' : ''} trouvé{filteredReports.length > 1 ? 's' : ''}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse text-neutral-500">Chargement des rapports...</div>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="bg-white rounded-lg border border-neutral-200 p-8 text-center">
          <FileText className="h-12 w-12 mx-auto text-neutral-300 mb-3" />
          <h3 className="text-lg font-medium mb-2">Aucun rapport trouvé</h3>
          <p className="text-neutral-500 mb-6">
            {searchQuery 
              ? "Aucun rapport ne correspond à votre recherche." 
              : "Vous n'avez pas encore de rapports."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom du rapport</TableHead>
                <TableHead>Projet associé</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id} className="cursor-pointer hover:bg-neutral-50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-neutral-400" />
                      <span>{report.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{report.project_title}</TableCell>
                  <TableCell>{report.client_name}</TableCell>
                  <TableCell>{report.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </MainLayout>
  );
};

export default Reports;
