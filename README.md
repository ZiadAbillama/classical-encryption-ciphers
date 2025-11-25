"# 🔐 CryptoLab - Classical Encryption Ciphers

<div align="center">

![CryptoLab Banner](https://img.shields.io/badge/CryptoLab-Classical%20Cipher%20Mastery-blueviolet?style=for-the-badge)

**An interactive, gamified learning platform for mastering classical encryption ciphers**

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-5.1.0-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.18-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [API Documentation](#-api-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Usage](#-usage)
- [Available Ciphers](#-available-ciphers)
- [API Documentation](#-api-documentation)
- [Gamification System](#-gamification-system)
- [Authentication](#-authentication)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**CryptoLab** is a full-stack web application that transforms the learning of classical cryptography into an engaging, interactive experience. Through gamification elements like points, levels, combos, and missions, users master six fundamental encryption techniques that laid the foundation for modern cryptography.

### Why CryptoLab?

- 🎓 **Educational**: Learn cryptography fundamentals through hands-on practice
- 🎮 **Gamified**: Earn points, level up, and complete missions to stay motivated
- 🔬 **Interactive**: Real-time encryption/decryption with visual feedback
- 🎨 **Beautiful UI**: Modern, responsive design with dark/light themes
- 🔒 **Secure**: JWT authentication with OAuth support (Google & GitHub)
- 📊 **Progress Tracking**: Comprehensive statistics and achievement system

---

## ✨ Features

### 🔐 Cipher Laboratory

Master **6 classical encryption algorithms**:

1. **Affine Cipher** - Mathematical encryption with modular arithmetic
2. **Monoalphabetic Cipher** - Custom alphabet substitution
3. **Vigenère Cipher** - Polyalphabetic keyword-based encryption
4. **Playfair Cipher** - Digraph encryption with 5×5 matrix
5. **Hill Cipher** - Linear algebra meets cryptography (2×2 or 3×3 matrices)
6. **Extended Euclid Algorithm** - GCD calculation and modular inverse finder

### 🎯 Features Breakdown

#### Encryption & Decryption
- Real-time encryption/decryption with instant feedback
- Parameter customization for each cipher
- Visual matrix displays for Playfair and Hill ciphers
- Copy-to-clipboard functionality
- Input validation and error handling

#### Affine Cipher Cracking
- **Frequency Analysis Mode**: Crack affine ciphers using statistical analysis
- Specify most frequent letters (defaults: E and T)
- Automatic brute-force fallback with multiple candidate solutions
- 50 bonus points for successful cracks!

#### Gamification System
- **Points**: Earn 10 points per encryption/decryption
- **Combo Multiplier**: Build streaks for bonus points (1.5× per combo)
- **Levels**: Automatically level up every 500 points
- **Achievements**: Unlock badges for milestones
- **Missions**: Complete cipher challenges for extra rewards

#### Mission System
Six progressive missions with increasing difficulty:
-  **Novice**: Basic encryption tasks (20 pts)
-  **Apprentice**: Decrypt and keyword challenges (25-35 pts)
-  **Advanced**: Complex digraph encryption (40 pts)
-  **Expert**: Crack encrypted messages (50 pts)

### 🎨 User Interface

#### Dual Theme System
- **Dark Theme**: Sleek slate and cyan gradients
- **Light Theme**: Clean white and blue aesthetics
- Persistent theme selection (saved to localStorage)
- Smooth transitions between themes

#### Responsive Design
- Mobile-first approach with Tailwind CSS
- Beautiful glassmorphism effects
- Animated background glows
- Lucide React icons for consistency
- Toast notifications for user feedback

### 👤 User Management

#### Authentication
- **Email/Password** registration and login
- **OAuth Integration**: Google and GitHub sign-in
- JWT token-based authentication
- Secure password hashing with bcrypt
- Protected routes with auth middleware

#### Profile Management
- Comprehensive user statistics dashboard
- Achievement tracking system
- Mission completion history
- Best combo record
- Account creation date
- Password change functionality

### 📊 Statistics Tracking

Real-time stats synchronized with MongoDB:
- Total encryption operations
- Total decryption operations
- Current combo streak
- Best combo achieved
- Experience points
- Current level
- Ciphers tried
- Missions completed

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI framework |
| **React Router** | 6.30.1 | Client-side routing |
| **Tailwind CSS** | 3.4.18 | Utility-first styling |
| **Lucide React** | 0.552.0 | Icon library |
| **React Scripts** | 5.0.1 | Build tooling |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | Latest | Runtime environment |
| **Express** | 5.1.0 | Web framework |
| **MongoDB** | - | NoSQL database |
| **Mongoose** | 8.19.2 | MongoDB ODM |
| **JWT** | 9.0.2 | Authentication |
| **Bcrypt** | 6.0.0 | Password hashing |
| **CORS** | 2.8.5 | Cross-origin support |
| **dotenv** | 17.2.3 | Environment variables |

### Development Tools
- **Nodemon** - Auto-restart development server
- **PostCSS** - CSS processing
- **Autoprefixer** - Vendor prefixes

---

## 📁 Project Structure

```
classical-encryption-ciphers/
│
├── Backend/
│   ├── Algorithms/              # Cipher implementations
│   │   ├── Affine_cipher.js
│   │   ├── Monoalphabetic_cipher.js
│   │   ├── Vigenere_cipher.js
│   │   ├── Playfair_cipher.js
│   │   ├── Hill_cipher.js
│   │   └── Extended_Euclid.js
│   │
│   ├── models/                  # MongoDB schemas
│   │   └── User.js             # User model with stats
│   │
│   ├── routes/                  # API endpoints
│   │   ├── auth.js             # Authentication routes
│   │   └── users.js            # User management routes
│   │
│   ├── db.js                    # MongoDB connection
│   ├── server.js                # Express server setup
│   └── package.json
│
├── Frontend/
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── robots.txt
│   │
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   ├── ProtectedRoute.js
│   │   │   └── Router.js
│   │   │
│   │   ├── contexts/            # React Context providers
│   │   │   ├── AuthContext.js  # Authentication state
│   │   │   └── ThemeContext.js # Theme management
│   │   │
│   │   ├── pages/               # Application pages
│   │   │   ├── HomePage.js     # Dashboard
│   │   │   ├── CipherLabPage.js # Main cipher interface
│   │   │   ├── MissionsPage.js # Challenge list
│   │   │   ├── MissionAttemptPage.js # Mission interface
│   │   │   ├── ProfilePage.js  # User profile
│   │   │   ├── LoginPage.js    # Login form
│   │   │   ├── SignupPage.js   # Registration form
│   │   │   └── OAuthCallbackPage.js # OAuth handler
│   │   │
│   │   ├── App.js               # Root component
│   │   ├── App.css
│   │   ├── index.js             # Entry point
│   │   └── index.css
│   │
│   ├── tailwind.config.js       # Tailwind configuration
│   ├── postcss.config.js        # PostCSS configuration
│   └── package.json
│
└── README.md                     # This file
```

---

## 🚀 Installation

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** (local or cloud) - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)

### Clone the Repository

```bash
git clone https://github.com/ZiadAbillama/classical-encryption-ciphers.git
cd classical-encryption-ciphers
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `Backend/` directory with the following variables:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/cryptolab
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cryptolab

# Server
PORT=3000

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:3001

# Google OAuth (Optional - for Google sign-in)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# GitHub OAuth (Optional - for GitHub sign-in)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:3000/api/auth/github/callback
```

4. Start the backend server:
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `Frontend/` directory:
```env
REACT_APP_API_URL=http://localhost:3000
```

4. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3001` and automatically open in your browser.

---

## 🔧 Environment Setup

### MongoDB Configuration

#### Option 1: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service: `mongod`
3. Use connection string: `mongodb://localhost:27017/cryptolab`

#### Option 2: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Add a database user
4. Whitelist your IP address
5. Get your connection string and add it to `.env`

### OAuth Setup (Optional)

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

#### GitHub OAuth
1. Go to GitHub Settings > Developer Settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/github/callback`
4. Copy Client ID and Client Secret to `.env`

---

## 💻 Usage

### Getting Started

1. **Sign Up**: Create an account using email/password or OAuth (Google/GitHub)
2. **Explore the Dashboard**: View your stats and quick action buttons
3. **Enter Cipher Lab**: Choose a cipher to start learning
4. **Complete Missions**: Test your skills with progressive challenges
5. **Track Progress**: Monitor your achievements in your profile

### Using the Cipher Lab

#### Encryption/Decryption
1. Select a cipher from the available options
2. Toggle between Encrypt/Decrypt mode
3. Configure cipher parameters (keys, matrices, etc.)
4. Enter your text
5. Click the action button to process
6. Copy the result to clipboard if needed

#### Affine Cipher Cracking
1. Select Affine Cipher
2. Click "Normal Mode" to switch to "Crack Mode"
3. Enter the ciphertext to crack
4. Optionally specify the two most frequent letters (defaults: E and T)
5. Click "CRACK THE CODE"
6. View the decrypted result

#### Points & Combos
- Every successful encryption/decryption earns **10 base points**
- Consecutive operations build a **combo streak**
- Combo multiplier adds **1.5 points per combo level**
- Example: 5x combo = 10 + (5 × 1.5) = **17.5 points**
- Breaking a combo resets the multiplier

### Mission System

Missions test your cipher skills with specific challenges:

1. Navigate to **Missions** from the home page
2. View available missions with difficulty ratings
3. Click "Attempt Mission" to start
4. Complete the encryption/decryption task
5. Submit your answer
6. Earn points and complete the mission!

---

## 🔐 Available Ciphers

### 1. Affine Cipher
**Mathematical encryption using modular arithmetic**

- **Formula**: `C = (aP + b) mod 26`
- **Parameters**:
  - `a` - Multiplier (must be coprime with 26)
  - `b` - Shift value
- **Features**:
  - Encrypt/Decrypt modes
  - Frequency analysis cracking
  - Automatic validation

### 2. Monoalphabetic Cipher
**Simple substitution with custom alphabet**

- **Parameters**:
  - Custom 26-letter substitution key
- **Features**:
  - Visual alphabet mapping
  - Key validation (must be 26 unique letters)
  - Case preservation

### 3. Vigenère Cipher
**Polyalphabetic substitution cipher**

- **Parameters**:
  - Keyword (repeats throughout message)
- **Features**:
  - Keyword-based encryption
  - Polyalphabetic substitution
  - Visual key explanation

### 4. Playfair Cipher
**Digraph encryption with 5×5 matrix**

- **Parameters**:
  - Keyword for matrix generation
- **Features**:
  - Automatic 5×5 matrix generation
  - Visual matrix display
  - Digraph processing

### 5. Hill Cipher
**Linear algebra encryption**

- **Parameters**:
  - 2×2 or 3×3 key matrix
- **Features**:
  - Matrix size selection
  - Editable matrix cells
  - Automatic inverse calculation
  - Invertibility validation

### 6. Extended Euclid Algorithm
**GCD and modular inverse calculator**

- **Parameters**:
  - Integer `a`
  - Modulo `m`
- **Features**:
  - GCD calculation
  - Modular inverse finding
  - Bézout coefficient display

---

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### POST `/auth/signup`
Register a new user with email and password.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "stats": { ... }
  },
  "token": "jwt_token_here"
}
```

#### POST `/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### GET `/auth/me`
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

#### PATCH `/auth/password`
Change user password (requires authentication).

**Request Body:**
```json
{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword123"
}
```

#### OAuth Routes
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - Google OAuth callback
- `GET /auth/github` - Initiate GitHub OAuth
- `GET /auth/github/callback` - GitHub OAuth callback

### User Endpoints

#### GET `/users/me`
Get current user data (requires authentication).

#### PATCH `/users/me/stats`
Update user statistics (requires authentication).

**Request Body:**
```json
{
  "stats": {
    "points": 150,
    "level": 2,
    "combo": 3,
    "bestCombo": 5,
    "totalEncryptions": 10,
    "totalDecryptions": 8,
    "experiencedCiphers": ["affine", "vigenere"],
    "completedChallenges": ["affine_encrypt"]
  }
}
```

### Cipher Endpoints

#### Affine Cipher

**POST `/affine/encrypt`**
```json
{
  "text": "HELLO",
  "a": 5,
  "b": 8
}
```
Response: `{ "result": "RCLLA" }`

**POST `/affine/decrypt`**
```json
{
  "text": "RCLLA",
  "a": 5,
  "b": 8
}
```
Response: `{ "result": "HELLO" }`

**POST `/affine/crack`**
```json
{
  "text": "RCLLA",
  "plain1": "E",
  "plain2": "T"
}
```
Response: `{ "candidates": [...], "preview": "HELLO" }`

#### Monoalphabetic Cipher

**POST `/mono/encrypt`**
```json
{
  "text": "HELLO",
  "key": "QWERTYUIOPASDFGHJKLZXCVBNM"
}
```

**POST `/mono/decrypt`**
```json
{
  "text": "ITSSG",
  "key": "QWERTYUIOPASDFGHJKLZXCVBNM"
}
```

#### Vigenère Cipher

**POST `/vigenere/encrypt`**
```json
{
  "text": "HELLO",
  "key": "KEY"
}
```

**POST `/vigenere/decrypt`**
```json
{
  "text": "RIJVS",
  "key": "KEY"
}
```

#### Playfair Cipher

**POST `/playfair/encrypt`**
```json
{
  "text": "HELLO",
  "key": "MONARCHY"
}
```
Response: `{ "result": "...", "matrix": [[...]] }`

**POST `/playfair/decrypt`**
```json
{
  "text": "GATLMZ",
  "key": "MONARCHY"
}
```

#### Hill Cipher

**POST `/hill/encrypt`**
```json
{
  "text": "HELLO",
  "keyMat": [[6, 24, 1], [13, 16, 10], [20, 17, 15]]
}
```
Response: `{ "result": "...", "inverse": [[...]] }`

**POST `/hill/decrypt`**
```json
{
  "text": "ENCRYPTED",
  "keyMat": [[6, 24, 1], [13, 16, 10], [20, 17, 15]]
}
```

#### Extended Euclid

**POST `/euclid`**
```json
{
  "a": 15,
  "m": 26
}
```
Response: 
```json
{
  "gcd": 1,
  "inverse": 7,
  "coefficients": { "x": 7, "y": -4 }
}
```

---

## 🎮 Gamification System

### Points System
- **Base Points**: 10 points per encryption/decryption
- **Combo Bonus**: +1.5 points per combo level
- **Mission Rewards**: 20-50 points based on difficulty
- **Crack Bonus**: 50 points for successfully cracking a cipher

### Leveling System
- Start at **Level 1**
- Level up every **500 points**
- No level cap - keep climbing!

### Combo System
- Build combos by consecutive operations
- Combo resets when you take a break
- Best combo is tracked permanently
- Visual flame indicator shows current streak

### Achievements
- **First Steps**: Complete your first encryption/decryption
- **Combo Master**: Achieve a 5x combo or higher
- **Balanced Operator**: Complete 5+ encryptions AND 5+ decryptions
- **Rising Star**: Reach level 5
- More achievements coming soon!

### Statistics Tracked
- Total encryption operations
- Total decryption operations
- Current combo streak
- Best combo achieved
- Experience points earned
- Current level
- Ciphers experienced
- Missions completed

---

## 🔒 Authentication

### Authentication Flow

1. **Registration**: User creates account with email/password or OAuth
2. **Login**: Credentials are verified, JWT token is generated
3. **Token Storage**: Token saved to localStorage
4. **Protected Routes**: Token is sent with every API request
5. **Token Verification**: Server validates JWT on protected endpoints

### Security Features

- **Password Hashing**: Bcrypt with salt rounds (10)
- **JWT Tokens**: 7-day expiration
- **HTTP-Only**: Recommended for production (cookies)
- **CORS Protection**: Configured for frontend origin
- **Input Validation**: Server-side validation on all endpoints
- **OAuth**: Secure third-party authentication

### Protected Routes

All application routes except `/login` and `/signup` require authentication:
- `/` - Home dashboard
- `/cipherlab` - Cipher laboratory
- `/missions` - Mission list
- `/mission-attempt` - Mission interface
- `/profile` - User profile

---

## 🎨 Screenshots

### Dark Theme
*Beautiful dark mode with glassmorphism effects and gradient accents*

### Light Theme
*Clean, professional light theme for daytime use*

### Cipher Lab
*Interactive cipher interface with real-time feedback*

### Missions
*Progressive challenges with difficulty ratings*

### Profile Dashboard
*Comprehensive statistics and achievement tracking*

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Ways to Contribute

1. **Report Bugs**: Open an issue describing the bug
2. **Suggest Features**: Share ideas for new features
3. **Submit Pull Requests**: Fix bugs or implement features
4. **Improve Documentation**: Help make the docs better
5. **Add Ciphers**: Implement additional classical ciphers

### Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Commit with clear messages (`git commit -m 'Add AmazingFeature'`)
5. Push to your branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

### Code Style

- **Frontend**: Follow React best practices, use functional components
- **Backend**: Use ES6+ syntax, async/await for asynchronous operations
- **Formatting**: Consistent indentation (2 spaces)
- **Comments**: Add comments for complex logic

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- **Lucide Icons** - Beautiful open-source icon library
- **Tailwind CSS** - Utility-first CSS framework
- **MongoDB** - NoSQL database platform
- **The Cryptography Community** - For preserving classical cipher knowledge

---


---

<div align="center">



⭐ **Star this repo if you find it helpful!** ⭐

</div>" 
