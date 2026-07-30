from fastapi import FastAPI
from shared.middleware import register_middlewares
from shared.exceptions import register_exception_handlers
from .lifespan import lifespan
from .api.router import api_router

app = FastAPI(
    title="Synapse Identity Service",
    description="Identity & Authentication Microservice for Synapse Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# Register shared middleware stack & global exception handlers
register_middlewares(app)
register_exception_handlers(app)

# Register API Router
app.include_router(api_router)
