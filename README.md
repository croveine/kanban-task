# Kanban Board Task Management

A full-stack Kanban board application built with React, NestJS, and MongoDB.

## Features

- Create, update, and delete boards
- Three columns: To Do, In Progress, Done
- Add, update, and delete cards
- Drag and drop cards between columns
- Search boards by name or ID
- Responsive Material-UI design

## Tech Stack

### Frontend
- React with TypeScript
- Redux Toolkit for state management
- Material-UI for components
- Vite for build tooling
- React Beautiful DnD for drag and drop

### Backend
- NestJS with TypeScript
- MongoDB for data storage
- RESTful API architecture

### Development Tools
- ESLint and Prettier for code quality
- GitHub Actions for CI/CD
- Docker for containerization

## Getting Started

### Prerequisites
- Node.js 18 or later
- MongoDB
- Docker (optional)

### Development

1. Clone the repository:

git clone <repository-url>
cd kanban-test-task

2. Install dependencies:

# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install

3. Start the development servers:

# Frontend (in frontend directory)
npm run start:dev

# Backend (in backend directory)
npm run start:dev

### Docker Deployment

Build and run the entire stack:

docker-compose up --build

The application will be available at:
- Frontend: http://localhost:80
- Backend API: http://localhost:3000

## Project Structure

kanban-test-task/
├── frontend/           # React frontend application
│   ├── src/           # Source code
│   ├── public/        # Static files
│   └── Dockerfile     # Frontend container configuration
├── backend/           # NestJS backend application
│   ├── src/          # Source code
│   └── Dockerfile    # Backend container configuration
└── docker-compose.yml # Container orchestration

## Available Scripts

### Frontend
- `npm run start:dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Backend
- `npm run start:dev` - Start development server
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request