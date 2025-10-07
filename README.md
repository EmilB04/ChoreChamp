# ChoreChamp 🏆

A modern household task management app built with React Native and Expo, designed to gamify chores and foster collaboration among household members.

## 📱 About the Project

ChoreChamp is a mobile application that transforms mundane household tasks into an engaging, gamified experience. Track tasks, compete with housemates, and maintain a clean, organized home through friendly competition and clear task management.

## 👥 Contributors

- **[EmilB04](https://github.com/EmilB04)** - Frontend Developer & Project Owner
  - UI/UX design and implementation
  - Architecture and tab navigation
- **[Khosman23](https://github.com/Khosman23)** - Frontend Developer
  - UI/UX design and implementation
  - Onboarding and user experience
- **[idatol](https://github.com/idatol)** - Frontend/Backend Developer
  - UI/UX design and implementation
  - Profile and settings management
- **[Andolaus ](https://github.com/Andolaus)** - Backend Developer
  - Authentication and database management
  - API development and integration
- **[Thomsen97](https://github.com/Thomsen97)** - Backend Developer
  - TBD

### ✨ Key Features

- **📅 Dynamic Task Scheduling**: Smart time-slot generation that adapts to tasks outside normal hours
- **🏠 Multi-Household Support**: Switch between different households with ease
- **🔍 Advanced Search & Filtering**: Find specific tasks and history entries quickly
- **📊 Interactive Dashboard**: Real-time task overview with live "now line" indicator
- **🎨 Adaptive UI**: Responsive SVG graphics that scale across all device sizes
- **🌙 Theme Support**: Centralized theme management with dark/light mode compatibility
- **📈 Progress Tracking**: Visual task completion status and leaderboards
- **🔔 Smart Notifications**: Stay updated on upcoming and overdue tasks

### 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router with tab-based navigation  
- **Graphics**: react-native-svg for scalable vector graphics
- **Styling**: StyleSheet with responsive design patterns
- **State Management**: React Context API for theme management
- **Time Management**: Dynamic time calculations with live updates

### 📱 Supported Platforms

- iOS
- Android  
- Web (Progressive Web App)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/EmilB04/ChoreChamp.git
   cd ChoreChamp
   ```

2. **Navigate to the project directory**
   ```bash
   cd ChoreChamp
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   npx expo start
   ```

5. **Run on your preferred platform**
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator  
   - Press `w` for Web browser
   - Scan QR code with Expo Go app for physical device

## 📂 Project Structure

```
ChoreChamp/
├── ChoreChamp/                 # Main application directory
│   ├── app/                    # App screens and navigation
│   │   ├── (tabs)/            # Tab-based navigation screens
│   │   │   ├── index.tsx      # Dashboard/Home screen
│   │   │   ├── HistoryTab.tsx # Task history with filtering
│   │   │   ├── ProfileTab.tsx # User profile and settings
│   │   │   └── ...
│   │   ├── _layout.tsx        # Root layout with theme provider
│   │   └── commonStyles.tsx   # Shared styling definitions
│   ├── components/            # Reusable UI components
│   │   ├── index/            # Home-specific components
│   │   ├── svg/              # SVG graphics components
│   │   └── ui/               # Generic UI components
│   ├── contexts/             # React Context providers
│   │   └── ThemeContext.tsx  # Centralized theme management
│   ├── constants/            # App constants and configurations
│   ├── hooks/                # Custom React hooks
│   └── assets/               # Images, fonts, and static assets
└── README.md                 # This file
```

## 🎨 Architecture Highlights

### Dynamic UI Components
- **Responsive SVG Graphics**: Auto-scaling background shapes that adapt to any screen size
- **Dynamic Time Slots**: Task scheduling that includes early morning and late evening tasks
- **Floating Action Buttons**: Mobile-optimized search and filter controls

### Theme Management
- **Centralized Theme Context**: Eliminates redundant color imports across components
- **Consistent Styling**: Unified color scheme and typography throughout the app
- **Cross-Platform Compatibility**: Ensures consistent appearance on all platforms

### Performance Optimizations
- **Live Time Updates**: Efficient 10-second intervals for real-time dashboard updates
- **Dimension Listeners**: Dynamic screen size adjustments for orientation changes
- **Optimized Rendering**: Minimal re-renders through proper state management

## 🏫 Academic Context

This project is developed as part of the **Mobilprogrammering** (Mobile Programming) course, demonstrating:

- Modern React Native development practices
- TypeScript integration for type safety
- Responsive design principles
- State management patterns
- Cross-platform mobile development
- User experience design for mobile interfaces

## 📄 License

This project is developed for educational purposes as part of a mobile programming course.


---

*Built with ❤️ for the Mobilprogrammering course - Making household chores fun, one task at a time!* 🏠✨
