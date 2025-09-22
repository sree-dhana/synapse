# Synapse Frontend

This is the frontend for the Synapse project, built with React and Vite. It provides the user interface for authentication, chat, room management, PDF analysis, and more.

## Features
- User authentication (login, signup, protected routes)
- Real-time chat and voice messaging
- Room creation and management
- Task management
- PDF analysis
- Modern, responsive UI

## Tech Stack
- React
- Vite
- CSS

## Project Structure
```
synapse-frontend/
  public/             # Static assets
  src/
    api.js           # API calls
    App.jsx          # Main app component
    main.jsx         # Entry point
    components/      # UI components
    hooks/           # Custom React hooks
    pages/           # Page components
    styles/          # CSS files
    utils/           # Utility functions
```

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn

### Setup
```bash
cd synapse-frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173` by default.

## Scripts
- `npm run dev`: Start the Vite development server
- `npm run build`: Build for production
- `npm run preview`: Preview the production build

## Environment Variables
- Configure API endpoints and other settings in a `.env` file if needed.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](../LICENSE)
