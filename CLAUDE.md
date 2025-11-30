# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 application using the App Router, React 19, TypeScript, and Tailwind CSS 4. The project is integrated with shadcn/ui components (New York style) for building the UI.

## Development Commands

```bash
# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Architecture

### Next.js App Router Structure

- Uses the `app/` directory for routing (Next.js 13+ App Router)
- Root layout: [app/layout.tsx](app/layout.tsx) - configures fonts (Geist Sans, Geist Mono) and metadata
- Pages defined in `app/` directory structure

### Styling System

- **Tailwind CSS 4**: Modern version with `@import "tailwindcss"` syntax in [app/globals.css](app/globals.css)
- **CSS Variables**: Uses OKLCH color space for design tokens defined in `:root` and `.dark` selectors
- **Theme Configuration**: Color system uses CSS variables mapped to Tailwind colors via `@theme inline` directive
- **Animations**: Includes `tw-animate-css` for extended animation utilities
- **Dark Mode**: Custom variant `@custom-variant dark (&:is(.dark *))` for class-based dark mode

### Component System

- **shadcn/ui**: Configured in [components.json](components.json) with "new-york" style
- **UI Components**: Located in `components/ui/` directory
- **Component Pattern**: Uses `class-variance-authority` (CVA) for variant-based styling (see [button.tsx](components/ui/button.tsx))
- **Radix UI**: UI primitives like `Slot` for composable components
- **Icons**: Lucide React is the icon library

### Path Aliases

The TypeScript configuration ([tsconfig.json](tsconfig.json)) defines:

```typescript
"paths": {
  "@/*": ["./*"]
}
```

This means:

- `@/components` → root `components/` directory
- `@/lib` → root `lib/` directory
- `@/app` → root `app/` directory
- etc.

shadcn/ui additionally expects these aliases (from [components.json](components.json)):

- `@/components/ui` for UI components
- `@/lib/utils` for utilities
- `@/hooks` for custom hooks

### Utilities

- [lib/utils.ts](lib/utils.ts): Contains `cn()` utility for merging Tailwind classes using `clsx` and `tailwind-merge`

## Code Style and Patterns

### Adding shadcn/ui Components

To add new shadcn/ui components, use the CLI which will place components in the correct location based on [components.json](components.json):

```bash
npx shadcn@latest add [component-name]
```

### Component Styling Pattern

Follow the established pattern from [button.tsx](components/ui/button.tsx):

1. Define variants using `class-variance-authority` (CVA)
2. Support polymorphism with Radix UI `Slot` via `asChild` prop
3. Use the `cn()` utility to merge className props
4. Include `data-slot` attributes for component identification

### TypeScript Configuration

- Strict mode enabled
- JSX mode: `react-jsx` (new JSX transform)
- Module resolution: `bundler` (modern Next.js resolution)
- Target: ES2017

## Package Manager

This project uses `pnpm` (evidenced by [pnpm-lock.yaml](pnpm-lock.yaml)).
