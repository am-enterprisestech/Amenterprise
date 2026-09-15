import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import current_client, current_role, current_user, require_admin
from app.core.errors import ConflictError, NotFoundError, UnauthorizedError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.db.session import get_db
from app.models import (
    BlogPost,
    Booking,
    CaseStudy,
    Client,
    ClientMessage,
    ClientNotification,
    ContactMessage,
    Faq,
    Lead,
    NewsletterSubscriber,
    PageSeo,
    Portfolio,
    PricingPlan,
    ProcessStep,
    Project,
    QuoteRequest,
    Service,
    SiteAudit,
    Stat,
    SupportRequest,
    TeamMember,
    Testimonial,
    User,
    UserRole,
)
from app.schemas import (
    AuditIn,
    BlogPostOut,
    BookingIn,
    ContactIn,
    LeadIn,
    LoginIn,
    NewsletterIn,
    OkOut,
    PortfolioOut,
    QuoteIn,
    RefreshIn,
    RegisterIn,
    ServiceOut,
    SupportRequestIn,
    TokenPair,
    UserOut,
)

api_router = APIRouter()

# --------------------------------------------------------------------------- auth
auth_router = APIRouter(prefix="/auth", tags=["auth"])


@auth_router.post("/register", response_model=UserOut, status_code=201)
async def register(payload: RegisterIn, db: AsyncSession = Depends(get_db)):
    exists = await db.scalar(select(User).where(User.email == payload.email.lower()))
    if exists:
        raise ConflictError("An account with that email already exists")
    user = User(
        email=payload.email.lower(),
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
    )
    db.add(user)
    await db.flush()
    db.add(UserRole(user_id=user.id, role="user"))
    await db.flush()
    return UserOut(
        id=user.id, email=user.email, full_name=user.full_name, is_active=True, role="user"
    )


@auth_router.post("/login", response_model=TokenPair)
async def login(payload: LoginIn, db: AsyncSession = Depends(get_db)):
    user = await db.scalar(select(User).where(User.email == payload.email.lower()))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise UnauthorizedError("Invalid email or password")
    role = await db.scalar(select(UserRole.role).where(UserRole.user_id == user.id)) or "user"
    sub = str(user.id)
    return TokenPair(
        access_token=create_access_token(sub, role),
        refresh_token=create_refresh_token(sub, role),
    )


@auth_router.post("/refresh", response_model=TokenPair)
async def refresh(payload: RefreshIn):
    claims = decode_token(payload.refresh_token, "refresh")
    sub, role = claims["sub"], claims.get("role", "user")
    return TokenPair(
        access_token=create_access_token(sub, role),
        refresh_token=create_refresh_token(sub, role),
    )


@auth_router.get("/me", response_model=UserOut)
async def me(user: User = Depends(current_user), role: str = Depends(current_role)):
    return UserOut(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
        role=role,
    )


# ------------------------------------------------------------------------ content
content_router = APIRouter(prefix="/content", tags=["content"])

PUBLIC_TABLES = {
    "services": Service,
    "portfolio": Portfolio,
    "testimonials": Testimonial,
    "team": TeamMember,
    "faqs": Faq,
    "pricing": PricingPlan,
    "stats": Stat,
    "process": ProcessStep,
    "clients": Client,
    "case-studies": CaseStudy,
}


@content_router.get("/services", response_model=list[ServiceOut])
async def list_services(db: AsyncSession = Depends(get_db)):
    rows = await db.scalars(
        select(Service).where(Service.published.is_(True)).order_by(Service.sort_order)
    )
    return list(rows)


@content_router.get("/services/{slug}", response_model=ServiceOut)
async def get_service(slug: str, db: AsyncSession = Depends(get_db)):
    row = await db.scalar(
        select(Service).where(Service.slug == slug, Service.published.is_(True))
    )
    if row is None:
        raise NotFoundError("Service not found")
    return row


@content_router.get("/blog", response_model=list[BlogPostOut])
async def list_posts(
    limit: int = Query(20, le=100), offset: int = 0, db: AsyncSession = Depends(get_db)
):
    rows = await db.scalars(
        select(BlogPost)
        .where(BlogPost.published.is_(True))
        .order_by(BlogPost.published_at.desc())
        .limit(limit)
        .offset(offset)
    )
    return list(rows)


