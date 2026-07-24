export type UserRole = 'student' | 'mentor' | 'admin';

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  department: string;
  college: string;
  year: string; // e.g. "1st Year", "3rd Year", "Final Year", "Alumni"
  bio: string;
  skillsOffered: string[];
  skillsToLearn: string[];
  availability: string; // e.g. "Mon-Wed 4:00 PM - 7:00 PM"
  socialLinks: SocialLinks;
  rating: number;
  totalReviews: number;
  completedSessions: number;
  role: UserRole;
  createdAt: number; // timestamp
  updatedAt: number;
}

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export interface SkillItem {
  id: string;
  title: string;
  category: string;
  description: string;
  mentorId: string;
  mentorName: string;
  mentorPhoto?: string;
  mentorCollege: string;
  mentorDepartment: string;
  mentorRating: number;
  mentorReviewsCount: number;
  experienceYears: number;
  level: SkillLevel;
  availability: string;
  tags: string[];
  featured?: boolean;
  createdAt: number;
}

export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'rescheduled' | 'completed';

export interface SessionRequest {
  id: string;
  learnerId: string;
  learnerName: string;
  learnerPhoto?: string;
  learnerEmail: string;
  mentorId: string;
  mentorName: string;
  mentorPhoto?: string;
  skillId: string;
  skillTitle: string;
  status: RequestStatus;
  preferredDate: string; // YYYY-MM-DD
  preferredTime: string; // HH:MM
  proposedDate?: string;
  proposedTime?: string;
  message: string;
  rescheduleNote?: string;
  createdAt: number;
  updatedAt: number;
}

export interface LearningSession {
  id: string;
  requestId: string;
  learnerId: string;
  learnerName: string;
  learnerPhoto?: string;
  mentorId: string;
  mentorName: string;
  mentorPhoto?: string;
  skillId: string;
  skillTitle: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  meetingLink?: string;
  notes?: string;
  reviewed?: boolean;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string; // learnerId_mentorId or request ID
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  recipientId: string;
  text: string;
  imageUrl?: string;
  timestamp: number;
  read: boolean;
}

export interface ChatConversation {
  id: string; // e.g. "userA_userB"
  participantIds: string[];
  participants: {
    [uid: string]: {
      displayName: string;
      photoURL?: string;
    };
  };
  lastMessage?: string;
  lastMessageTimestamp?: number;
  unreadCount?: { [uid: string]: number };
}

export type NotificationType =
  | 'session_request'
  | 'session_accepted'
  | 'session_rejected'
  | 'session_rescheduled'
  | 'new_message'
  | 'review_added';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: number;
}

export interface ReviewItem {
  id: string;
  mentorId: string;
  learnerId: string;
  learnerName: string;
  learnerPhoto?: string;
  rating: number; // 1-5
  comment: string;
  skillTitle: string;
  createdAt: number;
}

export interface AnalyticsSummary {
  totalUsers: number;
  totalMentors: number;
  totalSkills: number;
  totalSessions: number;
  completedSessions: number;
  categoryDistribution: { category: string; count: number }[];
  monthlyGrowth: { month: string; users: number; sessions: number }[];
}
