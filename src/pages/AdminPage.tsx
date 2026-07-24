import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  BookOpen,
  Calendar,
  Trash2,
  CheckCircle2,
  Star,
  RefreshCw,
  Search,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile, SkillItem, SessionRequest } from '../types';
import { seedCommunityDataIfNeeded } from '../lib/seedData';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'skills' | 'requests'>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [requests, setRequests] = useState<SessionRequest[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const uList: UserProfile[] = [];
      usersSnap.forEach((d) => uList.push({ uid: d.id, ...d.data() } as UserProfile));
      setUsers(uList);

      const skillsSnap = await getDocs(collection(db, 'skills'));
      const sList: SkillItem[] = [];
      skillsSnap.forEach((d) => sList.push({ id: d.id, ...d.data() } as SkillItem));
      setSkills(sList);

      const reqsSnap = await getDocs(collection(db, 'requests'));
      const rList: SessionRequest[] = [];
      reqsSnap.forEach((d) => rList.push({ id: d.id, ...d.data() } as SessionRequest));
      setRequests(rList);
    } catch (err) {
      console.error('Error loading admin dataset:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleDeleteUser = async (uid: string) => {
    if (!window.confirm('Are you sure you want to delete this user profile?')) return;
    try {
      await deleteDoc(doc(db, 'users', uid));
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
      setMessage('User successfully deleted.');
    } catch (err) {
      console.error('Failed to delete user:', err);
    }
  };

  const handleToggleAdminRole = async (userProf: UserProfile) => {
    const newRole = userProf.role === 'admin' ? 'student' : 'admin';
    try {
      await updateDoc(doc(db, 'users', userProf.uid), { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.uid === userProf.uid ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (!window.confirm('Delete this skill listing?')) return;
    try {
      await deleteDoc(doc(db, 'skills', skillId));
      setSkills((prev) => prev.filter((s) => s.id !== skillId));
      setMessage('Skill listing deleted.');
    } catch (err) {
      console.error('Failed to delete skill:', err);
    }
  };

  const handleToggleFeaturedSkill = async (skill: SkillItem) => {
    try {
      await updateDoc(doc(db, 'skills', skill.id), { featured: !skill.featured });
      setSkills((prev) =>
        prev.map((s) => (s.id === skill.id ? { ...s, featured: !s.featured } : s))
      );
    } catch (err) {
      console.error('Failed to toggle featured skill:', err);
    }
  };

  const handleResetSeedData = async () => {
    setMessage('Seeding initial community dataset...');
    await seedCommunityDataIfNeeded();
    await loadAdminData();
    setMessage('Sample community dataset refreshed successfully!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-500" />
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Admin Governance & Platform Management
            </h1>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Manage student user accounts, moderate skills, inspect session logs, and initialize community seed data.
          </p>
        </div>

        <button
          onClick={handleResetSeedData}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          Re-seed Community Data
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="text-xs underline">Dismiss</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-zinc-500'
          }`}
        >
          <Users className="w-4 h-4" /> User Management ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'skills'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-zinc-500'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Skills Listings ({skills.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'requests'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-zinc-500'
          }`}
        >
          <Calendar className="w-4 h-4" /> Session Requests ({requests.length})
        </button>
      </div>

      {/* 1. Users Table */}
      {activeTab === 'users' && (
        <div className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 shadow-xs backdrop-blur-md overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-800 dark:text-zinc-200">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-2">User</th>
                <th className="py-3 px-2">College & Major</th>
                <th className="py-3 px-2">Role</th>
                <th className="py-3 px-2">Rating</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {users.map((u) => (
                <tr key={u.uid} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3.5 px-2 flex items-center gap-3">
                    <img
                      src={u.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.uid}`}
                      alt={u.displayName}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-zinc-100">{u.displayName}</p>
                      <p className="text-[10px] text-zinc-500">{u.email}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-2 text-zinc-600 dark:text-zinc-400">
                    {u.college} ({u.department})
                  </td>
                  <td className="py-3.5 px-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      u.role === 'admin' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 font-semibold text-amber-600">
                    ⭐ {u.rating ? u.rating.toFixed(1) : '5.0'}
                  </td>
                  <td className="py-3.5 px-2 text-right space-x-2">
                    <button
                      onClick={() => handleToggleAdminRole(u)}
                      className="text-[11px] font-semibold text-indigo-600 hover:underline"
                    >
                      {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.uid)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. Skills Table */}
      {activeTab === 'skills' && (
        <div className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 shadow-xs backdrop-blur-md overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-800 dark:text-zinc-200">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-2">Skill Title</th>
                <th className="py-3 px-2">Category</th>
                <th className="py-3 px-2">Mentor</th>
                <th className="py-3 px-2">Featured</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {skills.map((s) => (
                <tr key={s.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3.5 px-2 font-bold text-zinc-900 dark:text-zinc-100 max-w-xs truncate">
                    {s.title}
                  </td>
                  <td className="py-3.5 px-2 text-zinc-500">{s.category}</td>
                  <td className="py-3.5 px-2 font-medium">{s.mentorName}</td>
                  <td className="py-3.5 px-2">
                    <button
                      onClick={() => handleToggleFeaturedSkill(s)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.featured ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-500'
                      }`}
                    >
                      {s.featured ? '★ Featured' : 'Normal'}
                    </button>
                  </td>
                  <td className="py-3.5 px-2 text-right">
                    <button
                      onClick={() => handleDeleteSkill(s.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 rounded-lg"
                      title="Delete Listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. Requests Table */}
      {activeTab === 'requests' && (
        <div className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 shadow-xs backdrop-blur-md overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-800 dark:text-zinc-200">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-2">Skill</th>
                <th className="py-3 px-2">Learner</th>
                <th className="py-3 px-2">Mentor</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {requests.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3.5 px-2 font-bold max-w-xs truncate">{r.skillTitle}</td>
                  <td className="py-3.5 px-2 text-zinc-600">{r.learnerName}</td>
                  <td className="py-3.5 px-2 text-zinc-600">{r.mentorName}</td>
                  <td className="py-3.5 px-2">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 font-bold uppercase text-[10px]">
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-2 text-zinc-500">{r.preferredDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
