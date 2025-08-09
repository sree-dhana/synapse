# Synapse Frontend

A modern, responsive React application for real-time collaboration and learning. Built with React, Vite, and modern CSS.

## Features

- 🎨 **Modern UI/UX**: Beautiful, responsive design with smooth animations
- 🔐 **Authentication**: Secure login/register with JWT tokens
- 👥 **Role-based Access**: Different experiences for students and teachers
- 🚀 **Room Management**: Create and join collaboration rooms
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- ⚡ **Fast Performance**: Built with Vite for optimal development experience

## Tech Stack

- **React 19** - Latest React with hooks and modern patterns
- **Vite** - Fast build tool and development server
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API communication
- **CSS3** - Modern styling with Flexbox and Grid
- **Google Fonts** - Inter font family for clean typography

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on `http://localhost:5000`

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend/synapse-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/
│   ├── Header.jsx          # Navigation header component
│   └── Header.css
├── pages/
│   ├── HomePage.jsx        # Landing page
│   ├── HomePage.css
│   ├── Login.jsx          # Authentication page
│   ├── Register.jsx       # Registration page
│   ├── Auth.css           # Shared auth styles
│   ├── Dashboard.jsx      # User dashboard
│   ├── Dashboard.css
│   ├── Room.jsx           # Collaboration room
│   └── Room.css
├── App.jsx                # Main app component
├── App.css               # Global app styles
├── index.css             # Base styles and utilities
└── main.jsx              # App entry point
```

## Key Features

### Authentication
- Secure login and registration
- JWT token management
- Automatic token refresh
- Protected routes

### Dashboard
- User profile display
- Quick room creation
- Join existing rooms
- Recent activity tracking

### Room Collaboration
- Real-time room joining
- Participant management
- Room code sharing
- Collaboration workspace (placeholder for future features)

### Responsive Design
- Mobile-first approach
- Breakpoints for tablet and desktop
- Touch-friendly interactions
- Optimized for all screen sizes

## API Integration

The frontend communicates with your backend API at `http://localhost:5000`:

- **Authentication**: `/api/mainpage/login`, `/api/mainpage/register`
- **Room Management**: `/api/room/createroom`, `/api/room/joinroom`
- **User Dashboard**: `/api/mainpage/studentDashboard`, `/api/mainpage/teacherDashboard`

## Styling

The application uses a modern design system with:

- **Color Palette**: Purple gradient theme (#667eea to #764ba2)
- **Typography**: Inter font family
- **Spacing**: Consistent 8px grid system
- **Shadows**: Subtle elevation with box-shadows
- **Animations**: Smooth transitions and hover effects

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- Use functional components with hooks
- Follow React best practices
- Maintain consistent naming conventions
- Write clean, readable CSS

## Future Enhancements

- Real-time chat functionality
- Video/audio calling integration
- File sharing capabilities
- Interactive whiteboard
- Screen sharing
- Push notifications
- Offline support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Synapse collaboration platform.

---

Built with ❤️ using React and modern web technologies.
