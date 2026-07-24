import { collection, doc, setDoc, getDocs, query, limit, where } from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile, SkillItem, ReviewItem, SessionRequest, LearningSession, AppNotification, ChatMessage } from '../types';

export const MOCK_MENTORS: Partial<UserProfile>[] = [
  {
    uid: 'mentor_alex_dev',
    displayName: 'Alex Chen',
    email: 'alex.chen@campus.edu',
    department: 'Computer Science & Engineering',
    college: 'Stanford University',
    year: 'Final Year',
    bio: 'Full-stack developer with 3+ years experience in React, Node.js, and Cloud Infrastructure. Passionate about teaching UI/UX and web performance.',
    skillsOffered: ['React & Next.js', 'TypeScript', 'Node.js Backend', 'Tailwind CSS'],
    skillsToLearn: ['Machine Learning', 'PyTorch', 'Rust'],
    availability: 'Mon, Wed, Fri (4:00 PM - 7:00 PM EST)',
    photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    socialLinks: { github: 'https://github.com', linkedin: 'https://linkedin.com' },
    rating: 4.9,
    totalReviews: 18,
    completedSessions: 24,
    role: 'mentor',
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now()
  },
  {
    uid: 'mentor_sarah_ai',
    displayName: 'Dr. Sarah Connor',
    email: 'sarah.c@campus.edu',
    department: 'Data Science & AI',
    college: 'MIT Technology Institute',
    year: 'Alumni / Researcher',
    bio: 'Specializing in Computer Vision, Deep Learning, and Gemini API fine-tuning. Happy to guide students through research projects and AI hackathons.',
    skillsOffered: ['Python AI/ML', 'PyTorch', 'Gemini & LLM Prompting', 'Data Analytics'],
    skillsToLearn: ['Product Design', 'DevOps'],
    availability: 'Tue, Thu (5:00 PM - 8:00 PM EST), Weekends',
    photoURL: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    socialLinks: { github: 'https://github.com', linkedin: 'https://linkedin.com' },
    rating: 5.0,
    totalReviews: 22,
    completedSessions: 31,
    role: 'mentor',
    createdAt: Date.now() - 86400000 * 45,
    updatedAt: Date.now()
  },
  {
    uid: 'mentor_marcus_ui',
    displayName: 'Marcus Vance',
    email: 'marcus.vance@campus.edu',
    department: 'Design & Digital Arts',
    college: 'Rhode Island School of Design',
    year: '3rd Year',
    bio: 'Product Designer fascinated by component systems, Figma auto-layouts, and linear-style interfaces. Let us design beautiful products together!',
    skillsOffered: ['Figma UI/UX', 'Design Systems', 'Framer Motion', 'Interaction Design'],
    skillsToLearn: ['React Native', 'SwiftUI'],
    availability: 'Weekdays (6:00 PM - 9:00 PM EST)',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    socialLinks: { linkedin: 'https://linkedin.com' },
    rating: 4.8,
    totalReviews: 14,
    completedSessions: 19,
    role: 'mentor',
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now()
  },
  {
    uid: 'mentor_priya_cyber',
    displayName: 'Priya Sharma',
    email: 'priya.s@campus.edu',
    department: 'Information Security',
    college: 'UC Berkeley',
    year: 'Final Year',
    bio: 'Ethical hacker and cybersecurity researcher. Winner of 5+ national CTFs. Offering hands-on guidance in web application security and penetration testing.',
    skillsOffered: ['Cybersecurity & CTFs', 'Ethical Hacking', 'Network Security', 'Linux Systems'],
    skillsToLearn: ['Solidity', 'Web3'],
    availability: 'Saturdays & Sundays (1:00 PM - 6:00 PM EST)',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    socialLinks: { github: 'https://github.com', linkedin: 'https://linkedin.com' },
    rating: 4.9,
    totalReviews: 12,
    completedSessions: 15,
    role: 'mentor',
    createdAt: Date.now() - 86400000 * 15,
    updatedAt: Date.now()
  },
  {
    uid: 'mentor_david_mobile',
    displayName: 'David Kim',
    email: 'david.k@campus.edu',
    department: 'Mobile Computing',
    college: 'Carnegie Mellon University',
    year: 'Graduate Student',
    bio: 'Flutter and iOS engineer who has published 4 apps on App Store and Play Store. Passionate about native performance and clean app architecture.',
    skillsOffered: ['Flutter & Dart', 'iOS SwiftUI', 'React Native', 'Firebase Integration'],
    skillsToLearn: ['Rust', 'WebAssembly'],
    availability: 'Mon, Thu (3:00 PM - 7:00 PM EST)',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    socialLinks: { github: 'https://github.com', linkedin: 'https://linkedin.com' },
    rating: 4.9,
    totalReviews: 16,
    completedSessions: 21,
    role: 'mentor',
    createdAt: Date.now() - 86400000 * 28,
    updatedAt: Date.now()
  },
  {
    uid: 'mentor_elena_cloud',
    displayName: 'Elena Rostova',
    email: 'elena.r@campus.edu',
    department: 'Cloud Systems & DevOps',
    college: 'Georgia Tech',
    year: 'Final Year',
    bio: 'AWS Certified Solutions Architect & DevOps enthusiast. I teach Docker, Kubernetes, CI/CD pipelines, and infrastructure as code.',
    skillsOffered: ['AWS Cloud Architecture', 'Docker & Kubernetes', 'CI/CD Pipelines', 'Terraform'],
    skillsToLearn: ['Go', 'Distributed Systems'],
    availability: 'Wed, Fri, Sat (5:00 PM - 8:00 PM EST)',
    photoURL: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
    socialLinks: { github: 'https://github.com', linkedin: 'https://linkedin.com' },
    rating: 5.0,
    totalReviews: 19,
    completedSessions: 26,
    role: 'mentor',
    createdAt: Date.now() - 86400000 * 35,
    updatedAt: Date.now()
  },
  {
    uid: 'mentor_vikram_hardware',
    displayName: 'Vikram Patel',
    email: 'vikram.p@campus.edu',
    department: 'Mechanical & Robotics',
    college: 'ETH Zurich Exchange / Cornell',
    year: '3rd Year',
    bio: 'Robotics creator and CAD design expert. Built autonomous drones and IoT microcontrollers. Teaching Arduino, C++, and 3D CAD modeling.',
    skillsOffered: ['Robotics & Arduino', 'Embedded C++', '3D CAD Fusion 360', 'IoT Hardware'],
    skillsToLearn: ['Computer Vision', 'ROS2'],
    availability: 'Tue, Sat (2:00 PM - 6:00 PM EST)',
    photoURL: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
    socialLinks: { linkedin: 'https://linkedin.com' },
    rating: 4.8,
    totalReviews: 11,
    completedSessions: 14,
    role: 'mentor',
    createdAt: Date.now() - 86400000 * 12,
    updatedAt: Date.now()
  }
];

