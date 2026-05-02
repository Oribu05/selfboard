# SelfBoard 🚀

**SelfBoard** is a minimalist, premium personal dashboard designed to give you a clean and focused view of your day. It combines real-time weather, task management, and dynamic data visualization with a unique live-sync feature.


## ✨ Features

- **Live CSV Syncing**: Link any CSV file from your project folder, and the dashboard will update the charts automatically as soon as you save changes to the file.
- **Smart Data Parsing**: Automatically detects whether your CSV uses commas (`,`) or semicolons (`;`).
- **Dynamic Charts**: Beautiful, animated line charts powered by Chart.js with custom gradients.
- **Editable Titles**: Click and type directly on chart titles to customize them. Your changes are saved automatically to `localStorage`.
- **Personal Weather**: Real-time weather information based on your current geolocation.
- **Task Manager**: A sleek, glassmorphism-style to-do list to keep track of your daily goals.
- **Premium UI**: Built with modern web standards, featuring dark mode, glassmorphism effects, and smooth transitions.

## 🛠️ Tech Stack

- **[Vite](https://vitejs.dev/)**: Next-generation frontend tooling for a fast development experience.
- **[Tailwind CSS v4](https://tailwindcss.com/)**: The latest version of the utility-first CSS framework for rapid UI development.
- **[Chart.js](https://www.chartjs.org/)**: Flexible JavaScript charting for designers & developers.
- **[Remix Icons](https://remixicon.com/)**: A set of open-source neutral style system symbols.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Oribu05/selfboard.git
   cd selfboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

## 📊 How to use Live Charts

1. **Upload**: Use the "Upload" button to select a CSV file (e.g., the included `finances.csv` or `expenses.csv`).
2. **Auto-Link**: The dashboard will automatically link the file. 
3. **Live Edit**: Open the linked CSV file in your code editor. When you modify a value and save the file, the dashboard will reflect the change within 3 seconds—**no refresh needed!**
4. **Custom Titles**: Click on "Add title to your graph..." to set a custom name for your data. It will be saved for your next visit.