@content_router.get("/blog/{slug}", response_model=BlogPostOut)
async def get_post(slug: str, db: AsyncSession = Depends(get_db)):
    row = await db.scalar(
        select(BlogPost).where(BlogPost.slug == slug, BlogPost.published.is_(True))
    )
    if row is None:
        raise NotFoundError("Post not found")
    return row


@content_router.get("/portfolio", response_model=list[PortfolioOut])
async def list_portfolio(db: AsyncSession = Depends(get_db)):
    rows = await db.scalars(
        select(Portfolio).where(Portfolio.published.is_(True)).order_by(Portfolio.sort_order)
    )
    return list(rows)


@content_router.get("/{table}")
async def list_public_table(table: str, db: AsyncSession = Depends(get_db)):
    model = PUBLIC_TABLES.get(table)
    if model is None:
        raise NotFoundError(f"Unknown content collection '{table}'")
    rows = await db.scalars(
        select(model).where(model.published.is_(True)).order_by(model.sort_order)
    )
    return [
        {c.name: getattr(r, c.name) for c in model.__table__.columns} for r in rows
    ]


@content_router.get("/seo/page")
async def page_seo(path: str, db: AsyncSession = Depends(get_db)):
    row = await db.scalar(select(PageSeo).where(PageSeo.path == path))
    if row is None:
        raise NotFoundError("No SEO record for that path")
    return {c.name: getattr(row, c.name) for c in PageSeo.__table__.columns}


# -------------------------------------------------------------------------- forms
forms_router = APIRouter(prefix="/forms", tags=["forms"])


@forms_router.post("/contact", response_model=OkOut, status_code=201)
async def submit_contact(payload: ContactIn, db: AsyncSession = Depends(get_db)):
    row = ContactMessage(**payload.model_dump())
    db.add(row)
    await db.flush()
    return OkOut(id=row.id)


@forms_router.post("/quote", response_model=OkOut, status_code=201)
async def submit_quote(payload: QuoteIn, db: AsyncSession = Depends(get_db)):
    row = QuoteRequest(**payload.model_dump())
    db.add(row)
    await db.flush()
    return OkOut(id=row.id)


@forms_router.post("/booking", response_model=OkOut, status_code=201)
async def submit_booking(payload: BookingIn, db: AsyncSession = Depends(get_db)):
    row = Booking(**payload.model_dump())
    db.add(row)
    await db.flush()
    return OkOut(id=row.id)


@forms_router.post("/newsletter", response_model=OkOut, status_code=201)
async def subscribe(payload: NewsletterIn, db: AsyncSession = Depends(get_db)):
    existing = await db.scalar(
        select(NewsletterSubscriber).where(NewsletterSubscriber.email == payload.email)
    )
    if existing:
        return OkOut(id=existing.id)
    row = NewsletterSubscriber(**payload.model_dump())
    db.add(row)
    await db.flush()
    return OkOut(id=row.id)


@forms_router.post("/audit", response_model=OkOut, status_code=201)
async def request_audit(payload: AuditIn, db: AsyncSession = Depends(get_db)):
    row = SiteAudit(**payload.model_dump(), status="pending")
    db.add(row)
    await db.flush()
    return OkOut(id=row.id)


@forms_router.post("/lead", response_model=OkOut, status_code=201)
async def create_lead(payload: LeadIn, db: AsyncSession = Depends(get_db)):
    row = Lead(**payload.model_dump(), stage="new")
    db.add(row)
    await db.flush()
    return OkOut(id=row.id)


# ------------------------------------------------------------------------- portal
portal_router = APIRouter(prefix="/portal", tags=["portal"])


@portal_router.get("/me")
async def portal_me(client=Depends(current_client)):
    return {
        "id": client.id,
        "name": client.name,
        "email": client.email,
        "company": client.company,
        "phone": client.phone,
        "active": client.active,
    }


@portal_router.get("/projects")
async def my_projects(client=Depends(current_client), db: AsyncSession = Depends(get_db)):
    rows = await db.scalars(
        select(Project).where(Project.client_id == client.id).order_by(Project.created_at.desc())
    )
    return [{c.name: getattr(r, c.name) for c in Project.__table__.columns} for r in rows]


@portal_router.get("/messages")
async def my_messages(client=Depends(current_client), db: AsyncSession = Depends(get_db)):
    rows = await db.scalars(
        select(ClientMessage)
        .where(ClientMessage.client_id == client.id)
        .order_by(ClientMessage.created_at.desc())
    )
    return [{c.name: getattr(r, c.name) for c in ClientMessage.__table__.columns} for r in rows]


@portal_router.post("/messages/{message_id}/read", response_model=OkOut)
async def mark_message_read(
    message_id: uuid.UUID, client=Depends(current_client), db: AsyncSession = Depends(get_db)
):
    row = await db.get(ClientMessage, message_id)
    if row is None or row.client_id != client.id:
        raise NotFoundError("Message not found")
    row.is_read = True
    return OkOut(id=row.id)


@portal_router.get("/notifications")
async def my_notifications(client=Depends(current_client), db: AsyncSession = Depends(get_db)):
    rows = await db.scalars(
        select(ClientNotification)
        .where(ClientNotification.client_id == client.id)
        .order_by(ClientNotification.created_at.desc())
    )
    return [
        {c.name: getattr(r, c.name) for c in ClientNotification.__table__.columns} for r in rows
    ]


@portal_router.post("/support", response_model=OkOut, status_code=201)
async def open_ticket(
    payload: SupportRequestIn,
    client=Depends(current_client),
    db: AsyncSession = Depends(get_db),
):
    row = SupportRequest(client_id=client.id, **payload.model_dump())
    db.add(row)
    await db.flush()
    return OkOut(id=row.id)


# -------------------------------------------------------------------------- admin
admin_router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])

ADMIN_TABLES = {
    **PUBLIC_TABLES,
    "blog": BlogPost,
    "page-seo": PageSeo,
    "contact-messages": ContactMessage,
    "quote-requests": QuoteRequest,
    "bookings": Booking,
    "leads": Lead,
    "site-audits": SiteAudit,
    "support-requests": SupportRequest,
}


@admin_router.get("/{table}")
async def admin_list(
    table: str,
    limit: int = Query(100, le=500),
    offset: int = 0,
    db: AsyncSession = Depends(get_db),
):
    model = ADMIN_TABLES.get(table)
    if model is None:
        raise NotFoundError(f"Unknown collection '{table}'")
    rows = await db.scalars(select(model).limit(limit).offset(offset))
    return [{c.name: getattr(r, c.name) for c in model.__table__.columns} for r in rows]


@admin_router.post("/{table}", status_code=201)
async def admin_create(table: str, payload: dict, db: AsyncSession = Depends(get_db)):
    model = ADMIN_TABLES.get(table)
    if model is None:
        raise NotFoundError(f"Unknown collection '{table}'")
    allowed = {c.name for c in model.__table__.columns} - {"id", "created_at", "updated_at"}
    row = model(**{k: v for k, v in payload.items() if k in allowed})
    db.add(row)
    await db.flush()
    return {"id": row.id}


@admin_router.patch("/{table}/{row_id}")
async def admin_update(
    table: str, row_id: uuid.UUID, payload: dict, db: AsyncSession = Depends(get_db)
):
    model = ADMIN_TABLES.get(table)
    if model is None:
        raise NotFoundError(f"Unknown collection '{table}'")
    row = await db.get(model, row_id)
    if row is None:
        raise NotFoundError("Row not found")
    allowed = {c.name for c in model.__table__.columns} - {"id", "created_at"}
    for key, value in payload.items():
        if key in allowed:
            setattr(row, key, value)
    return {"id": row.id}


@admin_router.delete("/{table}/{row_id}", response_model=OkOut)
async def admin_delete(table: str, row_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    model = ADMIN_TABLES.get(table)
    if model is None:
        raise NotFoundError(f"Unknown collection '{table}'")
    row = await db.get(model, row_id)
    if row is None:
        raise NotFoundError("Row not found")
    await db.delete(row)
    return OkOut(id=row_id)


for r in (auth_router, content_router, forms_router, portal_router, admin_router):
    api_router.include_router(r)
