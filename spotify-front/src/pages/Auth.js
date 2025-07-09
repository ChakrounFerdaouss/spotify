import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api'; // Your API import is back!

// --- STYLING ---
const ComponentStyles = () => {
  const styles = `
    /* --- Google Fonts: 'Righteous' for the logo, 'Montserrat' for UI --- */
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Righteous&display=swap');

    /* --- CSS Variables for the "MyMood" theme --- */
    :root {
        --mood-magenta: #e100ff;
        --mood-cyan: #00c2ff;
        --mood-purple: #2c003e;
        --mood-dark: #1a1a1a;
        --mood-light: #f0e6ff;
        --mood-gray: #9b9b9b;
    }

    /* --- The Animated "Mood Ring" Background --- */
    .auth-page-container {
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: 'Montserrat', sans-serif;
        background: linear-gradient(-45deg, var(--mood-purple), var(--mood-magenta), var(--mood-cyan), var(--mood-dark));
        background-size: 400% 400%;
        animation: moodGradient 10s ease infinite;
    }
    @keyframes moodGradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

    /* --- The Glassy Form Box --- */
    .auth-form-container {
        width: 90%;
        max-width: 400px;
        padding: 40px;
        background-color: rgba(0, 0, 0, 0.75);
        border-radius: 12px;
        box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.18);
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    /* --- The "MyMood" Text Logo --- */
    .mymood-logo {
        font-family: 'Righteous', cursive;
        font-size: 3.5rem;
        color: var(--mood-light);
        margin-bottom: 25px;
        letter-spacing: 2px;
        text-shadow: 0 0 10px rgba(225, 0, 255, 0.5);
    }

    /* --- Form Title --- */
    .auth-title { color: var(--mood-light); margin-bottom: 25px; font-size: 1.5rem; font-weight: 400; }

    /* --- Form Elements --- */
    .auth-form { width: 100%; display: flex; flex-direction: column; }
    .auth-input {
        background-color: #2b2b2b; border: 1px solid #444; border-radius: 5px; padding: 14px;
        color: var(--mood-light); font-size: 1rem; margin-bottom: 15px; width: 100%;
        box-sizing: border-box; transition: border-color 0.3s ease;
    }
    .auth-input::placeholder { color: var(--mood-gray); }
    .auth-input:focus { outline: none; border-color: var(--mood-magenta); }

    /* --- Buttons --- */
    .submit-btn {
        color: var(--mood-light); font-weight: 700; font-size: 1rem; border: none;
        border-radius: 500px; padding: 16px; margin-top: 10px; cursor: pointer;
        text-transform: uppercase; letter-spacing: 1px; transition: transform 0.2s ease, box-shadow 0.2s ease;
        background: linear-gradient(90deg, var(--mood-magenta), var(--mood-cyan));
        background-size: 200% 200%;
    }
    .submit-btn:hover { transform: scale(1.05); box-shadow: 0 0 20px rgba(0, 194, 255, 0.5); }
    .divider { height: 1px; width: 100%; background-color: #444; margin: 25px 0; }
    .toggle-btn { background: none; border: none; color: var(--mood-gray); cursor: pointer; font-size: 0.9rem; transition: color 0.3s ease; }
    .toggle-btn:hover { color: var(--mood-light); text-decoration: underline; }
  `;
  return <style>{styles}</style>;
};


// --- YOUR COMPONENT ---
export default function Auth() {
  const [form, setForm] = useState({ email: '', password: '', username: '' });
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  // --- THIS IS YOUR ORIGINAL, FULLY FUNCTIONAL BACKEND LOGIC ---
  const handleSubmit = async (e) => {
    e.preventDefault();
   const url = isLogin ? '/auth/login' : '/auth/register';    try {
      const res = await API.post(url, form);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        alert('Connecté !');
        // You might want to change this to navigate to a new '/mymood' route!
        navigate('/spotify');  
      } else {
        alert(res.data.message || 'Succès');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur');
    }
  };

  return (
    <>
      <ComponentStyles /> {/* This injects all the styles */}

      <div className="auth-page-container">
        <div className="auth-form-container">
          
          <div className="mymood-logo">MyMood</div>

          <h2 className="auth-title">{isLogin ? 'Welcome Back' : 'Create Your Account'}</h2>
          
          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <input
                className="auth-input"
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            )}
            <input
              className="auth-input"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="auth-input"
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button type="submit" className="submit-btn">
              {isLogin ? 'Log In' : 'Sign Up'}
            </button>
          </form>

          <div className="divider"></div>

          <button onClick={() => setIsLogin(!isLogin)} className="toggle-btn">
            {isLogin ? "First time here? Sign Up" : 'Already have an account? Log in'}
          </button>
        </div>
      </div>
    </>
  );
}