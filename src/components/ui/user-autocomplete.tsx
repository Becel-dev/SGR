'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, User, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AzureUser {
  id: string;
  name: string;
  email: string;
  jobTitle?: string;
  department?: string;
}

interface UserAutocompleteProps {
  value?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function UserAutocomplete({
  value,
  onSelect,
  placeholder = 'Selecione um usuário...',
  disabled = false,
}: UserAutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [users, setUsers] = React.useState<AzureUser[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<AzureUser | null>(null);

  // Debounce para busca
  React.useEffect(() => {
    if (searchQuery.length < 2) {
      setUsers([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Se já houver um valor inicial, tenta parsear
  React.useEffect(() => {
    if (value && !selectedUser) {
      // Tenta extrair nome do formato "Nome (email)"
      const match = value.match(/^(.+?)\s*\((.+?)\)$/);
      if (match) {
        setSelectedUser({
          id: '',
          name: match[1],
          email: match[2],
        });
      } else {
        setSelectedUser({
          id: '',
          name: value,
          email: '',
        });
      }
    }
  }, [value]);

  const searchUsers = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (user: AzureUser) => {
    setSelectedUser(user);
    setOpen(false);
    // Retorna no formato "Nome (email)"
    onSelect(`${user.name} (${user.email})`);
  };

  const handleClear = () => {
    setSelectedUser(null);
    setSearchQuery('');
    onSelect('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedUser ? (
            <div className="flex items-center gap-2 truncate">
              <User className="h-4 w-4 shrink-0" />
              <span className="truncate">{selectedUser.name}</span>
              {selectedUser.email && (
                <span className="text-xs text-muted-foreground truncate">
                  ({selectedUser.email})
                </span>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="p-2 border-b">
          <Input
            placeholder="Digite para buscar usuário..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
          />
        </div>
        
        <ScrollArea className="h-[300px]">
          {loading && (
            <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Buscando usuários...
            </div>
          )}
          
          {!loading && searchQuery.length < 2 && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Digite pelo menos 2 caracteres para buscar
            </div>
          )}
          
          {!loading && searchQuery.length >= 2 && users.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Nenhum usuário encontrado
            </div>
          )}
          
          {users.length > 0 && (
            <div className="p-1">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelect(user)}
                  className="w-full flex items-start gap-2 p-2 rounded-md hover:bg-accent text-left transition-colors"
                >
                  <Check
                    className={cn(
                      'mt-1 h-4 w-4 shrink-0',
                      selectedUser?.id === user.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 shrink-0" />
                      <span className="font-medium truncate">{user.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    {(user.jobTitle || user.department) && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {user.jobTitle && (
                          <Badge variant="outline" className="text-xs">
                            {user.jobTitle}
                          </Badge>
                        )}
                        {user.department && (
                          <Badge variant="outline" className="text-xs">
                            {user.department}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {selectedUser && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="w-full"
            >
              <X className="mr-2 h-4 w-4" />
              Limpar seleção
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
