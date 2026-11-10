# MathPad Junior ✏️📐

> **Interactive Stylus-Powered Math Workbook with Handwriting Recognition for Kids**

[![Version](https://img.shields.io/badge/version-0.20.0-blue.svg)](package.json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-PWA%20%7C%20Android-green.svg)](capacitor.config.json)
[![Offline](https://img.shields.io/badge/offline-100%25%20first-brightgreen.svg)](sw.js)

MathPad Junior bridges the gap between traditional paper-and-pencil math practice and modern digital learning. Designed specifically for touchscreen tablets and stylus input, it enables young learners to handwrite their working out, receive intelligent step-by-step guidance, and progress through curriculum-aligned math challenges in a gamified school environment.

---

## ✨ Key Features

### ✏️ Natural Stylus & Tactile Input
* **Handwriting Recognition (OCR)**: Write directly on the digital paper using a stylus or finger.
* **Tactile Keypad Fallback**: Integrated on-screen numeric keypad for alternate input and accessibility.
* **Canvas Palm Guard**: Designed for tablets so learners can rest their hand naturally while solving problems.

### 🧠 Procedural Curriculum & Misconception Diagnosis
* **Dynamic Problem Generation**: Automatically generates questions across core topics (Addition, Subtraction, Multiplication, Division, Fractions, Geometry, and Word Problems) across Year 1 to Year 6.
* **Pedagogical Diagnostic Engine**: Identifies *why* a student made an error (e.g., regrouping mistakes, digit reversal, place value column misalignment) rather than just marking an answer incorrect.
* **Step-by-Step Guidance**: Interactive breakdown modal helping students understand the solution pathway.

### 🔔 "The School Day" Session Formats
* **📚 Lesson Time (Classes)**: Structured 10–15 question topic-focused practice.
* **🏃 Morning Break (Recess Dash)**: Rapid-fire 60-second speed challenge awarding double stars.
* **🚨 Detention (Mistake Buster Clinic)**: Targeted recovery mode where learners re-attempt missed questions to earn back stars and achieve mastery.

### 🎒 The Pencil Case Shop & Economy
* **Math Stars Economy**: Earn stars for accuracy, streaks, and speed challenges.
* **Custom Collectibles**: Unlock custom stationery, ink colors, themed desk mats, and paper textures (grid, lined, notebook, dotted).

### 🌐 100% Offline-First & Native Android
* **Progressive Web App (PWA)**: Full offline caching via Service Worker.
* **Native Android Support**: Packaged with Capacitor 8 for tablet deployment.

---

## 📁 Project Architecture

```
MathPad Junior/
├── index.html                   # Main application shell (Worksheet & Settings)
├── pencil_case.html             # The Pencil Case shop & customization studio
├── manifest.json                # PWA manifest
├── sw.js                        # Service Worker for offline-first asset caching
├── capacitor.config.json        # Capacitor configuration for Android
├── css/
│   ├── base.css                 # Theme variables, typography & layout resets
│   ├── canvas.css               # MathPad handwriting canvas & palm guard styling
│   ├── pencil_case.css          # Shop UI & inventory display
│   ├── workbook.css             # Worksheet & problem layout
│   └── components/              # Modals, keypads, step guides
├── js/
│   ├── main.js                  # App bootstrap & event wiring
│   ├── components/              # Reusable UI widgets (NumKeypad, StepGuideModal)
│   ├── core/                    # CanvasEngine, AudioManager, HistoryManager
│   ├── data/                    # Curricula definitions, PencilCaseData, StudentProgress
│   ├── math/                    # ProceduralGenerator, DiagnosisEngine, OCRHandler, Validator
│   └── pages/                   # CoverPage, PracticePage, PencilCasePage, PageManager
├── scripts/
│   └── stage-www.js             # Asset bundling & staging script for Capacitor
└── android/                     # Native Android Studio project (Capacitor)
```

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or newer recommended)
* (Optional for Android builds) [Android Studio](https://developer.android.com/studio) & Android SDK

### Running Locally (Web / PWA)
Clone the repository and install dependencies:
```bash
npm install
```

Start the local development server:
```bash
npm start
# or
npm run dev
```
Open `http://localhost:3000` (or the URL printed in your terminal) in any modern browser.

---

## 📱 Android Development & Building

1. **Sync Web Assets to Android**:
   ```bash
   npm run sync
   ```
   *(Runs `stage-www.js` and synchronizes assets to the native Android folder)*

2. **Open in Android Studio**:
   ```bash
   npm run open
   ```

3. **Build Debug APK directly**:
   ```bash
   npm run build:apk
   ```

---

## 👨‍💻 Creator & Attribution

* **Creator & Lead Designer**: Marc Bailey
* *"Crafted with passion for playful learning & tactile mathematical discovery."*

## 📄 License

This project is licensed under the [MIT License](LICENSE).
