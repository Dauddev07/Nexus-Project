import React, { useState, useRef, useEffect } from 'react';
import {
  Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Monitor,
  MessageCircle, Users, Settings, Maximize, Minimize, Copy, Check
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

type CallStatus = 'idle' | 'calling' | 'connected' | 'ended';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isMuted: boolean;
  isVideoOn: boolean;
}

const MOCK_CONTACTS = [
  { id: 'i1', name: 'Michael Rodriguez', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg', role: 'Investor' },
  { id: 'i2', name: 'Jennifer Lee', avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg', role: 'Investor' },
  { id: 'e1', name: 'Sarah Johnson', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg', role: 'Entrepreneur' },
  { id: 'e3', name: 'Maya Patel', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg', role: 'Entrepreneur' },
];

export const VideoCallPage: React.FC = () => {
  const { user } = useAuth();
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [selectedContact, setSelectedContact] = useState<typeof MOCK_CONTACTS[0] | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ from: string; text: string; time: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [meetingId] = useState(`NXS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (callStatus === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (callStatus === 'idle') setCallDuration(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callStatus]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startCall = () => {
    if (!selectedContact) return;
    setCallStatus('calling');
    setTimeout(() => setCallStatus('connected'), 2500);
  };

  const endCall = () => {
    setCallStatus('ended');
    setIsScreenSharing(false);
    setTimeout(() => {
      setCallStatus('idle');
      setCallDuration(0);
    }, 2000);
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, {
      from: user?.name || 'You',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setChatInput('');
    // Simulate a reply
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        from: selectedContact?.name || 'Participant',
        text: 'Sounds good! Let me share my screen to show you the details.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }, 2000);
  };

  const copyMeetingId = () => {
    navigator.clipboard?.writeText(meetingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Calls</h1>
          <p className="text-gray-600">Connect face-to-face with investors and entrepreneurs</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Meeting ID: <code className="bg-gray-100 px-2 py-0.5 rounded font-mono">{meetingId}</code></span>
          <button onClick={copyMeetingId} className="p-1 hover:bg-gray-100 rounded">
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Video Area */}
        <div className={`${showChat ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <Card className="overflow-hidden">
            <div className={`relative bg-gray-900 ${isFullscreen ? 'fixed inset-0 z-50' : 'rounded-t-lg'}`} style={{ minHeight: isFullscreen ? '100vh' : '480px' }}>
              
              {callStatus === 'idle' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <Video size={40} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold">Ready to start a call?</h3>
                  <p className="text-gray-400 mt-2">Select a contact and click Start Call</p>
                </div>
              )}

              {callStatus === 'calling' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <img src={selectedContact?.avatar} alt="" className="w-24 h-24 rounded-full object-cover mb-4 ring-4 ring-primary-500 animate-pulse" />
                  <h3 className="text-xl font-semibold">Calling {selectedContact?.name}...</h3>
                  <p className="text-gray-400 mt-2">Waiting for response</p>
                  <div className="mt-6">
                    <button onClick={endCall} className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                      <PhoneOff size={24} />
                    </button>
                  </div>
                </div>
              )}

              {callStatus === 'connected' && (
                <>
                  {/* Remote Video (mock) */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    {isScreenSharing ? (
                      <div className="w-full h-full bg-white p-8 flex items-center justify-center">
                        <div className="text-center">
                          <Monitor size={64} className="text-primary-500 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-gray-900">Screen Sharing Active</h3>
                          <p className="text-gray-500 mt-2">Your screen is being shared with participants</p>
                          <div className="mt-4 bg-gray-100 rounded-lg p-6 max-w-md mx-auto">
                            <div className="h-3 bg-gray-300 rounded mb-2 w-3/4" />
                            <div className="h-3 bg-gray-300 rounded mb-2 w-full" />
                            <div className="h-3 bg-gray-300 rounded mb-2 w-5/6" />
                            <div className="h-20 bg-primary-100 rounded mt-4" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <img src={selectedContact?.avatar} alt="" className="w-32 h-32 rounded-full object-cover" />
                    )}
                  </div>

                  {/* Self video (PIP) */}
                  <div className="absolute bottom-4 right-4 w-40 h-28 bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600 shadow-lg">
                    {isVideoOn ? (
                      <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                        <img src={user.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <VideoOff size={20} className="text-gray-500" />
                      </div>
                    )}
                    <div className="absolute bottom-1 left-1 text-white text-xs bg-black/50 px-1.5 py-0.5 rounded">You</div>
                  </div>

                  {/* Call info */}
                  <div className="absolute top-4 left-4 flex items-center gap-3">
                    <div className="bg-black/50 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      {formatDuration(callDuration)}
                    </div>
                    <div className="bg-black/50 text-white px-3 py-1.5 rounded-lg text-sm">
                      {selectedContact?.name}
                    </div>
                  </div>

                  {/* Fullscreen toggle */}
                  <button onClick={() => setIsFullscreen(!isFullscreen)} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-lg hover:bg-black/70">
                    {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                  </button>
                </>
              )}

              {callStatus === 'ended' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <PhoneOff size={48} className="text-red-400 mb-4" />
                  <h3 className="text-xl font-semibold">Call Ended</h3>
                  <p className="text-gray-400 mt-2">Duration: {formatDuration(callDuration)}</p>
                </div>
              )}

              {/* Controls */}
              {callStatus === 'connected' && (
                <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-sm px-6 py-3 rounded-2xl`}>
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
                  >
                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                  <button
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${!isVideoOn ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
                  >
                    {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
                  </button>
                  <button
                    onClick={() => setIsScreenSharing(!isScreenSharing)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isScreenSharing ? 'bg-primary-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
                  >
                    <Monitor size={20} />
                  </button>
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${showChat ? 'bg-primary-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
                  >
                    <MessageCircle size={20} />
                  </button>
                  <button
                    onClick={endCall}
                    className="w-14 h-12 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                  >
                    <PhoneOff size={20} />
                  </button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Chat Panel (shown during call) */}
        {showChat && callStatus === 'connected' && (
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col" style={{ minHeight: '480px' }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">In-Call Chat</h3>
                  <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-gray-600"><MessageCircle size={16} /></button>
                </div>
              </CardHeader>
              <CardBody className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-3 mb-3">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`${msg.from === (user?.name || 'You') ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block px-3 py-2 rounded-lg text-sm max-w-[80%] ${msg.from === (user?.name || 'You') ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
                        {msg.text}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{msg.time}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text" value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <Button size="sm" onClick={sendChatMessage}>Send</Button>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Contact List (shown when not in call) */}
        {callStatus === 'idle' && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-gray-900">Start a Call</h3>
              </CardHeader>
              <CardBody className="space-y-2">
                {MOCK_CONTACTS.map(contact => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                      selectedContact?.id === contact.id ? 'bg-primary-50 ring-2 ring-primary-500' : 'hover:bg-gray-50'
                    }`}
                  >
                    <img src={contact.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                      <p className="text-xs text-gray-500">{contact.role}</p>
                    </div>
                  </button>
                ))}
                {selectedContact && (
                  <Button onClick={startCall} fullWidth leftIcon={<Phone size={16} />} className="mt-3">
                    Call {selectedContact.name.split(' ')[0]}
                  </Button>
                )}
              </CardBody>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
