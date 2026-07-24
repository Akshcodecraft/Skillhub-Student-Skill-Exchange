import React, { useState } from 'react';
import { X, Sparkles, RefreshCw, Check, Image as ImageIcon, Smile, Zap, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhotoURL?: string;
  onSelectAvatar?: (url: string) => void;
}

const AVATAR_CATEGORIES = [
  {
    name: 'Cute People',
    icon: Smile,
    avatars: [
      { id: 'c1', name: 'Anya', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anya&eyebrows=default&eyes=happy&mouth=smile' },
      { id: 'c2', name: 'Luna', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna&hairColor=2c1b18&skinColor=f8d25c' },
      { id: 'c3', name: 'Milo', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo&top=shortHair&hairColor=4a312c' },
      { id: 'c4', name: 'Zoe', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe&top=longHair&accessories=round' },
      { id: 'c5', name: 'Kai', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kai&top=curly&glasses=prescription02' },
      { id: 'c6', name: 'Maya', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya&top=bob&hairColor=e8e1e1' },
      { id: 'c7', name: 'Leo', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo&top=dreads&skinColor=d08b5b' },
      { id: 'c8', name: 'Chloe', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe&top=straight02&accessories=wayfarers' }
    ]
  },
  {
    name: '3D & Anime Art',
    icon: Sparkles,
    avatars: [
      { id: 'a1', name: '3D Scholar', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=ScholarGirl&hair=long01' },
      { id: 'a2', name: '3D Techie', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=TechBoy&glasses=variant02' },
      { id: 'a3', name: 'Pixel Coder', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=PixelDev' },
      { id: 'a4', name: 'Cute Artist', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=ArtistPass' },
      { id: 'a5', name: '3D Gamer', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=GamerDude' },
      { id: 'a6', name: 'Cool Buddy', url: 'https://api.dicebear.com/7.x/micah/svg?seed=CoolBuddy' }
    ]
  },
  {
    name: 'Fun Mascots',
    icon: Zap,
    avatars: [
      { id: 'm1', name: 'Sparky Bot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sparky' },
      { id: 'm2', name: 'Friendly Robo', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Friendly' },
      { id: 'm3', name: 'Smart AI', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=SmartAI' },
      { id: 'm4', name: 'Fun Bear', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=HappyBear' },
      { id: 'm5', name: 'Cheery Cat', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=CheeryCat' },
      { id: 'm6', name: 'Joyful Bunny', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=JoyBunny' }
    ]
  }
];

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  isOpen,
  onClose,
  currentPhotoURL,
  onSelectAvatar
}) => {
  const { profile, updateUserProfile } = useAuth();
  const [selectedUrl, setSelectedUrl] = useState<string>(currentPhotoURL || profile?.photoURL || '');
  const [customSeed, setCustomSeed] = useState<string>('');
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('Cute People');
  const [saving, setSaving] = useState(false);
  const [randomizing, setRandomizing] = useState(false);

  if (!isOpen) return null;

  const handleApply = async () => {
    const finalUrl = selectedUrl.trim();
    if (!finalUrl) return;

    if (onSelectAvatar) {
      onSelectAvatar(finalUrl);
      onClose();
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile({ photoURL: finalUrl });
      onClose();
    } catch (e) {
      console.error('Failed to save avatar:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleRandomize = () => {
    setRandomizing(true);
    const seeds = ['Anya', 'Felix', 'Sparky', 'Milo', 'Luna', 'Kira', 'Oliver', 'Ruby', 'Zephyr', 'Nova', 'Pippin', 'Bramble', 'Neko', 'Chibi'];
    const randomSeed = seeds[Math.floor(Math.random() * seeds.length)] + Math.floor(Math.random() * 1000);
    const newUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`;
    setSelectedUrl(newUrl);
    setTimeout(() => setRandomizing(false), 300);
  };

  const handleGenerateFromSeed = () => {
    if (!customSeed.trim()) return;
    const newUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customSeed.trim())}`;
    setSelectedUrl(newUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Choose Cute Avatar</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Select a personalized avatar that fits your vibe</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          
          {/* Currently Selected Live Preview */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/50">
            <div className="relative shrink-0">
              <img
                src={selectedUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=Anya`}
                alt="Selected Avatar"
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-500/40 shadow-md bg-white dark:bg-zinc-800"
              />
              <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1 rounded-full shadow-xs">
                <Check className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Previewing Selected Avatar</span>
              <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Looks great! You can choose from presets below or generate a custom seed.
              </p>
              <button
                type="button"
                onClick={handleRandomize}
                className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-500 ${randomizing ? 'animate-spin' : ''}`} />
                Surprise Me 🎲
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-2 overflow-x-auto">
            {AVATAR_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeTab === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => setActiveTab(cat.name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Grid of Avatars for Active Category */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {AVATAR_CATEGORIES.find((c) => c.name === activeTab)?.avatars.map((avatar) => {
              const isSelected = selectedUrl === avatar.url;
              return (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setSelectedUrl(avatar.url)}
                  className={`relative p-2 rounded-2xl border transition-all flex flex-col items-center gap-1.5 group ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/30'
                      : 'bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-200/60 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                  }`}
                >
                  <img
                    src={avatar.url}
                    alt={avatar.name}
                    className="w-14 h-14 rounded-xl object-cover bg-white dark:bg-zinc-800 group-hover:scale-105 transition-transform"
                  />
                  <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 truncate w-full text-center">
                    {avatar.name}
                  </span>
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 bg-indigo-600 text-white p-0.5 rounded-full">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom Seed Creator */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
            <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200">
              Create Avatar from Name / Seed Phrase:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your name or favourite word (e.g. Kitty, Astro, Coffee)..."
                value={customSeed}
                onChange={(e) => setCustomSeed(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleGenerateFromSeed())}
                className="flex-1 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
              />
              <button
                type="button"
                onClick={handleGenerateFromSeed}
                className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors"
              >
                Generate
              </button>
            </div>
          </div>

          {/* Custom URL Option */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-1.5">
            <label className="block text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              Or paste image URL directly:
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://..."
                value={customUrlInput}
                onChange={(e) => {
                  setCustomUrlInput(e.target.value);
                  if (e.target.value.trim()) setSelectedUrl(e.target.value.trim());
                }}
                className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3 bg-zinc-50/50 dark:bg-zinc-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={saving || !selectedUrl}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            {saving ? 'Saving...' : 'Apply Avatar'}
          </button>
        </div>

      </div>
    </div>
  );
};
