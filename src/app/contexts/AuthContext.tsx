import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'admin' | 'coordinador' | 'instructor' | 'asistente';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users - Luego se reemplazará con Supabase
const mockUsers: Array<User & { password: string }> = [
  {
    id: '1',
    name: 'Admin SENA',
    email: 'admin@sena.edu.co',
    password: 'admin123',
    role: 'admin',
  },
  {
    id: '2',
    name: 'Carlos Ramírez',
    email: 'cramirez@sena.edu.co',
    password: 'instructor123',
    role: 'instructor',
  },
  {
    id: '3',
    name: 'Ana García',
    email: 'agarcia@sena.edu.co',
    password: 'coordinador123',
    role: 'coordinador',
  },
  {
    id: '4',
    name: 'Pedro López',
    email: 'plopez@sena.edu.co',
    password: 'asistente123',
    role: 'asistente',
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - Luego se reemplazará con Supabase Auth
    return new Promise((resolve) => {
      setTimeout(() => {
        const foundUser = mockUsers.find(
          (u) => u.email === email && u.password === password
        );
        
        if (foundUser) {
          const { password: _, ...userWithoutPassword } = foundUser;
          setUser(userWithoutPassword);
          localStorage.setItem('phias_user', JSON.stringify(userWithoutPassword));
          resolve(true);
        } else {
          resolve(false);
        }
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('phias_user');
  };

  // Check if user is stored in localStorage on mount
  useState(() => {
    const storedUser = localStorage.getItem('phias_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
