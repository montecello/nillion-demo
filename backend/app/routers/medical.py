"""
Medical Query Router
Handles encrypted medical queries and forwards to nilAI for private inference
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import logging
from datetime import datetime

from app.services.encryption import EncryptionService
from app.services.nilai_client import NilaiClient
from app.services.audit_logger import AuditLogger

logger = logging.getLogger(__name__)
router = APIRouter()

# Initialize services
encryption_service = EncryptionService()
nilai_client = NilaiClient()
audit_logger = AuditLogger()


class MedicalQueryRequest(BaseModel):
    """Request model for encrypted medical queries"""
    encrypted_query: str = Field(..., description="Client-side encrypted medical query (base64)")
    encryption_metadata: Dict[str, Any] = Field(..., description="Encryption parameters for decryption")
    session_id: str = Field(..., description="Client session ID for audit trail")
    request_attestation: bool = Field(default=True, description="Request TEE attestation proof")


class MedicalQueryResponse(BaseModel):
    """Response model for medical queries"""
    encrypted_response: str = Field(..., description="Encrypted medical advice (base64)")
    encryption_metadata: Dict[str, Any] = Field(..., description="Encryption parameters")
    attestation_proof: Optional[str] = Field(None, description="TEE attestation proof")
    query_id: str = Field(..., description="Unique query ID for audit trail")
    processing_time_ms: int = Field(..., description="Server-side processing time")
    timestamp: str = Field(..., description="Response timestamp (ISO 8601)")


@router.post("/query", response_model=MedicalQueryResponse)
async def process_medical_query(request: MedicalQueryRequest):
    """
    Process encrypted medical query through nilAI
    
    Flow:
    1. Receive encrypted query from client
    2. Forward to nilAI for private inference (without decryption)
    3. Get encrypted response from nilAI
    4. Return encrypted response + attestation proof
    5. Log interaction (encrypted references only)
    """
    start_time = datetime.utcnow()
    
    try:
        logger.info(f"Processing medical query - Session: {request.session_id}")
        
        # Validate encrypted payload
        if not request.encrypted_query or len(request.encrypted_query) < 10:
            raise HTTPException(status_code=400, detail="Invalid encrypted query")
        
        # Forward encrypted query to nilAI
        # Note: nilAI processes encrypted data directly (homomorphic encryption)
        nilai_response = await nilai_client.process_encrypted_query(
            encrypted_data=request.encrypted_query,
            metadata=request.encryption_metadata
        )
        
        # Get TEE attestation proof (if requested)
        attestation_proof = None
        if request.request_attestation:
            attestation_proof = await nilai_client.get_attestation_proof()
        
        # Calculate processing time
        processing_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        
        # Generate query ID for audit trail
        query_id = f"query_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{request.session_id[:8]}"
        
        # Log interaction (HIPAA-compliant: no PHI in logs)
        audit_logger.log_medical_query(
            query_id=query_id,
            session_id=request.session_id,
            processing_time_ms=processing_time,
            attestation_included=attestation_proof is not None,
            encrypted_query_hash=encryption_service.hash_data(request.encrypted_query)
        )
        
        return MedicalQueryResponse(
            encrypted_response=nilai_response["encrypted_response"],
            encryption_metadata=nilai_response["metadata"],
            attestation_proof=attestation_proof,
            query_id=query_id,
            processing_time_ms=processing_time,
            timestamp=datetime.utcnow().isoformat()
        )
        
    except Exception as e:
        logger.error(f"Error processing medical query: {str(e)}", exc_info=True)
        
        # Log error without exposing sensitive details
        audit_logger.log_error(
            error_type="medical_query_error",
            error_message=str(e),
            session_id=request.session_id
        )
        
        raise HTTPException(
            status_code=500,
            detail="Failed to process medical query. Please try again."
        )


@router.get("/status")
async def get_medical_service_status():
    """Get medical service status and nilAI connectivity"""
    try:
        # Check nilAI connectivity
        nilai_status = await nilai_client.health_check()
        
        return {
            "status": "operational",
            "nilai_connected": nilai_status["connected"],
            "models_available": nilai_status.get("models", []),
            "encryption_enabled": True,
            "attestation_available": nilai_status.get("attestation_enabled", False),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Medical service status check failed: {str(e)}")
        return {
            "status": "degraded",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.post("/demo/sample-query")
async def demo_sample_query():
    """
    Demo endpoint: Generate sample encrypted medical query
    For testing and demonstrations
    """
    try:
        sample_query = "I have been experiencing chest pain and shortness of breath for the past 2 days. What should I do?"
        
        # Encrypt sample query (server-side for demo purposes)
        encrypted_data = encryption_service.encrypt_data(sample_query)
        
        return {
            "plaintext_query": sample_query,
            "encrypted_query": encrypted_data["encrypted"],
            "encryption_metadata": encrypted_data["metadata"],
            "note": "In production, encryption happens client-side only",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Demo sample query failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to generate sample query")
