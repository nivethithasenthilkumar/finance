<div align="center">
  <img src="https://raw.githubusercontent.com/nivethithasenthilkumar/finance/nivethitha/budget-app/public/globe.svg" width="100" height="100" alt="Finance App Logo" />
  <h1>✨ Next-Gen Personal Finance & Budgeting App</h1>
  <p><strong>A beautifully designed, AI-powered financial dashboard to track your money, predict your future balance, and roast your spending habits.</strong></p>

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
  [![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](#)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)
  [![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](#)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](#)

</div>

---

## 🌟 Key Features

### 🤖 Context-Aware AI Assistant
* **Speak to Your Money:** Built-in Voice-to-Text and Text-to-Speech synthesis allows you to talk naturally to your financial assistant.
* **Fully Personalized Context:** The AI reads your live income, expenses, budgets, and savings goals to give you *actual* tailored advice instead of generic tips.
* **Friendly Roasting Mode:** Toggle the AI tone to "Roasting & Friendly" and let it jokingly criticize your terrible spending choices like a best friend would.

### 💰 Comprehensive Budget Planner
* **Category Tracking:** Easily categorize your spending (Housing, Food, Entertainment, etc).
* **Live Spending Bars:** Visual progress bars that turn red when you're close to exceeding your budget limit.
* **Goal Tracking:** Set long-term financial goals and watch your progress visually fill up over time.

### 📊 Advanced Dashboard
* **Glassmorphism UI:** Stunning, modern, premium interface designed with smooth micro-animations.
* **Transaction History:** Clean and organized view of all your recent incomes and expenses.
* **Total Balance Tracking:** Instantly see your net worth at a glance.

---

## 🛠️ Technology Stack

**Frontend**
* Next.js (App Router)
* React 18
* Tailwind CSS (Custom color schemes and glass effects)
* Framer Motion (Smooth UI animations)
* Lucide Icons

**Backend**
* Java 17
* Spring Boot 3
* PostgreSQL (NeonDB)
* Hibernate / JPA

**AI Integration**
* Google Gemini 2.5 API (Context-aware generative content)
* Web Speech API (Voice Synthesis and Recognition)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/nivethithasenthilkumar/finance.git
cd finance
```

### 2. Set up the Frontend (Next.js)
```bash
cd budget-app
npm install

# Create a .env.local file and add your Gemini API Key:
# GEMINI_API_KEY=your_api_key_here

npm run dev
```
The frontend will start on `http://localhost:3000`.

### 3. Set up the Backend (Spring Boot)
Ensure you have a PostgreSQL instance running. Update the database credentials in `backend/src/main/resources/application.properties` and then run:
```bash
cd backend
mvn spring-boot:run
```
The backend will start on `http://localhost:8080`.

---

<div align="center">
  <i>Built with ❤️ for better financial habits.</i>
</div>
