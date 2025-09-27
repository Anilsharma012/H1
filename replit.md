# Vyomkesh Industries - Investment Platform

## Project Overview
A full-stack investment platform built with React, TypeScript, Vite, Express, and MongoDB. Features investment plans, user authentication, KYC verification, and admin dashboard.

## Architecture
- **Frontend**: React + TypeScript + Vite (port 5000)
- **Backend**: Express.js with MongoDB (integrated into Vite dev server)
- **UI**: Radix UI components with Tailwind CSS
- **Authentication**: JWT-based with bcrypt password hashing

## Recent Changes
- ✅ Configured Vite dev server for Replit environment (allowedHosts: all, port 5000)
- ✅ Updated CORS configuration to allow Replit domains
- ✅ Set up development workflow on port 5000
- ✅ Configured deployment for autoscale with npm build/start
- ✅ Project successfully running in demo mode (without MongoDB connection)

## Key Features
- Investment plans with configurable returns
- User registration/login system
- KYC document verification
- Admin dashboard for user/plan management
- Responsive UI with modern design
- CSV export functionality

## Development Setup
- Frontend and backend run together via `npm run dev`
- Application accessible at localhost:5000 in development
- Demo mode active (no database required for basic functionality)
- All dependencies installed and configured for Replit environment

## User Preferences
- Prefers complete, working applications over placeholder content
- Focus on functionality and proper configuration
- Ensure all components work in Replit's proxy environment