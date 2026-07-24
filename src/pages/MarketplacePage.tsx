import React, { useState, useEffect } from 'react';
import { Search, Filter, Sparkles, BookOpen, PlusCircle, ArrowUpDown, Layers } from 'lucide-react';
import { collection, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SkillItem, SkillLevel } from '../types';
import { SkillCard } from '../components/skills/SkillCard';
import { RequestSessionModal } from '../components/skills/RequestSessionModal';
import { CardSkeleton } from '../components/common/Skeleton';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  'All Categories',
  'Web Development',
  'AI & Data Science',
  'Mobile Development',
  'UI/UX Design',
  'Cybersecurity',
  'Cloud & DevOps',
  'Programming Languages',
  'Academic & Research'
];

import { seedCommunityDataIfNeeded } from '../lib/seedData';

export const MarketplacePage: React.FC<{ onOpenAddSkill: () => void }> = ({ onOpenAddSkill }) => {
  const { user } = useAuth();

  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLevel, setSelectedLevel] = useState<string>('All Levels');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'newest'>('rating');

  const [selectedSkillForRequest, setSelectedSkillForRequest] = useState<SkillItem | null>(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    const initMarketplace = async () => {
      await seedCommunityDataIfNeeded();

      const skillsQuery = query(collection(db, 'skills'));
      unsub = onSnapshot(skillsQuery, (snapshot) => {
        const items: SkillItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push({ id: docSnap.id, ...docSnap.data() } as SkillItem);
        });
        setSkills(items);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching marketplace skills:', error);
        setLoading(false);
      });
    };

    initMarketplace();

    return () => {
      if (unsub) unsub();
    };
  }, []);


  // Filter & Sort Logic
  const filteredSkills = skills.filter((skill) => {
    // Search matching
    const matchesSearch =
      skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.mentorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skill.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    // Category matching
    const matchesCategory =
      selectedCategory === 'All Categories' || skill.category === selectedCategory;

    // Level matching
    const matchesLevel =
      selectedLevel === 'All Levels' || skill.level === selectedLevel;

    // Rating matching
    const matchesRating = (skill.mentorRating || 5.0) >= minRating;

    return matchesSearch && matchesCategory && matchesLevel && matchesRating;
  });

  // Sorting
  const sortedSkills = [...filteredSkills].sort((a, b) => {
    if (sortBy === 'rating') {
      return (b.mentorRating || 5.0) - (a.mentorRating || 5.0);
    } else if (sortBy === 'experience') {
      return (b.experienceYears || 0) - (a.experienceYears || 0);
    } else {
      return (b.createdAt || 0) - (a.createdAt || 0);
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-500" />
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Student Skill Marketplace
            </h1>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Browse skills offered by student mentors. Request 1-on-1 mentorship sessions and level up together.
          </p>
        </div>

        {user && (
          <button
            onClick={onOpenAddSkill}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Offer Your Skill
          </button>
        )}
      </div>

      {/* Search & Filter Controls Panel */}
      <div className="bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-5 shadow-xs backdrop-blur-md space-y-4">
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search skills, categories, mentor names, or tags (e.g. React, PyTorch, Figma)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          {/* Category Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Level Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
              Skill Level
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
            >
              <option value="All Levels">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>

          {/* Rating Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
              Min Rating
            </label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
            >
              <option value={0}>Any Rating</option>
              <option value={4.0}>4.0★ & above</option>
              <option value={4.5}>4.5★ & above</option>
              <option value={4.8}>4.8★ & above</option>
            </select>
          </div>

          {/* Sorting */}
          <div>
            <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
            >
              <option value="rating">Highest Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="newest">Latest Added</option>
            </select>
          </div>

        </div>

      </div>

      {/* Skills Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : sortedSkills.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white/50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800">
          <BookOpen className="w-12 h-12 text-zinc-400 mx-auto" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">No skills match your search criteria.</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Try adjusting your search terms or filters, or offer a new skill to the community!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedSkills.map((skill) => (
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

      {/* Request Session Modal Trigger */}
      <RequestSessionModal
        skill={selectedSkillForRequest}
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
      />

    </div>
  );
};
