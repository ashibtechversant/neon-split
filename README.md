# Neon Split :: JSON Difference Finder

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-19.0-61dafb.svg)
![Vite](https://img.shields.io/badge/vite-7.0-646cff.svg)

Neon Split is a modernized, "eye-feasting" diff checker built for developers who need deep insight into JSON payload changes. It goes beyond simple text comparison by offering intelligent JSON parsing, canonicalization, and multiple visualization modes.

## ✨ Key Features

- **Intelligent JSON Parsing**: Uses [`json5`](https://json5.org/) to parse loose JSON (unquoted keys, trailing commas, single quotes), making it easier to paste directly from Javascript code.
- **Auto-Formatting & Canonicalization**: Automatically sorts object keys and formats JSON to ensure you are comparing content, not whitespace or key order.
- **Order-Agnostic Array Comparison**: Optional "Compare arrays by value" mode sorts arrays before diffing, ignoring item order differences.
- **Multiple View Modes**:
  - **Split View**: GitHub-style side-by-side text diff.
  - **Unified View**: GitHub-style single column diff stream.
  - **Tree View**: Collapsible, hierarchical view for deep nesting.
  - **Table View**: Standard row-by-row comparison.
- **Deep Linking & Export**: Share diffs (coming soon) or export results as JSON.
- **Modern Aesthetic**: Glassmorphism design with a dark, high-contrast theme using JetBrains Mono for maximum readability.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/YOUR_USERNAME/json-diff-checker.git
    cd json-diff-checker
    ```

2.  Install dependencies:

    ```bash
    npm install
    # or
    yarn install
    ```

3.  Start the development server:

    ```bash
    npm run dev
    # or
    yarn dev
    ```

    Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## 🛠 Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite
- **Language**: JavaScript (ESModules)
- **Styling**: Vanilla CSS (CSS Variables, Flexbox/Grid)
- **Core Libraries**:
  - `diff`: For text-based diffing algorithms.
  - `json5`: For lenient JSON parsing.
  - `gh-pages`: For deployment (optional).

## 📦 Deployment

This project is configured for easy deployment to **GitHub Pages**.

1.  **Push to GitHub**: Push your code to a GitHub repository.
2.  **Enable Pages**: Go to **Settings > Pages** in your repo.
3.  **Source**: Select **GitHub Actions**.

The included `.github/workflows/deploy.yml` workflow will automatically build and deploy the `dist` folder to your GitHub Pages site on every push to `main`.

## 🤝 Contributing

Contributions are welcome! Please fork the repository and open a pull request with your improvements.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

> Built with 💜 by Ashib Techversant
