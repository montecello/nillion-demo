'use client';

import { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Loader2, Download, FileCheck } from 'lucide-react';
import { getAttestationProof, verifyAttestationProof } from '@/lib/api';

export default function AttestationProof() {
  const [loading, setLoading] = useState(false);
  const [proof, setProof] = useState<any>(null);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProof = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAttestationProof();
      setProof(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch attestation proof');
    } finally {
      setLoading(false);
    }
  };

  const verifyProof = async () => {
    if (!proof) return;
    
    setLoading(true);
    setError(null);
    try {
      const result = await verifyAttestationProof(proof.proof_data);
      setVerificationResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to verify attestation');
    } finally {
      setLoading(false);
    }
  };

  const downloadProof = () => {
    if (!proof) return;
    
    const dataStr = JSON.stringify(proof, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attestation_proof_${new Date().toISOString()}.json`;
    link.click();
  };

  useEffect(() => {
    fetchProof();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Shield className="w-8 h-8 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            TEE Attestation Proof
          </h2>
        </div>
        <p className="text-gray-600">
          Cryptographic proof that medical AI inference runs in a Trusted Execution Environment (TEE)
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <XCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && !proof && (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Fetching attestation proof...</p>
        </div>
      )}

      {/* Attestation Proof Display */}
      {proof && (
        <div className="space-y-4">
          {/* Proof Summary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-500 uppercase">
                  Proof ID
                </label>
                <p className="text-gray-900 font-mono text-sm mt-1">
                  {proof.proof_id}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-500 uppercase">
                  Status
                </label>
                <div className="flex items-center gap-2 mt-1">
                  {proof.verified ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-600 font-semibold">Verified</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-red-600 font-semibold">Unverified</span>
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-500 uppercase">
                  Enclave Hash
                </label>
                <p className="text-gray-900 font-mono text-xs mt-1 truncate">
                  {proof.enclave_hash}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-semibold text-gray-500 uppercase">
                  Timestamp
                </label>
                <p className="text-gray-900 text-sm mt-1">
                  {new Date(proof.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Verification Result */}
          {verificationResult && (
            <div className={`rounded-lg border-2 p-6 ${
              verificationResult.verified
                ? 'bg-green-50 border-green-500'
                : 'bg-red-50 border-red-500'
            }`}>
              <div className="flex items-center gap-3 mb-4">
                {verificationResult.verified ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600" />
                )}
                <div>
                  <h3 className="text-lg font-bold">
                    {verificationResult.verified 
                      ? 'Attestation Verified ✓' 
                      : 'Verification Failed'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Trust Level: {verificationResult.trust_level || 'N/A'}
                  </p>
                </div>
              </div>

              {verificationResult.details && (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4" />
                    <span>
                      Signature: {verificationResult.details.signature_valid ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4" />
                    <span>
                      Certificate: {verificationResult.details.certificate_valid ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4" />
                    <span>
                      Measurements: {verificationResult.details.measurements_valid ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4" />
                    <span>
                      Timestamp: {verificationResult.details.timestamp_valid ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={verifyProof}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Shield className="w-5 h-5" />
              )}
              <span>Verify Attestation</span>
            </button>
            
            <button
              onClick={downloadProof}
              className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Download</span>
            </button>
            
            <button
              onClick={fetchProof}
              disabled={loading}
              className="px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
              Refresh
            </button>
          </div>

          {/* What This Means */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-3">
              What This Proves
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  AI model runs inside a Trusted Execution Environment (TEE)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Code has not been tampered with (verified via measurements)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Your medical data is processed in a secure, isolated environment
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Infrastructure provider cannot access patient data during inference
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
