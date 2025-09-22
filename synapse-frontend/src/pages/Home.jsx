import "../styles/home.css"
import { Link } from "react-router-dom"

const Home = () => {
  return (
    <div className="home-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-content">
          <div className="logo">
            <h2>Synapse</h2>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <Link to="/login" className="login-link">Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Connect, Learn, and Collaborate with <span className="highlight">Synapse</span>
            </h1>
            <p className="hero-description">
              The ultimate platform for seamless collaboration and accelerated learning. Join thousands of learners and
              professionals building the future together.
            </p>
            <div className="hero-features">
              <div className="feature-item">
                <span className="feature-icon">🚀</span>
                <span>Real-time Collaboration</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📚</span>
                <span>Interactive Learning</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🌐</span>
                <span>Global Community</span>
              </div>
            </div>
            <Link to="/login" className="cta-button">Get Started</Link>
          </div>
          <div className="hero-visual">
            <div className="floating-card card-1">
              <div className="card-content">
                <h4>Live Sessions</h4>
                <p>Join interactive workshops</p>
              </div>
            </div>
            <div className="floating-card card-2">
              <div className="card-content">
                <h4>Progress Tracking</h4>
                <p>Monitor your learning journey</p>
              </div>
            </div>
            <div className="floating-card card-3">
              <div className="card-content">
                <h4>Team Projects</h4>
                <p>Collaborate on real challenges</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
