# GutCheck: Clinical Menu Intelligence 🩺🍽️

**GutCheck** is an AI-powered clinical intelligence tool designed to bridge the gap between complex blood reports and everyday dining decisions. It transforms static medical data into actionable, real-time guidance when you're looking at a restaurant menu.

## 🌟 The Vision
Most people receive blood reports but struggle to translate markers like "HbA1c: 6.2%" or "LDL: 140 mg/dL" into specific dietary choices at a restaurant. GutCheck solves this by creating a personalized "Clinical Food Profile" that acts as a filter for any restaurant menu, highlighting what's safe and what's risky based on *your* specific health markers.

## 🚀 Key Features

- **Blood Report Decoding**: Upload a PDF or image of your blood test. GutCheck uses Gemini 2.5 Pro to extract markers (HbA1c, Cholesterol, Uric Acid, Thyroid, etc.) and interpret their clinical significance.
- **Personalized Food Profile**: Automatically generates custom "Food Rules" (e.g., "Limit saturated fats due to high LDL", "Avoid high-purine foods for Uric Acid").
- **Real-Time Menu Analysis**: Paste or scan any restaurant menu. The AI runs a two-pass analysis to rank dishes based on your clinical profile.
- **Indian Cuisine Aware**: Specifically optimized for Indian dietary contexts, understanding the impact of dishes like Dal Makhani, Paneer Tikka, or Roti on different health conditions.
- **Privacy-First Architecture**: Your clinical data and food profile are stored **entirely on your device** (Local Storage). Nothing is stored on our servers.

## 🛠️ Technical Architecture

### Two-Pass Menu Analysis
To ensure speed and token efficiency, GutCheck employs a two-pass strategy for menu processing:
1. **Pass 1 (Extraction)**: Compresses raw menu text into a structured list of unique dishes and descriptions.
2. **Pass 2 (Clinical Scoring)**: Runs the personalized food rules against the structured dish list to generate clinical scores and warnings.

### Security & Robustness
- **Prompt Injection Detection**: Built-in layers to detect and block malicious prompts before they reach the LLM.
- **Input Sanitization**: Cleanses blood report and menu text to prevent data leakage or malformed requests.
- **Response Validation**: Uses Zod to ensure AI outputs strictly follow the required clinical schemas.

## 💻 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org)
- **AI Engine**: [Google Gemini 2.5 Pro](https://ai.google.dev/) (Free Tier optimized)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) with Persistence
- **Parsing**: `pdf-parse` & `pdfjs-dist` for robust document processing
- **Styling**: Vanilla CSS & Tailwind CSS 4.0
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Validation**: [Zod](https://zod.dev/)

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- A Google AI (Gemini) API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Kshitij-KS/GutCheck.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file in the root:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## 🔒 Privacy & Security
GutCheck is built with a **Zero-Persistence Backend**. 
- **Blood reports** are processed in-memory and discarded.
- **Clinical profiles** are stored in your browser's `localStorage`.
- **Menu data** is processed through the API but never logged or stored.

---
Built with ❤️ for better metabolic health.
