# Synapse

Synapse is a full-stack web application featuring a Node.js/Express backend and a React (Vite) frontend. It provides real-time chat, room management, authentication, and collaborative tools.

## Features

- User authentication (signup, login, protected routes)
- Real-time chat and voice messaging
- Room creation and management
- Task management
- PDF analysis
- Role-based access control
- Error handling middleware

## Tech Stack

- **Frontend:** React, Vite, CSS
- **Backend:** Node.js, Express
- **Database:** (Add your DB info here)

## Project Structure

```
backend/
  config/           # Database connections
  controllers/      # Route controllers
  middleware/       # Express middleware
  models/           # Data models
  routes/           # API routes
  server.js         # Entry point
synapse-frontend/
  src/
    components/     # React components
    hooks/          # Custom hooks
    pages/          # Page components
    styles/         # CSS files
    utils/          # Utility functions
  public/           # Static assets
  App.jsx           # Main app
  main.jsx          # Entry point
  ...
```

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
cd synapse-frontend
npm install
npm run dev
```

## Environment Variables
- Configure your database and secret keys in the backend `config` folder.

## Scripts
- `npm start` (backend): Starts the Express server
- `npm run dev` (frontend): Starts the Vite dev server

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)
