LifeBase - Personal Organizer App

LifeBase is a modern, mobile-first Progressive Web App (PWA) built with React, TypeScript, and Tailwind CSS. It is designed to help you organize your thoughts and rank your favorite media without the need for a complex backend or account registration.

🌟 Key Features

📝 Smart Notes

Sticky-Note Interface: Notes take on the color of their assigned label for a visual, sticky-note feel.

Label Management:

Create custom labels with names and specific colors.

Edit Labels: Rename labels or change their colors on the fly; all associated notes update automatically.

Safe Deletion: Deleting a label doesn't delete the notes—they simply become "Unlabeled" (Labellos).

Filtering:

Filter notes by clicking on label tags in the top bar.

"Labellos" Filter: Quickly find notes that haven't been assigned a category yet.

Editing: Click any note to edit its content or change its label. The editor adapts to the note's color theme.

🏆 Tier Lists

Drag & Drop: Intuitive drag-and-drop interface for ranking items.

Multi-List Support: Create separate tier lists for Games, Movies, Anime, etc.

Tier Rows: Standard S, A, B, C, D ranking rows.

Quick Add: Add items directly to specific tiers.

🎨 Customization (Zen Mode)

Dark & Light Mode: Fully supported themes that adapt to system preferences or manual selection.

Accent Colors: Choose your vibe from 6 different accent profiles (Indigo, Rose, Emerald, Amber, Cyan, Violet).

Adaptive UI: The interface changes tint based on your selected accent color.

🔄 Data & Sync (No Cloud Required)

Local First: All data is stored locally on your device (localStorage) for privacy and speed.

Quick Sync (Clipboard):

Transfer data between Phone and PC without a server.

Copy: Exports your database to a text string in your clipboard.

Paste & Merge: Intelligently merges imported data with your existing data. It adds new items but preserves your current ones (no accidental overwrites of existing IDs).

File Backup: Export/Import your entire database as a .json file for long-term safekeeping.

🛠️ Tech Stack

Framework: React

Language: TypeScript

Styling: Tailwind CSS v4

Icons: Lucide React

Build Tool: Vite

🚀 Getting Started

Prerequisites

Node.js (LTS version recommended)

npm or yarn

Installation

Clone the repository or download the source code.

Install dependencies:

npm install


Note: Ensure @tailwindcss/postcss is installed if using Tailwind v4.

Start the development server:

npm run dev


Open the link provided in the terminal (usually http://localhost:5173) on your PC or Phone (if on the same Wi-Fi).

📱 Mobile Installation (PWA)

To get the full app experience without the browser bars:

Host the app (e.g., via Vercel or locally).

Open the URL in Chrome on Android or Safari on iOS.

Tap the menu and select "Add to Home Screen".

Launch LifeBase from your app drawer.

🤝 Contributing

This is a personal project. Feel free to fork it and add your own features!

Commit Types:

feat: New features (e.g., new tier row types).

fix: Bug fixes.

refactor: Code cleanup without feature changes.

style: UI/CSS updates.