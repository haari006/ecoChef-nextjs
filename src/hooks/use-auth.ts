'use client';

import { createContext, useContext } from 'react';
import { type User } from 'firebase/auth';

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const useAuth = () => {
    return useContext(AuthContext);
};
