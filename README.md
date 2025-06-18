# ASCII-GEN 🎨

A modern, cross-platform ASCII art generator desktop application built with Electron and Next.js. Convert images to beautiful ASCII art with advanced customization options.

[![Electron](https://img.shields.io/badge/Electron-36.4.0-47848F?style=for-the-badge&logo=electron)](https://electronjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Latest-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)

## 🚀 Features

- **Cross-platform**: Windows and Linux support
- **Real-time preview**: See changes instantly as you adjust settings
- **Advanced customization**: Brightness, contrast, blur, zoom, dithering, and more
- **Multiple ASCII charsets**: Detailed, simple, and custom character sets
- **Edge detection**: Various edge detection algorithms
- **Export options**: Copy to clipboard or download as PNG
- **Dark/Light theme**: Automatic theme switching
- **Drag & Drop**: Easy image upload with drag and drop support

## 🏗️ Architecture

### Frontend Stack
- **Next.js 15.2.4** - React framework with static export
- **React 18.2.0** - UI library with hooks
- **TypeScript 5.0** - Type-safe JavaScript
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

### Desktop Framework
- **Electron 36.4.0** - Cross-platform desktop app framework
- **Electron Builder** - Packaging and distribution

### Key Libraries
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Class Variance Authority** - Component variant management
- **Tailwind Merge** - Utility class merging
- **Sonner** - Toast notifications

## 📦 Installation

### Prerequisites
- Node.js (Latest LTS version)
- npm or pnpm

### Development Setup
```bash
# Clone the repository
git clone <your-repo-url>
cd ascii-generator

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
```

### Building for Production
```bash
# Build for Windows (Portable)
npm run package:win

# Build for Linux (AppImage & DEB)
npm run package:linux
```

## 🎯 Usage

1. **Upload Image**: Drag and drop an image or click to browse
2. **Adjust Settings**: Use the sliders and options to customize your ASCII art
3. **Preview**: See real-time changes in the preview area
4. **Export**: Copy to clipboard or download as PNG

### Available Settings

- **ASCII Width**: Control the width of the output
- **Brightness**: Adjust image brightness
- **Contrast**: Modify image contrast
- **Blur**: Apply Gaussian blur
- **Zoom**: Scale the image
- **Dithering**: Enable/disable dithering with multiple algorithms
- **Invert**: Invert the image colors
- **Character Set**: Choose from detailed, simple, or custom characters
- **Edge Detection**: Apply various edge detection methods

## 🛠️ Development

### Project Structure
```
ascii-generator/
├── app/                 # Next.js app directory
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Main ASCII generator component
├── components/         # Reusable UI components
│   └── ui/            # Radix UI components
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── assets/            # App icons and resources
├── main.js            # Electron main process
└── package.json       # Dependencies and scripts
```

### Available Scripts
- `npm run dev` - Start development server with Electron
- `npm run dev:web` - Start Next.js development server only
- `npm run build:web` - Build Next.js application
- `npm run package:win` - Package for Windows
- `npm run package:linux` - Package for Linux
- `npm run clean` - Clean build artifacts

## 🎨 Customization

The app uses a comprehensive design system with:
- **Shadcn/ui components** - Pre-built, accessible components
- **CSS Variables** - Theme-aware styling
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations

## 📱 Platform Support

- ✅ Windows x64 (Portable executable)
- 🔄 Linux (Coming soon)
- 🔄 macOS (Can be added with electron-builder)


## 📄 License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Saganaki22** - [GitHub Profile](https://github.com/Saganaki22/)

---

⭐ Star this repository if you find it useful! 
