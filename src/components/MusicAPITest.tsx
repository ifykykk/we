import React, { useState } from 'react';

// Simple test component to verify the YouTube API is working
const MusicAPITest: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://youtube138.p.rapidapi.com/search/?q=meditation%20music&hl=en&gl=US',
        {
          method: 'GET',
          headers: {
            'x-rapidapi-host': 'youtube138.p.rapidapi.com',
            'x-rapidapi-key': 'f92009fadfmshd3afbaa6d3fa492p18c379jsn54acf1eb095a',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTestResults(data);
      console.log('API Test Results:', data);
    } catch (error) {
      console.error('API Test Error:', error);
  setTestResults({ error: error instanceof Error ? error.message : String(error) });
    }
    setLoading(false);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">YouTube API Test</h3>
      <button
        onClick={testAPI}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test API'}
      </button>
      
      {testResults && (
        <div className="mt-4">
          <h4 className="font-semibold">Results:</h4>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-60">
            {JSON.stringify(testResults, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default MusicAPITest;
