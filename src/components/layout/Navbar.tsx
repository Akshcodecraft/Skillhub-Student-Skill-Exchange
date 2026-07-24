import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  Calendar,
  MessageSquare,
  Trophy,
  BarChart3,
  ShieldAlert,
  Bell,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  PlusCircle,
  Menu,
  X,
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { AppNotification } from '../../types';

export const Navbar: React.FC<{ onOpenAddSkill?: () => void }> = ({ onOpenAddSkill }) => {
  const { user, profile, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Subscribe to realtime notifications for logged-in user
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const items: AppNotification[] = [];
      let unread = 0;
      snapshot.forEach((docSnap) => {
        const data = { id: docSnap.id, ...docSnap.data() } as AppNotification;
        items.push(data);
        if (!data.read) unread++;
      });
      // Sort newest first
      items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setNotifications(items.slice(0, 10)); // Top 10
      setUnreadCount(unread);
    }, (error) => {
      console.error('Error fetching notifications snapshot:', error);
    });

    return () => unsub();
  }, [user]);

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: Sparkles },
    { name: 'Marketplace', path: '/marketplace', icon: BookOpen },
    { name: 'Sessions', path: '/sessions', icon: Calendar },
    { name: 'Messages', path: '/chat', icon: MessageSquare },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    ...(isAdmin ? [{ name: 'Admin', path: '/admin', icon: ShieldAlert }] : [])
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  const showNavLinks = Boolean(user && location.pathname !== '/auth');

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link to={user ? "/" : "/auth"} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 p-0.5 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center text-indigo-400 font-bold">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              SkillHub
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                PRO
              </span>
            </span>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:inline">Student Skill Exchange</span>
          </div>
        </Link>

        {/* Desktop Navigation Links - ONLY shown when authenticated */}
        {showNavLinks && (
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-100 dark:bg-zinc-800/90 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100/60 dark:hover:bg-zinc-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Offer Skill Quick Action Button */}
          {user && (
            <button
              onClick={onOpenAddSkill}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold shadow-sm hover:from-indigo-500 hover:to-purple-500 transition-all transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Offer Skill
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
          </button>

          {/* Notification Bell */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 relative transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-zinc-950 animate-pulse" />
                )}
              </button>

              {/* Notification Popover */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-indigo-500" />
                      Notifications ({unreadCount} unread)
                    </h3>
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      Close
                    </button>
                  </div>
                  <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-center py-6 text-xs text-zinc-500 dark:text-zinc-400">
                        No notifications yet!
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setNotificationsOpen(false);
                            if (n.link) navigate(n.link);
                          }}
                          className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                            n.read
                              ? 'bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-400'
                              : 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800/80 text-zinc-900 dark:text-zinc-100'
                          }`}
                        >
                          <p className="font-semibold text-[13px]">{n.title}</p>
                          <p className="text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">{n.body}</p>
                          <p className="text-[10px] text-zinc-400 mt-1">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile / Auth State */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <img
                  src={profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`}
                  alt={profile?.displayName || 'Avatar'}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/30"
                />
                <span className="hidden md:inline text-xs font-semibold text-zinc-800 dark:text-zinc-200 max-w-[100px] truncate">
                  {profile?.displayName || 'User'}
                </span>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 py-2 z-50">
                  <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {profile?.displayName}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      {profile?.role || 'Student'}
                    </span>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <UserIcon className="w-4 h-4 text-indigo-500" />
                    My Profile
                  </Link>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      if (onOpenAddSkill) onOpenAddSkill();
                    }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <PlusCircle className="w-4 h-4 text-purple-500" />
                    Offer Skill
                  </button>

                  <div className="border-t border-zinc-100 dark:border-zinc-800 my-1" />

                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            location.pathname !== '/auth' && (
              <Link
                to="/auth"
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                Sign In
              </Link>
            )
          )}

          {/* Mobile Menu Button - ONLY shown when authenticated */}
          {showNavLinks && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer */}
      {showNavLinks && mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                }`}
              >
                <Icon className="w-4 h-4 text-indigo-500" />
                {link.name}
              </Link>
            );
          })}
          {user && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenAddSkill) onOpenAddSkill();
              }}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
            >
              <PlusCircle className="w-4 h-4" />
              Offer Skill
            </button>
          )}
        </div>
      )}
    </header>
  );
};
