# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Guida Universitaria is a Next.js application for discovering and filtering Italian university courses. It uses Firebase as the backend database and includes a course discovery system with advanced filtering capabilities.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `./start_services.sh` - Complete development setup (pipelines + Firebase emulators)
- `./stop_services.sh` - Stop all development services

## Claude Commands

- `/setup-dev` - Complete development setup (pipelines + Firebase emulators)
- `/stop-dev` - Stop all development services (including Next.js)

## Project Architecture

### Tech Stack
- **Frontend**: Next.js 14 with TypeScript and React 18
- **Styling**: Tailwind CSS with DaisyUI components
- **Database**: Firebase Firestore
- **Icons**: FontAwesome and React Icons
- **State Management**: React hooks and SWR for data fetching

### Key Directories
- `src/app/` - Next.js App Router pages
- `src/components/` - Reusable React components
- `src/styles/` - Global CSS and Tailwind configuration
- `pipelines/` - Data processing scripts and course data
- `functions/` - Firebase Cloud Functions
- `public/images/uni_images/` - University logos and hero images

### Core Components Architecture

**Course System**:
- `CourseGrid` - Main course listing component with Firebase integration
- `CourseCard` - Individual course display with university logos and metadata
- `FilterBar` - Advanced filtering by discipline, location, and university
- Filter data fetchers (`getTopDisciplines`, `getTopLocations`, `getTopUniversities`)

**Data Structure**:
Courses are stored in Firestore with nested objects for:
- `discipline` (id, name)
- `location` (id, name) 
- `university` (id, name)
- `degree_type`, `program_type`, `language`

### Firebase Configuration

- Development uses local emulators (ports: Firestore 8080, Auth 9099, Storage 9199, Functions 5001)
- Production uses environment variables for Firebase config
- Emulator connection is automatic in development mode

### Styling System

Custom Tailwind theme with:
- Primary colors: `#3e763d` (verde-alloro: `#2d572c`)
- Dark mode support via `next-themes`
- DaisyUI component library integration
- Custom breakpoints and shadows

### Current Development Focus

Based on README TODO:
- Course filtering system (implemented)
- Search functionality (basic implementation exists)
- Future: Pagination, user authentication, saved courses

## Important Notes

- University images are dynamically loaded with fallbacks to placeholder images
- Course cards use random hero images from `/images/uni_images/uni_heroes/`
- Logo loading includes existence checks with fallback to placeholder
- Mobile-responsive design with Tailwind grid system