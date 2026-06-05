import React, { useState } from 'react';
import { 
  Calendar, Clock, Plus, Check, X, ChevronLeft, ChevronRight, 
  Users, Video, MapPin, Edit2, Trash2 
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addDays } from 'date-fns';

interface AvailabilitySlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface MeetingRequest {
  id: string;
  fromUser: string;
  fromAvatar: string;
  toUser: string;
  date: string;
  time: string;
  topic: string;
  status: 'pending' | 'accepted' | 'declined';
  type: 'video' | 'in-person';
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  attendees: string[];
  type: 'video' | 'in-person';
  location?: string;
}

const INITIAL_AVAILABILITY: AvailabilitySlot[] = [
  { id: 'a1', date: '2026-06-08', startTime: '09:00', endTime: '12:00' },
  { id: 'a2', date: '2026-06-10', startTime: '14:00', endTime: '17:00' },
  { id: 'a3', date: '2026-06-12', startTime: '10:00', endTime: '13:00' },
  { id: 'a4', date: '2026-06-15', startTime: '09:00', endTime: '11:00' },
];

const INITIAL_REQUESTS: MeetingRequest[] = [
  { id: 'r1', fromUser: 'Michael Rodriguez', fromAvatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg', toUser: 'You', date: '2026-06-09', time: '10:00 AM', topic: 'Series A Funding Discussion', status: 'pending', type: 'video' },
  { id: 'r2', fromUser: 'Jennifer Lee', fromAvatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg', toUser: 'You', date: '2026-06-11', time: '2:00 PM', topic: 'Clean Energy Partnership', status: 'pending', type: 'in-person' },
  { id: 'r3', fromUser: 'Robert Torres', fromAvatar: 'https://images.pexels.com/photos/834863/pexels-photo-834863.jpeg', toUser: 'You', date: '2026-06-06', time: '11:00 AM', topic: 'Product Demo', status: 'accepted', type: 'video' },
];

const INITIAL_MEETINGS: Meeting[] = [
  { id: 'm1', title: 'Quarterly Review with Board', date: '2026-06-06', time: '11:00 AM', duration: '1 hour', attendees: ['Robert Torres', 'You'], type: 'video' },
  { id: 'm2', title: 'Pitch Deck Walkthrough', date: '2026-06-13', time: '3:00 PM', duration: '45 min', attendees: ['Michael Rodriguez', 'You'], type: 'video' },
  { id: 'm3', title: 'Investor Networking Event', date: '2026-06-18', time: '6:00 PM', duration: '2 hours', attendees: ['Multiple Investors', 'You'], type: 'in-person', location: 'Grand Ballroom, SF' },
];

export const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 5, 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2026, 5, 6));
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(INITIAL_AVAILABILITY);
  const [requests, setRequests] = useState<MeetingRequest[]>(INITIAL_REQUESTS);
  const [meetings, setMeetings] = useState<Meeting[]>(INITIAL_MEETINGS);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [showNewMeeting, setShowNewMeeting] = useState(false);
  const [newSlot, setNewSlot] = useState({ date: '', startTime: '09:00', endTime: '17:00' });
  const [newMeeting, setNewMeeting] = useState({ title: '', date: '', time: '10:00', duration: '30 min', type: 'video' as 'video' | 'in-person', attendee: '' });

  if (!user) return null;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayOfWeek = monthStart.getDay();
  const paddingDays = Array.from({ length: startDayOfWeek }, (_, i) => addDays(monthStart, -(startDayOfWeek - i)));

  const hasEvent = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return meetings.some(m => m.date === dateStr) || 
           availability.some(a => a.date === dateStr) ||
           requests.some(r => r.date === dateStr && r.status !== 'declined');
  };

  const getDateEvents = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return {
      meetings: meetings.filter(m => m.date === dateStr),
      slots: availability.filter(a => a.date === dateStr),
      requests: requests.filter(r => r.date === dateStr),
    };
  };

  const handleAcceptRequest = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'accepted' as const } : r));
    const req = requests.find(r => r.id === id);
    if (req) {
      setMeetings(prev => [...prev, {
        id: `m${Date.now()}`,
        title: req.topic,
        date: req.date,
        time: req.time,
        duration: '30 min',
        attendees: [req.fromUser, 'You'],
        type: req.type,
      }]);
    }
  };

  const handleDeclineRequest = (id: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'declined' as const } : r));
  };

  const handleAddSlot = () => {
    if (newSlot.date && newSlot.startTime && newSlot.endTime) {
      setAvailability(prev => [...prev, { id: `a${Date.now()}`, ...newSlot }]);
      setNewSlot({ date: '', startTime: '09:00', endTime: '17:00' });
      setShowAddSlot(false);
    }
  };

  const handleRemoveSlot = (id: string) => {
    setAvailability(prev => prev.filter(s => s.id !== id));
  };

  const handleAddMeeting = () => {
    if (newMeeting.title && newMeeting.date && newMeeting.time) {
      setMeetings(prev => [...prev, {
        id: `m${Date.now()}`,
        title: newMeeting.title,
        date: newMeeting.date,
        time: newMeeting.time,
        duration: newMeeting.duration,
        attendees: [newMeeting.attendee || 'TBD', 'You'],
        type: newMeeting.type,
      }]);
      setNewMeeting({ title: '', date: '', time: '10:00', duration: '30 min', type: 'video', attendee: '' });
      setShowNewMeeting(false);
    }
  };

  const selectedDateEvents = selectedDate ? getDateEvents(selectedDate) : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meeting Scheduler</h1>
          <p className="text-gray-600">Manage your availability and meetings</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddSlot(true)} leftIcon={<Clock size={18} />} variant="outline">
            Add Availability
          </Button>
          <Button onClick={() => setShowNewMeeting(true)} leftIcon={<Plus size={18} />}>
            Schedule Meeting
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-md">
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-lg font-semibold text-gray-900">{format(currentMonth, 'MMMM yyyy')}</h2>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-gray-100 rounded-md">
                  <ChevronRight size={20} />
                </button>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">{day}</div>
                ))}
                {paddingDays.map((day, i) => (
                  <div key={`pad-${i}`} className="h-16 p-1 text-gray-300 text-sm">{format(day, 'd')}</div>
                ))}
                {daysInMonth.map(day => {
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const hasEvents = hasEvent(day);
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`h-16 p-1 text-sm rounded-lg transition-all relative flex flex-col items-center
                        ${isSelected ? 'bg-primary-100 ring-2 ring-primary-500' : 'hover:bg-gray-50'}
                        ${isToday(day) ? 'font-bold text-primary-600' : isSameMonth(day, currentMonth) ? 'text-gray-900' : 'text-gray-400'}
                      `}
                    >
                      <span>{format(day, 'd')}</span>
                      {hasEvents && (
                        <div className="flex gap-0.5 mt-1">
                          {meetings.some(m => m.date === format(day, 'yyyy-MM-dd')) && <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />}
                          {availability.some(a => a.date === format(day, 'yyyy-MM-dd')) && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                          {requests.some(r => r.date === format(day, 'yyyy-MM-dd') && r.status === 'pending') && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary-500" /> Meetings</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Available</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Pending</span>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Selected Date Details */}
        <div className="space-y-4">
          {selectedDate && (
            <Card>
              <CardHeader>
                <h3 className="text-md font-semibold text-gray-900">{format(selectedDate, 'EEEE, MMMM d')}</h3>
              </CardHeader>
              <CardBody className="space-y-3">
                {selectedDateEvents && selectedDateEvents.meetings.length > 0 ? (
                  selectedDateEvents.meetings.map(meeting => (
                    <div key={meeting.id} className="p-3 bg-primary-50 rounded-lg border border-primary-100">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-primary-900">{meeting.title}</h4>
                        {meeting.type === 'video' ? <Video size={14} className="text-primary-600" /> : <MapPin size={14} className="text-primary-600" />}
                      </div>
                      <p className="text-xs text-primary-700 mt-1">{meeting.time} · {meeting.duration}</p>
                      <p className="text-xs text-primary-600 mt-1">{meeting.attendees.join(', ')}</p>
                      {meeting.location && <p className="text-xs text-primary-600 mt-1">📍 {meeting.location}</p>}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No meetings scheduled</p>
                )}
                {selectedDateEvents && selectedDateEvents.slots.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase mb-2">Available Slots</p>
                    {selectedDateEvents.slots.map(slot => (
                      <div key={slot.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-100 mb-1">
                        <span className="text-sm text-green-800">{slot.startTime} – {slot.endTime}</span>
                        <button onClick={() => handleRemoveSlot(slot.id)} className="text-green-600 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          {/* Upcoming Meetings Summary */}
          <Card>
            <CardHeader>
              <h3 className="text-md font-semibold text-gray-900">Upcoming Meetings</h3>
            </CardHeader>
            <CardBody className="space-y-2">
              {meetings.slice(0, 5).map(m => (
                <div key={m.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    {m.type === 'video' ? <Video size={16} className="text-primary-600" /> : <MapPin size={16} className="text-primary-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{m.title}</p>
                    <p className="text-xs text-gray-500">{format(new Date(m.date), 'MMM d')} · {m.time}</p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Meeting Requests */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Meeting Requests</h2>
        </CardHeader>
        <CardBody>
          {requests.filter(r => r.status === 'pending').length === 0 ? (
            <p className="text-center text-gray-500 py-4">No pending meeting requests</p>
          ) : (
            <div className="space-y-3">
              {requests.filter(r => r.status === 'pending').map(req => (
                <div key={req.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="flex items-center gap-3">
                    <img src={req.fromAvatar} alt={req.fromUser} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{req.fromUser}</p>
                      <p className="text-sm text-gray-600">{req.topic}</p>
                      <p className="text-xs text-gray-500">{req.date} at {req.time} · {req.type === 'video' ? '📹 Video Call' : '📍 In Person'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleAcceptRequest(req.id)} leftIcon={<Check size={14} />}>Accept</Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeclineRequest(req.id)} leftIcon={<X size={14} />}>Decline</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {requests.filter(r => r.status !== 'pending').length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">Past Responses</p>
              {requests.filter(r => r.status !== 'pending').map(req => (
                <div key={req.id} className="flex items-center justify-between p-3 rounded-lg mb-1">
                  <div className="flex items-center gap-3">
                    <img src={req.fromAvatar} alt={req.fromUser} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <p className="text-sm text-gray-700">{req.fromUser} – {req.topic}</p>
                      <p className="text-xs text-gray-500">{req.date} at {req.time}</p>
                    </div>
                  </div>
                  <Badge variant={req.status === 'accepted' ? 'success' : 'error'}>{req.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Add Availability Modal */}
      {showAddSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddSlot(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Availability Slot</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={newSlot.date} onChange={e => setNewSlot({ ...newSlot, date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input type="time" value={newSlot.startTime} onChange={e => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input type="time" value={newSlot.endTime} onChange={e => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleAddSlot} fullWidth>Add Slot</Button>
                <Button variant="outline" onClick={() => setShowAddSlot(false)} fullWidth>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Meeting Modal */}
      {showNewMeeting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowNewMeeting(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule New Meeting</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title</label>
                <input type="text" value={newMeeting.title} onChange={e => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  placeholder="e.g., Funding Discussion" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attendee</label>
                <input type="text" value={newMeeting.attendee} onChange={e => setNewMeeting({ ...newMeeting, attendee: e.target.value })}
                  placeholder="e.g., Michael Rodriguez" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={newMeeting.date} onChange={e => setNewMeeting({ ...newMeeting, date: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input type="time" value={newMeeting.time} onChange={e => setNewMeeting({ ...newMeeting, time: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <select value={newMeeting.duration} onChange={e => setNewMeeting({ ...newMeeting, duration: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    <option>15 min</option><option>30 min</option><option>45 min</option><option>1 hour</option><option>2 hours</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={newMeeting.type} onChange={e => setNewMeeting({ ...newMeeting, type: e.target.value as 'video' | 'in-person' })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                    <option value="video">Video Call</option><option value="in-person">In Person</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleAddMeeting} fullWidth>Schedule</Button>
                <Button variant="outline" onClick={() => setShowNewMeeting(false)} fullWidth>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
