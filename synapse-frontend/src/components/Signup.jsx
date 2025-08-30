"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { register, login } from "../api"
import { setAuth } from "../utils/auth"
import "../styles/login.css"

const Signup = ({ onSignup }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    userType: "student",
  })
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState("")
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      setError("Please fill in all required fields")
      return
    }
    
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }
    
    setLoading(true)
    try {
      // Backend expects username,email,password,role
      await register({
        username: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.userType
      })
      
      // Auto login to get token
      const res = await login({ email: formData.email.trim(), password: formData.password })
      
      // Use auth utility to set authentication data
      setAuth(res.data.accessToken, formData.name.trim(), formData.userType)
      
      // Store email from server response for participant identification
      localStorage.setItem('userEmail', res.data.email || formData.email.trim())
      
      if (onSignup) onSignup()
      navigate('/dashboard')
    } catch (err) {
      console.error("Registration error:", err)
      
      // Handle different types of registration errors
      if (err.response?.status === 409) {
        setError("An account with this email already exists. Please login instead.")
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || "Invalid registration data. Please check your information.")
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Registration failed. Please check your information and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Join Synapse</h1>
          <p className="login-subtitle">Create your account to start collaborating and learning</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">I am a:</label>
            <div className="radio-group">
              <div className="radio-option">
                <input
                  type="radio"
                  id="student"
                  name="userType"
                  value="student"
                  checked={formData.userType === "student"}
                  onChange={handleChange}
                />
                <label htmlFor="student" className="radio-label">
                  Student
                </label>
              </div>
              <div className="radio-option">
                <input
                  type="radio"
                  id="teacher"
                  name="userType"
                  value="teacher"
                  checked={formData.userType === "teacher"}
                  onChange={handleChange}
                />
                <label htmlFor="teacher" className="radio-label">
                  Teacher
                </label>
              </div>
            </div>
          </div>

          {error && <div style={{color:'#f87171', fontSize:'0.85rem'}}>{error}</div>}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="login-footer">
          <p className="signup-text">
            Already have an account?{" "}
            <a href="/login" className="signup-link">
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup
