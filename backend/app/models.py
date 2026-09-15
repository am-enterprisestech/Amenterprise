"""SQLAlchemy models mirroring the production schema."""
import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDMixin


# ---------- auth ----------
class User(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "users"
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(200))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class UserRole(Base, UUIDMixin):
    __tablename__ = "user_roles"
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="user")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


# ---------- public content ----------
class Service(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "services"
    title: Mapped[str] = mapped_column(Text, nullable=False)
    slug: Mapped[str | None] = mapped_column(Text, unique=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    long_description: Mapped[str | None] = mapped_column(Text)
    icon: Mapped[str | None] = mapped_column(Text)
    gradient: Mapped[str | None] = mapped_column(Text)
    tags: Mapped[list[str] | None] = mapped_column(ARRAY(Text))
    features: Mapped[list[str] | None] = mapped_column(ARRAY(Text))
    faq: Mapped[list | None] = mapped_column(JSONB, default=list)
    process: Mapped[list | None] = mapped_column(JSONB, default=list)
    pricing_tiers: Mapped[list | None] = mapped_column(JSONB, default=list)
    hero_image: Mapped[str | None] = mapped_column(Text)
    banner_image: Mapped[str | None] = mapped_column(Text)
    meta_title: Mapped[str | None] = mapped_column(Text)
    meta_description: Mapped[str | None] = mapped_column(Text)
    og_image: Mapped[str | None] = mapped_column(Text)
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    published: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class Portfolio(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "portfolio"
    title: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    image_url: Mapped[str | None] = mapped_column(Text)
    link_url: Mapped[str | None] = mapped_column(Text)
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    published: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class BlogPost(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "blog_posts"
    title: Mapped[str] = mapped_column(Text, nullable=False)
    slug: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    excerpt: Mapped[str | None] = mapped_column(Text)
    content: Mapped[str | None] = mapped_column(Text)
    cover_url: Mapped[str | None] = mapped_column(Text)
    author: Mapped[str | None] = mapped_column(Text)
    tags: Mapped[list[str] | None] = mapped_column(ARRAY(Text))
    meta_title: Mapped[str | None] = mapped_column(Text)
    meta_description: Mapped[str | None] = mapped_column(Text)
    og_image: Mapped[str | None] = mapped_column(Text)
    published: Mapped[bool] = mapped_column(Boolean, default=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class Testimonial(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "testimonials"
    name: Mapped[str] = mapped_column(Text, nullable=False)
    role_title: Mapped[str | None] = mapped_column(Text)
    quote: Mapped[str] = mapped_column(Text, nullable=False)
    stars: Mapped[int] = mapped_column(Integer, default=5)
    avatar_url: Mapped[str | None] = mapped_column(Text)
    published: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class TeamMember(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "team_members"
    name: Mapped[str] = mapped_column(Text, nullable=False)
    role_title: Mapped[str | None] = mapped_column(Text)
    bio: Mapped[str | None] = mapped_column(Text)
    photo_url: Mapped[str | None] = mapped_column(Text)
    email: Mapped[str | None] = mapped_column(Text)
    linkedin_url: Mapped[str | None] = mapped_column(Text)
    twitter_url: Mapped[str | None] = mapped_column(Text)
    published: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class Faq(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "faqs"
    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str | None] = mapped_column(Text)
    published: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class PricingPlan(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "pricing_plans"
    name: Mapped[str] = mapped_column(Text, nullable=False)
    price: Mapped[str | None] = mapped_column(Text)
    price_period: Mapped[str | None] = mapped_column(Text)
    description: Mapped[str | None] = mapped_column(Text)
    features: Mapped[list[str] | None] = mapped_column(ARRAY(Text))
    cta_label: Mapped[str | None] = mapped_column(Text)
    cta_url: Mapped[str | None] = mapped_column(Text)
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    published: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class Stat(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "stats"
    label: Mapped[str] = mapped_column(Text, nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    published: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class ProcessStep(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "process_steps"
    step_number: Mapped[str | None] = mapped_column(Text)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    published: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class Client(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "clients"
    name: Mapped[str] = mapped_column(Text, nullable=False)
    logo_url: Mapped[str | None] = mapped_column(Text)
    website_url: Mapped[str | None] = mapped_column(Text)
    published: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class CaseStudy(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "case_studies"
    title: Mapped[str] = mapped_column(Text, nullable=False)
    client: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str | None] = mapped_column(Text)
    summary: Mapped[str | None] = mapped_column(Text)
    results: Mapped[str | None] = mapped_column(Text)
    cover_url: Mapped[str | None] = mapped_column(Text)
    link_url: Mapped[str | None] = mapped_column(Text)
    published: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class PageSeo(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "page_seo"
    path: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    label: Mapped[str] = mapped_column(Text, nullable=False)
    meta_title: Mapped[str | None] = mapped_column(Text)
    meta_description: Mapped[str | None] = mapped_column(Text)
    meta_keywords: Mapped[str | None] = mapped_column(Text)
    og_title: Mapped[str | None] = mapped_column(Text)
    og_description: Mapped[str | None] = mapped_column(Text)
    og_image: Mapped[str | None] = mapped_column(Text)
    canonical_url: Mapped[str | None] = mapped_column(Text)
    noindex: Mapped[bool] = mapped_column(Boolean, default=False)


# ---------- inbound submissions ----------
class ContactMessage(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "contact_messages"
    name: Mapped[str] = mapped_column(Text, nullable=False)
    email: Mapped[str] = mapped_column(Text, nullable=False)
    phone: Mapped[str | None] = mapped_column(Text)
    subject: Mapped[str | None] = mapped_column(Text)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)


class QuoteRequest(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "quote_requests"
    name: Mapped[str] = mapped_column(Text, nullable=False)
    email: Mapped[str] = mapped_column(Text, nullable=False)
    phone: Mapped[str | None] = mapped_column(Text)
    company: Mapped[str | None] = mapped_column(Text)
    service: Mapped[str | None] = mapped_column(Text)
    budget: Mapped[str | None] = mapped_column(Text)
    timeline: Mapped[str | None] = mapped_column(Text)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(Text, default="new")


class Booking(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "bookings"
    name: Mapped[str] = mapped_column(Text, nullable=False)
    email: Mapped[str] = mapped_column(Text, nullable=False)
    phone: Mapped[str | None] = mapped_column(Text)
    company: Mapped[str | None] = mapped_column(Text)
    service: Mapped[str | None] = mapped_column(Text)
    preferred_date: Mapped[date | None] = mapped_column(Date)
    preferred_time: Mapped[str | None] = mapped_column(Text)
    meeting_type: Mapped[str | None] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(Text, default="new")


class NewsletterSubscriber(Base, UUIDMixin):
    __tablename__ = "newsletter_subscribers"
    email: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    source: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class SiteAudit(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "site_audits"
    url: Mapped[str] = mapped_column(Text, nullable=False)
    name: Mapped[str | None] = mapped_column(Text)
    email: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(Text, default="pending")
    score_overall: Mapped[int | None] = mapped_column(Integer)
    scores: Mapped[dict | None] = mapped_column(JSONB, default=dict)
    findings: Mapped[list | None] = mapped_column(JSONB, default=list)
    summary: Mapped[str | None] = mapped_column(Text)


# ---------- CRM ----------
class Lead(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "leads"
    name: Mapped[str] = mapped_column(Text, nullable=False)
    email: Mapped[str] = mapped_column(Text, nullable=False)
    phone: Mapped[str | None] = mapped_column(Text)
    company: Mapped[str | None] = mapped_column(Text)
    service: Mapped[str | None] = mapped_column(Text)
    source: Mapped[str] = mapped_column(Text, default="website")
    value_usd: Mapped[float] = mapped_column(Numeric, default=0)
    stage: Mapped[str] = mapped_column(Text, default="new")
    priority: Mapped[str] = mapped_column(Text, default="medium")
    notes: Mapped[str | None] = mapped_column(Text)
    next_follow_up: Mapped[date | None] = mapped_column(Date)


class Proposal(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "proposals"
    client_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("portal_clients.id", ondelete="SET NULL")
    )
    title: Mapped[str] = mapped_column(Text, nullable=False)
    client_name: Mapped[str] = mapped_column(Text, nullable=False)
    client_email: Mapped[str | None] = mapped_column(Text)
    currency: Mapped[str] = mapped_column(Text, default="USD")
    items: Mapped[list | None] = mapped_column(JSONB, default=list)
    subtotal: Mapped[float] = mapped_column(Numeric, default=0)
    discount: Mapped[float] = mapped_column(Numeric, default=0)
    total: Mapped[float] = mapped_column(Numeric, default=0)
    status: Mapped[str] = mapped_column(Text, default="draft")
    valid_until: Mapped[date | None] = mapped_column(Date)


class Invoice(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "invoices"
    client_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("portal_clients.id", ondelete="SET NULL")
    )
    number: Mapped[str] = mapped_column(Text, nullable=False)
    client_name: Mapped[str] = mapped_column(Text, nullable=False)
    client_email: Mapped[str | None] = mapped_column(Text)
    currency: Mapped[str] = mapped_column(Text, default="USD")
    items: Mapped[list | None] = mapped_column(JSONB, default=list)
    subtotal: Mapped[float] = mapped_column(Numeric, default=0)
    tax: Mapped[float] = mapped_column(Numeric, default=0)
    total: Mapped[float] = mapped_column(Numeric, default=0)
    amount_paid: Mapped[float] = mapped_column(Numeric, default=0)
    status: Mapped[str] = mapped_column(Text, default="draft")
    due_date: Mapped[date | None] = mapped_column(Date)


# ---------- client portal ----------
class PortalClient(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "portal_clients"
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    name: Mapped[str] = mapped_column(Text, nullable=False)
    email: Mapped[str] = mapped_column(Text, nullable=False)
    company: Mapped[str | None] = mapped_column(Text)
    phone: Mapped[str | None] = mapped_column(Text)
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class Project(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "projects"
    client_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("portal_clients.id", ondelete="SET NULL")
    )
    title: Mapped[str] = mapped_column(Text, nullable=False)
    service: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(Text, default="planning")
    progress: Mapped[int] = mapped_column(Integer, default=0)
    start_date: Mapped[date | None] = mapped_column(Date)
    due_date: Mapped[date | None] = mapped_column(Date)
    budget_usd: Mapped[float] = mapped_column(Numeric, default=0)
    summary: Mapped[str | None] = mapped_column(Text)


class ProjectMilestone(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "project_milestones"
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(Text, default="pending")
    due_date: Mapped[date | None] = mapped_column(Date)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class ClientTask(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "client_tasks"
    client_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("portal_clients.id", ondelete="CASCADE"), nullable=False
    )
    project_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    title: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(Text, default="todo")
    priority: Mapped[str] = mapped_column(Text, default="medium")
    progress: Mapped[int] = mapped_column(Integer, default=0)
    assignee: Mapped[str | None] = mapped_column(Text)
    due_date: Mapped[date | None] = mapped_column(Date)


class ClientDocument(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "client_documents"
    client_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("portal_clients.id", ondelete="CASCADE"), nullable=False
    )
    project_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    name: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    file_type: Mapped[str | None] = mapped_column(Text)
    file_size: Mapped[int | None] = mapped_column(Integer)
    url: Mapped[str] = mapped_column(Text, nullable=False)


class ClientMessage(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "client_messages"
    client_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("portal_clients.id", ondelete="CASCADE"), nullable=False
    )
    subject: Mapped[str] = mapped_column(Text, nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    sender: Mapped[str] = mapped_column(Text, default="Team")
    important: Mapped[bool] = mapped_column(Boolean, default=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)


class ClientNotification(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "client_notifications"
    client_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("portal_clients.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(Text, nullable=False)
    body: Mapped[str | None] = mapped_column(Text)
    kind: Mapped[str] = mapped_column(Text, default="info")
    link: Mapped[str | None] = mapped_column(Text)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)


class ClientActivity(Base, UUIDMixin):
    __tablename__ = "client_activities"
    client_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("portal_clients.id", ondelete="CASCADE"), nullable=False
    )
    action: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    actor: Mapped[str] = mapped_column(Text, default="system")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class SupportRequest(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "support_requests"
    client_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("portal_clients.id", ondelete="CASCADE"), nullable=False
    )
    subject: Mapped[str] = mapped_column(Text, nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(Text, default="open")
    priority: Mapped[str] = mapped_column(Text, default="normal")
    reply: Mapped[str | None] = mapped_column(Text)
