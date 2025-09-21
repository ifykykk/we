import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MessageSquare, AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { getStudentToken } from '../../utils/auth';

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
  rejectionReason?: string;
  counsellorInfo: {
    firstName: string;
    lastName: string;
    email: string;
    department: string;
  };
  createdAt: string;
  confirmedAt?: string;
  rejectedAt?: string;
  completedAt?: string;
}

const MyBookings: React.FC = () => {
  const { user } = useUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // Check if user is logged in
      if (!user) {
        setError('Please log in to view your appointments');
        return;
      }
      
      // Get simple token
      const token = await getStudentToken();
      
      const response = await fetch('http://localhost:3000/api/bookings/my-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        setError('Failed to fetch bookings');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      // Check if user is logged in
      if (!user) {
        setError('Please log in to cancel appointments');
        return;
      }
      
      // Get simple token
      const token = await getStudentToken();
      
      const response = await fetch(`http://localhost:3000/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchBookings(); // Refresh the list
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to cancel booking');
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
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
        <p className="text-gray-600 mt-2">Track and manage your counseling appointments</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No appointments yet</h3>
          <p className="text-gray-600 mb-4">You haven't booked any counseling sessions yet.</p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Book Your First Appointment
          </button>
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
                        Appointment with {booking.counsellorInfo.firstName} {booking.counsellorInfo.lastName}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span className="ml-1 capitalize">{booking.status}</span>
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

                    <div className="text-sm text-gray-600 mb-3">
                      <p><strong>Department:</strong> {booking.counsellorInfo.department}</p>
                      <p><strong>Ticket ID:</strong> <span className="font-mono bg-gray-100 px-2 py-1 rounded">{booking.ticketId}</span></p>
                    </div>

                    <div className="text-sm text-gray-600">
                      <p><strong>Reason:</strong> {booking.reason}</p>
                      {booking.notes && (
                        <p className="mt-1"><strong>Notes:</strong> {booking.notes}</p>
                      )}
                    </div>

                    {booking.status === 'rejected' && booking.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">
                          <strong>Rejection Reason:</strong> {booking.rejectionReason}
                        </p>
                      </div>
                    )}

                    {booking.status === 'confirmed' && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          <CheckCircle className="h-4 w-4 inline mr-2" />
                          Your appointment has been confirmed! Please join at the scheduled time.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowDetails(true);
                      }}
                      className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Details
                    </button>

                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <button
                        onClick={() => cancelBooking(booking._id)}
                        className="flex items-center px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Booked: {formatDateTime(booking.createdAt)}</span>
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

      {/* Booking Details Modal */}
      {showDetails && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Appointment Details</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Status and Ticket */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(selectedBooking.status)}`}>
                      {getStatusIcon(selectedBooking.status)}
                      <span className="ml-1 capitalize">{selectedBooking.status}</span>
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyColor(selectedBooking.urgency)}`}>
                      {selectedBooking.urgency.toUpperCase()} PRIORITY
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>Ticket ID:</strong> <span className="font-mono bg-white px-2 py-1 rounded">{selectedBooking.ticketId}</span>
                  </p>
                </div>

                {/* Counsellor Information */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Counsellor Information</h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="font-medium text-blue-900">
                      {selectedBooking.counsellorInfo.firstName} {selectedBooking.counsellorInfo.lastName}
                    </p>
                    <p className="text-sm text-blue-700">{selectedBooking.counsellorInfo.department}</p>
                    <p className="text-sm text-blue-600">{selectedBooking.counsellorInfo.email}</p>
                  </div>
                </div>

                {/* Schedule Information */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Schedule</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-gray-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Date</p>
                        <p className="text-sm text-gray-600">{formatDate(selectedBooking.appointmentDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Clock className="h-5 w-5 text-gray-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Time</p>
                        <p className="text-sm text-gray-600">{selectedBooking.appointmentTime}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Session Details */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Session Details</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 mb-1">Mode</p>
                      <p className="text-sm text-gray-600 capitalize">{selectedBooking.mode} Session</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 mb-1">Reason for Appointment</p>
                      <p className="text-sm text-gray-600">{selectedBooking.reason}</p>
                    </div>
                    {selectedBooking.notes && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-900 mb-1">Additional Notes</p>
                        <p className="text-sm text-gray-600">{selectedBooking.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status-specific Information */}
                {selectedBooking.status === 'rejected' && selectedBooking.rejectionReason && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Rejection Details</h3>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">{selectedBooking.rejectionReason}</p>
                    </div>
                  </div>
                )}

                {selectedBooking.status === 'confirmed' && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Appointment Confirmed</h3>
                    <p className="text-sm text-green-800">
                      Your appointment has been confirmed. Please be available at the scheduled time.
                      {selectedBooking.mode === 'online' && ' You will receive joining instructions via email.'}
                    </p>
                  </div>
                )}

                {/* Timeline */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Timeline</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Booked</span>
                      <span className="font-medium">{formatDateTime(selectedBooking.createdAt)}</span>
                    </div>
                    {selectedBooking.confirmedAt && (
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-green-600">Confirmed</span>
                        <span className="font-medium">{formatDateTime(selectedBooking.confirmedAt)}</span>
                      </div>
                    )}
                    {selectedBooking.rejectedAt && (
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-red-600">Rejected</span>
                        <span className="font-medium">{formatDateTime(selectedBooking.rejectedAt)}</span>
                      </div>
                    )}
                    {selectedBooking.completedAt && (
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-blue-600">Completed</span>
                        <span className="font-medium">{formatDateTime(selectedBooking.completedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex space-x-3">
                  {(selectedBooking.status === 'pending' || selectedBooking.status === 'confirmed') && (
                    <button
                      onClick={() => {
                        cancelBooking(selectedBooking._id);
                        setShowDetails(false);
                      }}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Appointment
                    </button>
                  )}
                  <button
                    onClick={() => setShowDetails(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;