"""
Encryption Service
Uses Nillion blindfold-py for privacy-preserving encryption
"""

import base64
import hashlib
import logging
from typing import Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)

# Import blindfold
try:
    import blindfold
    BLINDFOLD_AVAILABLE = True
    logger.info("✓ Nillion blindfold loaded successfully")
except ImportError as e:
    BLINDFOLD_AVAILABLE = False
    logger.error(f"✗ blindfold not available: {str(e)}")
    raise ImportError("blindfold-py is required. Install with: pip install blindfold")


class EncryptionService:
    """
    Encryption service using Nillion's blindfold library
    Provides privacy-preserving encryption for medical data
    """
    
    def __init__(self):
        logger.info("Initializing EncryptionService with Nillion blindfold")
        
        # Initialize blindfold key for single-node cluster (demo)
        # In production, this would be configured for multi-node TEE cluster
        try:
            cluster = {'nodes': [{}]}  # Single node for demo
            self.secret_key = blindfold.SecretKey.generate(cluster, {'store': True})
            logger.info("✓ Generated blindfold SecretKey for single-node cluster")
        except Exception as e:
            logger.error(f"✗ Failed to initialize blindfold: {str(e)}")
            raise
    
    def encrypt_data(self, plaintext: str) -> Dict[str, Any]:
        """
        Encrypt data using Nillion blindfold
        
        Args:
            plaintext: Data to encrypt
            
        Returns:
            Dict with encrypted data and metadata
        """
        try:
            # Encrypt using blindfold
            ciphertext = blindfold.encrypt(self.secret_key, plaintext)
            
            # Convert to base64 for JSON serialization
            if isinstance(ciphertext, bytes):
                encrypted_b64 = base64.b64encode(ciphertext).decode('utf-8')
            else:
                # Ciphertext might already be serialized
                encrypted_b64 = str(ciphertext)
            
            metadata = {
                "encryption_type": "nillion-blindfold",
                "algorithm": "XSalsa20-Poly1305",
                "mode": "single-node",
                "timestamp": datetime.utcnow().isoformat(),
                "size_bytes": len(encrypted_b64),
            }
            
            logger.debug(f"Encrypted {len(plaintext)} bytes -> {len(encrypted_b64)} bytes")
            
            return {
                "encrypted": encrypted_b64,
                "metadata": metadata
            }
            
        except Exception as e:
            logger.error(f"Encryption failed: {str(e)}")
            raise RuntimeError(f"Failed to encrypt data: {str(e)}")
    
    def decrypt_data(self, encrypted_data: str, metadata: Dict[str, Any]) -> str:
        """
        Decrypt data using Nillion blindfold
        
        Args:
            encrypted_data: Base64-encoded encrypted data
            metadata: Encryption metadata
            
        Returns:
            Decrypted plaintext
        """
        try:
            # Decode from base64
            try:
                ciphertext = base64.b64decode(encrypted_data)
            except Exception:
                # Might already be in raw format
                ciphertext = encrypted_data
            
            # Decrypt using blindfold
            plaintext = blindfold.decrypt(self.secret_key, ciphertext)
            
            logger.debug(f"Decrypted {len(encrypted_data)} bytes -> {len(plaintext)} bytes")
            
            return plaintext
            
        except Exception as e:
            logger.error(f"Decryption failed: {str(e)}")
            raise RuntimeError(f"Failed to decrypt data: {str(e)}")
    
    @staticmethod
    def hash_data(data: str) -> str:
        """
        Create hash of data for audit logging
        Used to reference encrypted data without storing plaintext
        """
        return hashlib.sha256(data.encode('utf-8')).hexdigest()[:16]
    
    def get_encryption_info(self) -> Dict[str, Any]:
        """Get information about encryption capabilities"""
        return {
            "blindfold_available": self.use_blindfold,
            "encryption_type": "homomorphic" if self.use_blindfold else "symmetric",
            "algorithm": "blindfold" if self.use_blindfold else "Fernet (AES-128-CBC)",
            "supports_encrypted_computation": self.use_blindfold
        }
