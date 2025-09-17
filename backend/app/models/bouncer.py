from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, Time, DateTime, ARRAY
from sqlalchemy.types import DECIMAL
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base

class BouncerProfile(Base):
    __tablename__ = "bouncer_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    license_number = Column(String(100), unique=True)
    experience_years = Column(Integer)
    height_cm = Column(Integer)
    weight_kg = Column(Integer)
    certifications = Column(ARRAY(String))
    hourly_rate = Column(DECIMAL(10, 2))
    is_available = Column(Boolean, default=True)
    rating = Column(DECIMAL(3, 2), default=0.00)
    total_reviews = Column(Integer, default=0)
    background_check_status = Column(String(20), default="pending")
    background_check_date = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="bouncer_profile")
    bookings = relationship("Booking", back_populates="bouncer")
    availability = relationship("BouncerAvailability", back_populates="bouncer")

class BouncerAvailability(Base):
    __tablename__ = "bouncer_availability"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    bouncer_id = Column(UUID(as_uuid=True), ForeignKey("bouncer_profiles.id"), nullable=False)
    day_of_week = Column(Integer, nullable=False)  # 0=Sunday, 6=Saturday
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    bouncer = relationship("BouncerProfile", back_populates="availability")