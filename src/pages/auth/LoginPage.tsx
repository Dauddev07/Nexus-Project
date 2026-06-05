import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, CircleDollarSign, Building2, LogIn, AlertCircle, Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { UserRole } from '../../types';

type LoginStep = 'credentials' | '2fa';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('entrepreneur');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<LoginStep>('credentials');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    // Move to 2FA step
    setStep('2fa');
  };
  
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newValues = [...otpValues];
    newValues[index] = value.slice(-1);
    setOtpValues(newValues);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };
  
  const handleLogin = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      await login(email, password, role);
      navigate(role === 'entrepreneur' ? '/dashboard/entrepreneur' : '/dashboard/investor');
    } catch (err) {
      setError((err as Error).message);
      setIsLoading(false);
    }
  };
  
  const handleSkip2FA = async () => {
    await handleLogin();
  };
  
  const handleVerify2FA = async () => {
    const code = otpValues.join('');
    if (code.length < 6) {
      setError('Please enter the full 6-digit code');
      return;
    }
    await handleLogin();
  };
  
  // For demo purposes, pre-filled credentials
  const fillDemoCredentials = (userRole: UserRole) => {
    if (userRole === 'entrepreneur') {
      setEmail('sarah@techwave.io');
      setPassword('password123');
    } else {
      setEmail('michael@vcinnovate.com');
      setPassword('password123');
    }
    setRole(userRole);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary-600 rounded-md flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to Business Nexus
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Connect with investors and entrepreneurs
        </p>
        
        {/* Step indicator */}
        <div className="flex items-center justify-center mt-4 gap-2">
          <div className={`w-8 h-1 rounded-full transition-colors ${step === 'credentials' ? 'bg-primary-600' : 'bg-primary-300'}`} />
          <div className={`w-8 h-1 rounded-full transition-colors ${step === '2fa' ? 'bg-primary-600' : 'bg-gray-200'}`} />
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-error-50 border border-error-500 text-error-700 px-4 py-3 rounded-md flex items-start">
              <AlertCircle size={18} className="mr-2 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          {step === 'credentials' ? (
            <>
              <form className="space-y-6" onSubmit={handleCredentialsSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    I am a
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className={`py-3 px-4 border rounded-md flex items-center justify-center transition-colors ${
                        role === 'entrepreneur'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setRole('entrepreneur')}
                    >
                      <Building2 size={18} className="mr-2" />
                      Entrepreneur
                    </button>
                    
                    <button
                      type="button"
                      className={`py-3 px-4 border rounded-md flex items-center justify-center transition-colors ${
                        role === 'investor'
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setRole('investor')}
                    >
                      <CircleDollarSign size={18} className="mr-2" />
                      Investor
                    </button>
                  </div>
                </div>
                
                <Input
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  startAdornment={<User size={18} />}
                />
                
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
                      Forgot your password?
                    </a>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  fullWidth
                  leftIcon={<LogIn size={18} />}
                >
                  Continue
                </Button>
              </form>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Demo Accounts</span>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => fillDemoCredentials('entrepreneur')}
                    leftIcon={<Building2 size={16} />}
                  >
                    Entrepreneur Demo
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => fillDemoCredentials('investor')}
                    leftIcon={<CircleDollarSign size={16} />}
                  >
                    Investor Demo
                  </Button>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or</span>
                  </div>
                </div>
                
                <div className="mt-2 text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                      Sign up
                    </Link>
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* 2FA Step */
            <div className="space-y-6">
              <button onClick={() => { setStep('credentials'); setError(null); }} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                <ArrowLeft size={16} /> Back to credentials
              </button>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield size={28} className="text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500 mt-1">Enter the 6-digit code from your authenticator app</p>
              </div>
              
              <div className="flex justify-center gap-2">
                {otpValues.map((val, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={val}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  />
                ))}
              </div>
              
              <Button
                onClick={handleVerify2FA}
                fullWidth
                isLoading={isLoading}
                leftIcon={<Shield size={18} />}
              >
                Verify & Sign In
              </Button>
              
              <div className="text-center">
                <button onClick={handleSkip2FA} className="text-sm text-primary-600 hover:text-primary-500 font-medium">
                  Skip for now (demo mode)
                </button>
              </div>
              
              <p className="text-xs text-gray-400 text-center">
                Lost your authenticator? Contact support for account recovery.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
