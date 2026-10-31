import { createContext } from 'react';

// { user, status: 'loading' | 'authenticated' | 'guest', login, logout, updateToken, refreshUser }
export const AuthContext = createContext(null);
