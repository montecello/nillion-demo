'use client';

import { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import EncryptionStatus from '@/components/EncryptionStatus';
import AttestationProof from '@/components/AttestationProof';
import AuditLog from '@/components/AuditLog';
import { Shield, Lock, FileCheck, Activity } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'chat' | 'attestation' | 'audit'>('chat');
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);
  const [queryCount, setQueryCount] = useState(0);

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Shield className="w-12 h-12 text-indigo-600" />
          <h1 className="text-4xl font-bold text-gray-900">
            Medical AI Assistant
          </h1>
        </div>
        <p className="text-lg text-gray-600 mb-2">
          Privacy-Preserving Healthcare AI powered by Nillion
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>End-to-End Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            <span>HIPAA Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span>TEE Verified</span>
          </div>
        </div>
      </div>

      {/* Encryption Status Banner */}
      <EncryptionStatus 
        enabled={encryptionEnabled}
        onToggle={setEncryptionEnabled}
      />

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'chat'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Medical Chat
            </button>
            <button
              onClick={() => setActiveTab('attestation')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'attestation'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              TEE Attestation
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'audit'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Audit Log
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'chat' && (
            <ChatInterface 
              encryptionEnabled={encryptionEnabled}
              onQueryComplete={() => setQueryCount(prev => prev + 1)}
            />
          )}
          
          {activeTab === 'attestation' && (
            <AttestationProof />
          )}
          
          {activeTab === 'audit' && (
            <AuditLog queryCount={queryCount} />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500">
        <p>
          This demo uses Nillion's privacy-preserving infrastructure for secure medical AI inference.
        </p>
        <p className="mt-2">
          All patient data is encrypted client-side before transmission.
          Server never sees plaintext.
        </p>
      </div>
    </main>
  );
}
