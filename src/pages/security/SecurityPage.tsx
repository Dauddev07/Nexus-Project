import React, { useState, useRef, useEffect } from 'react';
import {
  Shield, Lock, Key, Smartphone, Eye, EyeOff, CheckCircle, AlertTriangle,
  XCircle, Fingerprint, Mail, Settings, LogOut
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';

const checkPasswordStrength = (password: string): { score: number; label: string; color: string; checks: { label: string; passed: boolean }[] } => {
  const checks = [
    { label: 'At least 8 characters', passed: password.length >= 8 },
    { label: 'Contains uppercase letter', passed: /[A-Z]/.test(password) },
    { label: 'Contains lowercase letter', passed: /[a-z]/.test(password) },
    { label: 'Contains a number', passed: /\d/.test(password) },
    { label: 'Contains special character', passed: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
    { label: 'At least 12 characters', passed: password.length >= 12 },
  ];
  const score = checks.filter(c => c.passed).length;
  let label = 'Very Weak';
  let color = 'bg-red-500';
  if (score >= 6) { label = 'Very Strong'; color = 'bg-green-500'; }
  else if (score >= 5) { label = 'Strong'; color = 'bg-green-400'; }
  else if (score >= 4) { label = 'Good'; color = 'bg-yellow-500'; }
  else if (score >= 3) { label = 'Fair'; color = 'bg-orange-500'; }
  else if (score >= 2) { label = 'Weak'; color = 'bg-red-400'; }
  return { score, label, color, checks };
};

export const SecurityPage: React.FC = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [otpVerified, setOtpVerified] = useState(false);
  const [passwordChanged, setPasswordChanged] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [activeSessions, setActiveSessions] = useState([
    { id: 's1', device: 'Chrome on Windows', ip: '192.168.1.1', lastActive: 'Now', current: true },
    { id: 's2', device: 'Safari on iPhone', ip: '10.0.0.5', lastActive: '2 hours ago', current: false },
    { id: 's3', device: 'Firefox on MacOS', ip: '172.16.0.3', lastActive: '1 day ago', current: false },
  ]);

  if (!user) return null;

  const passwordStrength = checkPasswordStrength(newPassword);
  const passwordsMatch = confirmPassword && newPassword === confirmPassword;

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

  const verifyOtp = () => {
    const code = otpValues.join('');
    if (code.length === 6) {
      setOtpVerified(true);
      setIs2FAEnabled(true);
      setTimeout(() => { setShow2FASetup(false); setOtpVerified(false); }, 2000);
    }
  };

  const handleChangePassword = () => {
    if (newPassword && passwordsMatch && passwordStrength.score >= 4) {
      setPasswordChanged(true);
      setTimeout(() => {
        setPasswordChanged(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }, 2000);
    }
  };

  const terminateSession = (id: string) => {
    setActiveSessions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Security & Access Control</h1>
        <p className="text-gray-600">Manage your account security and authentication settings</p>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={is2FAEnabled ? 'bg-green-50 border border-green-100' : 'bg-amber-50 border border-amber-100'}>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${is2FAEnabled ? 'bg-green-200' : 'bg-amber-200'}`}>
                <Shield size={18} className={is2FAEnabled ? 'text-green-600' : 'text-amber-600'} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Security Level</p>
                <p className={`text-lg font-bold ${is2FAEnabled ? 'text-green-700' : 'text-amber-700'}`}>
                  {is2FAEnabled ? 'High' : 'Medium'}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary-100 rounded-lg"><Smartphone size={18} className="text-primary-600" /></div>
              <div>
                <p className="text-xs text-gray-500">Two-Factor Auth</p>
                <p className="text-lg font-bold text-gray-900">{is2FAEnabled ? 'Enabled' : 'Disabled'}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 rounded-lg"><Key size={18} className="text-blue-600" /></div>
              <div>
                <p className="text-xs text-gray-500">Role Access</p>
                <p className="text-lg font-bold text-gray-900 capitalize">{user.role}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Change Password */}
        <Card>
          <CardHeader><h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Lock size={18} /> Change Password</h2></CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <div className="relative">
                <input type={showCurrentPw ? 'text' : 'password'} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                <button onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input type={showNewPw ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                <button onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Password Strength Meter */}
              {newPassword && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Password Strength</span>
                    <span className={`text-xs font-medium ${passwordStrength.score >= 4 ? 'text-green-600' : passwordStrength.score >= 3 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.score / 6) * 100}%` }} />
                  </div>
                  <div className="mt-2 space-y-1">
                    {passwordStrength.checks.map((check, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        {check.passed ? <CheckCircle size={12} className="text-green-500" /> : <XCircle size={12} className="text-gray-300" />}
                        <span className={check.passed ? 'text-green-600' : 'text-gray-400'}>{check.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${confirmPassword ? (passwordsMatch ? 'border-green-500' : 'border-red-500') : 'border-gray-300'}`} />
              {confirmPassword && !passwordsMatch && <p className="text-xs text-red-500 mt-1">Passwords do not match</p>}
              {confirmPassword && passwordsMatch && <p className="text-xs text-green-500 mt-1">Passwords match</p>}
            </div>
            {passwordChanged ? (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <CheckCircle size={18} /><span className="text-sm font-medium">Password changed successfully!</span>
              </div>
            ) : (
              <Button onClick={handleChangePassword} disabled={!passwordsMatch || passwordStrength.score < 4} fullWidth>
                Update Password
              </Button>
            )}
          </CardBody>
        </Card>

        {/* Two-Factor Authentication */}
        <Card>
          <CardHeader><h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Smartphone size={18} /> Two-Factor Authentication</h2></CardHeader>
          <CardBody>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-700">Status: <span className={`font-medium ${is2FAEnabled ? 'text-green-600' : 'text-gray-500'}`}>{is2FAEnabled ? 'Enabled' : 'Disabled'}</span></p>
                <p className="text-xs text-gray-500 mt-1">Add an extra layer of security to your account</p>
              </div>
              <Badge variant={is2FAEnabled ? 'success' : 'gray'}>{is2FAEnabled ? 'Active' : 'Inactive'}</Badge>
            </div>

            {!show2FASetup ? (
              <Button onClick={() => { setShow2FASetup(true); setOtpValues(['', '', '', '', '', '']); setOtpVerified(false); }}
                variant={is2FAEnabled ? 'outline' : 'primary'} fullWidth leftIcon={<Key size={16} />}>
                {is2FAEnabled ? 'Reconfigure 2FA' : 'Enable 2FA'}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="w-32 h-32 bg-white border-2 border-gray-300 rounded-lg mx-auto mb-3 flex items-center justify-center">
                    <div className="grid grid-cols-4 gap-1 p-2">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className={`w-4 h-4 ${Math.random() > 0.5 ? 'bg-gray-900' : 'bg-white'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Scan QR code with your authenticator app</p>
                  <p className="text-xs text-gray-400 mt-1 font-mono">Manual key: JBSW Y3DP EHPK 3PXP</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3 text-center">Enter the 6-digit code from your app</p>
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
                        className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    ))}
                  </div>
                </div>

                {otpVerified ? (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg justify-center">
                    <CheckCircle size={18} /><span className="text-sm font-medium">2FA enabled successfully!</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={verifyOtp} fullWidth disabled={otpValues.some(v => !v)}>Verify & Enable</Button>
                    <Button variant="outline" onClick={() => setShow2FASetup(false)} fullWidth>Cancel</Button>
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Role-Based Access */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Settings size={18} /> Role-Based Access Control</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-4 rounded-lg border-2 ${user.role === 'investor' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Investor Dashboard</h3>
                {user.role === 'investor' && <Badge variant="primary">Your Role</Badge>}
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> View & search startups</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Send collaboration requests</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Fund startups & manage wallet</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Access deal documents</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Schedule meetings</li>
              </ul>
            </div>
            <div className={`p-4 rounded-lg border-2 ${user.role === 'entrepreneur' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Entrepreneur Dashboard</h3>
                {user.role === 'entrepreneur' && <Badge variant="primary">Your Role</Badge>}
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Manage startup profile</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Accept/decline collaborations</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Receive funding & deposits</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Upload & sign documents</li>
                <li className="flex items-center gap-2"><CheckCircle size={14} className="text-green-500" /> Schedule investor meetings</li>
              </ul>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader><h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Fingerprint size={18} /> Active Sessions</h2></CardHeader>
        <CardBody>
          <div className="space-y-3">
            {activeSessions.map(session => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${session.current ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{session.device}</p>
                    <p className="text-xs text-gray-500">{session.ip} · {session.lastActive}</p>
                  </div>
                </div>
                {session.current ? (
                  <Badge variant="success">Current</Badge>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => terminateSession(session.id)} leftIcon={<LogOut size={14} />}>
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
