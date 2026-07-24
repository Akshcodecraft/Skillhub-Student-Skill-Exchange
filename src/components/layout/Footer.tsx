import React from 'react';
import { Sparkles, Heart, Github, Linkedin, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 py-8 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Brand & Tagline */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left gap-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">SkillHub</span>
            <span className="text-xs text-zinc-400">— Peer-to-Peer Student Learning</span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Empowering students to share knowledge, request 1-on-1 mentorship, and grow together.
          </p>
        </div>

        {/* Platform Tech Stack Pills */}
        <div className="flex flex-wrap justify-center items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
          <span className="px-2.5 py-1 rounded-full bg-zinc-200/60 dark:bg-zinc-800/60 border border-zinc-300/40 dark:border-zinc-700/40">
            Firebase Firestore & Auth
          </span>
          <span className="px-2.5 py-1 rounded-full bg-zinc-200/60 dark:bg-zinc-800/60 border border-zinc-300/40 dark:border-zinc-700/40">
            React 19 & Vite
          </span>
          <span className="px-2.5 py-1 rounded-full bg-zinc-200/60 dark:bg-zinc-800/60 border border-zinc-300/40 dark:border-zinc-700/40">
            Tailwind CSS & Motion
          </span>
        </div>

        {/* Social / Copyright */}
        <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <span>&copy; {new Date().getFullYear()} SkillHub</span>
          <div className="flex items-center gap-3">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500 transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};
