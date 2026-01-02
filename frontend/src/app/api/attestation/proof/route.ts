import { NextResponse } from 'next/server';

export async function GET() {
  // Mock attestation data structure that matches component expectations
  // In production, this would fetch real attestation from Nillion nilAI TEE
  return NextResponse.json({
    proof_id: 'att_' + Math.random().toString(36).substr(2, 9),
    verified: true,
    enclave_hash: 'a7f3c9e2d1b8f6a4e3c2d1b9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0',
    timestamp: new Date().toISOString(),
    attestation_proof: {
      type: 'AMD-SEV-SNP',
      tcb_version: '0x0000000000000003',
      platform_info: {
        vendor: 'AMD',
        security_level: 'TEE',
        firmware_version: '1.51.0',
      },
      measurements: {
        code_hash: 'a7f3c9e2d1b8f6a4e3c2d1b9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0',
        data_hash: 'f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d0c1b2a3f4e5d6c7b8a9f0',
      },
    },
    verification_status: 'VERIFIED',
    chain_of_trust: [
      {
        level: 'Hardware',
        component: 'AMD SEV-SNP Processor',
        status: 'verified',
      },
      {
        level: 'Firmware',
        component: 'TEE Secure Boot',
        status: 'verified',
      },
      {
        level: 'Runtime',
        component: 'Nillion nilAI Container',
        status: 'verified',
      },
    ],
  });
}
