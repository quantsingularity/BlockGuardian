"""
Compliance reporting and regulatory features for BlockGuardian Backend
Implements comprehensive compliance monitoring, reporting, and regulatory requirements
"""

import csv
import enum
import io
import json
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import (JSON, Boolean, Column, DateTime, Float, ForeignKey,
                        Integer, String, Text)
from sqlalchemy.orm import relationship
from src.models.base import AuditMixin, Base, TimestampMixin, db_manager
from src.models.portfolio import (Transaction, TransactionStatus,
                                  TransactionType)
from src.models.user import AMLRiskLevel, KYCStatus, User
from src.security.audit import audit_logger


class ReportType(enum.Enum):
    """Types of compliance reports"""

    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    LARGE_TRANSACTION = "large_transaction"
    KYC_STATUS = "kyc_status"
    AML_MONITORING = "aml_monitoring"
    TRANSACTION_MONITORING = "transaction_monitoring"
    REGULATORY_FILING = "regulatory_filing"
    AUDIT_TRAIL = "audit_trail"
    RISK_ASSESSMENT = "risk_assessment"


class ReportStatus(enum.Enum):
    """Report generation status"""

    PENDING = "pending"
    GENERATING = "generating"
    COMPLETED = "completed"
    FAILED = "failed"
    SUBMITTED = "submitted"


class ComplianceViolationType(enum.Enum):
    """Types of compliance violations"""

    SUSPICIOUS_TRANSACTION = "suspicious_transaction"
    LARGE_CASH_TRANSACTION = "large_cash_transaction"
    STRUCTURING = "structuring"
    UNUSUAL_ACTIVITY = "unusual_activity"
    KYC_VIOLATION = "kyc_violation"
    AML_VIOLATION = "aml_violation"
    SANCTIONS_VIOLATION = "sanctions_violation"
    REGULATORY_LIMIT_EXCEEDED = "regulatory_limit_exceeded"


