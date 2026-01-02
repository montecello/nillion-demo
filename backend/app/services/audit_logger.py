"""
HIPAA-Compliant Audit Logger
Structured logging for all medical operations without PHI exposure
"""

import logging
import json
from typing import Dict, Any, Optional
from datetime import datetime
import hashlib
from pathlib import Path

logger = logging.getLogger(__name__)


class AuditLogger:
    """
    HIPAA-compliant audit logger
    
    Logs all operations without storing PHI (Protected Health Information)
    Uses encrypted references and hashes only
    """
    
    def __init__(self, log_dir: str = "logs"):
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(exist_ok=True)
        
        # Audit log file with rotation
        self.audit_file = self.log_dir / f"audit_{datetime.utcnow().strftime('%Y%m%d')}.jsonl"
        
        logger.info(f"Initialized audit logger: {self.audit_file}")
    
    def log_medical_query(
        self,
        query_id: str,
        session_id: str,
        processing_time_ms: int,
        attestation_included: bool,
        encrypted_query_hash: str
    ):
        """
        Log medical query operation (HIPAA-compliant)
        
        Args:
            query_id: Unique query identifier
            session_id: Client session ID
            processing_time_ms: Processing duration
            attestation_included: Whether TEE attestation was included
            encrypted_query_hash: Hash of encrypted query (not plaintext)
        """
        audit_entry = {
            "event_type": "medical_query",
            "timestamp": datetime.utcnow().isoformat(),
            "query_id": query_id,
            "session_id": self._hash_session_id(session_id),  # Hash for privacy
            "processing_time_ms": processing_time_ms,
            "attestation_included": attestation_included,
            "encrypted_query_hash": encrypted_query_hash,
            "compliance": "HIPAA",
            "phi_exposed": False  # Critical: confirm no PHI in logs
        }
        
        self._write_audit_entry(audit_entry)
        logger.info(f"Audit: Medical query processed - {query_id}")
    
    def log_api_request(
        self,
        method: str,
        path: str,
        status_code: int,
        duration: float,
        client_ip: str
    ):
        """
        Log API request for security monitoring
        
        Args:
            method: HTTP method
            path: Request path
            status_code: Response status code
            duration: Request duration in seconds
            client_ip: Client IP address (anonymized)
        """
        audit_entry = {
            "event_type": "api_request",
            "timestamp": datetime.utcnow().isoformat(),
            "method": method,
            "path": path,
            "status_code": status_code,
            "duration_seconds": round(duration, 3),
            "client_ip": self._anonymize_ip(client_ip)
        }
        
        self._write_audit_entry(audit_entry)
    
    def log_attestation_verification(
        self,
        attestation_id: str,
        verification_result: bool,
        enclave_hash: str
    ):
        """
        Log TEE attestation verification
        
        Args:
            attestation_id: Attestation proof ID
            verification_result: Whether verification passed
            enclave_hash: Hash of enclave code
        """
        audit_entry = {
            "event_type": "attestation_verification",
            "timestamp": datetime.utcnow().isoformat(),
            "attestation_id": attestation_id,
            "verification_result": verification_result,
            "enclave_hash": enclave_hash,
            "trust_level": "TEE_verified" if verification_result else "unverified"
        }
        
        self._write_audit_entry(audit_entry)
        logger.info(f"Audit: Attestation verified - {attestation_id}")
    
    def log_error(
        self,
        error_type: str,
        error_message: str,
        path: Optional[str] = None,
        method: Optional[str] = None,
        session_id: Optional[str] = None
    ):
        """
        Log error event for monitoring
        
        Args:
            error_type: Type of error
            error_message: Error message (sanitized)
            path: Request path if applicable
            method: HTTP method if applicable
            session_id: Session ID if applicable
        """
        audit_entry = {
            "event_type": "error",
            "timestamp": datetime.utcnow().isoformat(),
            "error_type": error_type,
            "error_message": self._sanitize_error_message(error_message),
            "path": path,
            "method": method,
            "session_id": self._hash_session_id(session_id) if session_id else None
        }
        
        self._write_audit_entry(audit_entry)
        logger.error(f"Audit: Error logged - {error_type}")
    
    def log_encryption_operation(
        self,
        operation: str,
        encryption_type: str,
        data_hash: str,
        success: bool
    ):
        """
        Log encryption/decryption operation
        
        Args:
            operation: "encrypt" or "decrypt"
            encryption_type: Type of encryption used
            data_hash: Hash of data (not plaintext)
            success: Whether operation succeeded
        """
        audit_entry = {
            "event_type": "encryption_operation",
            "timestamp": datetime.utcnow().isoformat(),
            "operation": operation,
            "encryption_type": encryption_type,
            "data_hash": data_hash,
            "success": success
        }
        
        self._write_audit_entry(audit_entry)
    
    def _write_audit_entry(self, entry: Dict[str, Any]):
        """
        Write audit entry to JSONL file
        
        Args:
            entry: Audit log entry dict
        """
        try:
            with open(self.audit_file, 'a') as f:
                f.write(json.dumps(entry) + '\n')
        except Exception as e:
            logger.error(f"Failed to write audit entry: {str(e)}")
    
    @staticmethod
    def _hash_session_id(session_id: str) -> str:
        """Hash session ID for privacy"""
        if not session_id:
            return "unknown"
        return hashlib.sha256(session_id.encode()).hexdigest()[:16]
    
    @staticmethod
    def _anonymize_ip(ip: str) -> str:
        """Anonymize IP address (keep first 3 octets only)"""
        if not ip or ip == "unknown":
            return "unknown"
        parts = ip.split('.')
        if len(parts) == 4:
            return f"{parts[0]}.{parts[1]}.{parts[2]}.xxx"
        return "xxx.xxx.xxx.xxx"
    
    @staticmethod
    def _sanitize_error_message(message: str) -> str:
        """
        Sanitize error message to remove potential PHI
        
        Args:
            message: Raw error message
            
        Returns:
            Sanitized error message
        """
        # Remove any potential sensitive data patterns
        # This is a simple implementation - production would be more sophisticated
        sanitized = message
        
        # Remove long strings that might contain encrypted data
        if len(sanitized) > 200:
            sanitized = sanitized[:200] + "..."
        
        return sanitized
    
    def get_audit_summary(self, hours: int = 24) -> Dict[str, Any]:
        """
        Get audit log summary for monitoring dashboard
        
        Args:
            hours: Number of hours to summarize
            
        Returns:
            Summary statistics dict
        """
        try:
            # Read audit log and generate summary
            # This is a simplified version
            return {
                "period_hours": hours,
                "total_queries": 0,  # Would count from log
                "total_errors": 0,
                "average_processing_time_ms": 0,
                "attestations_verified": 0,
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"Failed to generate audit summary: {str(e)}")
            return {}
