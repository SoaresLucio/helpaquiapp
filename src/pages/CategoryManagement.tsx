
import React, { useState } from 'react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Move,
  AlertCircle,
  Search,
  LayoutGrid,
  List,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { serviceCategories } from '@/data/mockData';

// Create a starting point with our existing categories
const initialCategories = serviceCategories.map(category => ({
  ...category,
  isActive: true,
  icon: category.icon || 'default-icon.svg',
  count: Math.floor(Math.random() * 100) + 1 // Random number of services for demo
}));

const CategoryManagement = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState(initialCategories);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // State for new category
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    icon: '',
    isActive: true
  });
  
  // State for editing category
  const [editCategory, setEditCategory] = useState<{
    id: string;
    name: string;
    description: string;
    icon: string;
    isActive: boolean;
  } | null>(null);
  
  // Filter categories based on search term
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  // Add new category
  const handleAddCategory = (event: React.FormEvent, onClose: () => void) => {
    event.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newCategoryEntry = {
        id: `category-${Date.now()}`,
        name: newCategory.name,
        description: newCategory.description || '',
        icon: newCategory.icon || 'default-icon.svg',
        isActive: newCategory.isActive,
        count: 0
      };
      
      setCategories(prev => [...prev, newCategoryEntry]);
      
      setNewCategory({
        name: '',
        description: '',
        icon: '',
        isActive: true
      });
      
      toast({
        title: "Categoria adicionada",
        description: `A categoria "${newCategory.name}" foi adicionada com sucesso.`,
      });
      
      setIsLoading(false);
      onClose();
    }, 1000);
  };
  
  // Update category
  const handleUpdateCategory = (event: React.FormEvent, onClose: () => void) => {
    event.preventDefault();
    
    if (!editCategory) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setCategories(prev => 
        prev.map(category => 
          category.id === editCategory.id 
            ? { 
                ...category, 
                name: editCategory.name,
                description: editCategory.description,
                icon: editCategory.icon,
                isActive: editCategory.isActive
              } 
            : category
        )
      );
      
      toast({
        title: "Categoria atualizada",
        description: `A categoria "${editCategory.name}" foi atualizada com sucesso.`,
      });
      
      setIsLoading(false);
      setEditCategory(null);
      onClose();
    }, 1000);
  };
  
  // Delete category
  const handleDeleteCategory = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja excluir a categoria "${name}"?`)) {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setCategories(prev => prev.filter(category => category.id !== id));
        
        toast({
          title: "Categoria excluída",
          description: `A categoria "${name}" foi excluída com sucesso.`,
        });
        
        setIsLoading(false);
      }, 1000);
    }
  };
  
  // Toggle category active state
  const toggleCategoryActive = (id: string, currentState: boolean) => {
    setCategories(prev => 
      prev.map(category => 
        category.id === id 
          ? { ...category, isActive: !currentState } 
          : category
      )
    );
    
    const category = categories.find(cat => cat.id === id);
    
    toast({
      title: currentState ? "Categoria desativada" : "Categoria ativada",
      description: `A categoria "${category?.name}" foi ${currentState ? "desativada" : "ativada"}.`,
    });
  };
  
  // Function to render add category form
  const renderAddCategoryForm = (onClose: () => void) => (
    <form onSubmit={(e) => handleAddCategory(e, onClose)}>
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="category-name">Nome da categoria</Label>
          <Input 
            id="category-name" 
            placeholder="Ex: Limpeza, Reparos, etc."
            value={newCategory.name}
            onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category-description">Descrição (opcional)</Label>
          <Input 
            id="category-description" 
            placeholder="Uma breve descrição da categoria"
            value={newCategory.description}
            onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category-icon">Ícone (URL)</Label>
          <Input 
            id="category-icon" 
            placeholder="URL do ícone da categoria"
            value={newCategory.icon}
            onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="category-active" 
            checked={newCategory.isActive}
            onCheckedChange={(checked) => setNewCategory({...newCategory, isActive: checked})}
          />
          <Label htmlFor="category-active">Categoria ativa</Label>
        </div>
      </div>
      
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancelar</Button>
        </DialogClose>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adicionando...
            </>
          ) : (
            <>Adicionar categoria</>
          )}
        </Button>
      </DialogFooter>
    </form>
  );

  // Function to render edit category form
  const renderEditCategoryForm = (onClose: () => void) => {
    if (!editCategory) return null;
    
    return (
      <form onSubmit={(e) => handleUpdateCategory(e, onClose)}>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="edit-category-name">Nome da categoria</Label>
            <Input 
              id="edit-category-name" 
              value={editCategory.name}
              onChange={(e) => setEditCategory({...editCategory, name: e.target.value})}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-category-description">Descrição (opcional)</Label>
            <Input 
              id="edit-category-description" 
              value={editCategory.description}
              onChange={(e) => setEditCategory({...editCategory, description: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit-category-icon">Ícone (URL)</Label>
            <Input 
              id="edit-category-icon" 
              value={editCategory.icon}
              onChange={(e) => setEditCategory({...editCategory, icon: e.target.value})}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="edit-category-active" 
              checked={editCategory.isActive}
              onCheckedChange={(checked) => setEditCategory({...editCategory, isActive: checked})}
            />
            <Label htmlFor="edit-category-active">Categoria ativa</Label>
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Atualizando...
              </>
            ) : (
              <>Atualizar categoria</>
            )}
          </Button>
        </DialogFooter>
      </form>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-1 helpaqui-container py-4">
        <div className="flex flex-col md:flex-row items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Gerenciamento de Categorias</h1>
            <p className="text-gray-600">
              Adicione, edite ou remova categorias de serviços
            </p>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0 helpaqui-button-primary">
                <Plus className="mr-2 h-4 w-4" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar nova categoria</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes da nova categoria de serviços.
                </DialogDescription>
              </DialogHeader>
              
              {(onClose: () => void) => renderAddCategoryForm(onClose)}
            </DialogContent>
          </Dialog>
        </div>
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="w-full md:flex-1 relative">
                <Input
                  placeholder="Buscar categorias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Visualização:</span>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {filteredCategories.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredCategories.map(category => (
                <Card key={category.id} className={!category.isActive ? 'opacity-60' : ''}>
                  <CardContent className="p-0">
                    <div className="flex flex-col p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-md bg-gray-200 flex items-center justify-center text-gray-500">
                          <ImageIcon className="h-6 w-6" />
                        </div>
                        <div className="flex items-center gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => setEditCategory({
                                  id: category.id,
                                  name: category.name,
                                  description: category.description || '',
                                  icon: category.icon,
                                  isActive: category.isActive
                                })}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Editar categoria</DialogTitle>
                                <DialogDescription>
                                  Atualize os detalhes da categoria.
                                </DialogDescription>
                              </DialogHeader>
                              
                              {(onClose: () => void) => renderEditCategoryForm(onClose)}
                            </DialogContent>
                          </Dialog>
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleDeleteCategory(category.id, category.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <h3 className="font-medium">{category.name}</h3>
                      
                      {category.description && (
                        <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                      )}
                      
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm text-gray-500">
                          {category.count} serviços
                        </span>
                        
                        <div className="flex items-center">
                          <Switch 
                            id={`toggle-${category.id}`} 
                            checked={category.isActive}
                            onCheckedChange={() => toggleCategoryActive(category.id, category.isActive)}
                          />
                          <Label htmlFor={`toggle-${category.id}`} className="ml-2 text-sm">
                            {category.isActive ? 'Ativo' : 'Inativo'}
                          </Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCategories.map(category => (
                <Card key={category.id} className={!category.isActive ? 'opacity-60' : ''}>
                  <CardContent className="p-0">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center text-gray-500">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium">{category.name}</h3>
                          {category.description && (
                            <p className="text-sm text-gray-500">{category.description}</p>
                          )}
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {category.count} serviços
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center mr-4">
                          <Switch 
                            id={`list-toggle-${category.id}`} 
                            checked={category.isActive}
                            onCheckedChange={() => toggleCategoryActive(category.id, category.isActive)}
                          />
                          <Label htmlFor={`list-toggle-${category.id}`} className="ml-2 text-sm">
                            {category.isActive ? 'Ativo' : 'Inativo'}
                          </Label>
                        </div>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => setEditCategory({
                                id: category.id,
                                name: category.name,
                                description: category.description || '',
                                icon: category.icon,
                                isActive: category.isActive
                              })}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar categoria</DialogTitle>
                            </DialogHeader>
                            
                            {(onClose: () => void) => renderEditCategoryForm(onClose)}
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteCategory(category.id, category.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium">Nenhuma categoria encontrada</h3>
            <p className="mt-2 text-gray-500">
              {searchTerm 
                ? `Nenhuma categoria corresponde a "${searchTerm}"`
                : 'Você ainda não possui categorias cadastradas.'}
            </p>
            {searchTerm && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setSearchTerm('')}
              >
                Limpar busca
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default CategoryManagement;
