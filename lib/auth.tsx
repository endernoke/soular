import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  isLoading: true,
  updateUserProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const createOrUpdateUserDocument = async (firebaseUser: any) => {
    if (!firebaseUser) return null;

    const userRef = doc(db, 'users', firebaseUser.uid);
    
    try {
      // First check if the document exists
      const userDoc = await getDoc(userRef);
      let userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoUrl: firebaseUser.photoURL // Map Firebase's photoURL to our schema's photoUrl
      };

      if (!userDoc.exists()) {
        // Create new user document if it doesn't exist
        await setDoc(userRef, userData);
      } else {
        // Use stored doc data as source of truth
        userData = {
          ...userData,
          ...userDoc.data(),
        };
      }
      return userData;
    } catch (error) {
      console.error('Error managing user document:', error);
      return null;
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user?.uid) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, data, { merge: true });
      setUser(curr => curr ? { ...curr, ...data } : null);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await createOrUpdateUserDocument(firebaseUser);
        setUser(userData);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);