"""Pydantic v2 request/response schemas."""
import uuid
from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ---------- auth ----------
class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=200)


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshIn(BaseModel):
    refresh_token: str


class UserOut(ORMModel):
    id: uuid.UUID
    email: EmailStr
    full_name: str | None = None
    is_active: bool
    role: str = "user"


# ---------- content ----------
class ServiceOut(ORMModel):
    id: uuid.UUID
    title: str
    slug: str | None = None
    description: str
    long_description: str | None = None
    icon: str | None = None
    tags: list[str] | None = None
    features: list[str] | None = None
    faq: Any = None
    process: Any = None
    pricing_tiers: Any = None
    featured: bool
    published: bool
    sort_order: int


class BlogPostOut(ORMModel):
    id: uuid.UUID
    title: str
    slug: str
    excerpt: str | None = None
    content: str | None = None
    cover_url: str | None = None
    author: str | None = None
    tags: list[str] | None = None
    published: bool
    published_at: datetime | None = None


class PortfolioOut(ORMModel):
    id: uuid.UUID
    title: str
    category: str
    description: str | None = None
    image_url: str | None = None
    link_url: str | None = None
    featured: bool
    published: bool
    sort_order: int


class SimpleContentOut(ORMModel):
    id: uuid.UUID
    published: bool
    sort_order: int
    model_config = ConfigDict(from_attributes=True, extra="allow")


# ---------- forms ----------
class ContactIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=50)
    subject: str | None = Field(default=None, max_length=200)
    message: str = Field(min_length=1, max_length=5000)


class QuoteIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=50)
    company: str | None = Field(default=None, max_length=200)
    service: str | None = Field(default=None, max_length=200)
    budget: str | None = Field(default=None, max_length=100)
    timeline: str | None = Field(default=None, max_length=100)
    message: str = Field(min_length=1, max_length=5000)


class BookingIn(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=50)
    company: str | None = Field(default=None, max_length=200)
    service: str | None = Field(default=None, max_length=200)
    preferred_date: date | None = None
    preferred_time: str | None = Field(default=None, max_length=50)
    meeting_type: str | None = Field(default=None, max_length=100)
    notes: str | None = Field(default=None, max_length=5000)


class NewsletterIn(BaseModel):
    email: EmailStr
    source: str | None = Field(default=None, max_length=100)


class AuditIn(BaseModel):
    url: str = Field(min_length=4, max_length=400)
    name: str | None = Field(default=None, max_length=200)
    email: EmailStr


class LeadIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    phone: str | None = Field(default=None, max_length=50)
    company: str | None = Field(default=None, max_length=200)
    service: str | None = Field(default=None, max_length=200)
    notes: str | None = Field(default=None, max_length=4000)


class SupportRequestIn(BaseModel):
    subject: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=1, max_length=5000)
    priority: str = Field(default="normal", pattern="^(low|normal|high|urgent)$")


class OkOut(BaseModel):
    ok: bool = True
    id: uuid.UUID | None = None
