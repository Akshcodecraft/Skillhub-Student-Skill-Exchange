import React, { useState } from 'react';
import { X, User, Building, BookOpen, Clock, Globe, Github, Linkedin, Twitter, Sparkles, AlertCircle, Palette } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types';
import { AvatarPickerModal } from './AvatarPickerModal';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { profile, updateUserProfile } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [department, setDepartment] = useState(profile?.department || 'Computer Science');
  const [college, setCollege] = useState(profile?.college || 'University Campus');
  const [year, setYear] = useState(profile?.year || '2nd Year');
  const [bio, setBio] = useState(profile?.bio || '');
  const [skillsOfferedInput, setSkillsOfferedInput] = useState(profile?.skillsOffered.join(', ') || '');
  const [skillsToLearnInput, setSkillsToLearnInput] = useState(profile?.skillsToLearn.join(', ') || '');
  const [availability, setAvailability] = useState(profile?.availability || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || '');
  const [github, setGithub] = useState(profile?.socialLinks?.github || '');
  const [linkedin, setLinkedin] = useState(profile?.socialLinks?.linkedin || '');
  const [twitter, setTwitter] = useState(profile?.socialLinks?.twitter || '');
  const [website, setWebsite] = useState(profile?.socialLinks?.website || '');

  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !profile) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Display name cannot be empty.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const skillsOffered = skillsOfferedInput
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const skillsToLearn = skillsToLearnInput
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await updateUserProfile({
        displayName: displayName.trim(),
        department: department.trim(),
        college: college.trim(),
        year,
        bio: bio.trim(),
        skillsOffered,
        skillsToLearn,
        availability: availability.trim(),
        photoURL: photoURL.trim(),
        socialLinks: {
          github: github.trim(),
          linkedin: linkedin.trim(),
          twitter: twitter.trim(),
          website: website.trim()
        }
      });

      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 sticky top-0 bg-white dark:bg-zinc-900 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Edit Student Profile</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Update your public profile, skills, and social links</p>
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

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
          
          {/* Avatar preview & Photo URL */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800">
            <div className="relative group shrink-0">
              <img
                src={photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.uid}`}
                alt="Avatar Preview"
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/30 bg-white dark:bg-zinc-800"
              />
              <button
                type="button"
                onClick={() => setAvatarPickerOpen(true)}
                className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                title="Change Avatar"
              >
                <Palette className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300">
                  Profile Avatar
                </label>
                <button
                  type="button"
                  onClick={() => setAvatarPickerOpen(true)}
                  className="px-3 py-1 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 hover:bg-indigo-200 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Choose Cute Avatar 🎨
                </button>
              </div>
              <input
                type="url"
                placeholder="Or paste custom image URL..."
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Year / Grade
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="Final Year">Final Year</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="Alumni">Alumni</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                College / University
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Department / Major
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Bio / About Me
            </label>
            <textarea
              rows={3}
              placeholder="Tell others about your learning journey, interests, and background..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Skills Offered (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. React, Python, Figma, Cybersecurity"
              value={skillsOfferedInput}
              onChange={(e) => setSkillsOfferedInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Skills to Learn (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Machine Learning, Rust, Web3, Mobile Apps"
              value={skillsToLearnInput}
              onChange={(e) => setSkillsToLearnInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Mentorship Availability
            </label>
            <input
              type="text"
              placeholder="e.g. Weekdays 4 PM - 7 PM, Saturdays"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          {/* Social Links */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <h4 className="font-bold text-zinc-800 dark:text-zinc-200 mb-2">Social Profiles</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">GitHub URL</label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">Twitter / X URL</label>
                <input
                  type="url"
                  placeholder="https://x.com/..."
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-[11px] text-zinc-500 dark:text-zinc-400 mb-1">Personal Website</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 sticky bottom-0 bg-white dark:bg-zinc-900 py-2 border-t border-zinc-100 dark:border-zinc-800">
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-md disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>

        <AvatarPickerModal
          isOpen={avatarPickerOpen}
          onClose={() => setAvatarPickerOpen(false)}
          currentPhotoURL={photoURL}
          onSelectAvatar={(selectedUrl) => setPhotoURL(selectedUrl)}
        />

      </div>
    </div>
  );
};