class ComplianceReport(Base, AuditMixin, TimestampMixin):
    """Compliance report model"""

    __tablename__ = "compliance_reports"

    # Report identification
    report_id = Column(String(255), unique=True, nullable=False, index=True)
    report_type = Column(Enum(ReportType), nullable=False, index=True)
    report_name = Column(String(255), nullable=False)
    description = Column(Text)

    # Report parameters
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    filters = Column(JSON)  # Report filters and parameters

    # Report status
    status = Column(Enum(ReportStatus), default=ReportStatus.PENDING, nullable=False)
    generated_at = Column(DateTime)
    generated_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Report content
    report_data = Column(JSON)  # Report results
    file_path = Column(String(500))  # Path to generated file
    file_format = Column(String(20))  # csv, pdf, json

    # Regulatory submission
    submitted_to = Column(String(100))  # Regulatory body
    submission_date = Column(DateTime)
    submission_reference = Column(String(255))

    # Error handling
    error_message = Column(Text)
    retry_count = Column(Integer, default=0)

    def __repr__(self):
        return f"<ComplianceReport {self.report_id} - {self.report_type.value}>"

    def generate(self):
        """Generate the compliance report"""
        self.status = ReportStatus.GENERATING
        self.generated_at = datetime.utcnow()

        try:
            # Generate report based on type
            if self.report_type == ReportType.SUSPICIOUS_ACTIVITY:
                self.report_data = self._generate_suspicious_activity_report()
            elif self.report_type == ReportType.LARGE_TRANSACTION:
                self.report_data = self._generate_large_transaction_report()
            elif self.report_type == ReportType.KYC_STATUS:
                self.report_data = self._generate_kyc_status_report()
            elif self.report_type == ReportType.AML_MONITORING:
                self.report_data = self._generate_aml_monitoring_report()
            elif self.report_type == ReportType.TRANSACTION_MONITORING:
                self.report_data = self._generate_transaction_monitoring_report()
            elif self.report_type == ReportType.AUDIT_TRAIL:
                self.report_data = self._generate_audit_trail_report()
            else:
                raise ValueError(f"Unsupported report type: {self.report_type}")

            self.status = ReportStatus.COMPLETED

            # Add audit entry
            self.add_audit_entry(
                "report_generated",
                {
                    "report_id": self.report_id,
                    "report_type": self.report_type.value,
                    "record_count": len(self.report_data.get("records", [])),
                },
            )

        except Exception as e:
            self.status = ReportStatus.FAILED
            self.error_message = str(e)

            # Add audit entry
            self.add_audit_entry(
                "report_generation_failed",
                {"report_id": self.report_id, "error": str(e)},
            )

    def _generate_suspicious_activity_report(self) -> Dict[str, Any]:
        """Generate suspicious activity report"""
        session = db_manager.get_session()
        try:
            # Query suspicious transactions and activities
            from src.models.ai_models import FraudDetection

            suspicious_activities = (
                session.query(FraudDetection)
                .filter(
                    FraudDetection.created_at >= self.start_date,
                    FraudDetection.created_at <= self.end_date,
                    FraudDetection.is_fraud == True,
                )
                .all()
            )

            records = []
            for activity in suspicious_activities:
                record = {
                    "detection_id": activity.detection_id,
                    "user_id": activity.user_id,
                    "transaction_id": activity.transaction_id,
                    "fraud_score": float(activity.fraud_score),
                    "risk_level": activity.risk_level.value,
                    "fraud_indicators": activity.fraud_indicators,
                    "action_taken": activity.action_taken,
                    "detection_date": activity.created_at.isoformat(),
                }
                records.append(record)

            return {
                "report_type": "Suspicious Activity Report",
                "period": f"{self.start_date.date()} to {self.end_date.date()}",
                "total_records": len(records),
                "records": records,
                "summary": {
                    "high_risk_count": len(
                        [
                            r
                            for r in records
                            if r["risk_level"] in ["high", "very_high", "critical"]
                        ]
                    ),
                    "blocked_transactions": len(
                        [r for r in records if r["action_taken"] == "block"]
                    ),
                    "flagged_transactions": len(
                        [r for r in records if r["action_taken"] == "flag"]
                    ),
                },
            }
        finally:
            session.close()

    def _generate_large_transaction_report(self) -> Dict[str, Any]:
        """Generate large transaction report"""
        session = db_manager.get_session()
        try:
            # Query large transactions (>$10,000)
            large_transactions = (
                session.query(Transaction)
                .filter(
                    Transaction.created_at >= self.start_date,
                    Transaction.created_at <= self.end_date,
                    Transaction.amount >= 10000,
                    Transaction.status == TransactionStatus.COMPLETED,
                )
                .all()
            )

            records = []
            for transaction in large_transactions:
                record = {
                    "transaction_id": transaction.id,
                    "user_id": transaction.user_id,
                    "transaction_type": transaction.transaction_type.value,
                    "amount": float(transaction.amount),
                    "currency": transaction.currency,
                    "transaction_date": transaction.created_at.isoformat(),
                    "settlement_date": (
                        transaction.settled_at.isoformat()
                        if transaction.settled_at
                        else None
                    ),
                    "external_account": (
                        "***MASKED***" if transaction.external_account_number else None
                    ),
                }
                records.append(record)

            return {
                "report_type": "Large Transaction Report",
                "period": f"{self.start_date.date()} to {self.end_date.date()}",
                "threshold": 10000,
                "total_records": len(records),
                "records": records,
                "summary": {
                    "total_amount": sum(float(r["amount"]) for r in records),
                    "average_amount": (
                        sum(float(r["amount"]) for r in records) / len(records)
                        if records
                        else 0
                    ),
                    "transaction_types": self._count_by_field(
                        records, "transaction_type"
                    ),
                },
            }
        finally:
            session.close()

    def _generate_kyc_status_report(self) -> Dict[str, Any]:
        """Generate KYC status report"""
        session = db_manager.get_session()
        try:
            # Query users with KYC information
            users = (
                session.query(User)
                .filter(
                    User.created_at >= self.start_date, User.created_at <= self.end_date
                )
                .all()
            )

            records = []
            for user in users:
                record = {
                    "user_id": user.id,
                    "email": user.email,
                    "kyc_status": user.kyc_status.value,
                    "kyc_submitted_at": (
                        user.kyc_submitted_at.isoformat()
                        if user.kyc_submitted_at
                        else None
                    ),
                    "kyc_approved_at": (
                        user.kyc_approved_at.isoformat()
                        if user.kyc_approved_at
                        else None
                    ),
                    "kyc_expires_at": (
                        user.kyc_expires_at.isoformat() if user.kyc_expires_at else None
                    ),
                    "aml_risk_level": user.aml_risk_level.value,
                    "registration_date": user.created_at.isoformat(),
                }
                records.append(record)

            return {
                "report_type": "KYC Status Report",
                "period": f"{self.start_date.date()} to {self.end_date.date()}",
                "total_records": len(records),
                "records": records,
                "summary": {
                    "kyc_status_breakdown": self._count_by_field(records, "kyc_status"),
                    "aml_risk_breakdown": self._count_by_field(
                        records, "aml_risk_level"
                    ),
                    "pending_kyc": len(
                        [
                            r
                            for r in records
                            if r["kyc_status"]
                            in ["not_started", "in_progress", "pending_review"]
                        ]
                    ),
                    "expired_kyc": len(
                        [
                            r
                            for r in records
                            if r["kyc_expires_at"]
                            and r["kyc_expires_at"] < datetime.utcnow().isoformat()
                        ]
                    ),
                },
            }
        finally:
            session.close()

    def _generate_aml_monitoring_report(self) -> Dict[str, Any]:
        """Generate AML monitoring report"""
        session = db_manager.get_session()
        try:
            # Query AML-related data
            from src.models.ai_models import RiskAssessment

            risk_assessments = (
                session.query(RiskAssessment)
                .filter(
                    RiskAssessment.assessment_date >= self.start_date,
                    RiskAssessment.assessment_date <= self.end_date,
                )
                .all()
            )

            records = []
            for assessment in risk_assessments:
                record = {
                    "assessment_id": assessment.assessment_id,
                    "user_id": assessment.user_id,
                    "portfolio_id": assessment.portfolio_id,
                    "overall_risk_score": float(assessment.overall_risk_score),
                    "risk_level": assessment.risk_level.value,
                    "assessment_date": assessment.assessment_date.isoformat(),
                    "requires_manual_review": assessment.requires_manual_review,
                    "compliance_flags": assessment.compliance_flags,
                }
                records.append(record)

            return {
                "report_type": "AML Monitoring Report",
                "period": f"{self.start_date.date()} to {self.end_date.date()}",
                "total_records": len(records),
                "records": records,
                "summary": {
                    "risk_level_breakdown": self._count_by_field(records, "risk_level"),
                    "manual_review_required": len(
                        [r for r in records if r["requires_manual_review"]]
                    ),
                    "high_risk_assessments": len(
                        [
                            r
                            for r in records
                            if r["risk_level"] in ["high", "very_high", "critical"]
                        ]
                    ),
                    "average_risk_score": (
                        sum(float(r["overall_risk_score"]) for r in records)
                        / len(records)
                        if records
                        else 0
                    ),
                },
            }
        finally:
            session.close()

    def _generate_transaction_monitoring_report(self) -> Dict[str, Any]:
        """Generate transaction monitoring report"""
        session = db_manager.get_session()
        try:
            # Query all transactions in period
            transactions = (
                session.query(Transaction)
                .filter(
                    Transaction.created_at >= self.start_date,
                    Transaction.created_at <= self.end_date,
                )
                .all()
            )

            records = []
            for transaction in transactions:
                record = {
                    "transaction_id": transaction.id,
                    "user_id": transaction.user_id,
                    "portfolio_id": transaction.portfolio_id,
                    "transaction_type": transaction.transaction_type.value,
                    "status": transaction.status.value,
                    "amount": float(transaction.amount),
                    "currency": transaction.currency,
                    "fee": float(transaction.fee) if transaction.fee else 0,
                    "created_at": transaction.created_at.isoformat(),
                    "executed_at": (
                        transaction.executed_at.isoformat()
                        if transaction.executed_at
                        else None
                    ),
                    "settled_at": (
                        transaction.settled_at.isoformat()
                        if transaction.settled_at
                        else None
                    ),
                }
                records.append(record)

            return {
                "report_type": "Transaction Monitoring Report",
                "period": f"{self.start_date.date()} to {self.end_date.date()}",
                "total_records": len(records),
                "records": records,
                "summary": {
                    "total_volume": sum(float(r["amount"]) for r in records),
                    "total_fees": sum(float(r["fee"]) for r in records),
                    "transaction_types": self._count_by_field(
                        records, "transaction_type"
                    ),
                    "status_breakdown": self._count_by_field(records, "status"),
                    "failed_transactions": len(
                        [r for r in records if r["status"] == "failed"]
                    ),
                    "pending_transactions": len(
                        [r for r in records if r["status"] == "pending"]
                    ),
                },
            }
        finally:
            session.close()

    def _generate_audit_trail_report(self) -> Dict[str, Any]:
        """Generate audit trail report"""
        # This would query audit logs from the audit system
        # For now, return a placeholder structure
        return {
            "report_type": "Audit Trail Report",
            "period": f"{self.start_date.date()} to {self.end_date.date()}",
            "total_records": 0,
            "records": [],
            "summary": {
                "authentication_events": 0,
                "data_access_events": 0,
                "security_events": 0,
                "financial_events": 0,
            },
        }

    def _count_by_field(self, records: List[Dict], field: str) -> Dict[str, int]:
        """Count records by field value"""
        counts = {}
        for record in records:
            value = record.get(field, "unknown")
            counts[value] = counts.get(value, 0) + 1
        return counts

    def export_to_csv(self) -> str:
        """Export report to CSV format"""
        if not self.report_data or "records" not in self.report_data:
            raise ValueError("No report data available for export")

        records = self.report_data["records"]
        if not records:
            raise ValueError("No records to export")

        # Create CSV content
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=records[0].keys())
        writer.writeheader()
        writer.writerows(records)

        return output.getvalue()


