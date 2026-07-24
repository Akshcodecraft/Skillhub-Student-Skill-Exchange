import React, { useState } from 'react';
import { X, Calendar, Clock, MessageSquare, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { SkillItem } from '../../types';

interface RequestSessionModalProps {
  skill: SkillItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RequestSessionModal: React.FC<RequestSessionModalProps> = ({
  skill,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user, profile } = useAuth();

  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('16:00');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !skill) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      setError('Please sign in to send a mentorship request.');
      return;
    }

    if (user.uid === skill.mentorId) {
      setError('You cannot request a session for your own offered skill.');
      return;
    }

    if (!message.trim()) {
      setError('Please write a brief message outlining what you would like to focus on.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const requestData = {
        learnerId: user.uid,
        learnerName: profile.displayName || 'Student Learner',
        learnerPhoto: profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        learnerEmail: user.email || '',
        mentorId: skill.mentorId,
        mentorName: skill.mentorName,
        mentorPhoto: skill.mentorPhoto || '',
        skillId: skill.id,
        skillTitle: skill.title,
        status: 'pending',
        preferredDate: date,
        preferredTime: time,
        message: message.trim(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      const reqRef = await addDoc(collection(db, 'requests'), requestData);

      // Create notification for mentor
      await addDoc(collection(db, 'notifications'), {
        userId: skill.mentorId,
        type: 'session_request',
        title: 'New Session Request 🚀',
        body: `${profile.displayName || 'A student'} requested a mentorship session for "${skill.title}" on ${date} at ${time}.`,
        link: '/sessions',
        read: false,
        createdAt: Date.now()
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setMessage('');
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err: any) {
      console.error('Error sending session request:', err);
      setError(err.message || 'Failed to send request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden p-6 sm:p-8 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <img
              src={skill.mentorPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${skill.mentorId}`}
              alt={skill.mentorName}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/20"
            />
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Request Mentorship</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">with {skill.mentorName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Skill Title Banner */}
        <div className="mt-4 p-3 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
          <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Selected Skill</p>
          <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5 line-clamp-1">{skill.title}</p>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Availability: {skill.availability}</p>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="my-8 py-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Session Request Sent!</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {skill.mentorName} will review your request and get back to you shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  Preferred Date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  Preferred Time
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                Message / Learning Objectives
              </label>
              <textarea
                required
                rows={3}
                placeholder="Hi! I would love to learn more about this topic. Specifically, I'm hoping to get help with..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Sending Request...' : 'Send Request'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
