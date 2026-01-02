"""
Medical AI Assistant Backend API
HIPAA/SOC2-Compliant Private Medical Inference using Nillion nilAI

This FastAPI application provides:
- Encrypted medical query processing with blindfold-py
- nilAI LLM inference proxy
- TEE attestation verification
- HIPAA-compliant audit logging
- Web UI served via Jinja2 templates
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import logging
from datetime import datetime
import uvicorn
from pathlib import Path

from app.routers import medical, attestation, audit
from app.services.audit_logger import AuditLogger

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Medical AI Assistant",
    description="HIPAA-compliant private medical inference using Nillion",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Setup Jinja2 templates
templates = Jinja2Templates(directory=str(Path(__file__).parent / "templates"))

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize audit logger
audit_logger = AuditLogger()

# Include routers
app.include_router(medical.router, prefix="/api/medical", tags=["Medical"])
app.include_router(attestation.router, prefix="/api/attestation", tags=["Attestation"])
app.include_router(audit.router, prefix="/api/audit", tags=["Audit"])


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    """Serve the main web UI"""
    return templates.TemplateResponse("index.html", {"request": request})


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests for audit trail"""
    start_time = datetime.utcnow()
    
    # Process request
    response = await call_next(request)
    
    # Calculate duration
    duration = (datetime.utcnow() - start_time).total_seconds()
    
    # Log request (exclude sensitive data)
    audit_logger.log_api_request(
        method=request.method,
        path=request.url.path,
        status_code=response.status_code,
        duration=duration,
        client_ip=request.client.host if request.client else "unknown"
    )
    
    return response


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        # TODO: Add checks for nilAI connection, database, etc.
        return {
            "status": "healthy",
            "services": {
                "api": "operational",
                "nilai": "checking...",  # Will implement actual check
                "database": "checking...",
                "attestation": "checking..."
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unhealthy")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler with audit logging"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    
    # Log error to audit trail
    audit_logger.log_error(
        error_type=type(exc).__name__,
        error_message=str(exc),
        path=request.url.path,
        method=request.method
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred. Incident has been logged.",
            "timestamp": datetime.utcnow().isoformat()
        }
    )


if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
