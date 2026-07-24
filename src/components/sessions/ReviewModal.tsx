import React, { useState } from 'react';
import { X, Star, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { LearningSession } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface ReviewModalProps {
  session: LearningSession | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  session,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user, profile } = useAuth();

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !session) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    if (!comment.trim()) {
      setError('Please write a brief feedback review for your mentor.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // 1. Add review doc
      await addDoc(collection(db, 'reviews'), {
        mentorId: session.mentorId,
        learnerId: user.uid,
        learnerName: profile.displayName || 'Learner',
        learnerPhoto: profile.photoURL || '',
        rating,
        comment: comment.trim(),
        skillTitle: session.skillTitle,
        createdAt: Date.now()
      });

      // 2. Mark session as reviewed
      if (session.id) {
        await updateDoc(doc(db, 'sessions', session.id), {
          reviewed: true
        });
      }

      // 3. Recalculate & update mentor's rating in users collection
      const mentorRef = doc(db, 'users', session.mentorId);
      const mentorSnap = await getDoc(mentorRef);
      if (mentorSnap.exists()) {
        const mentorData = mentorSnap.data();
        const currentRating = mentorData.rating || 5.0;
        const currentReviewsCount = mentorData.totalReviews || 0;
        const newReviewsCount = currentReviewsCount + 1;
        const newRating = (currentRating * currentReviewsCount + rating) / newReviewsCount;

        await updateDoc(mentorRef, {
          rating: Number(newRating.toFixed(1)),
          totalReviews: newReviewsCount
        });
      }

      // 4. Send notification to mentor
      await addDoc(collection(db, 'notifications'), {
        userId: session.mentorId,
        type: 'review_added',
        title: 'New Review Received! ⭐',
        body: `${profile.displayName} rated your mentorship session ${rating}/5 stars: "${comment.slice(0, 60)}..."`,
        link: '/profile/' + session.mentorId,
        read: false,
        createdAt: Date.now()
      });

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Failed to submit review.');
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
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Rate Mentorship Session</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">with {session.mentorName}</p>
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

        <form onSubmit={handleSubmit} className="mt-6 space-y-5 text-xs">
          
          {/* Star Rating selector */}
          <div className="text-center space-y-2">
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300">
              Overall Rating
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= (hoverRating || rating);
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-125 focus:outline-hidden"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        active
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-zinc-200 dark:fill-zinc-800 text-zinc-300 dark:text-zinc-700'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
              {rating === 5 && 'Outstanding session! 🌟'}
              {rating === 4 && 'Very Helpful! 👍'}
              {rating === 3 && 'Good session 👌'}
              {rating === 2 && 'Needs Improvement'}
              {rating === 1 && 'Unsatisfactory'}
            </p>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Written Review / Feedback *
            </label>
            <textarea
              required
              rows={4}
              placeholder="What did you learn? How was the mentor's communication and clarity?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-md disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
