import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, Image as ImageIcon, MessageSquare, Search, User, CheckCheck, Sparkles } from 'lucide-react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  getDoc,
  setDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { ChatMessage, UserProfile } from '../types';

import { seedCommunityDataIfNeeded, seedUserDataIfNeeded } from '../lib/seedData';

export const ChatPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const targetUidParam = searchParams.get('with');

  const [activePartner, setActivePartner] = useState<UserProfile | null>(null);
  const [partners, setPartners] = useState<UserProfile[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const [textInput, setTextInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load target partner from query param if provided
  useEffect(() => {
    if (!targetUidParam) return;

    const fetchTargetPartner = async () => {
      try {
        const docRef = doc(db, 'users', targetUidParam);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const partnerProf = { uid: snap.id, ...snap.data() } as UserProfile;
          setActivePartner(partnerProf);

          // Add to partners list if missing
          setPartners((prev) => {
            if (prev.some((p) => p.uid === partnerProf.uid)) return prev;
            return [partnerProf, ...prev];
          });
        }
      } catch (err) {
        console.error('Error fetching chat partner:', err);
      }
    };

    fetchTargetPartner();
  }, [targetUidParam]);

  // Load existing conversation partners from recent messages or users
  useEffect(() => {
    if (!user) return;

    const fetchRecentPartners = async () => {
      try {
        await seedCommunityDataIfNeeded();
        await seedUserDataIfNeeded(user.uid, profile?.displayName, profile?.photoURL, user.email || undefined);

        // Fetch all recent users in platform to populate chat sidebar
        const usersSnap = await getDocs(collection(db, 'users'));
        const userList: UserProfile[] = [];
        usersSnap.forEach((d) => {
          if (d.id !== user.uid) {
            userList.push({ uid: d.id, ...d.data() } as UserProfile);
          }
        });
        setPartners(userList);

        if (!activePartner && userList.length > 0) {
          setActivePartner(userList[0]);
        }
      } catch (err) {
        console.error('Error loading chat users:', err);
      }
    };

    fetchRecentPartners();
  }, [user, profile]);


  // Realtime subscription to messages with activePartner
  useEffect(() => {
    if (!user || !activePartner) {
      setMessages([]);
      return;
    }

    const conversationId = [user.uid, activePartner.uid].sort().join('_');

    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const items: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as ChatMessage);
      });
      // Sort chronologically
      items.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      setMessages(items);
    }, (err) => {
      console.error('Error listening to chat messages snapshot:', err);
    });

    return () => unsub();
  }, [user, activePartner]);

  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activePartner || (!textInput.trim() && !imageUrlInput.trim())) return;

    const userMessageText = textInput.trim();
    const currentPartner = activePartner;

    setSending(true);
    const conversationId = [user.uid, currentPartner.uid].sort().join('_');

    try {
      const msgData = {
        conversationId,
        senderId: user.uid,
        senderName: profile?.displayName || 'User',
        senderPhoto: profile?.photoURL || '',
        recipientId: currentPartner.uid,
        text: userMessageText,
        imageUrl: imageUrlInput.trim() || null,
        timestamp: Date.now(),
        read: false
      };

      await addDoc(collection(db, 'messages'), msgData);

      // Create notification for recipient
      await addDoc(collection(db, 'notifications'), {
        userId: currentPartner.uid,
        type: 'new_message',
        title: `New Message from ${profile?.displayName || 'Peer'}`,
        body: userMessageText || 'Sent an attachment',
        link: `/chat?with=${user.uid}`,
        read: false,
        createdAt: Date.now()
      });

      setTextInput('');
      setImageUrlInput('');
      setShowImageInput(false);

      // Trigger realistic Peer-Mentor Auto-Reply
      triggerMentorAutoReply(conversationId, userMessageText, currentPartner, user.uid);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const triggerMentorAutoReply = (
    conversationId: string,
    userText: string,
    mentor: UserProfile,
    currentUserId: string
  ) => {
    setIsTyping(true);

    setTimeout(async () => {
      try {
        const lowerText = userText.toLowerCase();
        let replyText = '';

        if (lowerText.includes('hi') || lowerText.includes('hello') || lowerText.includes('hey') || lowerText.includes('how are you')) {
          replyText = `Hey ${profile?.displayName || 'there'}! 👋 Great to connect with you on SkillHub! I'm doing well, thanks. How is your project or learning going? Let me know if you'd like to schedule a session or review any code!`;
        } else if (lowerText.includes('session') || lowerText.includes('schedule') || lowerText.includes('meet') || lowerText.includes('time')) {
          replyText = `I'd love to schedule a mentorship session with you! You can submit a request on my profile or Sessions tab for ${mentor.availability || 'weekdays'}. What topic would you like us to focus on?`;
        } else if (lowerText.includes('help') || lowerText.includes('doubt') || lowerText.includes('question') || lowerText.includes('code')) {
          replyText = `I'm happy to help you with that! As a mentor in ${mentor.skillsOffered?.[0] || mentor.department}, I recommend checking out the best practices in our domain. Feel free to share more details or code snippets here!`;
        } else {
          replyText = `Thanks for your message, ${profile?.displayName || 'friend'}! I specialize in ${mentor.skillsOffered?.slice(0, 2).join(', ') || 'technical mentorship'}. Let me know how I can support your learning goals today!`;
        }

        const replyMsg = {
          conversationId,
          senderId: mentor.uid,
          senderName: mentor.displayName,
          senderPhoto: mentor.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.uid}`,
          recipientId: currentUserId,
          text: replyText,
          imageUrl: null,
          timestamp: Date.now(),
          read: false
        };

        await addDoc(collection(db, 'messages'), replyMsg);

        // Notify current user
        await addDoc(collection(db, 'notifications'), {
          userId: currentUserId,
          type: 'new_message',
          title: `Reply from ${mentor.displayName}`,
          body: replyText,
          link: `/chat?with=${mentor.uid}`,
          read: false,
          createdAt: Date.now()
        });
      } catch (err) {
        console.error('Error in mentor auto-reply:', err);
      } finally {
        setIsTyping(false);
      }
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[82vh] flex flex-col">
      
      {/* Header */}
      <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-500" />
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Realtime Student Chat Center
          </h1>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="mt-4 flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-xl overflow-hidden backdrop-blur-md">
        
        {/* Left Sidebar: Conversations List */}
        <div className="md:col-span-1 border-r border-zinc-200/80 dark:border-zinc-800/80 flex flex-col bg-zinc-50/50 dark:bg-zinc-950/40">
          <div className="p-3.5 border-b border-zinc-200/80 dark:border-zinc-800/80">
            <h3 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
              Mentors & Peers
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {partners.length === 0 ? (
              <p className="text-xs text-zinc-400 text-center py-8">No contacts found.</p>
            ) : (
              partners.map((p) => {
                const isSelected = activePartner?.uid === p.uid;
                return (
                  <div
                    key={p.uid}
                    onClick={() => setActivePartner(p)}
                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    <img
                      src={p.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.uid}`}
                      alt={p.displayName}
                      className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/20"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{p.displayName}</p>
                      <p className={`text-[10px] truncate ${isSelected ? 'text-indigo-100' : 'text-zinc-500 dark:text-zinc-400'}`}>
                        {p.college || 'Peer Student'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Chat Stream */}
        <div className="md:col-span-2 lg:col-span-3 flex flex-col h-full bg-white dark:bg-zinc-900">
          
          {/* Active Partner Top Bar */}
          {activePartner ? (
            <>
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/30 dark:bg-zinc-900/30">
                <div className="flex items-center gap-3">
                  <img
                    src={activePartner.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activePartner.uid}`}
                    alt={activePartner.displayName}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/20"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {activePartner.displayName}
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {activePartner.department} • {activePartner.college}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages Container */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.length === 0 ? (
                  <div className="my-16 text-center space-y-2">
                    <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
                    <p className="text-xs font-semibold text-zinc-500">
                      Start a conversation with {activePartner.displayName}!
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.senderId === user?.uid;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-1 shadow-xs ${
                            isMe
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-none border border-zinc-200/50 dark:border-zinc-700/50'
                          }`}
                        >
                          {msg.text && <p>{msg.text}</p>}
                          {msg.imageUrl && (
                            <img
                              src={msg.imageUrl}
                              alt="Attachment"
                              className="mt-2 rounded-xl max-h-48 object-cover border border-white/20"
                            />
                          )}
                          <p
                            className={`text-[9px] text-right mt-1 ${
                              isMe ? 'text-indigo-200' : 'text-zinc-400'
                            }`}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                {isTyping && (
                  <div className="flex items-center gap-2 p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 rounded-2xl w-fit text-xs animate-pulse border border-zinc-200/50 dark:border-zinc-700/50">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                    <span>{activePartner.displayName} is typing a reply...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <div className="p-3 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/50">
                {showImageInput && (
                  <div className="mb-2 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="Image Attachment URL (https://...)"
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="w-full text-xs bg-transparent border-none focus:outline-hidden text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImageInput(!showImageInput)}
                    className="p-2.5 text-zinc-400 hover:text-indigo-500 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    title="Attach Image URL"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    placeholder={`Message ${activePartner.displayName}...`}
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />

                  <button
                    type="submit"
                    disabled={sending || (!textInput.trim() && !imageUrlInput.trim())}
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all disabled:opacity-40"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-zinc-400">
              Select a peer or mentor from the list to start chatting.
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