class ComplianceViolation(Base, AuditMixin, TimestampMixin):
    """Compliance violation tracking"""

    __tablename__ = "compliance_violations"

    # Violation identification
    violation_id = Column(String(255), unique=True, nullable=False, index=True)
    violation_type = Column(Enum(ComplianceViolationType), nullable=False, index=True)
    severity = Column(String(20), nullable=False)  # low, medium, high, critical

    # Related entities
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id"), index=True)

    # Violation details
    description = Column(Text, nullable=False)
    violation_data = Column(JSON)  # Detailed violation information
    regulatory_reference = Column(String(255))  # Relevant regulation/rule

    # Detection information
    detected_by = Column(String(100))  # system, manual, external
    detection_method = Column(String(100))  # ai_model, rule_engine, manual_review
    detection_confidence = Column(Float)  # 0.0 to 1.0

    # Status and resolution
    status = Column(
        String(50), default="open", nullable=False
    )  # open, investigating, resolved, false_positive
    assigned_to = Column(Integer, ForeignKey("users.id"))
    resolution_date = Column(DateTime)
    resolution_notes = Column(Text)

    # Regulatory reporting
    reported_to_regulator = Column(Boolean, default=False)
    reporting_deadline = Column(DateTime)
    reported_at = Column(DateTime)
    regulatory_response = Column(Text)

    def __repr__(self):
        return (
            f"<ComplianceViolation {self.violation_id} - {self.violation_type.value}>"
        )

    def assign_to_investigator(self, investigator_id: int):
        """Assign violation to an investigator"""
        self.assigned_to = investigator_id
        self.status = "investigating"

        # Add audit entry
        self.add_audit_entry(
            "violation_assigned",
            {"violation_id": self.violation_id, "assigned_to": investigator_id},
        )

    def resolve(self, resolution_notes: str, resolved_by: int = None):
        """Resolve the violation"""
        self.status = "resolved"
        self.resolution_date = datetime.utcnow()
        self.resolution_notes = resolution_notes

        # Add audit entry
        self.add_audit_entry(
            "violation_resolved",
            {
                "violation_id": self.violation_id,
                "resolved_by": resolved_by,
                "resolution_notes": resolution_notes,
            },
        )

    def mark_false_positive(self, reason: str, marked_by: int = None):
        """Mark violation as false positive"""
        self.status = "false_positive"
        self.resolution_date = datetime.utcnow()
        self.resolution_notes = f"False positive: {reason}"

        # Add audit entry
        self.add_audit_entry(
            "violation_false_positive",
            {
                "violation_id": self.violation_id,
                "marked_by": marked_by,
                "reason": reason,
            },
        )

    def report_to_regulator(self, reported_by: int = None):
        """Report violation to regulatory authority"""
        self.reported_to_regulator = True
        self.reported_at = datetime.utcnow()

        # Add audit entry
        self.add_audit_entry(
            "violation_reported_to_regulator",
            {
                "violation_id": self.violation_id,
                "reported_by": reported_by,
                "reported_at": self.reported_at.isoformat(),
            },
        )


