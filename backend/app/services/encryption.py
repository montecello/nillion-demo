"""
Encryption Service
Wraps blindfold-py for homomorphic encryption operations
"""

import base64
import hashlib
import logging
from typing import Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

# Try to import blindfold (from NIL/blindfold-py)
try:
    import sys
    import os
    # Add blindfold-py to path
    blindfold_path = os.path.join(os.path.dirname(__file__), '../../../../NIL/blindfold-py/src')
    if os.path.exists(blindfold_path):
        sys.path.insert(0, blindfold_path)
    
    import blindfold
    BLINDFOLD_AVAILABLE = True
    logger.info("blindfold library loaded successfully")
except ImportError as e:
    BLINDFOLD_AVAILABLE = False
    logger.warning(f"blindfold not available, using fallback encryption: {str(e)}")
    # Fallback to standard cryptography
    from cryptography.fernet import Fernet


class EncryptionService:
    """
    Encryption service using Nillion's blindfold library
    Falls back to Fernet encryption if blindfold unavailable
    """
    
    def __init__(self):
        self.use_blindfold = BLINDFOLD_AVAILABLE
        
        if self.use_blindfold:
            logger.info("Initialized with blindfold (homomorphic encryption)")
            # Initialize blindfold keys
            try:
                self.secret_key = blindfold.SecretKey()
                self.public_key = self.secret_key.public()
            except Exception as e:
                logger.error(f"Failed to initialize blindfold keys: {str(e)}")
                self.use_blindfold = False
        
        if not self.use_blindfold:
            logger.info("Initialized with Fernet (standard encryption)")
            # Fallback to Fernet
            self.fernet_key = Fernet.generate_key()
            self.fernet = Fernet(self.fernet_key)
    
    def encrypt_data(self, plaintext: str) -> Dict[str, Any]:
        """
        Encrypt data using blindfold or fallback to Fernet
        
        Args:
            plaintext: Data to encrypt
            
        Returns:
            Dict with encrypted data and metadata
        """
        try:
            if self.use_blindfold:
                return self._encrypt_with_blindfold(plaintext)
            else:
                return self._encrypt_with_fernet(plaintext)
        except Exception as e:
            logger.error(f"Encryption failed: {str(e)}")
            raise
    
    def decrypt_data(self, encrypted_data: str, metadata: Dict[str, Any]) -> str:
        """
        Decrypt data using blindfold or Fernet
        
        Args:
            encrypted_data: Base64-encoded encrypted data
            metadata: Encryption metadata
            
        Returns:
            Decrypted plaintext
        """
        try:
            encryption_type = metadata.get("encryption_type", "fernet")
            
            if encryption_type == "blindfold" and self.use_blindfold:
                return self._decrypt_with_blindfold(encrypted_data, metadata)
            else:
                return self._decrypt_with_fernet(encrypted_data)
        except Exception as e:
            logger.error(f"Decryption failed: {str(e)}")
            raise
    
    def _encrypt_with_blindfold(self, plaintext: str) -> Dict[str, Any]:
        """Encrypt using blindfold homomorphic encryption"""
        try:
            # Convert string to bytes
            plaintext_bytes = plaintext.encode('utf-8')
            
            # Encrypt with blindfold
            # Note: For demonstration - actual implementation depends on blindfold API
            ciphertext = self.public_key.encrypt(plaintext_bytes)
            
            # Encode to base64 for transmission
            encrypted_b64 = base64.b64encode(bytes(ciphertext)).decode('utf-8')
            
            return {
                "encrypted": encrypted_b64,
                "metadata": {
                    "encryption_type": "blindfold",
                    "algorithm": "homomorphic",
                    "timestamp": datetime.utcnow().isoformat(),
                    "size_bytes": len(encrypted_b64)
                }
            }
        except Exception as e:
            logger.error(f"Blindfold encryption failed: {str(e)}")
            # Fallback to Fernet
            return self._encrypt_with_fernet(plaintext)
    
    def _decrypt_with_blindfold(self, encrypted_data: str, metadata: Dict[str, Any]) -> str:
        """Decrypt using blindfold"""
        try:
            # Decode from base64
            ciphertext_bytes = base64.b64decode(encrypted_data)
            
            # Decrypt with blindfold
            plaintext_bytes = self.secret_key.decrypt(ciphertext_bytes)
            
            return plaintext_bytes.decode('utf-8')
        except Exception as e:
            logger.error(f"Blindfold decryption failed: {str(e)}")
            raise
    
    def _encrypt_with_fernet(self, plaintext: str) -> Dict[str, Any]:
        """Fallback encryption using Fernet"""
        try:
            plaintext_bytes = plaintext.encode('utf-8')
            encrypted_bytes = self.fernet.encrypt(plaintext_bytes)
            encrypted_b64 = base64.b64encode(encrypted_bytes).decode('utf-8')
            
            return {
                "encrypted": encrypted_b64,
                "metadata": {
                    "encryption_type": "fernet",
                    "algorithm": "AES-128-CBC",
                    "timestamp": datetime.utcnow().isoformat(),
                    "size_bytes": len(encrypted_b64)
                }
            }
        except Exception as e:
            logger.error(f"Fernet encryption failed: {str(e)}")
            raise
    
    def _decrypt_with_fernet(self, encrypted_data: str) -> str:
        """Fallback decryption using Fernet"""
        try:
            encrypted_bytes = base64.b64decode(encrypted_data)
            plaintext_bytes = self.fernet.decrypt(encrypted_bytes)
            return plaintext_bytes.decode('utf-8')
        except Exception as e:
            logger.error(f"Fernet decryption failed: {str(e)}")
            raise
    
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
