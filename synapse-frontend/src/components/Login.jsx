import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { login } from "../api"
import "../styles/login.css"

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await login({ email: email.trim(), password })
      localStorage.setItem("token", res.data.accessToken)
      if (onLogin) onLogin()
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Sign in to your Synapse account</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
            />
          </div>

          {error && <div className="error-text" style={{color:'#f87171', fontSize:'0.85rem'}}>{error}</div>}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p className="signup-text">
            Don't have an account?
            <a href="/signup" className="signup-link">
              {" "}
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