export const MOCK_SKILLS: SkillItem[] = [
  {
    id: 'skill_react_next',
    title: 'Modern Fullstack Web Development (React, Next.js 15 & Tailwind)',
    category: 'Web Development',
    description: 'Learn modern React hooks, server components, state management, and build sleek responsive web apps with Tailwind CSS.',
    mentorId: 'mentor_alex_dev',
    mentorName: 'Alex Chen',
    mentorPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    mentorCollege: 'Stanford University',
    mentorDepartment: 'Computer Science',
    mentorRating: 4.9,
    mentorReviewsCount: 18,
    experienceYears: 3,
    level: 'Intermediate',
    availability: 'Mon, Wed, Fri 4-7 PM',
    tags: ['React', 'TypeScript', 'Next.js', 'Tailwind'],
    featured: true,
    createdAt: Date.now() - 86400000 * 25
  },
  {
    id: 'skill_node_backend',
    title: 'Node.js & Express Microservices Architecture',
    category: 'Web Development',
    description: 'Master backend API design, JWT authentication, PostgreSQL database ORMs, REST APIs, and production deployment.',
    mentorId: 'mentor_alex_dev',
    mentorName: 'Alex Chen',
    mentorPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    mentorCollege: 'Stanford University',
    mentorDepartment: 'Computer Science',
    mentorRating: 4.9,
    mentorReviewsCount: 18,
    experienceYears: 3,
    level: 'Intermediate',
    availability: 'Mon, Wed 5-8 PM',
    tags: ['Node.js', 'Express', 'APIs', 'Database'],
    featured: false,
    createdAt: Date.now() - 86400000 * 20
  },
  {
    id: 'skill_figma_design',
    title: 'UI/UX Design Systems & Figma Prototyping',
    category: 'UI/UX Design',
    description: 'Master auto-layout, design tokens, typography scales, and interactive prototyping inspired by Linear and Notion UI.',
    mentorId: 'mentor_marcus_ui',
    mentorName: 'Marcus Vance',
    mentorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    mentorCollege: 'RISD',
    mentorDepartment: 'Design',
    mentorRating: 4.8,
    mentorReviewsCount: 14,
    experienceYears: 2,
    level: 'Beginner',
    availability: 'Weekdays 6-9 PM',
    tags: ['Figma', 'UI/UX', 'Design Systems', 'Prototyping'],
    featured: true,
    createdAt: Date.now() - 86400000 * 18
  },
  {
    id: 'skill_mobile_ui',
    title: 'Mobile App Interface Design & Framer Motion',
    category: 'UI/UX Design',
    description: 'Design mobile-first user interfaces, dark mode color science, gesture transitions, and micro-animations.',
    mentorId: 'mentor_marcus_ui',
    mentorName: 'Marcus Vance',
    mentorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    mentorCollege: 'RISD',
    mentorDepartment: 'Design',
    mentorRating: 4.8,
    mentorReviewsCount: 14,
    experienceYears: 2,
    level: 'Intermediate',
    availability: 'Tue, Thu 6-8 PM',
    tags: ['Mobile UI', 'Figma', 'Animations', 'User Experience'],
    featured: false,
    createdAt: Date.now() - 86400000 * 15
  },
  {
    id: 'skill_python_ai',
    title: 'Machine Learning & Gemini AI API Integration',
    category: 'AI & Data Science',
    description: 'Hands-on mentorship in building AI applications with Python, PyTorch, and integrating LLM Gemini APIs into real projects.',
    mentorId: 'mentor_sarah_ai',
    mentorName: 'Dr. Sarah Connor',
    mentorPhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    mentorCollege: 'MIT',
    mentorDepartment: 'Data Science',
    mentorRating: 5.0,
    mentorReviewsCount: 22,
    experienceYears: 5,
    level: 'Advanced',
    availability: 'Tue, Thu 5-8 PM',
    tags: ['Python', 'AI/ML', 'Gemini API', 'PyTorch'],
    featured: true,
    createdAt: Date.now() - 86400000 * 40
  },
  {
    id: 'skill_data_analytics',
    title: 'Data Analytics, SQL & Data Visualization with Python',
    category: 'AI & Data Science',
    description: 'Learn SQL query optimization, Pandas data cleaning, and creating interactive charts with Plotly and Matplotlib.',
    mentorId: 'mentor_sarah_ai',
    mentorName: 'Dr. Sarah Connor',
    mentorPhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
    mentorCollege: 'MIT',
    mentorDepartment: 'Data Science',
    mentorRating: 5.0,
    mentorReviewsCount: 22,
    experienceYears: 4,
    level: 'Beginner',
    availability: 'Weekends 2-6 PM',
    tags: ['Data Science', 'SQL', 'Pandas', 'Visualization'],
    featured: false,
    createdAt: Date.now() - 86400000 * 14
  },
  {
    id: 'skill_ethical_hacking',
    title: 'Web Application Security & Ethical Hacking Bootcamp',
    category: 'Cybersecurity',
    description: 'Understand OWASP top 10 vulnerabilities, web app security testing, and capture-the-flag (CTF) strategies.',
    mentorId: 'mentor_priya_cyber',
    mentorName: 'Priya Sharma',
    mentorPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    mentorCollege: 'UC Berkeley',
    mentorDepartment: 'Info Security',
    mentorRating: 4.9,
    mentorReviewsCount: 12,
    experienceYears: 3,
    level: 'Intermediate',
    availability: 'Weekends 1-6 PM',
    tags: ['Security', 'Ethical Hacking', 'OWASP', 'CTF'],
    featured: true,
    createdAt: Date.now() - 86400000 * 12
  },
  {
    id: 'skill_flutter_mobile',
    title: 'Cross-Platform Mobile Apps with Flutter & Dart',
    category: 'Mobile Development',
    description: 'Build fast cross-platform Android & iOS apps with Flutter state management, custom animations, and Firebase backend.',
    mentorId: 'mentor_david_mobile',
    mentorName: 'David Kim',
    mentorPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    mentorCollege: 'Carnegie Mellon University',
    mentorDepartment: 'Mobile Computing',
    mentorRating: 4.9,
    mentorReviewsCount: 16,
    experienceYears: 3,
    level: 'Intermediate',
    availability: 'Mon, Thu 3-7 PM',
    tags: ['Flutter', 'Dart', 'Mobile', 'iOS & Android'],
    featured: true,
    createdAt: Date.now() - 86400000 * 22
  },
  {
    id: 'skill_ios_swiftui',
    title: 'iOS Native Development with Swift & SwiftUI',
    category: 'Mobile Development',
    description: 'Learn modern Swift 6, SwiftUI declarative layouts, CoreData, and publish your own iOS app to the Apple App Store.',
    mentorId: 'mentor_david_mobile',
    mentorName: 'David Kim',
    mentorPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    mentorCollege: 'Carnegie Mellon University',
    mentorDepartment: 'Mobile Computing',
    mentorRating: 4.9,
    mentorReviewsCount: 16,
    experienceYears: 4,
    level: 'Beginner',
    availability: 'Wed, Fri 4-7 PM',
    tags: ['Swift', 'SwiftUI', 'iOS', 'Apple'],
    featured: false,
    createdAt: Date.now() - 86400000 * 19
  },
  {
    id: 'skill_docker_k8s',
    title: 'Docker, Kubernetes & AWS Cloud DevOps Architecture',
    category: 'Cloud & DevOps',
    description: 'Containerize microservices with Docker, deploy Kubernetes clusters, build GitHub Actions CI/CD pipelines on AWS.',
    mentorId: 'mentor_elena_cloud',
    mentorName: 'Elena Rostova',
    mentorPhoto: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
    mentorCollege: 'Georgia Tech',
    mentorDepartment: 'Cloud Systems',
    mentorRating: 5.0,
    mentorReviewsCount: 19,
    experienceYears: 4,
    level: 'Advanced',
    availability: 'Wed, Fri, Sat 5-8 PM',
    tags: ['Docker', 'Kubernetes', 'AWS', 'DevOps'],
    featured: true,
    createdAt: Date.now() - 86400000 * 30
  },
  {
    id: 'skill_robotics_arduino',
    title: 'Embedded Systems, Arduino & IoT Robotics Engineering',
    category: 'Mechanical & Hardware',
    description: 'Learn C++ microcontroller programming, circuit prototyping, motor drivers, sensor integration, and 3D CAD enclosure design.',
    mentorId: 'mentor_vikram_hardware',
    mentorName: 'Vikram Patel',
    mentorPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
    mentorCollege: 'ETH Zurich / Cornell',
    mentorDepartment: 'Robotics',
    mentorRating: 4.8,
    mentorReviewsCount: 11,
    experienceYears: 3,
    level: 'Beginner',
    availability: 'Tue, Sat 2-6 PM',
    tags: ['Arduino', 'Robotics', 'IoT', 'CAD Design'],
    featured: true,
    createdAt: Date.now() - 86400000 * 10
  },
  {
    id: 'skill_solidity_web3',
    title: 'Smart Contract Development with Solidity & Hardhat',
    category: 'Blockchain & Web3',
    description: 'Build decentralized applications (dApps), write secure EVM smart contracts, write unit tests, and integrate Ethers.js.',
    mentorId: 'mentor_priya_cyber',
    mentorName: 'Priya Sharma',
    mentorPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    mentorCollege: 'UC Berkeley',
    mentorDepartment: 'Info Security',
    mentorRating: 4.9,
    mentorReviewsCount: 12,
    experienceYears: 2,
    level: 'Intermediate',
    availability: 'Saturdays 2-6 PM',
    tags: ['Solidity', 'Web3', 'Blockchain', 'Smart Contracts'],
    featured: false,
    createdAt: Date.now() - 86400000 * 16
  }
];

