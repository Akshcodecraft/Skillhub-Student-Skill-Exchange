import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  Calendar,
  Clock,
  Star,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  PlusCircle,
  MessageSquare,
  Bell,
  Award,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SkillItem, SessionRequest, LearningSession, AppNotification } from '../types';
import { SkillCard } from '../components/skills/SkillCard';
import { RequestSessionModal } from '../components/skills/RequestSessionModal';
import { CardSkeleton } from '../components/common/Skeleton';

import { seedCommunityDataIfNeeded, seedUserDataIfNeeded } from '../lib/seedData';

export const DashboardPage: React.FC<{ onOpenAddSkill: () => void }> = ({ onOpenAddSkill }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [recommendedSkills, setRecommendedSkills] = useState<SkillItem[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<LearningSession[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [stats, setStats] = useState({
    skillsOfferedCount: 0,
    pendingRequestsCount: 0,
    upcomingSessionsCount: 0,
    completedSessionsCount: 0
  });

  const [selectedSkillForRequest, setSelectedSkillForRequest] = useState<SkillItem | null>(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Calculate Profile Completion Percentage
  const calculateProfileCompletion = () => {
    if (!profile) return 0;
    let score = 0;
    if (profile.displayName) score += 15;
    if (profile.college) score += 15;
    if (profile.department) score += 15;
    if (profile.bio && profile.bio.length > 10) score += 15;
    if (profile.skillsOffered && profile.skillsOffered.length > 0) score += 15;
    if (profile.skillsToLearn && profile.skillsToLearn.length > 0) score += 15;
    if (profile.availability) score += 10;
    return Math.min(100, score);
  };

  const completionPct = calculateProfileCompletion();

  useEffect(() => {
    const initAndFetch = async () => {
      try {
        setLoading(true);

        // Ensure baseline community data exists
        await seedCommunityDataIfNeeded();

        if (user) {
          await seedUserDataIfNeeded(user.uid, profile?.displayName, profile?.photoURL, user.email || undefined);
        }

        // Fetch skills for recommendations
        const skillsSnap = await getDocs(query(collection(db, 'skills'), limit(10)));
        const allSkills: SkillItem[] = [];
        skillsSnap.forEach((d) => allSkills.push({ id: d.id, ...d.data() } as SkillItem));

        // Filter out user's own skills if user is logged in
        let otherSkills = user ? allSkills.filter((s) => s.mentorId !== user.uid) : allSkills;
        if (otherSkills.length === 0) otherSkills = allSkills;
        setRecommendedSkills(otherSkills.slice(0, 3));

        if (user) {
          // Fetch user's pending requests (both as mentor and learner)
          const mentorReqsSnap = await getDocs(query(
            collection(db, 'requests'),
            where('mentorId', '==', user.uid),
            where('status', '==', 'pending')
          ));
          const learnerReqsSnap = await getDocs(query(
            collection(db, 'requests'),
            where('learnerId', '==', user.uid),
            where('status', '==', 'pending')
          ));

          // Fetch upcoming and completed sessions (both as learner and mentor)
          const learnerSessSnap = await getDocs(query(
            collection(db, 'sessions'),
            where('learnerId', '==', user.uid)
          ));
          const mentorSessSnap = await getDocs(query(
            collection(db, 'sessions'),
            where('mentorId', '==', user.uid)
          ));

          const userSessionsMap = new Map<string, LearningSession>();
          learnerSessSnap.forEach((d) => userSessionsMap.set(d.id, { id: d.id, ...d.data() } as LearningSession));
          mentorSessSnap.forEach((d) => userSessionsMap.set(d.id, { id: d.id, ...d.data() } as LearningSession));

          const userSessions = Array.from(userSessionsMap.values());
          const upcoming = userSessions.filter((s) => s.status === 'upcoming');
          const completed = userSessions.filter((s) => s.status === 'completed');

          setUpcomingSessions(upcoming.slice(0, 3));

          setStats({
            skillsOfferedCount: profile?.skillsOffered?.length || 0,
            pendingRequestsCount: mentorReqsSnap.size + learnerReqsSnap.size,
            upcomingSessionsCount: upcoming.length,
            completedSessionsCount: completed.length
          });
        } else {
          setStats({
            skillsOfferedCount: 0,
            pendingRequestsCount: 0,
            upcomingSessionsCount: 0,
            completedSessionsCount: 0
          });
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    initAndFetch();

    if (user) {
      // Listen to recent notifications
      const notifQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', user.uid),
        limit(5)
      );
      const unsubNotif = onSnapshot(notifQuery, (snapshot) => {
        const notifs: AppNotification[] = [];
        snapshot.forEach((d) => notifs.push({ id: d.id, ...d.data() } as AppNotification));
        notifs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setNotifications(notifs);
      });

      return () => unsubNotif();
    }
  }, [user, profile]);


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Hero Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              SkillHub Student Community
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {profile?.displayName || 'Student'}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100/80 leading-relaxed">
              {profile?.college || 'Campus Member'} • {profile?.department || 'Computer Science'} ({profile?.year || 'Student'})
            </p>
          </div>

          {/* Quick Action Trigger Buttons */}
          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              onClick={onOpenAddSkill}
              className="px-4 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              Offer a Skill
            </button>
            <Link
              to="/marketplace"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-all flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Browse Skills
            </Link>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-indigo-200">Profile Completion</span>
              <span className="font-bold text-white">{completionPct}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-indigo-300 rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>

          {completionPct < 100 && (
            <Link
              to="/profile"
              className="text-xs text-amber-300 hover:text-amber-200 underline font-medium flex items-center gap-1 shrink-0"
            >
              Complete missing fields &rarr;
            </Link>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 p-5 rounded-2xl shadow-xs backdrop-blur-md flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Skills Offered</p>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{stats.skillsOfferedCount}</h3>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 p-5 rounded-2xl shadow-xs backdrop-blur-md flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Pending Requests</p>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{stats.pendingRequestsCount}</h3>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 p-5 rounded-2xl shadow-xs backdrop-blur-md flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Upcoming Sessions</p>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{stats.upcomingSessionsCount}</h3>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 p-5 rounded-2xl shadow-xs backdrop-blur-md flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
            <Star className="w-5 h-5 fill-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">My Mentor Rating</p>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {profile?.rating ? profile.rating.toFixed(1) : '5.0'}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Grid: Recommended Skills & Notifications/Sessions Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recommended Skills Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Recommended Mentor Skills
              </h2>
            </div>
            <Link
              to="/marketplace"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View All Skills <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : recommendedSkills.length === 0 ? (
            <div className="p-8 text-center bg-white/50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 text-xs text-zinc-500">
              No recommended skills available right now. Browse the marketplace!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendedSkills.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  onRequestSession={(s) => {
                    setSelectedSkillForRequest(s);
                    setRequestModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Upcoming Sessions & Notifications */}
        <div className="space-y-6">
          
          {/* Upcoming Sessions Widget */}
          <div className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 p-5 rounded-3xl shadow-xs backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-500" />
                Upcoming Mentorship Sessions
              </h3>
              <Link to="/sessions" className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                View All
              </Link>
            </div>

            {upcomingSessions.length === 0 ? (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center py-6">
                No upcoming sessions scheduled. Request a session from a mentor!
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingSessions.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[160px]">
                        {s.skillTitle}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                        Upcoming
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Mentor: {s.mentorName}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold pt-1">
                      <span>📅 {s.date} at {s.time}</span>
                      <button
                        onClick={() => navigate(`/chat?with=${s.mentorId}`)}
                        className="hover:underline flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" /> Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity / Notifications Feed */}
          <div className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 p-5 rounded-3xl shadow-xs backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-500" />
                Recent Notifications
              </h3>
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center py-6">
                No recent notifications.
              </p>
            ) : (
              <div className="space-y-2.5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => n.link && navigate(n.link)}
                    className="p-3 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/40 dark:border-zinc-800/40 text-xs cursor-pointer hover:border-indigo-500/30 transition-all space-y-1"
                  >
                    <p className="font-semibold text-zinc-900 dark:text-zinc-100">{n.title}</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">{n.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Request Session Modal Trigger */}
      <RequestSessionModal
        skill={selectedSkillForRequest}
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
      />

    </div>
  );
};
