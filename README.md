this is an assessment that i completed for ksense tech. i've also included a vue 3 app to display a ui.

## Setup & Installation

Follow these steps to run the code locally:

### 1. 📥 Clone the Repository

```bash
git clone https://github.com/Syed-Codes07/assessment.ksensetech.git
cd assessment.ksensetech
```

### 2. 🛠 Install Node.js & npm

Make sure you have Node.js and npm installed:

```bash
node -v
npm -v
```

> Recommended: Node.js v18+ and npm v9+

### 3. 📦 Install Dependencies

Install the required package (`axios` for HTTP requests):

```bash
npm install axios
```

If you're using TypeScript and haven't initialized a project yet:

```bash
npm init -y
npm install typescript --save-dev
npx tsc --init
```

---

## ▶️ Run the Code

### If Using TypeScript

```bash
npx tsc riskAssessment.ts
node riskAssessment.js
```

### Or, use `ts-node` (optional shortcut):

```bash
npx ts-node riskAssessment.ts
```

---

## 🔐 API Information

This solution uses the KSenseTech assessment API:

- **GET** `/api/patients` (paginated, error-prone)
- **POST** `/api/submit-assessment` (final output submission)
- Authenticated using:  
  `x-api-key: ak_628c56f5c85d072ad97d69aec2b67af697816d2ec87398c2`

---

## 📤 What Gets Submitted?

My solution automatically submits 3 critical lists:

```json
{
  "high_risk_patients": [...],
  "fever_patients": [...],
  "data_quality_issues": [...]
}
```

You can inspect this payload and the submission response directly in the console output after running the script.

---
