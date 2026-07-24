import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded-md w-1/3"></div>
        <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded-full w-16"></div>
      </div>
      <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded-md w-3/4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
        <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6"></div>
      </div>
      <div className="flex items-center gap-3 pt-2">
        <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3"></div>
        </div>
      </div>
      <div className="h-9 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-full pt-2"></div>
    </div>
  );
};

export const ProfileSkeleton: React.FC = () => {
  return (
    <div className="bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-2xl bg-zinc-200 dark:bg-zinc-800"></div>
        <div className="space-y-3 text-center sm:text-left flex-1">
          <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-48 mx-auto sm:mx-0"></div>
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-32 mx-auto sm:mx-0"></div>
          <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded w-64 mx-auto sm:mx-0"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 bg-zinc-200/60 dark:bg-zinc-800/60 rounded-xl p-3"></div>
        ))}
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC = () => {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-12 bg-zinc-100 dark:bg-zinc-900 rounded-xl w-full"></div>
      ))}
    </div>
  );
};
