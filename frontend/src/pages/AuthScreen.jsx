import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Activity, Mail, Lock, User, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { toast } from 'sonner';

const AuthScreen = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Email and password are required');
      return;
    }
    
    if (!isLogin && !formData.name) {
      toast.error('Name is required for registration');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password, name: formData.name };

      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        // Store user data and token
        localStorage.setItem('tokhealth_token', data.data.token);
        localStorage.setItem('tokhealth_user', JSON.stringify(data.data));
        toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
        onLogin(data.data);
      } else {
        toast.error(data.detail || data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100 flex items-center justify-center p-4" data-testid="auth-screen">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Activity className="w-10 h-10 text-sky-600" />
            <h1 className="text-3xl font-bold">
              <span className="text-sky-600">TOK</span>
              <span className="text-slate-800">HEALTH</span>
            </h1>
          </div>
          <p className="text-slate-600 text-sm">Keep People Alive</p>
        </div>

        {/* Auth Card */}
        <Card className="bg-white/90 backdrop-blur border-sky-200 shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-slate-800 text-xl">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </CardTitle>
            <p className="text-slate-500 text-sm">
              {isLogin ? 'Sign in to your health profile' : 'Start your health journey'}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label className="text-slate-700">Your Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="pl-10 bg-white border-slate-200 focus:border-sky-400"
                      data-testid="auth-name-input"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-slate-700">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="pl-10 bg-white border-slate-200 focus:border-sky-400"
                    data-testid="auth-email-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="pl-10 bg-white border-slate-200 focus:border-sky-400"
                    data-testid="auth-password-input"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white py-6"
                data-testid="auth-submit-button"
              >
                {loading ? (
                  <Activity className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? <LogIn className="w-5 h-5 mr-2" /> : <UserPlus className="w-5 h-5 mr-2" />}
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sky-600 hover:text-sky-700 text-sm font-medium"
                data-testid="auth-toggle-button"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-sky-600/70">
          Your health data is private and secure
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
