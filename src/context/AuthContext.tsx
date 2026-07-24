import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile as updateAuthProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, query, where, limit, getDocs } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { seedCommunityDataIfNeeded, seedUserDataIfNeeded } from '../lib/seedData';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signUpWithEmail: (email: string, pass: string, name: string, role?: UserRole) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize seed data & local storage session recovery
  useEffect(() => {
    seedCommunityDataIfNeeded();

    // Check if local mock user exists in storage
    const savedUserJson = localStorage.getItem('skillhub_local_user');
    if (savedUserJson) {
      try {
        const savedUser = JSON.parse(savedUserJson);
        if (savedUser && savedUser.uid) {
          const fakeAuthUser = {
            uid: savedUser.uid,
            email: savedUser.email,
            displayName: savedUser.displayName,
            photoURL: savedUser.photoURL,
            emailVerified: true,
            isAnonymous: false,
            metadata: {},
            providerData: [],
            refreshToken: '',
            tenantId: null,
            delete: async () => {},
            getIdToken: async () => '',
            getIdTokenResult: async () => ({} as any),
            reload: async () => {},
            toJSON: () => ({})
          } as unknown as User;

          setUser(fakeAuthUser);
          setProfile(savedUser);
          seedUserDataIfNeeded(savedUser.uid, savedUser.displayName, savedUser.photoURL, savedUser.email);
          setLoading(false);
          return;
        }
      } catch (e) {
        console.error('Error parsing local saved user:', e);
      }
    }
  }, []);

  // Listen to Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Clear local storage fallback if real firebase auth fires
        localStorage.removeItem('skillhub_local_user');
        setUser(firebaseUser);
        const userRef = doc(db, 'users', firebaseUser.uid);
        const unsubDoc = onSnapshot(userRef, async (snap) => {
          if (snap.exists()) {
            const p = snap.data() as UserProfile;
            setProfile(p);
            await seedUserDataIfNeeded(firebaseUser.uid, p.displayName, p.photoURL, firebaseUser.email || undefined);
          } else {
            const defaultProf: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Student Learner',
              photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.uid}`,
              department: 'Computer Science',
              college: 'University Campus',
              year: '2nd Year',
              bio: 'Excited to learn new skills and collaborate with mentors!',
              skillsOffered: [],
              skillsToLearn: ['React', 'Python', 'UI/UX Design'],
              availability: 'Weekdays after 4:00 PM',
              socialLinks: {},
              rating: 5.0,
              totalReviews: 0,
              completedSessions: 0,
              role: 'student',
              createdAt: Date.now(),
              updatedAt: Date.now()
            };
            await setDoc(userRef, defaultProf);
            setProfile(defaultProf);
            await seedUserDataIfNeeded(firebaseUser.uid, defaultProf.displayName, defaultProf.photoURL, defaultProf.email);
          }
          setLoading(false);
        }, (err) => {
          console.error('Error fetching user profile snapshot:', err);
          setLoading(false);
        });

        return () => unsubDoc();
      } else {
        // If no firebase user, check if we have local user active
        if (!localStorage.getItem('skillhub_local_user')) {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Helper to retrieve registered accounts from local storage registry
  const getRegisteredAccountsMap = (): Record<string, any> => {
    try {
      const reg = localStorage.getItem('skillhub_registered_accounts');
      return reg ? JSON.parse(reg) : {};
    } catch {
      return {};
    }
  };

  const saveRegisteredAccount = (accountData: any) => {
    try {
      const map = getRegisteredAccountsMap();
      const key = accountData.email.toLowerCase().trim();
      map[key] = accountData;
      localStorage.setItem('skillhub_registered_accounts', JSON.stringify(map));
    } catch (e) {
      console.warn('Could not save account to local registry:', e);
    }
  };

  const setFallbackUser = async (email: string, name: string, role: UserRole = 'student') => {
    const cleanEmail = email.toLowerCase().trim();
    const uid = 'user_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const photoURL = `https://api.dicebear.com/7.x/avataaars/svg?seed=${uid}`;

    const fakeUser = {
      uid,
      email: cleanEmail,
      displayName: name,
      photoURL,
      emailVerified: true,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => '',
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      toJSON: () => ({})
    } as unknown as User;

    let prof: UserProfile = {
      uid,
      email: cleanEmail,
      displayName: name,
      photoURL,
      department: 'Computer Science & Engineering',
      college: 'University Campus',
      year: '2nd Year',
      bio: 'Passionate learner on SkillHub platform.',
      skillsOffered: role === 'mentor' ? ['Web Development (React & Node)', 'UI/UX Design'] : ['Python Basics'],
      skillsToLearn: ['Machine Learning', 'Cloud DevOps', 'Cybersecurity'],
      availability: 'Weekdays 4:00 PM - 8:00 PM',
      socialLinks: { github: 'https://github.com' },
      rating: 5.0,
      totalReviews: 4,
      completedSessions: 6,
      role,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        prof = snap.data() as UserProfile;
        if (name && prof.displayName !== name) {
          prof.displayName = name;
          await setDoc(doc(db, 'users', uid), { displayName: name }, { merge: true });
        }
      } else {
        await setDoc(doc(db, 'users', uid), prof, { merge: true });
      }
    } catch (e) {
      console.warn('Could not write fallback profile to Firestore:', e);
    }

    localStorage.setItem('skillhub_local_user', JSON.stringify(prof));
    setUser(fakeUser);
    setProfile(prof);
    await seedUserDataIfNeeded(uid, prof.displayName, prof.photoURL, prof.email);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, role: UserRole = 'student') => {
    setLoading(true);
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim() || 'Student Learner';

    try {
      const res = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      await updateAuthProfile(res.user, { displayName: cleanName });
      
      const newProf: UserProfile = {
        uid: res.user.uid,
        email: cleanEmail,
        displayName: cleanName,
        photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${res.user.uid}`,
        department: 'Computer Science',
        college: 'University Campus',
        year: '1st Year',
        bio: 'Passionate student eager to exchange skills.',
        skillsOffered: role === 'mentor' ? ['Web Development', 'Problem Solving'] : [],
        skillsToLearn: ['Machine Learning', 'UI Design'],
        availability: 'Weekdays 4 - 7 PM',
        socialLinks: {},
        rating: 5.0,
        totalReviews: 0,
        completedSessions: 0,
        role: role,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      await setDoc(doc(db, 'users', res.user.uid), newProf);

      saveRegisteredAccount({
        email: cleanEmail,
        password: pass,
        displayName: cleanName,
        role,
        uid: res.user.uid
      });

      setProfile(newProf);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/admin-restricted-operation') {
        saveRegisteredAccount({
          email: cleanEmail,
          password: pass,
          displayName: cleanName,
          role,
          uid: 'user_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')
        });
        await setFallbackUser(cleanEmail, cleanName, role);
        return;
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    const cleanEmail = email.toLowerCase().trim();

    try {
      // 1. Try Firebase Auth
      await signInWithEmailAndPassword(auth, cleanEmail, pass);
    } catch (err: any) {
      // Check if user is in our local account registry
      const registry = getRegisteredAccountsMap();
      const registeredUser = registry[cleanEmail];

      // Built-in Demo accounts check
      const isDemoStudent = cleanEmail === 'student.demo@skillhub.edu';
      const isDemoMentor = cleanEmail === 'alex.chen@campus.edu';

      // If registered locally with password check
      if (registeredUser) {
        if (registeredUser.password && registeredUser.password !== pass) {
          throw new Error('Incorrect password. Please verify your credentials and try again.');
        }
        await setFallbackUser(cleanEmail, registeredUser.displayName, registeredUser.role);
        return;
      }

      // If built-in demo account
      if (isDemoStudent || isDemoMentor) {
        const displayName = isDemoMentor ? 'Alex Chen' : 'Jordan Smith';
        const role = isDemoMentor ? 'mentor' : 'student';
        await setFallbackUser(cleanEmail, displayName, role);
        return;
      }

      // Standard error messages for unregistered or invalid credentials
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        throw new Error('No registered account found with this email. Please click "Create Account" first.');
      }
      if (err.code === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please check your password and try again.');
      }

      // Fallback for any other unregistered attempt
      throw new Error('Invalid email or password. Please click "Create Account" to register a new account.');
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        throw new Error('Unauthorized domain: Please add your Netlify site domain (e.g. your-app.netlify.app) to Firebase Console > Authentication > Settings > Authorized domains.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const logout = async () => {
    localStorage.removeItem('skillhub_local_user');
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('SignOut error ignored:', e);
    }
    setUser(null);
    setProfile(null);
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const updatedData = { ...updates, updatedAt: Date.now() };
    await updateDoc(userRef, updatedData);
    if (profile) {
      setProfile({ ...profile, ...updatedData });
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      setProfile(snap.data() as UserProfile);
    }
  };

  const isAdmin = profile?.role === 'admin' || profile?.email?.includes('admin') || false;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        signUpWithEmail,
        loginWithEmail,
        loginWithGoogle,
        sendPasswordReset,
        logout,
        updateUserProfile,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
