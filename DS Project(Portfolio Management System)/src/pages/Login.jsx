import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { WalletCards, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { authenticate, setSession } from '../services/localStore';

export default function Login() {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = e => {
    e.preventDefault();
    setError('');

    const result = authenticate(email, password);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSession(result.user);
    window.location.href = '/';
  };

  return (
    <AuthLayout>
      <form onSubmit={submit}>
        <h1>Welcome back</h1>
        <p className="muted">
          Monitor your complete investment portfolio in one place.
        </p>

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
          <div className="password">
            <input
              required
              minLength="6"
              type={show ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShow(!show)}>
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </label>

        {error && <div className="notice">{error}</div>}

        <div className="form-row">
          <label className="check">
            <input type="checkbox" />
            Remember me
          </label>
          <span className="muted">Backend password recovery later</span>
        </div>

        <button className="primary full">Sign in</button>

        <p className="center muted">
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

function AuthLayout({ children }) {
  return (
    <div className="auth">
      <div className="auth-visual">
        <div className="auth-logo">
          <WalletCards /> PortfolioX
        </div>

        <div className="auth-copy">
          <span className="eyebrow">ONE VIEW. EVERY INVESTMENT.</span>
          <h2>
            Know what you own.
            <br />
            <em>Understand how it moves.</em>
          </h2>
          <p>
            Import statements from your investment platforms and monitor
            stocks, ETFs, mutual funds, bonds and crypto from one clean
            dashboard.
          </p>

          <div className="trust">
            <ShieldCheck size={18} />
            Your credentials stay with you. PortfolioX is a monitoring
            system, not a trading platform.
          </div>
        </div>
      </div>

      <div className="auth-form">{children}</div>
    </div>
  );
}
