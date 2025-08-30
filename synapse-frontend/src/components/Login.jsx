import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { login } from "../api"
import { setAuth, clearAuth } from "../utils/auth"
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
    
    if (!email.trim() || !password) {
      setError("Please enter both email and password")
      setLoading(false)
      return
    }
    
    try {
      const res = await login({ email: email.trim(), password })
      
      if (!res.data.accessToken || !res.data.username) {
        throw new Error("Invalid response from server")
      }
      
      setAuth(res.data.accessToken, res.data.username, res.data.role || "student")
      
      localStorage.setItem('userEmail', res.data.email)
      
      if (onLogin) onLogin()
      navigate('/dashboard')
    } catch (err) {
      console.error("Login error:", err)
      
      clearAuth()
      
      if (err.response?.status === 401) {
        setError("Incorrect password. Please check your credentials.")
      } else if (err.response?.status === 404) {
        setError("User not found. Please sign up first or check your email.")
      } else if (err.response?.status === 400) {
        setError("Please fill in all required fields.")
      } else if (err.response?.status === 403) {
        setError("Account access denied. Please contact administrator.")
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError("Login failed. Please check your credentials and try again.")
      }
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
