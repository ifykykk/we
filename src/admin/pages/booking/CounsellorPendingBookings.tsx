import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MessageSquare, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

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
  studentInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

const CounsellorPendingBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'confirm' | 'reject'>('confirm');
  const [actionNote, setActionNote] = useState('');

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const fetchPendingBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch('http://localhost:3000/api/admin/counsellor/pending-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        setError('Failed to fetch pending bookings');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (bookingId: string, action: 'confirm' | 'reject', note?: string) => {
    try {
      setProcessingId(bookingId);
      const token = localStorage.getItem('adminToken');
      
      const endpoint = action === 'confirm' ? 'confirm' : 'reject';
      const body = action === 'confirm' 
        ? { counsellorNotes: note }
        : { rejectionReason: note };

      const response = await fetch(`http://localhost:3000/api/admin/counsellor/booking/${bookingId}/${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        fetchPendingBookings(); // Refresh the list
        setShowActionModal(false);
        setActionNote('');
        setSelectedBooking(null);
      } else {
        const data = await response.json();
        setError(data.error || `Failed to ${action} booking`);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  const openActionModal = (booking: Booking, action: 'confirm' | 'reject') => {
    setSelectedBooking(booking);
    setActionType(action);
    setShowActionModal(true);
    setActionNote('');
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
        <div className="text-center py-8">Loading pending bookings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pending Appointment Requests</h1>
        <p className="text-gray-600 mt-2">Review and respond to student appointment requests</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No pending requests</h3>
          <p className="text-gray-600">You don't have any pending appointment requests at the moment.</p>
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
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(booking.urgency)}`}>
                        {booking.urgency.toUpperCase()} PRIORITY
                      </span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        PENDING REVIEW
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
                      <p><strong>Requested:</strong> {formatDateTime(booking.createdAt)}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Reason for Appointment:</h4>
                      <p className="text-sm text-gray-700">{booking.reason}</p>
                      {booking.notes && (
                        <div className="mt-3">
                          <h4 className="font-medium text-gray-900 mb-2">Additional Notes:</h4>
                          <p className="text-sm text-gray-700">{booking.notes}</p>
                        </div>
                      )}
                    </div>

                    {booking.urgency === 'critical' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center">
                          <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                          <p className="text-sm text-red-800 font-medium">
                            Critical Priority - This student requires immediate attention
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-3 ml-6">
                    <button
                      onClick={() => openActionModal(booking, 'confirm')}
                      disabled={processingId === booking._id}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {processingId === booking._id ? 'Processing...' : 'Confirm'}
                    </button>
                    
                    <button
                      onClick={() => openActionModal(booking, 'reject')}
                      disabled={processingId === booking._id}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {actionType === 'confirm' ? 'Confirm Appointment' : 'Reject Appointment'}
                </h3>
                <p className="text-gray-600">
                  Student: {selectedBooking.studentInfo.firstName} {selectedBooking.studentInfo.lastName}
                </p>
                <p className="text-sm text-gray-500">
                  {formatDate(selectedBooking.appointmentDate)} at {selectedBooking.appointmentTime}
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {actionType === 'confirm' ? 'Confirmation Notes (Optional)' : 'Rejection Reason (Required)'}
                </label>
                <textarea
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={
                    actionType === 'confirm'
                      ? 'Any specific instructions or notes for the student...'
                      : 'Please provide a reason for rejecting this appointment...'
                  }
                />
              </div>

              {actionType === 'reject' && !actionNote.trim() && (
                <p className="text-sm text-red-600 mb-4">
                  Rejection reason is required
                </p>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    if (actionType === 'reject' && !actionNote.trim()) {
                      setError('Rejection reason is required');
                      return;
                    }
                    handleAction(selectedBooking._id, actionType, actionNote.trim() || undefined);
                  }}
                  disabled={processingId === selectedBooking._id}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                    actionType === 'confirm'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  } disabled:opacity-50`}
                >
                  {processingId === selectedBooking._id
                    ? 'Processing...'
                    : actionType === 'confirm'
                    ? 'Confirm Appointment'
                    : 'Reject Appointment'
                  }
                </button>
                
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    setActionNote('');
                    setSelectedBooking(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounsellorPendingBookings;