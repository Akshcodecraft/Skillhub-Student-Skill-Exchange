import React from 'react';
import { Star, Clock, Award, MessageSquare, Calendar, ChevronRight, Sparkles } from 'lucide-react';
import { SkillItem } from '../../types';
import { useNavigate } from 'react-router-dom';

interface SkillCardProps {
  skill: SkillItem;
  onRequestSession: (skill: SkillItem) => void;
}

export const SkillCard: React.FC<SkillCardProps> = ({ skill, onRequestSession }) => {
  const navigate = useNavigate();

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Intermediate':
        return 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
      case 'Advanced':
        return 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case 'Expert':
        return 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300';
    }
  };

  return (
    <div className="group relative bg-white/70 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 shadow-xs hover:shadow-xl hover:border-indigo-500/40 dark:hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between backdrop-blur-md">
      
      {/* Featured indicator badge if featured */}
      {skill.featured && (
        <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Featured Mentor
        </div>
      )}

      <div>
        {/* Top Meta: Category & Level */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-400">
            {skill.category}
          </span>
          <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${getLevelColor(skill.level)}`}>
            {skill.level}
          </span>
        </div>

        {/* Skill Title */}
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
          {skill.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
          {skill.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {skill.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-100/80 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-700/50"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Mentor Profile Info Block */}
      <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div
            onClick={() => navigate(`/profile/${skill.mentorId}`)}
            className="flex items-center gap-2.5 cursor-pointer group/mentor"
          >
            <img
              src={skill.mentorPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${skill.mentorId}`}
              alt={skill.mentorName}
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-indigo-500/20 group-hover/mentor:ring-indigo-500 transition-all"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover/mentor:text-indigo-500 transition-colors truncate max-w-[130px]">
                {skill.mentorName}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate max-w-[130px]">
                {skill.mentorCollege}
              </span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/50 px-2 py-1 rounded-lg border border-amber-200/60 dark:border-amber-800/60">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300">
              {skill.mentorRating ? skill.mentorRating.toFixed(1) : '5.0'}
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400">
              ({skill.mentorReviewsCount || 0})
            </span>
          </div>
        </div>

        {/* Experience & Availability */}
        <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
          <span className="flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-indigo-500" />
            {skill.experienceYears}y exp
          </span>
          <span className="flex items-center gap-1 truncate max-w-[150px]">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            {skill.availability}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={() => navigate(`/chat?with=${skill.mentorId}`)}
            className="w-full py-2 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Chat
          </button>
          <button
            onClick={() => onRequestSession(skill)}
            className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <Calendar className="w-3.5 h-3.5" />
            Request
          </button>
        </div>
      </div>

    </div>
  );
};
