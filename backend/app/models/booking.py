from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.types import DECIMAL
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.core.database import Base

class BookingStatus(str, enum.Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    REJECTED = "rejected"

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    bouncer_id = Column(UUID(as_uuid=True), ForeignKey("bouncer_profiles.id"), nullable=False)
    event_name = Column(String(200), nullable=False)
    event_description = Column(Text)
    event_location_address = Column(Text, nullable=False)
    start_datetime = Column(DateTime, nullable=False)
    end_datetime = Column(DateTime, nullable=False)
    hourly_rate = Column(DECIMAL(10, 2), nullable=False)
    total_amount = Column(DECIMAL(10, 2), nullable=False)
    special_requirements = Column(Text)
    status = Column(Enum(BookingStatus), default=BookingStatus.PENDING)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="bookings")
    bouncer = relationship("BouncerProfile", back_populates="bookings")

class BookingStatusHistory(Base):
    __tablename__ = "booking_status_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id"), nullable=False)
    old_status = Column(Enum(BookingStatus))
    new_status = Column(Enum(BookingStatus), nullable=False)
    changed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    reason = Column(Text)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    booking = relationship("Booking")
    changed_by_user = relationship("User")