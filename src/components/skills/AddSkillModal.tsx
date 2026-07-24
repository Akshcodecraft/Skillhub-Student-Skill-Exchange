import React, { useState } from 'react';
import { X, Sparkles, BookOpen, Layers, Clock, AlertCircle } from 'lucide-react';
import { collection, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { SkillLevel } from '../../types';

interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CATEGORIES = [
  'Web Development',
  'AI & Data Science',
  'Mobile Development',
  'UI/UX Design',
  'Cybersecurity',
  'Cloud & DevOps',
  'Programming Languages',
  'Academic & Research'
];

export const AddSkillModal: React.FC<AddSkillModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, profile, updateUserProfile } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [level, setLevel] = useState<SkillLevel>('Intermediate');
  const [experienceYears, setExperienceYears] = useState(1);
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [availability, setAvailability] = useState(profile?.availability || 'Mon, Wed, Fri 4-7 PM');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      setError('You must be signed in to offer a skill.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setError('Please fill out skill title and description.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const skillData = {
        title: title.trim(),
        category,
        description: description.trim(),
        mentorId: user.uid,
        mentorName: profile.displayName || 'Student Mentor',
        mentorPhoto: profile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        mentorCollege: profile.college || 'University Campus',
        mentorDepartment: profile.department || 'Computer Science',
        mentorRating: profile.rating || 5.0,
        mentorReviewsCount: profile.totalReviews || 0,
        experienceYears: Number(experienceYears),
        level,
        availability: availability.trim(),
        tags: tags.length > 0 ? tags : [category],
        featured: false,
        createdAt: Date.now()
      };

      await addDoc(collection(db, 'skills'), skillData);

      // Add to user's skillsOffered array if not present
      if (!profile.skillsOffered.includes(title.trim())) {
        await updateUserProfile({
          skillsOffered: [...profile.skillsOffered, title.trim()],
          role: profile.role === 'student' ? 'mentor' : profile.role
        });
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Error adding skill:', err);
      setError(err.message || 'Failed to add skill.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden p-6 sm:p-8 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Offer a Skill to Community</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Share your expertise and mentor fellow students.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Skill Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Fullstack React & Tailwind CSS Mastery"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Skill Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as SkillLevel)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Years of Experience
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Availability
              </label>
              <input
                type="text"
                placeholder="e.g., Mon, Wed, Fri 4-7 PM"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Description *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe what students will learn in your 1-on-1 mentorship session..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g., React, TypeScript, Next.js, Tailwind"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Skill'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