class ComplianceManager:
    """Main compliance management system"""

    def __init__(self):
        self.violation_rules = []
        self.monitoring_thresholds = {
            "large_transaction": 10000,
            "daily_transaction_limit": 50000,
            "monthly_transaction_limit": 500000,
            "suspicious_velocity": 10,  # transactions per hour
            "unusual_amount_multiplier": 5,  # times normal transaction amount
        }

        # Initialize monitoring
        self._setup_monitoring_rules()

    def _setup_monitoring_rules(self):
        """Set up compliance monitoring rules"""
        # This would set up various compliance rules
        pass

    def check_transaction_compliance(
        self, transaction: Transaction
    ) -> List[ComplianceViolation]:
        """Check transaction for compliance violations"""
        violations = []

        # Check large transaction reporting
        if float(transaction.amount) >= self.monitoring_thresholds["large_transaction"]:
            violation = self._create_large_transaction_violation(transaction)
            violations.append(violation)

        # Check for structuring (multiple transactions just under reporting threshold)
        structuring_violation = self._check_structuring(transaction)
        if structuring_violation:
            violations.append(structuring_violation)

        # Check velocity (too many transactions in short time)
        velocity_violation = self._check_transaction_velocity(transaction)
        if velocity_violation:
            violations.append(velocity_violation)

        return violations

    def _create_large_transaction_violation(
        self, transaction: Transaction
    ) -> ComplianceViolation:
        """Create large transaction violation"""
        violation_id = f"LTR_{transaction.id}_{int(datetime.utcnow().timestamp())}"

        violation = ComplianceViolation(
            violation_id=violation_id,
            violation_type=ComplianceViolationType.LARGE_CASH_TRANSACTION,
            severity="medium",
            user_id=transaction.user_id,
            transaction_id=transaction.id,
            description=f"Large transaction requiring reporting: ${transaction.amount}",
            violation_data={
                "transaction_amount": float(transaction.amount),
                "threshold": self.monitoring_thresholds["large_transaction"],
                "transaction_type": transaction.transaction_type.value,
            },
            regulatory_reference="BSA/AML CTR Requirements",
            detected_by="system",
            detection_method="rule_engine",
            detection_confidence=1.0,
            reporting_deadline=datetime.utcnow() + timedelta(days=15),
        )

        return violation

    def _check_structuring(
        self, transaction: Transaction
    ) -> Optional[ComplianceViolation]:
        """Check for potential structuring activity"""
        session = db_manager.get_session()
        try:
            # Look for multiple transactions just under the reporting threshold
            threshold = self.monitoring_thresholds["large_transaction"]
            lookback_hours = 24
            cutoff_time = datetime.utcnow() - timedelta(hours=lookback_hours)

            recent_transactions = (
                session.query(Transaction)
                .filter(
                    Transaction.user_id == transaction.user_id,
                    Transaction.created_at >= cutoff_time,
                    Transaction.amount >= threshold * 0.8,  # 80% of threshold
                    Transaction.amount < threshold,
                    Transaction.status == TransactionStatus.COMPLETED,
                )
                .all()
            )

            if len(recent_transactions) >= 3:  # 3 or more transactions
                total_amount = sum(float(t.amount) for t in recent_transactions)

                if total_amount >= threshold * 1.5:  # Total exceeds 1.5x threshold
                    violation_id = f"STR_{transaction.user_id}_{int(datetime.utcnow().timestamp())}"

                    violation = ComplianceViolation(
                        violation_id=violation_id,
                        violation_type=ComplianceViolationType.STRUCTURING,
                        severity="high",
                        user_id=transaction.user_id,
                        transaction_id=transaction.id,
                        description=f"Potential structuring: {len(recent_transactions)} transactions totaling ${total_amount}",
                        violation_data={
                            "transaction_count": len(recent_transactions),
                            "total_amount": total_amount,
                            "time_period_hours": lookback_hours,
                            "transaction_ids": [t.id for t in recent_transactions],
                        },
                        regulatory_reference="BSA/AML Structuring Provisions",
                        detected_by="system",
                        detection_method="rule_engine",
                        detection_confidence=0.8,
                        reporting_deadline=datetime.utcnow() + timedelta(days=30),
                    )

                    return violation

            return None
        finally:
            session.close()

    def _check_transaction_velocity(
        self, transaction: Transaction
    ) -> Optional[ComplianceViolation]:
        """Check for unusual transaction velocity"""
        session = db_manager.get_session()
        try:
            # Count transactions in the last hour
            cutoff_time = datetime.utcnow() - timedelta(hours=1)

            recent_count = (
                session.query(Transaction)
                .filter(
                    Transaction.user_id == transaction.user_id,
                    Transaction.created_at >= cutoff_time,
                    Transaction.status.in_(
                        [TransactionStatus.COMPLETED, TransactionStatus.PROCESSING]
                    ),
                )
                .count()
            )

            if recent_count > self.monitoring_thresholds["suspicious_velocity"]:
                violation_id = (
                    f"VEL_{transaction.user_id}_{int(datetime.utcnow().timestamp())}"
                )

                violation = ComplianceViolation(
                    violation_id=violation_id,
                    violation_type=ComplianceViolationType.UNUSUAL_ACTIVITY,
                    severity="medium",
                    user_id=transaction.user_id,
                    transaction_id=transaction.id,
                    description=f"Unusual transaction velocity: {recent_count} transactions in 1 hour",
                    violation_data={
                        "transaction_count": recent_count,
                        "time_period_hours": 1,
                        "threshold": self.monitoring_thresholds["suspicious_velocity"],
                    },
                    regulatory_reference="AML Monitoring Requirements",
                    detected_by="system",
                    detection_method="rule_engine",
                    detection_confidence=0.7,
                )

                return violation

            return None
        finally:
            session.close()

    def generate_compliance_report(
        self,
        report_type: ReportType,
        start_date: datetime,
        end_date: datetime,
        generated_by: int,
    ) -> ComplianceReport:
        """Generate a compliance report"""
        report_id = f"{report_type.value}_{int(datetime.utcnow().timestamp())}"

        report = ComplianceReport(
            report_id=report_id,
            report_type=report_type,
            report_name=f"{report_type.value.replace('_', ' ').title()} Report",
            description=f"Automated {report_type.value} report for compliance monitoring",
            start_date=start_date,
            end_date=end_date,
            generated_by=generated_by,
        )

        # Generate the report
        report.generate()

        return report

    def get_compliance_dashboard_data(self) -> Dict[str, Any]:
        """Get compliance dashboard data"""
        session = db_manager.get_session()
        try:
            # Get recent violations
            recent_violations = (
                session.query(ComplianceViolation)
                .filter(
                    ComplianceViolation.created_at
                    >= datetime.utcnow() - timedelta(days=30)
                )
                .all()
            )

            # Get KYC status summary
            kyc_summary = {}
            for status in KYCStatus:
                count = session.query(User).filter(User.kyc_status == status).count()
                kyc_summary[status.value] = count

            # Get AML risk summary
            aml_summary = {}
            for risk_level in AMLRiskLevel:
                count = (
                    session.query(User)
                    .filter(User.aml_risk_level == risk_level)
                    .count()
                )
                aml_summary[risk_level.value] = count

            # Get recent large transactions
            large_transactions_count = (
                session.query(Transaction)
                .filter(
                    Transaction.created_at >= datetime.utcnow() - timedelta(days=30),
                    Transaction.amount
                    >= self.monitoring_thresholds["large_transaction"],
                )
                .count()
            )

            return {
                "violations": {
                    "total": len(recent_violations),
                    "open": len([v for v in recent_violations if v.status == "open"]),
                    "investigating": len(
                        [v for v in recent_violations if v.status == "investigating"]
                    ),
                    "resolved": len(
                        [v for v in recent_violations if v.status == "resolved"]
                    ),
                    "by_type": self._count_violations_by_type(recent_violations),
                },
                "kyc_status": kyc_summary,
                "aml_risk_levels": aml_summary,
                "large_transactions_30d": large_transactions_count,
                "monitoring_thresholds": self.monitoring_thresholds,
            }
        finally:
            session.close()

    def _count_violations_by_type(
        self, violations: List[ComplianceViolation]
    ) -> Dict[str, int]:
        """Count violations by type"""
        counts = {}
        for violation in violations:
            violation_type = violation.violation_type.value
            counts[violation_type] = counts.get(violation_type, 0) + 1
        return counts


# Global compliance manager instance
compliance_manager = ComplianceManager()