export const MOCK_REVIEWS: ReviewItem[] = [
  {
    id: 'rev_1',
    mentorId: 'mentor_alex_dev',
    learnerId: 'learner_jordan',
    learnerName: 'Jordan Smith',
    learnerPhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
    rating: 5,
    comment: 'Alex explained React hooks and state management so clearly! I built my first web app right after the 1-on-1 session.',
    skillTitle: 'Modern Fullstack Web Development',
    createdAt: Date.now() - 86400000 * 5
  },
  {
    id: 'rev_2',
    mentorId: 'mentor_sarah_ai',
    learnerId: 'learner_taylor',
    learnerName: 'Taylor Swift',
    learnerPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
    rating: 5,
    comment: 'Dr. Sarah helped me debug my PyTorch model and integrate Gemini API. Incredible guidance and deep knowledge!',
    skillTitle: 'Machine Learning & Gemini AI API Integration',
    createdAt: Date.now() - 86400000 * 8
  },
  {
    id: 'rev_3',
    mentorId: 'mentor_marcus_ui',
    learnerId: 'learner_sam',
    learnerName: 'Sam Miller',
    learnerPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    rating: 5,
    comment: 'Marcus reviewed my portfolio and gave actionable Figma component tips. Highly recommend his design session.',
    skillTitle: 'UI/UX Design Systems & Figma Prototyping',
    createdAt: Date.now() - 86400000 * 10
  }
];

