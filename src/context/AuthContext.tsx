import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, logOut, testConnection, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isFirebaseOnline: boolean;
  signIn: () => Promise<User | null>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFirebaseOnline, setIsFirebaseOnline] = useState<boolean>(true);

  useEffect(() => {
    // 1. Check connection
    testConnection().then(status => {
      setIsFirebaseOnline(status);
    });

    // 2. Listen to Auth State
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // If user logs in, ensure their profile doc exists
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);
          if (!snap.exists()) {
            await setDoc(userDocRef, {
              userId: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Inventory Manager',
              photoURL: currentUser.photoURL || '',
              createdAt: new Date().toISOString(),
              themePreference: 'dark',
            });
          }
        } catch (error) {
          // Log structured error
          try {
            handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.uid}`);
          } catch (e) {
            console.warn('Profile sync failed:', e);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      const loggedUser = await signInWithGoogle();
      return loggedUser;
    } catch (err) {
      console.error('Sign-in failed:', err);
      throw err;
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (err) {
      console.error('Sign-out failed:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseOnline,
        signIn: handleSignIn,
        signOutUser: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
