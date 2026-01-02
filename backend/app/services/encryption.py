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

# Import blindfold with fallback for Vercel deployment
try:
    import blindfold
    BLINDFOLD_AVAILABLE = True
    logger.info("✓ Nillion blindfold loaded successfully")
except ImportError as e:
    BLINDFOLD_AVAILABLE = False
    logger.warning(f"⚠️ blindfold not available, using cryptography fallback: {str(e)}")
    # Vercel serverless doesn't support Rust compilation
    # Use cryptography library as fallback
    from cryptography.fernet import Fernet


class EncryptionService:
    """
    Encryption service using Nillion's blindfold library
    Falls back to cryptography.Fernet on Vercel (no Rust support)
    """
    
    def __init__(self):
        if BLINDFOLD_AVAILABLE:
            logger.info("Initializing EncryptionService with Nillion blindfold")
            try:
                cluster = {'nodes': [{}]}  # Single node for demo
                self.secret_key = blindfold.SecretKey.generate(cluster, {'store': True})
                self.encryption_type = "nillion-blindfold"
                logger.info("✓ Generated blindfold SecretKey for single-node cluster")
            except Exception as e:
                logger.error(f"✗ Failed to initialize blindfold: {str(e)}")
                raise
        else:
            logger.info("Initializing EncryptionService with cryptography fallback (Vercel mode)")
            # Generate Fernet key for fallback
            self.secret_key = Fernet.generate_key()
            self.fernet = Fernet(self.secret_key)
            self.encryption_type = "fernet-fallback"
            logger.info("✓ Generated Fernet key for fallback encryption")
    
    def encrypt_data(self, plaintext: str) -> Dict[str, Any]:
        """
        Encrypt data using Nillion blindfold or Fernet fallback
        
        Args:
            plaintext: Data to encrypt
            
        Returns:
            Dict with encrypted data and metadata
        """
        try:
            if BLINDFOLD_AVAILABLE:
                # Use blindfold encryption
                ciphertext = blindfold.encrypt(self.secret_key, plaintext)
                
                # Convert to base64 for JSON serialization
                if isinstance(ciphertext, bytes):
                    encrypted_b64 = base64.b64encode(ciphertext).decode('utf-8')
                else:
                    encrypted_b64 = str(ciphertext)
                
                algorithm = "XSalsa20-Poly1305"
            else:
                # Use Fernet fallback
                ciphertext = self.fernet.encrypt(plaintext.encode('utf-8'))
                encrypted_b64 = base64.b64encode(ciphertext).decode('utf-8')
                algorithm = "AES-128-CBC (Fernet)"
            
            metadata = {
                "encryption_type": self.encryption_type,
                "algorithm": algorithm,
                "mode": "single-node" if BLINDFOLD_AVAILABLE else "fallback",
                "timestamp": datetime.utcnow().isoformat(),
                "size_bytes": len(encrypted_b64),
            }
            
            logger.debug(f"Encrypted {len(plaintext)} bytes -> {len(encrypted_b64)} bytes using {self.encryption_type}")
            
            return {
                "encrypted": encrypted_b64,
                "metadata": metadata
            }
            
        except Exception as e:
            logger.error(f"Encryption failed: {str(e)}")
            raise RuntimeError(f"Failed to encrypt data: {str(e)}")
    
    def decrypt_data(self, encrypted_data: str, metadata: Dict[str, Any]) -> str:
        """
        Decrypt data using Nillion blindfold or Fernet fallback
        
        Args:
            encrypted_data: Base64-encoded encrypted data
            metadata: Encryption metadata
            
        Returns:
            Decrypted plaintext
        """
        try:
            # Decode from base64
            ciphertext = base64.b64decode(encrypted_data)
            
            if BLINDFOLD_AVAILABLE:
                # Decrypt using blindfold
                plaintext = blindfold.decrypt(self.secret_key, ciphertext)
            else:
                # Decrypt using Fernet fallback
                plaintext = self.fernet.decrypt(ciphertext).decode('utf-8')
            
            logger.debug(f"Decrypted {len(encrypted_data)} bytes -> {len(plaintext)} bytes using {self.encryption_type}")
            
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
