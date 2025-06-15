
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchUserNotes } from '@/services/notesService';
import NotesList from './NotesList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StickyNote } from 'lucide-react';

const NotesContainer: React.FC = () => {
  const { data: notes = [], isLoading, error } = useQuery({
    queryKey: ['notes'],
    queryFn: fetchUserNotes,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-helpaqui-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-red-600">Erro ao carregar notas. Tente novamente.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <StickyNote className="h-5 w-5 mr-2" />
            Minhas Notas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NotesList notes={notes} />
        </CardContent>
      </Card>
    </div>
  );
};

export default NotesContainer;
