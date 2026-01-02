"""
Pydantic models for medical operations
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class MedicalSymptom(BaseModel):
    """Individual symptom description"""
    symptom: str = Field(..., description="Symptom description")
    severity: str = Field(..., description="Severity: mild, moderate, severe")
    duration_days: int = Field(..., description="Duration in days")


class MedicalHistory(BaseModel):
    """Patient medical history (encrypted)"""
    conditions: List[str] = Field(default=[], description="Existing conditions")
    medications: List[str] = Field(default=[], description="Current medications")
    allergies: List[str] = Field(default=[], description="Known allergies")


class MedicalQueryMetadata(BaseModel):
    """Metadata for medical query"""
    symptoms: List[MedicalSymptom]
    age_range: Optional[str] = Field(None, description="Age range: 0-18, 19-40, 41-65, 65+")
    gender: Optional[str] = Field(None, description="Gender if relevant")
    urgency: str = Field(default="normal", description="normal, urgent, emergency")
