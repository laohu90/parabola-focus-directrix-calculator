# Parabola Focus & Directrix Calculator (抛物线焦点与准线求解器)

> A modern, production-grade educational calculator for analytic geometry, conic sections, and high school math. Features detailed completing-the-square step-by-step breakdowns, opening direction mnemonics, an interactive Cartesian canvas, and full multilingual support (English, Spanish, French, Portuguese, Chinese).

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-blue.svg)](https://www.typescriptlang.org/)
[![KaTeX](https://img.shields.io/badge/LaTeX-KaTeX-00d1b2.svg)](https://katex.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)

---

## 🌟 Key Features

- **Smart Natural Equation Parser**: Type or paste equations directly (`y^2 - 4y - 8x + 12 = 0`, `y^2 = 8x`, `y = 0.25x^2`, `(y - 2)^2 = 8(x - 1)`).
- **Completing the Square Breakdown**: Step-by-step algebraic expansion, leading coefficient normalization, adding $(b/2)^2$ to both sides, and standard vertex form extraction.
- **Direction Rules & Avoid Common Traps**:
  - *Rule 1*: Linear variable sets the axis, coefficient sign sets the opening direction.
  - *Rule 2*: Focus is always inside the parabola; directrix is behind the vertex.
  - *Rule 3*: Both vertex-to-focus and vertex-to-directrix distances are $\frac{p}{2}$ (not $p$).
- **Interactive Geometric Coordinate Board**:
  - Live SVG Cartesian grid with dynamic parabola curve, Focus $F$, Directrix line $l$, Axis of Symmetry, and Latus Rectum chord.
  - Moveable Point $P$ demonstrating the primary definition of a parabola: $|PF| = d(P, \text{Directrix})$.
- **Full Multilingual i18n System**:
  - 🇺🇸 **English** (Default)
  - 🇪🇸 **Español** (Spanish)
  - 🇫🇷 **Français** (French)
  - 🇧🇷 **Português** (Portuguese)
  - 🇨🇳 **中文** (Simplified Chinese)
- **Comprehensive Analytic Geometry Outputs**:
  - Vertex $V(h, k)$
  - Focus $F(x_f, y_f)$
  - Directrix equation (e.g. $x = -\frac{p}{2} + h$)
  - Axis of symmetry equation
  - Focal parameter $p$ and semi-distance $\frac{p}{2}$
  - Latus rectum length ($2p$) and endpoints $L_1, L_2$
  - Domain and Range
  - Eccentricity $e = 1$
- **Print / PDF Export**: One-click print-optimized clean solution view for homework and teaching.
- **Interactive Quiz**: 5-question rapid self-check test on opening direction and focus calculation.
- **High-Yield FAQ & SEO Keywords**: Pre-structured for Google search visibility and educational content discovery.

---

## 🚀 Quick Start

### Prerequisites
- Node.js $\ge 18$
- npm $\ge 9$

### Installation

```bash
git clone https://github.com/laohu90/parabola-focus-directrix-calculator.git
cd parabola-focus-directrix-calculator

npm install
```

### Running Locally

```bash
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Building for Production

```bash
npm run build
```

---

## 📐 Supported Equation Types

| Form | Example | Converted Standard Form |
| :--- | :--- | :--- |
| **Standard Origin** | `y^2 = 8x` | $y^2 = 8x \implies p = 4, \frac{p}{2} = 2$ |
| **Negative Coefficient** | `x^2 = -6y` | $x^2 = -6y \implies \text{Opens Down}$ |
| **General Quadratic** | `y^2 - 4y - 8x + 12 = 0` | $(y - 2)^2 = 8(x - 1)$ |
| **Leading Coeff $\ne 1$** | `2y^2 - 8y - 16x + 24 = 0` | $(y - 2)^2 = 8(x - 1)$ |
| **Function Form** | `y = 0.25x^2` | $x^2 = 4y \implies F(0, 1)$ |
| **Vertex Form** | `(x + 3)^2 = -4(y - 2)` | Vertex $(-3, 2)$, Opens Down |

---

## 📄 License

Apache-2.0 License. Free for students, educators, and commercial deployment.
