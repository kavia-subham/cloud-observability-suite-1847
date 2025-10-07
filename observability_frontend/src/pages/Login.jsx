import React, { useState } from 'react';
import { usePostLoginRedirect, useAuth } from '../state/AuthContext';
import { UICard as Card, UIInput as Input, UIButton as Button } from '../components';

/**
 * Simple login page with mock authentication using AuthContext.
 * - On submit, calls login() and redirects back to originally requested route if available.
 */
// PUBLIC_INTERFACE
export default function Login() {
  const { login } = useAuth();
  const redirect = usePostLoginRedirect();
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email || undefined, pwd || undefined);
      redirect();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <Card className="w-full max-w-md p-8">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="text-white/70 mb-6">Access your observability workspace</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            label="Email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            autoComplete="current-password"
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing in...' : 'Continue'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
