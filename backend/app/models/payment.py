from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.types import DECIMAL
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id"), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    payment_method = Column(String(50), nullable=False)
    payment_intent_id = Column(String(200))  # Stripe payment intent ID
    status = Column(String(20), default="pending")
    processed_at = Column(DateTime)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    booking = relationship("Booking")