/**
 * API Client for Medical AI Backend
 * Uses Next.js API routes (relative URLs work in production)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface MedicalQueryRequest {
  encrypted_query: string;
  encryption_metadata: Record<string, any>;
  session_id: string;
  request_attestation: boolean;
  search_literature?: boolean; // Optional PubMed literature search
}

interface MedicalQueryResponse {
  encrypted_response: string;
  encryption_metadata: Record<string, any>;
  attestation_proof: string | null;
  query_id: string;
  processing_time_ms: number;
  timestamp: string;
  cited_articles?: Array<{pmid: string; title: string}>;
  initial_analysis?: string; // Stage 1: AI's initial diagnosis
  search_keywords?: string; // Keywords used for PubMed search
}

/**
 * Send medical query to backend
 */
export async function sendMedicalQuery(
  request: MedicalQueryRequest
): Promise<MedicalQueryResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/medical/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to process medical query');
    }

    return await response.json();
  } catch (error: any) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Get TEE attestation proof
 */
export async function getAttestationProof(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/attestation/proof`);

    if (!response.ok) {
      throw new Error('Failed to fetch attestation proof');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Attestation Error:', error);
    throw error;
  }
}

/**
 * Verify attestation proof
 */
export async function verifyAttestationProof(proofData: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/attestation/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ proof_data: proofData }),
    });

    if (!response.ok) {
      throw new Error('Failed to verify attestation proof');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Verification Error:', error);
    throw error;
  }
}

/**
 * Get audit logs
 */
export async function getAuditLogs(
  hours: number = 24,
  eventType?: string
): Promise<any> {
  try {
    const params = new URLSearchParams({
      hours: hours.toString(),
      ...(eventType && { event_type: eventType }),
    });

    const response = await fetch(`${API_BASE_URL}/audit/logs?${params}`);

    if (!response.ok) {
      throw new Error('Failed to fetch audit logs');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Audit Logs Error:', error);
    throw error;
  }
}

/**
 * Get audit summary
 */
export async function getAuditSummary(hours: number = 24): Promise<any> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/audit/summary?hours=${hours}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch audit summary');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Audit Summary Error:', error);
    throw error;
  }
}

/**
 * Get medical service status
 */
export async function getMedicalServiceStatus(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/medical/status`);

    if (!response.ok) {
      throw new Error('Failed to fetch service status');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Service Status Error:', error);
    throw error;
  }
}

/**
 * Health check
 */
export async function healthCheck(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
      throw new Error('Health check failed');
    }

    return await response.json();
  } catch (error: any) {
    console.error('Health Check Error:', error);
    throw error;
  }
}
