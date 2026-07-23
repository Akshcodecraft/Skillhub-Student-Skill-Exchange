# Skillhub-Student-Skill-Exchange
# 🎓 SkillHub — Campus Peer-to-Peer Skill Exchange & Mentorship Platform

> **SkillHub** is a modern full-stack web application designed for university campuses and student communities. It enables students and peer mentors to exchange technical skills, schedule mentorship sessions, chat in real-time, track achievements, and level up together.

---

## ✨ Features

- **🔐 Smart Authentication System**
  - Secure Email/Password registration & Sign-In with real-time profile persistence.
  - Dedicated account credential validation with instant fallback support.
  - Demo accounts provided for quick explore mode.

- **🎨 Cute Avatar Picker & Customizable Profiles**
  - Interactive Avatar Picker with multi-style categories (**Cute People**, **3D & Anime Art**, **Fun Mascots**).
  - Seed-based randomizer generator ("Surprise Me 🎲") and custom avatar generation from name/phrase.
  - Profile customization: college department, bio, social links (GitHub, LinkedIn), offered skills, and learning goals.

- **🏪 Skill Marketplace**
  - Browse peer-offered skills across categories: *Web Development*, *AI & Data Science*, *UI/UX Design*, *Mobile Development*, *Cloud & DevOps*, and *Cybersecurity*.
  - Filter by level (Beginner, Intermediate, Advanced), category, or search keywords.
  - Post custom skill listings with experience details and session availability.

- **💬 Real-Time Peer & Mentor Chat**
  - Direct messaging with online active status indicators.
  - Smart interactive mentor auto-replies for instant guidance and inquiry follow-ups.
  - Typing indicators, image attachments, and unread notification alerts.

- **📅 Session Booking & Request Management**
  - Request mentorship sessions with specific dates, times, and learning objectives.
  - Status tracking: *Pending*, *Accepted*, *Completed*, or *Cancelled*.
  - Rate and leave reviews for mentors after completed sessions.

- **🏆 Gamified Leaderboard & Analytics**
  - Peer ranking based on completed mentorship sessions, student ratings, and community reviews.
  - Visual metrics dashboard displaying active learners, skill distribution, and exchange statistics.

- **🛡️ Admin & Moderation Controls**
  - Community moderation panel for managing skill listings, user accounts, and platform metrics.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Icons & Motion**: Lucide React icons, Framer Motion transitions
- **Backend & Database**: Firebase Firestore (NoSQL cloud database) & Firebase Authentication
- **Avatars & Assets**: DiceBear SVG Avatar API, Unsplash curated images

---

## 🚀 Getting Started Locally

### Prerequisites

Ensure you have **Node.js** (v18 or higher) and **npm** installed on your system.

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/skillhub-platform.git
cd skillhub-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup (Optional for Firebase)

Create a `.env` file in the root folder if connecting to your custom Firebase project:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Run Development Server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 📦 Project Structure

```text
skillhub-platform/
├── src/
│   ├── components/
│   │   ├── common/         # Reusable UI skeletons, badges, & modals
│   │   ├── layout/         # Navbar, Footer, and Navigation
│   │   ├── marketplace/    # Skill cards, search & filter components
│   │   └── profile/        # Profile edit modal & AvatarPickerModal
│   ├── context/
│   │   └── AuthContext.tsx # Global authentication & profile state
│   ├── lib/
│   │   ├── firebase.ts     # Firebase initialisation
│   │   └── seedData.ts     # Initial seed database records
│   ├── pages/
│   │   ├── AuthPage.tsx        # Login & Account Creation
│   │   ├── MarketplacePage.tsx # Skill discovery hub
│   │   ├── ChatPage.tsx        # Peer messaging interface
│   │   ├── SessionsPage.tsx    # Mentorship booking tracker
│   │   ├── ProfilePage.tsx     # Student & mentor profile view
│   │   ├── LeaderboardPage.tsx # Top mentors ranking
│   │   └── AnalyticsPage.tsx   # Platform analytics dashboard
│   ├── App.tsx             # Route configuration
│   ├── main.tsx            # Application entry point
│   └── types.ts            # TypeScript interfaces
├── package.json
└── README.md
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more details.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to fork this repository and submit pull requests.
