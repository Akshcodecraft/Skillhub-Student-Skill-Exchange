import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Star, Award, Sparkles, BookOpen, UserCheck, ShieldCheck } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserProfile } from '../types';

export const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboardUsers = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const list: UserProfile[] = [];
        snap.forEach((d) => list.push({ uid: d.id, ...d.data() } as UserProfile));
        setUsers(list);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardUsers();
  }, []);

  // Top Mentors (highest rating & completed sessions)
  const topMentors = [...users]
    .sort((a, b) => (b.rating || 5.0) - (a.rating || 5.0) || (b.completedSessions || 0) - (a.completedSessions || 0))
    .slice(0, 5);

  // Most Active Learners
  const activeLearners = [...users]
    .sort((a, b) => (b.completedSessions || 0) - (a.completedSessions || 0))
    .slice(0, 5);

  const getRankBadge = (rank: number) => {
    if (rank === 0) return '🥇 1st Place';
    if (rank === 1) return '🥈 2nd Place';
    if (rank === 2) return '🥉 3rd Place';
    return `#${rank + 1}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-amber-100">
            <Trophy className="w-4 h-4 text-amber-200" />
            SkillHub Community Hall of Fame
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Peer Mentorship Leaderboard
          </h1>
          <p className="text-xs text-amber-100/90 max-w-xl">
            Celebrating the top-rated student mentors and most active learners across campus departments.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-xs font-bold">
          <div className="text-center">
            <p className="text-2xl font-extrabold">{users.length}</p>
            <p className="text-amber-100 font-normal">Active Students</p>
          </div>
        </div>
      </div>

      {/* Leaderboard Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Rated Mentors */}
        <div className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 p-6 rounded-3xl shadow-xs backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              Highest Rated Mentors
            </h2>
          </div>

          <div className="space-y-3">
            {topMentors.map((mentor, index) => (
              <div
                key={mentor.uid}
                onClick={() => navigate(`/profile/${mentor.uid}`)}
                className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between gap-3 cursor-pointer hover:border-indigo-500/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-xs text-amber-500 w-16">
                    {getRankBadge(index)}
                  </span>
                  <img
                    src={mentor.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.uid}`}
                    alt={mentor.displayName}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/20"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                      {mentor.displayName}
                      <span className="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[9px] uppercase">
                        {index === 0 ? 'Top Mentor' : 'Mentor'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-zinc-500">{mentor.college} • {mentor.department}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 justify-end">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {mentor.rating ? mentor.rating.toFixed(1) : '5.0'}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {mentor.completedSessions || 0} sessions
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Active Learners */}
        <div className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 p-6 rounded-3xl shadow-xs backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Most Active Collaborators
            </h2>
          </div>

          <div className="space-y-3">
            {activeLearners.map((learner, index) => (
              <div
                key={learner.uid}
                onClick={() => navigate(`/profile/${learner.uid}`)}
                className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between gap-3 cursor-pointer hover:border-indigo-500/40 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-xs text-indigo-500 w-16">
                    {getRankBadge(index)}
                  </span>
                  <img
                    src={learner.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${learner.uid}`}
                    alt={learner.displayName}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/20"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                      {learner.displayName}
                      <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 text-[9px] uppercase">
                        Super Collaborator
                      </span>
                    </h3>
                    <p className="text-[11px] text-zinc-500">{learner.college}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {learner.completedSessions || 0} Sessions
                  </span>
                  <p className="text-[10px] text-zinc-400">Completed</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
