'use client';

import { Lock, Unlock, Shield, AlertTriangle } from 'lucide-react';

interface EncryptionStatusProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export default function EncryptionStatus({ enabled, onToggle }: EncryptionStatusProps) {
  return (
    <div className={`rounded-lg p-4 mb-6 border-2 transition-all ${
      enabled 
        ? 'bg-green-50 border-green-500 encryption-glow' 
        : 'bg-yellow-50 border-yellow-500'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {enabled ? (
            <Lock className="w-6 h-6 text-green-600" />
          ) : (
            <Unlock className="w-6 h-6 text-yellow-600" />
          )}
          <div>
            <h3 className="font-semibold text-lg">
              {enabled ? 'End-to-End Encryption Enabled' : 'Encryption Disabled'}
            </h3>
            <p className="text-sm text-gray-600">
              {enabled 
                ? 'Your data is encrypted client-side before transmission. Server never sees plaintext.'
                : 'Enable encryption for maximum privacy protection.'}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => onToggle(!enabled)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            enabled
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-yellow-600 hover:bg-yellow-700 text-white'
          }`}
        >
          {enabled ? 'Enabled' : 'Enable'}
        </button>
      </div>

      {enabled && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-gray-700">Client-side encryption</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-gray-700">Homomorphic computation</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-gray-700">TEE-verified inference</span>
          </div>
        </div>
      )}

      {!enabled && (
        <div className="mt-3 flex items-start gap-2 text-sm bg-yellow-100 p-3 rounded">
          <AlertTriangle className="w-4 h-4 text-yellow-700 mt-0.5" />
          <p className="text-yellow-800">
            <strong>Warning:</strong> Without encryption, your medical queries are transmitted in plaintext. 
            This mode is for testing only and not HIPAA-compliant.
          </p>
        </div>
      )}
    </div>
  );
}
