
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Note {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
}

interface NotesListProps {
  notes: Note[];
  onEditNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onCreateNote: () => void;
}

const NotesList: React.FC<NotesListProps> = ({ 
  notes, 
  onEditNote, 
  onDeleteNote, 
  onCreateNote 
}) => {
  if (notes.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <div className="py-8 text-center">
          <p className="text-gray-500 mb-4">Você ainda não tem nenhuma nota.</p>
          <Button onClick={onCreateNote}>Criar minha primeira nota</Button>
        </div>
      </Card>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50%]">Título</TableHead>
          <TableHead>Data de Modificação</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {notes.map(note => (
          <TableRow key={note.id}>
            <TableCell className="font-medium">{note.title}</TableCell>
            <TableCell>
              {new Date(note.updated_at).toLocaleDateString('pt-BR')} às{' '}
              {new Date(note.updated_at).toLocaleTimeString('pt-BR')}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => onEditNote(note)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="text-red-500 hover:text-red-700" 
                  onClick={() => onDeleteNote(note.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default NotesList;