export async function seedUserDataIfNeeded(userUid: string, userDisplayName?: string, userPhoto?: string, userEmail?: string): Promise<void> {
  try {
    const name = userDisplayName || 'Student Learner';
    const photo = userPhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userUid}`;
    const email = userEmail || 'student@campus.edu';

    // Check if user already has requests or sessions
    const reqsSnap = await getDocs(query(collection(db, 'requests'), where('learnerId', '==', userUid), limit(1)));
    if (!reqsSnap.empty) {
      return; // Already has data
    }

    console.log('Seeding initial user requests, sessions, notifications, and messages for:', userUid);

    // 1. Seed Incoming Request (Alex Chen requesting mentorship from user)
    const incomingReqId = `req_inc_${userUid}_1`;
    const incomingReq: SessionRequest = {
      id: incomingReqId,
      learnerId: 'mentor_alex_dev',
      learnerName: 'Alex Chen',
      learnerPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      learnerEmail: 'alex.chen@campus.edu',
      mentorId: userUid,
      mentorName: name,
      mentorPhoto: photo,
      skillId: 'skill_react_next',
      skillTitle: 'React & Next.js Frontend Development',
      status: 'pending',
      preferredDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      preferredTime: '16:00',
      message: 'Hi! I saw your profile on SkillHub and would love to collaborate on UI state management and custom hooks!',
      createdAt: Date.now() - 3600000 * 4,
      updatedAt: Date.now() - 3600000 * 4
    };
    await setDoc(doc(db, 'requests', incomingReqId), incomingReq, { merge: true });

    // 2. Seed Sent Request (User requested mentorship from Dr. Sarah Connor)
    const sentReqId = `req_sent_${userUid}_1`;
    const sentReq: SessionRequest = {
      id: sentReqId,
      learnerId: userUid,
      learnerName: name,
      learnerPhoto: photo,
      learnerEmail: email,
      mentorId: 'mentor_sarah_ai',
      mentorName: 'Dr. Sarah Connor',
      mentorPhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
      skillId: 'skill_python_ai',
      skillTitle: 'Machine Learning & Gemini AI API Integration',
      status: 'pending',
      preferredDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      preferredTime: '17:00',
      message: 'Hello Dr. Sarah, I am working on an AI student assistant app using Gemini API. Could we schedule a 1-on-1 review session?',
      createdAt: Date.now() - 3600000 * 12,
      updatedAt: Date.now() - 3600000 * 12
    };
    await setDoc(doc(db, 'requests', sentReqId), sentReq, { merge: true });

    // 3. Seed Upcoming Session with Marcus Vance
    const upcomingSessId = `sess_up_${userUid}_1`;
    const upcomingSession: LearningSession = {
      id: upcomingSessId,
      requestId: `req_acc_${userUid}_1`,
      learnerId: userUid,
      learnerName: name,
      learnerPhoto: photo,
      mentorId: 'mentor_marcus_ui',
      mentorName: 'Marcus Vance',
      mentorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      skillId: 'skill_figma_design',
      skillTitle: 'UI/UX Design Systems & Figma Prototyping',
      date: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0],
      time: '18:00',
      status: 'upcoming',
      meetingLink: 'https://meet.jit.si/skillhub-marcus-vance-design',
      notes: 'Please bring your Figma design link or portfolio draft!',
      reviewed: false,
      createdAt: Date.now() - 86400000 * 1
    };
    await setDoc(doc(db, 'sessions', upcomingSessId), upcomingSession, { merge: true });

    // 4. Seed Completed Session with Priya Sharma
    const completedSessId = `sess_comp_${userUid}_1`;
    const completedSession: LearningSession = {
      id: completedSessId,
      requestId: `req_comp_${userUid}_1`,
      learnerId: userUid,
      learnerName: name,
      learnerPhoto: photo,
      mentorId: 'mentor_priya_cyber',
      mentorName: 'Priya Sharma',
      mentorPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
      skillId: 'skill_ethical_hacking',
      skillTitle: 'Web Application Security & Ethical Hacking Bootcamp',
      date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
      time: '14:00',
      status: 'completed',
      meetingLink: 'https://meet.jit.si/skillhub-priya-cybersecurity',
      notes: 'Covered OWASP Top 10 vulnerabilities, JWT security, and CSRF protection.',
      reviewed: false,
      createdAt: Date.now() - 86400000 * 4
    };
    await setDoc(doc(db, 'sessions', completedSessId), completedSession, { merge: true });

    // 5. Seed Notifications
    const notif1: AppNotification = {
      id: `notif_${userUid}_1`,
      userId: userUid,
      type: 'session_accepted',
      title: 'Session Confirmed! 🎉',
      body: 'Marcus Vance accepted your request for UI/UX Design Systems. Check your Sessions tab for the video link!',
      link: '/sessions',
      read: false,
      createdAt: Date.now() - 3600000 * 2
    };
    const notif2: AppNotification = {
      id: `notif_${userUid}_2`,
      userId: userUid,
      type: 'session_request',
      title: 'New Session Request Received 📩',
      body: 'Alex Chen requested a mentorship session with you for React & Next.js.',
      link: '/sessions',
      read: false,
      createdAt: Date.now() - 3600000 * 4
    };
    await setDoc(doc(db, 'notifications', notif1.id), notif1, { merge: true });
    await setDoc(doc(db, 'notifications', notif2.id), notif2, { merge: true });

    // 6. Seed Sample Messages with Alex Chen & Marcus Vance
    const convoIdAlex = [userUid, 'mentor_alex_dev'].sort().join('_');
    const msg1: ChatMessage = {
      id: `msg_${userUid}_1`,
      conversationId: convoIdAlex,
      senderId: 'mentor_alex_dev',
      senderName: 'Alex Chen',
      senderPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      recipientId: userUid,
      text: 'Hey! Welcome to SkillHub! Let me know if you want to pair program on React or TypeScript.',
      timestamp: Date.now() - 3600000 * 5,
      read: false
    };
    const msg2: ChatMessage = {
      id: `msg_${userUid}_2`,
      conversationId: convoIdAlex,
      senderId: userUid,
      senderName: name,
      senderPhoto: photo,
      recipientId: 'mentor_alex_dev',
      text: 'Hi Alex! Thanks for reaching out. I would love to learn more about Next.js App Router!',
      timestamp: Date.now() - 3600000 * 3,
      read: true
    };
    await setDoc(doc(db, 'messages', msg1.id), msg1, { merge: true });
    await setDoc(doc(db, 'messages', msg2.id), msg2, { merge: true });

    console.log('Successfully seeded user-specific interactive data!');
  } catch (err) {
    console.error('Error seeding user data:', err);
  }
}

export async function seedCommunityDataIfNeeded(): Promise<boolean> {

  try {
    const skillsSnap = await getDocs(query(collection(db, 'skills'), limit(1)));
    if (!skillsSnap.empty) {
      console.log('SkillHub Firestore already contains data.');
      return false;
    }

    console.log('Seeding initial SkillHub community data into Firestore...');

    // Seed Mentors
    for (const mentor of MOCK_MENTORS) {
      if (mentor.uid) {
        await setDoc(doc(db, 'users', mentor.uid), mentor, { merge: true });
      }
    }

    // Seed Skills
    for (const skill of MOCK_SKILLS) {
      await setDoc(doc(db, 'skills', skill.id), skill, { merge: true });
    }

    // Seed Reviews
    for (const rev of MOCK_REVIEWS) {
      await setDoc(doc(db, 'reviews', rev.id), rev, { merge: true });
    }

    console.log('Successfully seeded SkillHub community data.');
    return true;
  } catch (error) {
    console.error('Error seeding community data:', error);
    return false;
  }
}
