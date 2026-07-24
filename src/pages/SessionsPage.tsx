import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  MessageSquare,
  Star,
  Sparkles,
  AlertCircle,
  User
} from 'lucide-react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  addDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { SessionRequest, LearningSession } from '../types';
import { RescheduleModal } from '../components/sessions/RescheduleModal';
import { ReviewModal } from '../components/sessions/ReviewModal';

import { seedCommunityDataIfNeeded, seedUserDataIfNeeded } from '../lib/seedData';

export const SessionsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'incoming' | 'sent' | 'upcoming' | 'completed'>('incoming');

  const [incomingRequests, setIncomingRequests] = useState<SessionRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<SessionRequest[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<LearningSession[]>([]);
  const [completedSessions, setCompletedSessions] = useState<LearningSession[]>([]);

  // Modals state
  const [rescheduleRequest, setRescheduleRequest] = useState<SessionRequest | null>(null);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);

  const [reviewSession, setReviewSession] = useState<LearningSession | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    let unsubInc: (() => void) | undefined;
    let unsubSent: (() => void) | undefined;
    let unsubSessLearner: (() => void) | undefined;
    let unsubSessMentor: (() => void) | undefined;

    const initSessionsData = async () => {
      await seedCommunityDataIfNeeded();
      await seedUserDataIfNeeded(user.uid, profile?.displayName, profile?.photoURL, user.email || undefined);

      // 1. Incoming Requests (User is Mentor)
      const incQuery = query(
        collection(db, 'requests'),
        where('mentorId', '==', user.uid)
      );
      unsubInc = onSnapshot(incQuery, (snap) => {
        const items: SessionRequest[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() } as SessionRequest));
        items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setIncomingRequests(items);
      });

      // 2. Sent Requests (User is Learner)
      const sentQuery = query(
        collection(db, 'requests'),
        where('learnerId', '==', user.uid)
      );
      unsubSent = onSnapshot(sentQuery, (snap) => {
        const items: SessionRequest[] = [];
        snap.forEach((d) => items.push({ id: d.id, ...d.data() } as SessionRequest));
        items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setSentRequests(items);
      });

      // 3. Sessions (User as Learner or Mentor)
      let learnerSessions: LearningSession[] = [];
      let mentorSessions: LearningSession[] = [];

      const updateSessionsState = () => {
        const map = new Map<string, LearningSession>();
        learnerSessions.forEach((s) => map.set(s.id, s));
        mentorSessions.forEach((s) => map.set(s.id, s));
        const all = Array.from(map.values());
        all.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        setUpcomingSessions(all.filter((s) => s.status === 'upcoming'));
        setCompletedSessions(all.filter((s) => s.status === 'completed'));
      };

      const sessLearnerQuery = query(
        collection(db, 'sessions'),
        where('learnerId', '==', user.uid)
      );
      unsubSessLearner = onSnapshot(sessLearnerQuery, (snap) => {
        learnerSessions = [];
        snap.forEach((d) => learnerSessions.push({ id: d.id, ...d.data() } as LearningSession));
        updateSessionsState();
      });

      const sessMentorQuery = query(
        collection(db, 'sessions'),
        where('mentorId', '==', user.uid)
      );
      unsubSessMentor = onSnapshot(sessMentorQuery, (snap) => {
        mentorSessions = [];
        snap.forEach((d) => mentorSessions.push({ id: d.id, ...d.data() } as LearningSession));
        updateSessionsState();
      });
    };

    initSessionsData();

    return () => {
      if (unsubInc) unsubInc();
      if (unsubSent) unsubSent();
      if (unsubSessLearner) unsubSessLearner();
      if (unsubSessMentor) unsubSessMentor();
    };
  }, [user, profile]);


  // Mentor Action: Accept Request -> Creates LearningSession in Firestore
  const handleAcceptRequest = async (req: SessionRequest) => {
    try {
      // 1. Update request status to accepted
      await updateDoc(doc(db, 'requests', req.id), {
        status: 'accepted',
        updatedAt: Date.now()
      });

      // 2. Create Learning Session doc
      const sessionData = {
        requestId: req.id,
        learnerId: req.learnerId,
        learnerName: req.learnerName,
        learnerPhoto: req.learnerPhoto || '',
        mentorId: req.mentorId,
        mentorName: req.mentorName,
        mentorPhoto: req.mentorPhoto || '',
        skillId: req.skillId,
        skillTitle: req.skillTitle,
        date: req.proposedDate || req.preferredDate,
        time: req.proposedTime || req.preferredTime,
        status: 'upcoming',
        meetingLink: `https://meet.jit.si/skillhub-${req.id.slice(0, 8)}`,
        reviewed: false,
        createdAt: Date.now()
      };

      await addDoc(collection(db, 'sessions'), sessionData);

      // 3. Send Notification to Learner
      await addDoc(collection(db, 'notifications'), {
        userId: req.learnerId,
        type: 'session_accepted',
        title: 'Session Request Accepted! 🎉',
        body: `${req.mentorName} accepted your mentorship request for "${req.skillTitle}". Check your upcoming sessions!`,
        link: '/sessions',
        read: false,
        createdAt: Date.now()
      });
    } catch (err) {
      console.error('Error accepting request:', err);
    }
  };

  // Mentor Action: Reject Request
  const handleRejectRequest = async (req: SessionRequest) => {
    try {
      await updateDoc(doc(db, 'requests', req.id), {
        status: 'rejected',
        updatedAt: Date.now()
      });

      await addDoc(collection(db, 'notifications'), {
        userId: req.learnerId,
        type: 'session_rejected',
        title: 'Session Request Update',
        body: `${req.mentorName} was unable to accept your request for "${req.skillTitle}". Feel free to request another time.`,
        link: '/sessions',
        read: false,
        createdAt: Date.now()
      });
    } catch (err) {
      console.error('Error rejecting request:', err);
    }
  };

  // Mentor Action: Mark Session Completed
  const handleCompleteSession = async (session: LearningSession) => {
    try {
      await updateDoc(doc(db, 'sessions', session.id), {
        status: 'completed'
      });

      // Increment mentor's completedSessions counter
      if (profile) {
        await updateDoc(doc(db, 'users', user!.uid), {
          completedSessions: (profile.completedSessions || 0) + 1
        });
      }

      // Send notification to learner inviting review
      await addDoc(collection(db, 'notifications'), {
        userId: session.learnerId,
        type: 'session_accepted',
        title: 'Session Completed! ⭐',
        body: `Your mentorship session for "${session.skillTitle}" with ${session.mentorName} is complete. Please leave a review!`,
        link: '/sessions',
        read: false,
        createdAt: Date.now()
      });
    } catch (err) {
      console.error('Error completing session:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-indigo-500" />
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Mentorship Sessions & Requests
          </h1>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
          Manage session requests, accept mentorships, reschedule, and review completed sessions.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap border-b border-zinc-200 dark:border-zinc-800 gap-2">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'incoming'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Incoming Requests ({incomingRequests.filter((r) => r.status === 'pending').length})
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'sent'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          My Sent Requests ({sentRequests.length})
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'upcoming'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Upcoming Sessions ({upcomingSessions.length})
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'completed'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          Completed Sessions ({completedSessions.length})
        </button>
      </div>

      {/* Tab Contents */}

      {/* 1. Incoming Requests (User is Mentor) */}
      {activeTab === 'incoming' && (
        <div className="space-y-4">
          {incomingRequests.length === 0 ? (
            <div className="p-12 text-center bg-white/50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800 space-y-2">
              <Clock className="w-10 h-10 text-zinc-400 mx-auto" />
              <p className="text-xs text-zinc-500 font-semibold">No incoming session requests right now.</p>
            </div>
          ) : (
            incomingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 p-5 rounded-2xl shadow-xs backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={req.learnerPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.learnerId}`}
                    alt={req.learnerName}
                    className="w-11 h-11 rounded-xl object-cover ring-2 ring-indigo-500/20"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{req.learnerName}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        req.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                        req.status === 'rescheduled' ? 'bg-purple-100 text-purple-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Skill: {req.skillTitle}</p>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-xl">
                      "{req.message}"
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-zinc-500 pt-1">
                      <span>📅 Preferred: {req.preferredDate} at {req.preferredTime}</span>
                      {req.proposedDate && (
                        <span className="text-purple-600 font-semibold">🕒 Proposed: {req.proposedDate} at {req.proposedTime}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {req.status === 'pending' && (
                  <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0">
                    <button
                      onClick={() => handleAcceptRequest(req)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Accept
                    </button>
                    <button
                      onClick={() => {
                        setRescheduleRequest(req);
                        setRescheduleModalOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Reschedule
                    </button>
                    <button
                      onClick={() => handleRejectRequest(req)}
                      className="px-3 py-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Decline
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 2. Sent Requests (User is Learner) */}
      {activeTab === 'sent' && (
        <div className="space-y-4">
          {sentRequests.length === 0 ? (
            <div className="p-12 text-center bg-white/50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 font-semibold">You haven't requested any sessions yet.</p>
            </div>
          ) : (
            sentRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 p-5 rounded-2xl shadow-xs backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{req.skillTitle}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      req.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                      req.status === 'rescheduled' ? 'bg-purple-100 text-purple-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">Mentor: {req.mentorName}</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300">"{req.message}"</p>
                  <p className="text-[11px] text-zinc-500">📅 Requested for {req.preferredDate} at {req.preferredTime}</p>
                  {req.rescheduleNote && (
                    <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 text-xs text-purple-700 dark:text-purple-300">
                      <strong>Mentor Note:</strong> "{req.rescheduleNote}"
                    </div>
                  )}
                </div>

                <button
                  onClick={() => navigate(`/chat?with=${req.mentorId}`)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-xs font-semibold flex items-center gap-1.5 shrink-0"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Message Mentor
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* 3. Upcoming Sessions */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingSessions.length === 0 ? (
            <div className="p-12 text-center bg-white/50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 font-semibold">No upcoming sessions scheduled.</p>
            </div>
          ) : (
            upcomingSessions.map((s) => (
              <div
                key={s.id}
                className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 p-5 rounded-2xl shadow-xs backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{s.skillTitle}</span>
                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Upcoming
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Mentor: {s.mentorName} • Learner: {s.learnerName}
                  </p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                    📅 Date & Time: {s.date} at {s.time}
                  </p>
                  {s.meetingLink && (
                    <a
                      href={s.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs font-bold text-purple-600 dark:text-purple-400 underline"
                    >
                      🔗 Join Virtual Video Room
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/chat?with=${s.mentorId === user?.uid ? s.learnerId : s.mentorId}`)}
                    className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Chat
                  </button>

                  {/* Mentor can mark session complete */}
                  {user?.uid === s.mentorId && (
                    <button
                      onClick={() => handleCompleteSession(s)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 4. Completed Sessions */}
      {activeTab === 'completed' && (
        <div className="space-y-4">
          {completedSessions.length === 0 ? (
            <div className="p-12 text-center bg-white/50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-xs text-zinc-500 font-semibold">No completed sessions recorded yet.</p>
            </div>
          ) : (
            completedSessions.map((s) => (
              <div
                key={s.id}
                className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 p-5 rounded-2xl shadow-xs backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{s.skillTitle}</span>
                    <span className="bg-zinc-100 text-zinc-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Completed
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">Mentor: {s.mentorName}</p>
                  <p className="text-xs text-zinc-400">📅 Completed on {s.date}</p>
                </div>

                {/* Review button if learner & not reviewed */}
                {user?.uid === s.learnerId && !s.reviewed && (
                  <button
                    onClick={() => {
                      setReviewSession(s);
                      setReviewModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 shrink-0"
                  >
                    <Star className="w-3.5 h-3.5 fill-white" /> Leave Review
                  </button>
                )}

                {s.reviewed && (
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-4 h-4" /> Review Submitted
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      <RescheduleModal
        request={rescheduleRequest}
        isOpen={rescheduleModalOpen}
        onClose={() => setRescheduleModalOpen(false)}
      />

      <ReviewModal
        session={reviewSession}
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
      />

    </div>
  );
};
