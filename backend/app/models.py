import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    func,
)

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    customer_ref: Mapped[str] = mapped_column(
        String(32),
        unique=True,
        nullable=False,
        index=True,
    )

    full_name: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
    )

    country_code: Mapped[str] = mapped_column(
        String(2),
        nullable=False,
        index=True,
    )

    segment: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    transactions: Mapped[list["Transaction"]] = relationship(
        back_populates="customer",
        cascade="all, delete-orphan",
    )


class Transaction(Base):
    __tablename__ = "transactions"

    __table_args__ = (
        CheckConstraint(
            "amount > 0",
            name="ck_transactions_amount_positive",
        ),
        Index(
            "ix_transactions_customer_occurred_at",
            "customer_id",
            "occurred_at",
        ),
        Index(
            "ix_transactions_status_occurred_at",
            "status",
            "occurred_at",
        ),
        Index(
            "ix_transactions_destination_occurred_at",
            "destination_country",
            "occurred_at",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    transaction_ref: Mapped[str] = mapped_column(
        String(40),
        unique=True,
        nullable=False,
        index=True,
    )

    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "customers.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(18, 2),
        nullable=False,
    )

    currency: Mapped[str] = mapped_column(
        String(3),
        nullable=False,
    )

    transaction_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        index=True,
    )

    origin_country: Mapped[str] = mapped_column(
        String(2),
        nullable=False,
    )

    destination_country: Mapped[str] = mapped_column(
        String(2),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="completed",
    )

    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    customer: Mapped["Customer"] = relationship(
        back_populates="transactions",
    )

    risk_assessment: Mapped[Optional["RiskAssessment"]] = relationship(
        back_populates="transaction",
        uselist=False,
        cascade="all, delete-orphan",
    )


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    __table_args__ = (
        CheckConstraint(
            "risk_score >= 0 AND risk_score <= 100",
            name="ck_risk_score_range",
        ),
        Index(
            "ix_risk_assessment_level_analyzed",
            "risk_level",
            "analyzed_at",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    transaction_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "transactions.id",
            ondelete="CASCADE",
        ),
        unique=True,
        nullable=False,
    )

    risk_score: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    risk_level: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        index=True,
    )

    rule_version: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="v1",
    )

    analyzed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    transaction: Mapped["Transaction"] = relationship(
        back_populates="risk_assessment",
    )

    rule_matches: Mapped[list["RuleMatch"]] = relationship(
        back_populates="assessment",
        cascade="all, delete-orphan",
    )


class RuleMatch(Base):
    __tablename__ = "rule_matches"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    assessment_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "risk_assessments.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    rule_code: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    rule_name: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
    )

    score_contribution: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    reason: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    assessment: Mapped["RiskAssessment"] = relationship(
        back_populates="rule_matches",
    )
