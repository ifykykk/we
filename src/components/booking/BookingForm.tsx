import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, MessageSquare, AlertTriangle, CheckCircle, XCircle, Phone, Video } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { getStudentToken } from '../../utils/auth';

interface Counsellor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  profile: {
    specializations: string[];
    biography: string;
    experience: number;
    rating: {
      average: number;
      totalReviews: number;
    };
    isAcceptingBookings: boolean;
    isAvailableOnDate: boolean;
  };
}

interface BookingFormData {
  counsellorId: string;
  appointmentDate: string;
  appointmentTime: string;
  mode: 'online' | 'offline';
  reason: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  notes: string;
}

const BookingForm: React.FC = () => {
  const { user } = useUser();
  const [step, setStep] = useState(1);
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [selectedCounsellor, setSelectedCounsellor] = useState<Counsellor | null>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    counsellorId: '',
    appointmentDate: '',
    appointmentTime: '',
    mode: 'online',
    reason: '',
    urgency: 'medium',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [ticketId, setTicketId] = useState('');

  // Available time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30'
  ];

  // Specialization options with display names
  const specializationOptions = {
    'anxiety_disorders': 'Anxiety Disorders',
    'depression': 'Depression',
    'stress_management': 'Stress Management',
    'academic_pressure': 'Academic Pressure',
    'relationship_counseling': 'Relationship Counseling',
    'career_guidance': 'Career Guidance',
    'trauma_therapy': 'Trauma Therapy',
    'addiction_counseling': 'Addiction Counseling',
    'eating_disorders': 'Eating Disorders',
    'grief_counseling': 'Grief Counseling',
    'anger_management': 'Anger Management',
    'sleep_disorders': 'Sleep Disorders',
    'general_counseling': 'General Counseling'
  };

  useEffect(() => {
    if (user) {
      fetchCounsellors();
    }
  }, [formData.appointmentDate, user]);

  const fetchCounsellors = async () => {
    try {
      setLoading(true);
      // Check if user is logged in
      if (!user) {
        setError('Please log in to book an appointment');
        return;
      }
      
      // Get simple token
      const token = await getStudentToken();
      const url = formData.appointmentDate 
        ? `/api/bookings/counsellors?date=${formData.appointmentDate}`
        : '/api/bookings/counsellors';
      
      const response = await fetch(`http://localhost:3000${url}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCounsellors(data);
      } else {
        setError('Failed to fetch counsellors');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleCounsellorSelect = (counsellor: Counsellor) => {
    setSelectedCounsellor(counsellor);
    setFormData(prev => ({ ...prev, counsellorId: counsellor._id }));
    setStep(2);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setFormData(prev => ({ ...prev, appointmentDate: date, appointmentTime: '' }));
  };

  const submitBooking = async () => {
    try {
      setLoading(true);
      setError('');

      // Check if user is logged in
      if (!user) {
        setError('Please log in to book an appointment');
        return;
      }
      
      // Get simple token
      const token = await getStudentToken();
      const response = await fetch('http://localhost:3000/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTicketId(data.booking.ticketId);
        setStep(4);
      } else {
        setError(data.error || 'Failed to create booking');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.reason.trim()) {
      setError('Please provide a reason for your appointment');
      return;
    }
    submitBooking();
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get maximum date (30 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split('T')[0];
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
          <p className="text-gray-600 mb-6">
            Your appointment has been submitted successfully. Please save your ticket ID for reference.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-700 mb-2">Your Ticket ID:</p>
            <p className="text-xl font-bold text-blue-900">{ticketId}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">Appointment Details:</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Counsellor:</strong> {selectedCounsellor?.firstName} {selectedCounsellor?.lastName}</p>
              <p><strong>Date:</strong> {new Date(formData.appointmentDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {formData.appointmentTime}</p>
              <p><strong>Mode:</strong> {formData.mode === 'online' ? 'Online' : 'In-person'}</p>
              <p><strong>Status:</strong> <span className="text-yellow-600">Pending Approval</span></p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              Your appointment is pending counsellor approval. You will receive an update within 24 hours.
            </p>
          </div>

          <button
            onClick={() => {
              setStep(1);
              setSuccess(false);
              setFormData({
                counsellorId: '',
                appointmentDate: '',
                appointmentTime: '',
                mode: 'online',
                reason: '',
                urgency: 'medium',
                notes: ''
              });
              setSelectedCounsellor(null);
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Book Another Appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg">
        {/* Progress Steps */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="ml-2 text-sm font-medium">Select Counsellor</span>
            </div>
            <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2 text-sm font-medium">Schedule</span>
            </div>
            <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="ml-2 text-sm font-medium">Details</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Select Counsellor */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Select a Counsellor</h2>
              
              {/* Date Pre-filter */}
              <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Optional: Check availability for a specific date
                </label>
                <input
                  type="date"
                  value={formData.appointmentDate}
                  onChange={handleDateChange}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              {loading ? (
                <div className="text-center py-8">Loading counsellors...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {counsellors.map((counsellor) => (
                    <div
                      key={counsellor._id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
                      onClick={() => handleCounsellorSelect(counsellor)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {counsellor.firstName} {counsellor.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">{counsellor.department}</p>
                        </div>
                        {counsellor.profile?.rating?.average > 0 && (
                          <div className="text-sm text-yellow-600">
                            ★ {counsellor.profile.rating.average.toFixed(1)}
                          </div>
                        )}
                      </div>

                      {counsellor.profile?.specializations && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1">
                            {counsellor.profile.specializations.slice(0, 3).map((spec) => (
                              <span key={spec} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {specializationOptions[spec] || spec}
                              </span>
                            ))}
                            {counsellor.profile.specializations.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                +{counsellor.profile.specializations.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {counsellor.profile?.biography && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {counsellor.profile.biography}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{counsellor.profile?.experience || 0} years experience</span>
                        {formData.appointmentDate && (
                          <span className={`px-2 py-1 rounded ${
                            counsellor.profile?.isAvailableOnDate 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {counsellor.profile?.isAvailableOnDate ? 'Available' : 'Unavailable'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {counsellors.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                  No counsellors available. Please try a different date.
                </div>
              )}
            </div>
          )}

          {/* Step 2: Schedule */}
          {step === 2 && selectedCounsellor && (
            <div>
              <div className="mb-6">
                <button
                  onClick={() => setStep(1)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  ← Back to counsellor selection
                </button>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-6">Schedule Appointment</h2>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Selected Counsellor:</h3>
                <p className="text-gray-700">{selectedCounsellor.firstName} {selectedCounsellor.lastName}</p>
                <p className="text-sm text-gray-600">{selectedCounsellor.department}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="h-4 w-4 inline mr-2" />
                    Select Date
                  </label>
                  <input
                    type="date"
                    name="appointmentDate"
                    value={formData.appointmentDate}
                    onChange={handleInputChange}
                    min={getMinDate()}
                    max={getMaxDate()}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="h-4 w-4 inline mr-2" />
                    Select Time
                  </label>
                  <select
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Choose time</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Mode
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="mode"
                      value="online"
                      checked={formData.mode === 'online'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <Video className="h-4 w-4 mr-1" />
                    Online
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="mode"
                      value="offline"
                      checked={formData.mode === 'offline'}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <User className="h-4 w-4 mr-1" />
                    In-person
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.appointmentDate || !formData.appointmentTime}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Next: Add Details
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <div>
              <div className="mb-6">
                <button
                  onClick={() => setStep(2)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  ← Back to scheduling
                </button>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-6">Appointment Details</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Appointment *
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows={3}
                    required
                    placeholder="Please describe why you're seeking counseling..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency Level
                  </label>
                  <select
                    name="urgency"
                    value={formData.urgency}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Low - General consultation</option>
                    <option value="medium">Medium - Moderate concern</option>
                    <option value="high">High - Urgent concern</option>
                    <option value="critical">Critical - Emergency</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Any additional information you'd like to share..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Summary */}
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Appointment Summary:</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong>Counsellor:</strong> {selectedCounsellor?.firstName} {selectedCounsellor?.lastName}</p>
                  <p><strong>Date:</strong> {formData.appointmentDate ? new Date(formData.appointmentDate).toLocaleDateString() : 'Not selected'}</p>
                  <p><strong>Time:</strong> {formData.appointmentTime || 'Not selected'}</p>
                  <p><strong>Mode:</strong> {formData.mode === 'online' ? 'Online' : 'In-person'}</p>
                  <p><strong>Urgency:</strong> {formData.urgency}</p>
                </div>
              </div>

              <div className="mt-6 flex space-x-4">
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.reason.trim()}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Submitting...' : 'Book Appointment'}
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingForm;