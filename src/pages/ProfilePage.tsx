import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User,
  Building,
  GraduationCap,
  Award,
  Star,
  Clock,
  Github,
  Linkedin,
  Twitter,
  Globe,
  Edit3,
  Calendar,
  MessageSquare,
  Sparkles,
  BookOpen,
  Palette
} from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { UserProfile, ReviewItem } from '../types';
import { ProfileEditModal } from '../components/profile/ProfileEditModal';
import { AvatarPickerModal } from '../components/profile/AvatarPickerModal';
import { ProfileSkeleton } from '../components/common/Skeleton';

export const ProfilePage: React.FC = () => {
  const { uid } = useParams<{ uid?: string }>();
  const { user, profile: myProfile } = useAuth();
  const navigate = useNavigate();

  const [displayedProfile, setDisplayedProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);

  const isOwnProfile = !uid || uid === user?.uid;

  useEffect(() => {
    const targetUid = uid || user?.uid;
    if (!targetUid) {
      setLoading(false);
      return;
    }

    const fetchProfileAndReviews = async () => {
      setLoading(true);
      try {
        if (isOwnProfile && myProfile) {
          setDisplayedProfile(myProfile);
        } else {
          const userSnap = await getDoc(doc(db, 'users', targetUid));
          if (userSnap.exists()) {
            setDisplayedProfile({ uid: userSnap.id, ...userSnap.data() } as UserProfile);
          }
        }

        // Fetch reviews for this mentor
        const revQuery = query(
          collection(db, 'reviews'),
          where('mentorId', '==', targetUid)
        );
        const revSnap = await getDocs(revQuery);
        const revList: ReviewItem[] = [];
        revSnap.forEach((d) => revList.push({ id: d.id, ...d.data() } as ReviewItem));
        revList.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setReviews(revList);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndReviews();
  }, [uid, user, myProfile]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ProfileSkeleton />
      </div>
    );
  }

  const p = displayedProfile || myProfile;

  if (!p) {
    return (
      <div className="max-w-md mx-auto my-16 text-center space-y-4">
        <User className="w-12 h-12 text-zinc-400 mx-auto" />
        <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Profile Not Found</h2>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Profile Banner Header */}
      <div className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative">
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative group shrink-0">
            <img
              src={p.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.uid}`}
              alt={p.displayName}
              className="w-28 h-28 rounded-3xl object-cover ring-4 ring-indigo-500/30 shadow-lg bg-white dark:bg-zinc-800"
            />
            {isOwnProfile && (
              <button
                onClick={() => setAvatarPickerOpen(true)}
                className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold gap-1 backdrop-blur-xs"
                title="Change Avatar"
              >
                <Palette className="w-5 h-5 text-indigo-300 animate-bounce" />
                <span>Change Avatar</span>
              </button>
            )}
            {isOwnProfile && (
              <button
                onClick={() => setAvatarPickerOpen(true)}
                className="sm:hidden mt-2 w-full py-1 px-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[11px] flex items-center justify-center gap-1 border border-indigo-200 dark:border-indigo-800"
              >
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Change Avatar
              </button>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                {p.displayName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase">
                {p.role || 'Student'}
              </span>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center justify-center sm:justify-start gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              {p.college} • {p.department} ({p.year})
            </p>

            {p.bio && (
              <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-2xl pt-1">
                "{p.bio}"
              </p>
            )}

            {/* Social Links */}
            <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
              {p.socialLinks?.github && (
                <a href={p.socialLinks.github} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:text-indigo-500 text-zinc-600 dark:text-zinc-400 transition-colors">
                  <Github className="w-4 h-4" />
                </a>
              )}
              {p.socialLinks?.linkedin && (
                <a href={p.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:text-indigo-500 text-zinc-600 dark:text-zinc-400 transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
              {p.socialLinks?.twitter && (
                <a href={p.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:text-indigo-500 text-zinc-600 dark:text-zinc-400 transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {p.socialLinks?.website && (
                <a href={p.socialLinks.website} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:text-indigo-500 text-zinc-600 dark:text-zinc-400 transition-colors">
                  <Globe className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Action Trigger */}
          <div className="shrink-0 pt-2 sm:pt-0">
            {isOwnProfile ? (
              <button
                onClick={() => setEditModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={() => navigate(`/chat?with=${p.uid}`)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Chat with Mentor
              </button>
            )}
          </div>
        </div>

        {/* Key Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 text-center">
            <span className="text-xl font-extrabold text-amber-500 flex items-center justify-center gap-1">
              <Star className="w-5 h-5 fill-amber-400" /> {p.rating ? p.rating.toFixed(1) : '5.0'}
            </span>
            <p className="text-[11px] text-zinc-500 font-medium mt-0.5">Average Mentor Rating ({p.totalReviews || 0} reviews)</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 text-center">
            <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {p.completedSessions || 0}
            </span>
            <p className="text-[11px] text-zinc-500 font-medium mt-0.5">Completed Sessions</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 text-center col-span-2 sm:col-span-1">
            <span className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 block truncate">
              {p.availability || 'Weekdays 4 - 7 PM'}
            </span>
            <p className="text-[11px] text-zinc-500 font-medium mt-0.5">Availability Window</p>
          </div>
        </div>

      </div>

      {/* Skills Offered & Skills To Learn Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Skills Offered */}
        <div className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 p-6 rounded-3xl shadow-xs backdrop-blur-md space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-500" />
            Skills Offered / Teaching
          </h2>
          {(!p.skillsOffered || p.skillsOffered.length === 0) ? (
            <p className="text-xs text-zinc-400">No skills offered listed yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {p.skillsOffered.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Skills To Learn */}
        <div className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 p-6 rounded-3xl shadow-xs backdrop-blur-md space-y-4">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            Skills Interested in Learning
          </h2>
          {(!p.skillsToLearn || p.skillsToLearn.length === 0) ? (
            <p className="text-xs text-zinc-400">No learning interests listed yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {p.skillsToLearn.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Reviews Feed */}
      <div className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 p-6 rounded-3xl shadow-xs backdrop-blur-md space-y-4">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          Student Reviews & Testimonials ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <p className="text-xs text-zinc-500 py-4">No student reviews recorded yet for this mentor.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-200/40 dark:border-zinc-800/40 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={r.learnerPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.learnerId}`}
                      alt={r.learnerName}
                      className="w-7 h-7 rounded-lg object-cover"
                    />
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{r.learnerName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{r.rating}.0</span>
                  </div>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 italic">"{r.comment}"</p>
                <p className="text-[10px] text-zinc-400">Course: {r.skillTitle}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
      />

      {/* Avatar Picker Modal */}
      <AvatarPickerModal
        isOpen={avatarPickerOpen}
        onClose={() => setAvatarPickerOpen(false)}
        currentPhotoURL={p.photoURL}
      />

    </div>
  );
};
