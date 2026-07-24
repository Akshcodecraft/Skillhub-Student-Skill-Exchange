import React, { useState } from 'react';
import { X, Calendar, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { SessionRequest } from '../../types';

interface RescheduleModalProps {
  request: SessionRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({
  request,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [proposedDate, setProposedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    return tomorrow.toISOString().split('T')[0];
  });
  const [proposedTime, setProposedTime] = useState('17:00');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const reqRef = doc(db, 'requests', request.id);
      await updateDoc(reqRef, {
        status: 'rescheduled',
        proposedDate,
        proposedTime,
        rescheduleNote: note.trim(),
        updatedAt: Date.now()
      });

      // Send notification to learner
      await addDoc(collection(db, 'notifications'), {
        userId: request.learnerId,
        type: 'session_rescheduled',
        title: 'Session Reschedule Proposed 🕒',
        body: `${request.mentorName} proposed a new time for "${request.skillTitle}": ${proposedDate} at ${proposedTime}.`,
        link: '/sessions',
        read: false,
        createdAt: Date.now()
      });

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Error rescheduling session:', err);
      setError(err.message || 'Failed to propose reschedule.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-8 relative">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Reschedule Session</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Propose new date & time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-xs text-rose-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              Proposed Date
            </label>
            <input
              type="date"
              required
              value={proposedDate}
              onChange={(e) => setProposedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              Proposed Time
            </label>
            <input
              type="time"
              required
              value={proposedTime}
              onChange={(e) => setProposedTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Note to Learner
            </label>
            <textarea
              rows={2}
              placeholder="e.g., Sorry, I have an exam at the original time. Can we do this instead?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-md disabled:opacity-50"
            >
              {submitting ? 'Proposing...' : 'Submit Reschedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
