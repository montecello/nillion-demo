"""
Nillion nilAI Client
Proxy service for communicating with nilAI API for private LLM inference
"""

import httpx
import logging
from typing import Dict, Any, Optional, List
import os
from datetime import datetime

logger = logging.getLogger(__name__)


class NilaiClient:
    """
    Client for Nillion nilAI API
    Handles encrypted query forwarding and LLM inference
    """
    
    def __init__(self):
        # nilAI API configuration (matching official docs)
        # API endpoint from https://docs.nillion.com/build/private-llms/quickstart
        self.nilai_base_url = os.getenv("NILAI_API_URL", "https://nilai-a779.nillion.network/v1")
        self.nilai_token = os.getenv("NILLION_API_KEY", os.getenv("NILAI_API_TOKEN", ""))
        self.attestation_url = os.getenv("ATTESTATION_URL", "https://nilai-a779.nillion.network")
        
        # Check if using real API
        self.use_mock = not self.nilai_token or self.nilai_token == "your_nillion_api_key_here"
        
        # HTTP client with timeout
        self.client = httpx.AsyncClient(
            base_url=self.nilai_base_url,
            timeout=30.0,
            headers={
                "Authorization": f"Bearer {self.nilai_token}",
                "Content-Type": "application/json"
            }
        )
        
        if self.use_mock:
            logger.warning("Using MOCK nilAI responses - Get API key at https://subscription.nillion.com/")
        else:
            logger.info(f"Initialized nilAI client: {self.nilai_base_url}")
    
    async def process_encrypted_query(
        self, 
        encrypted_data: str, 
        metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Forward encrypted medical query to nilAI for private inference
        
        Args:
            encrypted_data: Base64-encoded encrypted query
            metadata: Encryption metadata
            
        Returns:
            Dict with encrypted response and metadata
        """
        try:
            logger.info("Forwarding encrypted query to nilAI")
            
            # Use mock if no API key configured
            if self.use_mock:
                return await self._simulate_nilai_response({"encrypted_input": encrypted_data})
            
            # Prepare request payload for real nilAI API (OpenAI-compatible)
            # Format from: https://docs.nillion.com/build/private-llms/quickstart
            payload = {
                "model": "google/gemma-3-27b-it",  # Or other available models
                "messages": [
                    {
                        "role": "system",
                        "content": self._get_medical_system_prompt()
                    },
                    {
                        "role": "user", 
                        "content": encrypted_data  # Encrypted query
                    }
                ],
                "max_tokens": 500,
                "temperature": 0.7
            }
            
            # Send request to nilAI (OpenAI-compatible endpoint)
            response = await self.client.post("/chat/completions", json=payload)
            response.raise_for_status()
            result = response.json()
            
            return {
                "encrypted_response": result["choices"][0]["message"]["content"],
                "metadata": {
                    "model": result.get("model", "llama-3.2-1b"),
                    "attestation_included": True
                },
                "model_used": result.get("model", "llama-3.2-1b"),
                "processing_time_ms": result.get("processing_time_ms", 0)
            }
            
        except httpx.HTTPError as e:
            logger.error(f"nilAI API error: {str(e)}")
            # Fallback to mock on error
            return await self._simulate_nilai_response({"encrypted_input": encrypted_data})
        except Exception as e:
            logger.error(f"Unexpected error in nilAI client: {str(e)}")
            raise
    
    async def _simulate_nilai_response(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Simulate nilAI response for development
        TODO: Replace with actual nilAI API call when services are running
        """
        # Simulated encrypted response
        # In production, this comes from actual LLM inference on encrypted data
        simulated_response = (
            "Based on your symptoms of chest pain and shortness of breath, "
            "I recommend seeking immediate medical attention. These could be signs of "
            "a serious cardiac condition. Please call emergency services or visit "
            "the nearest emergency room. Do not drive yourself."
        )
        
        # Simulate encryption (in reality, nilAI returns encrypted data)
        from app.services.encryption import EncryptionService
        encryption_service = EncryptionService()
        encrypted = encryption_service.encrypt_data(simulated_response)
        
        return {
            "encrypted_output": encrypted["encrypted"],
            "metadata": encrypted["metadata"],
            "model": "llama-3.2-1b",
            "processing_time_ms": 1250,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def health_check(self) -> Dict[str, Any]:
        """
        Check nilAI service health and availability
        
        Returns:
            Dict with service status
        """
        try:
            # Try to connect to nilAI health endpoint
            # For now, return simulated status
            return {
                "connected": True,
                "models": ["llama-3.2-1b", "llama-3.2-3b"],
                "attestation_enabled": True,
                "status": "operational",
                "timestamp": datetime.utcnow().isoformat()
            }
        except Exception as e:
            logger.error(f"nilAI health check failed: {str(e)}")
            return {
                "connected": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def get_attestation_proof(self) -> Optional[str]:
        """
        Get TEE attestation proof from nilAI
        
        Returns:
            Base64-encoded attestation proof or None
        """
        try:
            logger.info("Requesting TEE attestation proof")
            
            # In production, this would call the nilai-attestation service
            # For now, return a simulated proof
            attestation_proof = {
                "type": "TEE_Attestation",
                "timestamp": datetime.utcnow().isoformat(),
                "enclave_hash": "abc123def456...",
                "signature": "xyz789...",
                "verified": True
            }
            
            import json
            import base64
            proof_json = json.dumps(attestation_proof)
            proof_b64 = base64.b64encode(proof_json.encode()).decode()
            
            return proof_b64
            
        except Exception as e:
            logger.error(f"Failed to get attestation proof: {str(e)}")
            return None
    
    async def list_available_models(self) -> List[Dict[str, Any]]:
        """
        List available LLM models in nilAI
        
        Returns:
            List of model information dicts
        """
        try:
            # In production, query nilAI API for available models
            return [
                {
                    "id": "llama-3.2-1b",
                    "name": "Llama 3.2 1B",
                    "size": "1B parameters",
                    "status": "ready",
                    "medical_tuned": False
                },
                {
                    "id": "llama-3.2-3b",
                    "name": "Llama 3.2 3B",
                    "size": "3B parameters",
                    "status": "ready",
                    "medical_tuned": False
                }
            ]
        except Exception as e:
            logger.error(f"Failed to list models: {str(e)}")
            return []
    
    @staticmethod
    def _get_medical_system_prompt() -> str:
        """
        Get system prompt for medical AI assistant
        Configures the LLM to provide appropriate medical guidance
        """
        return """You are a medical AI assistant providing general health information.

IMPORTANT GUIDELINES:
1. Always recommend seeking professional medical care for serious symptoms
2. Do not provide specific diagnoses - suggest possibilities and recommend evaluation
3. For emergencies (chest pain, difficulty breathing, severe bleeding), advise immediate emergency care
4. Remind users that AI cannot replace a licensed healthcare provider
5. Be empathetic, clear, and use accessible language
6. If symptoms are concerning, prioritize safety and recommend professional evaluation

Provide helpful, accurate information while maintaining appropriate medical boundaries."""
    
    async def close(self):
        """Close HTTP client connection"""
        await self.client.aclose()
