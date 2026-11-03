from fastapi import APIRouter


def get_auth_routers() -> APIRouter:
    from .registration import router as register_router
    from .login import router as login_router
    from .external import get_auth_external_routers
    from .link.telegram import router as telegram_link_router
    
    router = APIRouter(prefix='/auth', tags=['Auth'])
    
    router.include_router(register_router)
    router.include_router(login_router)
    router.include_router(get_auth_external_routers())
    router.include_router(telegram_link_router, prefix="/link")
    
    return router
