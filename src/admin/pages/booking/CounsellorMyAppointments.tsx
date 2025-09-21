import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MessageSquare, CheckCircle, XCircle, Filter, Search } from 'lucide-react';

interface Booking {
  _id: string;
  ticketId: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled';
  mode: 'online' | 'offline';
  reason: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  notes: string;
  counsellorNotes?: string;
  studentInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  confirmedAt?: string;
  completedAt?: string;
}

const CounsellorMyAppointments: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  useEffect(() => {
    fetchMyBookings();
  }, [filter, dateFilter]);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      let url = 'http://localhost:3000/api/admin/counsellor/my-bookings';
      const params = new URLSearchParams();
      if (filter) params.append('status', filter);
      if (dateFilter) params.append('date', dateFilter);
      if (params.toString()) url += '?' + params.toString();
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        setError('Failed to fetch appointments');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async (bookingId: string) => {
    const notes = prompt('Add completion notes (optional):');
    
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`http://localhost:3000/api/admin/counsellor/booking/${bookingId}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          counsellorNotes: notes || '',
          followUpRequired: false
        })
      });

      if (response.ok) {
        fetchMyBookings();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to complete appointment');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-8">Loading your appointments...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-600 mt-2">Manage your scheduled counseling sessions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          {(filter || dateFilter) && (
            <button
              onClick={() => {
                setFilter('');
                setDateFilter('');
              }}
              className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments found</h3>
          <p className="text-gray-600">No appointments match your current filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {booking.studentInfo.firstName} {booking.studentInfo.lastName}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(booking.urgency)}`}>
                        {booking.urgency.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="text-sm">{formatDate(booking.appointmentDate)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="text-sm">{booking.appointmentTime}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        <span className="text-sm capitalize">{booking.mode}</span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 mb-4">
                      <p><strong>Student Email:</strong> {booking.studentInfo.email}</p>
                      <p><strong>Ticket ID:</strong> <span className="font-mono bg-gray-100 px-2 py-1 rounded">{booking.ticketId}</span></p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Reason:</h4>
                      <p className="text-sm text-gray-700">{booking.reason}</p>
                      {booking.notes && (
                        <div className="mt-3">
                          <h4 className="font-medium text-gray-900 mb-2">Student Notes:</h4>
                          <p className="text-sm text-gray-700">{booking.notes}</p>
                        </div>
                      )}
                      {booking.counsellorNotes && (
                        <div className="mt-3">
                          <h4 className="font-medium text-gray-900 mb-2">My Notes:</h4>
                          <p className="text-sm text-gray-700">{booking.counsellorNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    {booking.status === 'confirmed' && (
                      <button
                        onClick={() => markComplete(booking._id)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Created: {formatDateTime(booking.createdAt)}</span>
                    {booking.confirmedAt && (
                      <span>Confirmed: {formatDateTime(booking.confirmedAt)}</span>
                    )}
                    {booking.completedAt && (
                      <span>Completed: {formatDateTime(booking.completedAt)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CounsellorMyAppointments;