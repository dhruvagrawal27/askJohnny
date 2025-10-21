// src/pages/DatabaseTest.tsx
import React, { useState, useEffect } from 'react';
import { checkDatabaseHealth } from '../lib/dataService';
import { supabase } from '../lib/supabaseClient';

const DatabaseTest: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<any>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setLoading(true);
    try {
      // Test basic connection
      const health = await checkDatabaseHealth();
      setHealthStatus(health);

      // Get connection info
      setConnectionInfo({
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Connection test failed:', error);
      setHealthStatus({
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const testQuery = async () => {
    setLoading(true);
    try {
      console.log('Testing direct Supabase query...');
      
      const { data, error, count } = await supabase
        .from('users')
        .select('*', { count: 'exact' })
        .limit(5);

      if (error) {
        throw error;
      }

      console.log('Query successful:', { data, count });
      alert(`Query successful! Found ${count} users. Check console for details.`);
    } catch (error) {
      console.error('Query failed:', error);
      alert(`Query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Database Connection Test</h1>
      
      {/* Connection Status */}
      <div className="bg-white border rounded-lg p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">Connection Status</h2>
        {loading ? (
          <div className="text-blue-600">Testing connection...</div>
        ) : healthStatus ? (
          <div>
            <div className={`inline-block px-2 py-1 rounded text-sm ${
              healthStatus.status === 'healthy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {healthStatus.status}
            </div>
            <p className="mt-2 text-sm text-gray-600">{healthStatus.message}</p>
            {healthStatus.userCount !== undefined && (
              <p className="text-sm text-gray-600">User count: {healthStatus.userCount}</p>
            )}
          </div>
        ) : (
          <div className="text-gray-500">Not tested yet</div>
        )}
      </div>

      {/* Connection Info */}
      {connectionInfo && (
        <div className="bg-white border rounded-lg p-4 mb-4">
          <h2 className="text-lg font-semibold mb-2">Connection Info</h2>
          <div className="text-sm space-y-1">
            <div>URL: {connectionInfo.supabaseUrl || 'Not set'}</div>
            <div>Has API Key: {connectionInfo.hasAnonKey ? 'Yes' : 'No'}</div>
            <div>Tested at: {connectionInfo.timestamp}</div>
          </div>
        </div>
      )}

      {/* Test Buttons */}
      <div className="space-y-3">
        <button
          onClick={testConnection}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </button>
        
        <button
          onClick={testQuery}
          disabled={loading}
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Querying...' : 'Test Query (Check Console)'}
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Quick Debug Steps:</h3>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>Run the clean-database.sql script in Supabase first</li>
          <li>Then run the create-robust-schema.sql script</li>
          <li>Check if the connection tests pass above</li>
          <li>If tests pass, try logging in normally</li>
        </ol>
      </div>
    </div>
  );
};

export default DatabaseTest;
