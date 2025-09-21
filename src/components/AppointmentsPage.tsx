import React, { useState } from 'react';
import { Calendar, Clock, Plus, List } from 'lucide-react';
import BookingForm from './booking/BookingForm';
import MyBookings from './booking/MyBookings';

const AppointmentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'book' | 'view'>('book');

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Appointments</h1>
        <p className="text-gray-600">Book new appointments or manage your existing ones</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('book')}
            className={`flex items-center px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'book'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Plus className="h-4 w-4 mr-2" />
            Book New Appointment
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`flex items-center px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'view'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <List className="h-4 w-4 mr-2" />
            My Appointments
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'book' ? (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Book a New Appointment
              </h2>
              <BookingForm />
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Your Appointments
              </h2>
              <MyBookings />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage;
