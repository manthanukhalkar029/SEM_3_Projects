import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { WalletCards } from 'lucide-react';
import { createUser, setSession } from '../services/localStore';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const submit = e => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    const result = createUser({ name, email, password });

    if (!result.ok) {
      setError(result.error);
      return;
    }

    // A newly created account intentionally starts with a blank portfolio.
    setSession({ name, email });
    window.location.href = '/';
  };

  return (
    <div className="auth simple-auth">
      <div className="auth-form">
        <div className="auth-brand">
          <WalletCards size={22} /> Portfolio<span>X</span>
        </div>

        <form onSubmit={submit}>
          <h1>Create your account</h1>
          <p className="muted">
            Start monitoring all your investments in one place.
          </p>

          <label>
            Full name
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
            />
          </label>

          <label>
            Email address
            <input
              required
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password
            <input
              required
              minLength="6"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Create a password"
            />
          </label>

          <label>
            Confirm password
            <input
              required
              minLength="6"
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat your password"
            />
          </label>

          <label className="check">
            <input required type="checkbox" />
            I agree to the terms and privacy policy.
          </label>

          {error && <div className="notice">{error}</div>}

          <button className="primary full">Create account</button>

          <p className="center muted">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
