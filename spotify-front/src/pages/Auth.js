import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function Auth() {
  const [form, setForm] = useState({ email: '', password: '', username: '' });
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLogin ? '/login' : '/register';
    try {
      const res = await API.post(url, form);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        alert('Connecté !');
        navigate('/spotify');  // <-- redirection ici
      } else {
        alert(res.data.message || 'Succès');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur');
    }
  };

  return (
    <div>
      <h2>{isLogin ? 'Connexion' : 'Inscription'}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input placeholder="Username" value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })} />
        )}
        <input placeholder="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Password" type="password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Pas de compte ? S'inscrire" : "Déjà inscrit ? Se connecter"}
      </button>
    </div>
  );
}
