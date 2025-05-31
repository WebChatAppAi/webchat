# WebChat Application

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-Latest-green)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Latest-cyan)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📌 Overview

A modern real-time web chat application built with Next.js, Prisma, and NextAuth.js. This application provides secure authentication and real-time messaging capabilities in a sleek, responsive interface.

## ✨ Features

- Real-time messaging
- Email-based authentication with NextAuth.js
- SQLite database with Prisma ORM
- Responsive UI with Tailwind CSS

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or later recommended)
- npm or yarn
- [Any other prerequisites]

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/webchat-OLD.git
   cd webchat-OLD
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```
   # Prisma
   DATABASE_URL="file:./dev.db"

   # NextAuth.js
   # Generate a random string for NEXTAUTH_SECRET (e.g., using `openssl rand -base64 32` or an online generator)
   NEXTAUTH_SECRET="your_nextauth_secret"
   NEXTAUTH_URL="http://localhost:3000" # Replace with your deployment URL in production

   # Email Provider (for NextAuth.js)
   # For development, NextAuth will log email links to the console if you don't provide real email credentials
   EMAIL_SERVER_HOST="smtp.your-email-provider.com"
   EMAIL_SERVER_PORT="465"
   EMAIL_SERVER_USER="your-email@example.com"
   EMAIL_SERVER_PASSWORD="your-email-password"
   EMAIL_FROM="your-email@example.com"
   ```

4. Start the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## 🛠️ Technologies Used

- **Frontend & Backend**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: TailwindCSS
- **UI Components**: Shadcn UI

## 📋 Project Structure

```
webchat-OLD/
├── prisma/            # Prisma schema and migrations
├── public/            # Static assets
├── src/               # Next.js application code
│   ├── app/           # App router pages and components
│   ├── components/    # Reusable UI components
│   └── lib/           # Utility functions and configurations
├── .env               # Environment variables (not committed)
├── .gitignore         # Git ignore rules
├── next.config.ts     # Next.js configuration
└── README.md          # This file
```

## 🚀 Pushing to GitHub

To push your project to GitHub, follow these steps:

1. **Initialize git** (if not already done):
   ```bash
   git init
   ```

2. **Add all files to staging**:
   ```bash
   git add .
   ```

3. **Commit your changes**:
   ```bash
   git commit -m "Initial commit"
   ```

4. **Create a new repository on GitHub**:
   - Go to https://github.com/new
   - Name your repository (e.g., webchat-OLD)
   - Do not initialize with README, .gitignore, or license files

5. **Link your local repository to GitHub**:
   ```bash
   git remote add origin https://github.com/yourusername/webchat-OLD.git
   ```

6. **Push your code**:
   ```bash
   git push -u origin main
   ```
   (Use `master` instead of `main` if that's your default branch)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
