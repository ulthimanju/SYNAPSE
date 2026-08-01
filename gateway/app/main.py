import logging
import httpx
from fastapi import FastAPI, Request, Response, status
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from shared.config.settings import settings

from shared.clients.base import get_shared_httpx_client

logger = logging.getLogger("synapse-gateway")

app = FastAPI(
    title="Synapse API Gateway",
    description="Central entrypoint router and reverse proxy for Synapse Microservices",
    version="1.0.0",
)

# Enable Gzip compression for payloads > 1000 bytes (reduces Knowledge Graph JSON size by 70%)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Enable CORS for web-app frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "synapse-gateway", "version": "1.0.0"}

async def proxy_request(target_url: str, request: Request) -> Response:
    """Reverse proxies incoming HTTP request to target microservice using pooled keep-alive HTTP client."""
    if request.method == "OPTIONS":
        return Response(status_code=200)

    body = await request.body()
    headers = {k: v for k, v in request.headers.items() if k.lower() != "host"}

    try:
        client = get_shared_httpx_client()
        resp = await client.request(
            method=request.method,
            url=target_url,
            headers=headers,
            params=dict(request.query_params),
            content=body,
            timeout=120.0,
            follow_redirects=False,
        )

        # Handle 302/301 OAuth redirects cleanly while preserving Set-Cookie headers
        if resp.status_code in (301, 302, 303, 307, 308) and "location" in resp.headers:
            redirect_resp = RedirectResponse(url=resp.headers["location"], status_code=resp.status_code)
            for k, v in resp.headers.multi_items():
                if k.lower() == "set-cookie":
                    redirect_resp.headers.append("set-cookie", v)
            return redirect_resp

        # Construct response forwarding multi-value headers (Set-Cookie)
        response = Response(
            content=resp.content,
            status_code=resp.status_code,
            media_type=resp.headers.get("content-type"),
        )
        for k, v in resp.headers.multi_items():
            if k.lower() not in ("content-length", "content-type"):
                response.headers.append(k, v)
        return response
    except Exception as exc:
        logger.error(f"Gateway proxy error to {target_url}: {exc}")
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"detail": f"Service unavailable: {str(exc)}"},
        )

# ─────────────────────────────────────────────────────────
# Identity Service Routes  →  identity-service:8001
# ─────────────────────────────────────────────────────────
@app.api_route("/api/v1/auth/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
@app.api_route("/api/auth/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
@app.api_route("/auth/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def route_auth(request: Request, path: str = ""):
    target = f"{settings.identity_service_url}/auth/{path}" if path else f"{settings.identity_service_url}/auth"
    return await proxy_request(target, request)

# ─────────────────────────────────────────────────────────
# Document Service Routes — /workspaces/{id}/documents/*
# IMPORTANT: these MUST be declared BEFORE the workspace
# catch-all route so FastAPI matches them first.
# document-service owns all /workspaces/*/documents paths.
# ─────────────────────────────────────────────────────────
@app.api_route("/workspaces/{workspace_id}/documents", methods=["GET", "POST", "OPTIONS"])
@app.api_route("/workspaces/{workspace_id}/documents/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def route_workspace_documents(request: Request, workspace_id: str, path: str = ""):
    if path:
        target = f"{settings.document_service_url}/workspaces/{workspace_id}/documents/{path}"
    else:
        target = f"{settings.document_service_url}/workspaces/{workspace_id}/documents"
    return await proxy_request(target, request)

# ─────────────────────────────────────────────────────────
# Workspace Service Routes — all other /workspaces/* paths
# →  workspace-service:8002
# ─────────────────────────────────────────────────────────
@app.api_route("/api/v1/workspaces", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
@app.api_route("/api/v1/workspaces/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
@app.api_route("/api/workspaces", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
@app.api_route("/api/workspaces/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
@app.api_route("/workspaces", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
@app.api_route("/workspaces/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def route_workspaces(request: Request, path: str = ""):
    target = f"{settings.workspace_service_url}/workspaces/{path}" if path else f"{settings.workspace_service_url}/workspaces"
    return await proxy_request(target, request)

# ─────────────────────────────────────────────────────────
# Document Service Routes — /documents/* direct paths
# →  document-service:8003
# ─────────────────────────────────────────────────────────
@app.api_route("/api/v1/documents", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
@app.api_route("/api/v1/documents/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
@app.api_route("/api/documents", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
@app.api_route("/api/documents/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
@app.api_route("/documents", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
@app.api_route("/documents/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def route_documents(request: Request, path: str = ""):
    target = f"{settings.document_service_url}/documents/{path}" if path else f"{settings.document_service_url}/documents"
    return await proxy_request(target, request)

# ─────────────────────────────────────────────────────────
# RAG Service Routes  →  rag-service:8004
# ─────────────────────────────────────────────────────────
@app.api_route("/retrieve", methods=["POST", "OPTIONS"])
async def route_retrieve(request: Request):
    target = f"{settings.rag_service_url}/retrieve"
    return await proxy_request(target, request)

@app.api_route("/chat/{path:path}", methods=["GET", "POST", "DELETE", "OPTIONS"])
@app.api_route("/chat", methods=["GET", "POST", "DELETE", "OPTIONS"])
async def route_chat(request: Request, path: str = ""):
    target = f"{settings.rag_service_url}/chat/{path}" if path else f"{settings.rag_service_url}/chat"
    return await proxy_request(target, request)
