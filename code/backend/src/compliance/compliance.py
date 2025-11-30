"""
Enhanced Compliance System for Financial Services
Implements KYC/AML, regulatory reporting, and comprehensive compliance monitoring
"""

import hashlib
import json
import logging
import os
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from enum import Enum
from typing import Any, Dict, List, Optional


from ..models.base import db_manager
from ..models.transaction import SuspiciousActivity, Transaction
from ..models.user import User, UserStatus, KYCStatus, AMLRiskLevel

# Configure logging
logger = logging.getLogger(__name__)


class ComplianceStatus(Enum):
    """Compliance status enumeration"""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    APPROVED = "approved"
    REJECTED = "rejected"
    REQUIRES_REVIEW = "requires_review"
    EXPIRED = "expired"


class RiskLevel(Enum):
    """Risk level enumeration"""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class DocumentType(Enum):
    """KYC document types"""

    PASSPORT = "passport"
    DRIVERS_LICENSE = "drivers_license"
    NATIONAL_ID = "national_id"
    UTILITY_BILL = "utility_bill"
    BANK_STATEMENT = "bank_statement"
    TAX_DOCUMENT = "tax_document"
    EMPLOYMENT_VERIFICATION = "employment_verification"
    INCOME_VERIFICATION = "income_verification"


@dataclass
class ComplianceRule:
    """Compliance rule definition"""

    id: str
    name: str
    description: str
    rule_type: str  # kyc, aml, transaction, reporting
    conditions: Dict[str, Any]
    actions: List[str]
    severity: str
    enabled: bool = True


@dataclass
class RegulatoryRequirement:
    """Regulatory requirement definition"""

    regulation: str  # FINRA, SEC, CFTC, etc.
    requirement_id: str
    description: str
    applicable_jurisdictions: List[str]
    compliance_deadline: Optional[datetime]
    mandatory: bool = True


class EnhancedComplianceManager:
    """Enhanced compliance manager for financial services"""

    def __init__(self):
        self.logger = logging.getLogger(__name__)

        # Compliance thresholds
        self.kyc_thresholds = {
            "basic": Decimal("1000.00"),
            "enhanced": Decimal("10000.00"),
            "premium": Decimal("100000.00"),
        }

        # AML thresholds
        self.aml_thresholds = {
            "large_transaction": Decimal("10000.00"),
            "suspicious_pattern": Decimal("5000.00"),
            "daily_limit": Decimal("50000.00"),
            "monthly_limit": Decimal("500000.00"),
        }

        # Sanctions lists (would be loaded from external sources)
        self.sanctions_lists = self._load_sanctions_lists()

        # Compliance rules
        self.compliance_rules = self._load_compliance_rules()

        # Regulatory requirements
        self.regulatory_requirements = self._load_regulatory_requirements()

    def _load_sanctions_lists(self) -> Dict[str, List[str]]:
        """
        Load sanctions lists from a mock source.
        In a real system, this would be an API call to a provider like World-Check.
        """
        return {
            "ofac_sdn": ["John Doe", "Jane Smith"],  # Mock names
            "eu_sanctions": ["Company X", "Entity Y"],
            "un_sanctions": ["Individual Z"],
            "pep_list": ["Politician A", "Official B"],
        }

    def _load_compliance_rules(self) -> List[ComplianceRule]:
        """Load compliance rules configuration"""
        return [
            ComplianceRule(
                id="kyc_basic_verification",
                name="Basic KYC Verification",
                description="Verify basic customer information",
                rule_type="kyc",
                conditions={
                    "transaction_threshold": 1000.00,
                    "required_documents": ["government_id", "proof_of_address"],
                },
                actions=["request_documents", "verify_identity"],
                severity="medium",
            ),
            ComplianceRule(
                id="aml_large_transaction",
                name="Large Transaction Monitoring",
                description="Monitor transactions above threshold",
                rule_type="aml",
                conditions={"amount_threshold": 10000.00, "frequency_threshold": 3},
                actions=["flag_transaction", "generate_sar"],
                severity="high",
            ),
            ComplianceRule(
                id="sanctions_screening",
                name="Sanctions List Screening",
                description="Screen against sanctions lists",
                rule_type="aml",
                conditions={
                    "check_frequency": "daily",
                    "lists": ["ofac_sdn", "eu_sanctions", "un_sanctions"],
                },
                actions=["block_transaction", "freeze_account"],
                severity="critical",
            ),
        ]

    def _load_regulatory_requirements(self) -> List[RegulatoryRequirement]:
        """Load regulatory requirements"""
        return [
            RegulatoryRequirement(
                regulation="BSA",
                requirement_id="CTR_FILING",
                description="Currency Transaction Report filing for transactions over $10,000",
                applicable_jurisdictions=["US"],
                compliance_deadline=None,
                mandatory=True,
            ),
            RegulatoryRequirement(
                regulation="BSA",
                requirement_id="SAR_FILING",
                description="Suspicious Activity Report filing within 30 days",
                applicable_jurisdictions=["US"],
                compliance_deadline=None,
                mandatory=True,
            ),
            RegulatoryRequirement(
                regulation="GDPR",
                requirement_id="DATA_PROTECTION",
                description="General Data Protection Regulation compliance",
                applicable_jurisdictions=["EU"],
                compliance_deadline=None,
                mandatory=True,
            ),
        ]

    # --- KYC Verification ---

    def perform_kyc_verification(
        self, user: User, documents: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Perform comprehensive KYC verification"""

        # Input Validation
        if not isinstance(user, User):
            raise ValueError("Invalid user object provided.")
        if not isinstance(documents, list):
            raise ValueError("Documents must be a list.")
        if not user.id:
            raise ValueError("User object must have an ID.")

        verification_result = {
            "user_id": str(user.id),
            "verification_id": self._generate_verification_id(),
            "status": ComplianceStatus.IN_PROGRESS.value,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "documents_verified": [],
            "verification_steps": [],
            "risk_score": 0,
            "issues": [],
        }

        try:
            # Step 1: Document verification (Mock)
            doc_verification = self._verify_documents(documents)
            verification_result["documents_verified"] = doc_verification[
                "verified_documents"
            ]
            verification_result["verification_steps"].append(
                {
                    "step": "document_verification",
                    "status": "completed" if doc_verification["success"] else "failed",
                    "details": doc_verification,
                }
            )
            if not doc_verification["success"]:
                verification_result["issues"].append("Document verification failed.")

            # Step 2: Identity verification (Mock)
            identity_verification = self._verify_identity(user, documents)
            verification_result["verification_steps"].append(
                {
                    "step": "identity_verification",
                    "status": (
                        "completed" if identity_verification["success"] else "failed"
                    ),
                    "details": identity_verification,
                }
            )
            if not identity_verification["success"]:
                verification_result["issues"].append("Identity verification failed.")

            # Step 3: Address verification (Mock)
            address_verification = self._verify_address(user, documents)
            verification_result["verification_steps"].append(
                {
                    "step": "address_verification",
                    "status": (
                        "completed" if address_verification["success"] else "failed"
                    ),
                    "details": address_verification,
                }
            )
            if not address_verification["success"]:
                verification_result["issues"].append("Address verification failed.")

            # Step 4: Sanctions screening
            sanctions_screening = self._screen_sanctions(user)
            verification_result["verification_steps"].append(
                {
                    "step": "sanctions_screening",
                    "status": (
                        "completed" if sanctions_screening["success"] else "failed"
                    ),
                    "details": sanctions_screening,
                }
            )
            if not sanctions_screening["success"]:
                verification_result["issues"].append("Sanctions screening failed.")

            # Step 5: PEP screening
            pep_screening = self._screen_pep(user)
            verification_result["verification_steps"].append(
                {
                    "step": "pep_screening",
                    "status": "completed" if pep_screening["success"] else "failed",
                    "details": pep_screening,
                }
            )
            if not pep_screening["success"]:
                verification_result["issues"].append("PEP screening failed.")

            # Calculate overall risk score
            risk_score = self._calculate_kyc_risk_score(user, verification_result)
            verification_result["risk_score"] = risk_score

            # Determine final status
            all_steps_completed = all(
                step["status"] == "completed"
                for step in verification_result["verification_steps"]
            )

            if all_steps_completed:
                if risk_score < 30:
                    verification_result["status"] = ComplianceStatus.APPROVED.value
                elif risk_score < 70:
                    verification_result["status"] = (
                        ComplianceStatus.REQUIRES_REVIEW.value
                    )
                else:
                    verification_result["status"] = ComplianceStatus.REJECTED.value
            else:
                verification_result["status"] = ComplianceStatus.REJECTED.value

            # Update user KYC status
            self._update_user_kyc_status(user, verification_result)

            # Log verification
            self.logger.info(
                f"KYC verification completed for user {user.id}: {verification_result['status']}"
            )

            return verification_result

        except Exception as e:
            self.logger.error(f"KYC verification error for user {user.id}: {e}")
            verification_result["status"] = "error"
            verification_result["issues"].append(f"System error: {str(e)}")
            return verification_result

    def _verify_documents(self, documents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Mock document verification (e.g., check for required types, basic validity)"""
        required_types = [DocumentType.PASSPORT.value, DocumentType.UTILITY_BILL.value]
        verified_documents = []
        success = True

        for doc in documents:
            if doc.get("type") in required_types and doc.get("status") == "uploaded":
                verified_documents.append(doc)
                required_types.remove(doc.get("type"))

        if required_types:
            success = False

        return {"success": success, "verified_documents": verified_documents}

    def _verify_identity(
        self, user: User, documents: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Mock identity verification (e.g., check name match, liveness)"""
        # In a real system, this would involve a third-party service
        if user.first_name and user.last_name:
            return {"success": True, "details": "Name match confirmed."}
        return {"success": False, "details": "Missing user name details."}

    def _verify_address(
        self, user: User, documents: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Mock address verification (e.g., check address match with utility bill)"""
        if user.address_line1 and user.city and user.country:
            return {"success": True, "details": "Address match confirmed."}
        return {"success": False, "details": "Missing user address details."}

    def _screen_sanctions(self, user: User) -> Dict[str, Any]:
        """Screen user against sanctions lists"""
        full_name = f"{user.first_name} {user.last_name}"
        is_sanctioned = any(
            full_name in self.sanctions_lists[list_name]
            for list_name in ["ofac_sdn", "eu_sanctions", "un_sanctions"]
        )

        if is_sanctioned:
            return {"success": False, "details": "Match found on sanctions list."}
        return {"success": True, "details": "No match found on sanctions lists."}

    def _screen_pep(self, user: User) -> Dict[str, Any]:
        """Screen user against Politically Exposed Persons (PEP) list"""
        full_name = f"{user.first_name} {user.last_name}"
        is_pep = full_name in self.sanctions_lists["pep_list"]

        if is_pep:
            return {"success": False, "details": "Match found on PEP list."}
        return {"success": True, "details": "No match found on PEP list."}

    def _calculate_kyc_risk_score(
        self, user: User, verification_result: Dict[str, Any]
    ) -> int:
        """Calculate KYC risk score based on verification results and user data"""
        score = 0

        # Base risk based on country (Mock: High risk for certain countries)
        if user.country in ["IR", "KP", "SY"]:
            score += 50
        elif user.country in ["NG", "PK", "VE"]:
            score += 20

        # Risk based on verification failures
        for step in verification_result["verification_steps"]:
            if step["status"] == "failed":
                score += 15

        # Risk based on screening
        if not verification_result["verification_steps"][3]["success"]:  # Sanctions
            score += 100
        if not verification_result["verification_steps"][4]["success"]:  # PEP
            score += 50

        # Risk based on investment profile (Mock: Aggressive profile adds risk)
        if user.risk_tolerance == "aggressive":
            score += 10

        return min(100, score)

    def _update_user_kyc_status(self, user: User, verification_result: Dict[str, Any]):
        """Update user model with KYC results"""
        session = db_manager.get_session()
        try:
            user.kyc_status = verification_result["status"]
            user.aml_score = verification_result["risk_score"]

            if user.kyc_status == KYCStatus.APPROVED.value:
                user.kyc_approved_at = datetime.now(timezone.utc)
                user.kyc_expires_at = datetime.now(timezone.utc) + timedelta(days=365)
                user.status = UserStatus.ACTIVE.value
            elif user.kyc_status == KYCStatus.REJECTED.value:
                user.status = UserStatus.SUSPENDED.value

            # Determine AML risk level based on score
            if user.aml_score >= 70:
                user.aml_risk_level = AMLRiskLevel.HIGH.value
            elif user.aml_score >= 30:
                user.aml_risk_level = AMLRiskLevel.MEDIUM.value
            else:
                user.aml_risk_level = AMLRiskLevel.LOW.value

            session.merge(user)
            session.commit()
        except Exception as e:
            session.rollback()
            self.logger.error(f"Failed to update user KYC status: {e}")
        finally:
            session.close()

    # --- AML Monitoring ---

    def monitor_transaction(self, transaction: Transaction) -> Dict[str, Any]:
        """Monitor transaction for AML compliance"""

        monitoring_result = {
            "transaction_id": str(transaction.id),
            "monitoring_id": self._generate_monitoring_id(),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "risk_score": 0,
            "flags": [],
            "actions_required": [],
            "status": "approved",
        }

        session = db_manager.get_session()
        try:
            # Fetch user object with eager loading for efficiency
            user = session.query(User).filter(User.id == transaction.user_id).first()
            if not user:
                raise ValueError(f"User with ID {transaction.user_id} not found.")

            # Check transaction amount thresholds
            if transaction.total_amount >= self.aml_thresholds["large_transaction"]:
                monitoring_result["flags"].append(
                    {
                        "type": "large_transaction",
                        "description": f"Transaction amount ${transaction.total_amount} exceeds CTR threshold",
                        "severity": "high",
                    }
                )
                monitoring_result["risk_score"] += 30
                monitoring_result["actions_required"].append("generate_ctr")

            # Check for suspicious patterns
            pattern_analysis = self._analyze_transaction_patterns(transaction, session)
            if pattern_analysis["suspicious"]:
                monitoring_result["flags"].extend(pattern_analysis["flags"])
                monitoring_result["risk_score"] += pattern_analysis["risk_score"]
                monitoring_result["actions_required"].extend(
                    pattern_analysis["actions"]
                )

            # Check user risk profile
            user_risk = self._assess_user_transaction_risk(user, transaction)
            monitoring_result["risk_score"] += user_risk["risk_score"]
            monitoring_result["flags"].extend(user_risk["flags"])

            # Determine final status
            if monitoring_result["risk_score"] >= 70:
                monitoring_result["status"] = "blocked"
                monitoring_result["actions_required"].append("manual_review")
            elif monitoring_result["risk_score"] >= 40:
                monitoring_result["status"] = "requires_review"
                monitoring_result["actions_required"].append("enhanced_monitoring")

            # Generate SAR if required
            if "generate_sar" in monitoring_result["actions_required"]:
                self._generate_sar(transaction, monitoring_result, session)

            # Log monitoring result
            self.logger.info(
                f"Transaction monitoring completed for {transaction.id}: {monitoring_result['status']}"
            )

            return monitoring_result

        except Exception as e:
            self.logger.error(f"Transaction monitoring error for {transaction.id}: {e}")
            monitoring_result["status"] = "error"
            monitoring_result["flags"].append(
                {
                    "type": "monitoring_error",
                    "description": f"Monitoring error: {str(e)}",
                    "severity": "critical",
                }
            )
            return monitoring_result
        finally:
            session.close()

    def _analyze_transaction_patterns(
        self, transaction: Transaction, session
    ) -> Dict[str, Any]:
        """Analyze transaction patterns for suspicious activity"""

        result = {"suspicious": False, "flags": [], "risk_score": 0, "actions": []}

        # Get user's recent transactions (last 30 days)
        thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
        recent_transactions = (
            session.query(Transaction)
            .filter(
                Transaction.user_id == transaction.user_id,
                Transaction.created_at >= thirty_days_ago,
                Transaction.id != transaction.id,
            )
            .order_by(Transaction.created_at.desc())
            .all()
        )

        # Pattern 1: Rapid succession of transactions (e.g., > 5 in 1 hour)
        one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
        recent_count = len(
            [t for t in recent_transactions if t.created_at >= one_hour_ago]
        )
        if recent_count >= 5:
            result["suspicious"] = True
            result["flags"].append(
                {
                    "type": "rapid_transactions",
                    "description": f"{recent_count} transactions in the last hour",
                    "severity": "medium",
                }
            )
            result["risk_score"] += 20

        # Pattern 2: Round number transactions (e.g., $5000, $10000)
        if (
            transaction.total_amount % 1000 == 0
            and transaction.total_amount >= self.aml_thresholds["suspicious_pattern"]
        ):
            result["flags"].append(
                {
                    "type": "round_amount",
                    "description": f"Round amount transaction: ${transaction.total_amount}",
                    "severity": "low",
                }
            )
            result["risk_score"] += 10

        # Pattern 3: Structuring (multiple transactions just under reporting threshold)
        # Check for 2 or more transactions within 7 days just under the $10,000 CTR threshold
        seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
        structuring_transactions = [
            t
            for t in recent_transactions
            if t.created_at >= seven_days_ago
            and self.aml_thresholds["large_transaction"] - Decimal("1000.00")
            <= t.total_amount
            < self.aml_thresholds["large_transaction"]
        ]
        if len(structuring_transactions) >= 2:
            result["suspicious"] = True
            result["flags"].append(
                {
                    "type": "potential_structuring",
                    "description": f"{len(structuring_transactions)} transactions just under $10,000 threshold in 7 days",
                    "severity": "high",
                }
            )
            result["risk_score"] += 40
            result["actions"].append("generate_sar")

        # Pattern 4: Unusual transaction times (outside 6 AM - 10 PM UTC)
        transaction_hour = transaction.created_at.hour
        if transaction_hour < 6 or transaction_hour > 22:
            result["flags"].append(
                {
                    "type": "unusual_timing",
                    "description": f"Transaction at unusual hour: {transaction_hour}:00 UTC",
                    "severity": "low",
                }
            )
            result["risk_score"] += 5

        return result

    def _assess_user_transaction_risk(
        self, user: User, transaction: Transaction
    ) -> Dict[str, Any]:
        """Assess user-specific transaction risk"""

        result = {"risk_score": 0, "flags": []}

        # User KYC status
        if user.kyc_status != KYCStatus.APPROVED.value:
            result["risk_score"] += 25
            result["flags"].append(
                {
                    "type": "kyc_not_approved",
                    "description": f"User KYC status: {user.kyc_status}",
                    "severity": "medium",
                }
            )

        # User AML risk level
        if user.aml_risk_level == AMLRiskLevel.HIGH.value:
            result["risk_score"] += 30
            result["flags"].append(
                {
                    "type": "high_risk_user",
                    "description": "User classified as high AML risk",
                    "severity": "high",
                }
            )
        elif user.aml_risk_level == AMLRiskLevel.PROHIBITED.value:
            result["risk_score"] += 50
            result["flags"].append(
                {
                    "type": "critical_risk_user",
                    "description": "User classified as critical AML risk (Prohibited)",
                    "severity": "critical",
                }
            )

        # Transaction vs. user profile (e.g., large transaction relative to declared income)
        if (
            user.annual_income
            and user.annual_income > 0
            and transaction.total_amount > user.annual_income * Decimal("0.1")
        ):
            result["risk_score"] += 20
            result["flags"].append(
                {
                    "type": "transaction_vs_income",
                    "description": f"Transaction amount ({transaction.total_amount}) is high relative to declared income ({user.annual_income})",
                    "severity": "medium",
                }
            )

        return result

    def _generate_sar(
        self, transaction: Transaction, monitoring_result: Dict[str, Any], session
    ):
        """Generate Suspicious Activity Report"""

        try:
            sar = SuspiciousActivity(
                transaction_id=transaction.id,
                user_id=transaction.user_id,
                activity_type="unusual_transaction_pattern",
                description=f"Suspicious transaction patterns detected. Flags: {json.dumps(monitoring_result['flags'])}",
                risk_score=monitoring_result["risk_score"],
                status="pending_filing",
            )

            session.add(sar)
            session.commit()

            self.logger.info(
                f"SAR generated for transaction {transaction.id}. SAR ID: {sar.id}"
            )

        except Exception as e:
            session.rollback()
            self.logger.error(
                f"Failed to generate SAR for transaction {transaction.id}: {e}"
            )

    # --- Reporting ---

    def generate_compliance_report(
        self, report_type: str, start_date: datetime, end_date: datetime
    ) -> Dict[str, Any]:
        """Generate compliance report"""

        report = {
            "report_type": report_type,
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
            },
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "data": {},
        }

        session = db_manager.get_session()
        try:
            if report_type == "kyc_summary":
                report["data"] = self._generate_kyc_summary_report(
                    session, start_date, end_date
                )
            elif report_type == "aml_activity":
                report["data"] = self._generate_aml_activity_report(
                    session, start_date, end_date
                )
            elif report_type == "large_transactions":
                report["data"] = self._generate_large_transactions_report(
                    session, start_date, end_date
                )
            elif report_type == "suspicious_activity":
                report["data"] = self._generate_suspicious_activity_report(
                    session, start_date, end_date
                )
            else:
                raise ValueError(f"Unknown report type: {report_type}")

            return report

        except Exception as e:
            self.logger.error(f"Failed to generate {report_type} report: {e}")
            report["error"] = str(e)
            return report
        finally:
            session.close()

    def _generate_kyc_summary_report(
        self, session, start_date: datetime, end_date: datetime
    ) -> Dict[str, Any]:
        """Generate KYC summary report"""

        users = (
            session.query(User)
            .filter(User.created_at >= start_date, User.created_at <= end_date)
            .all()
        )

        kyc_stats = {
            "total_users": len(users),
            "kyc_approved": len(
                [u for u in users if u.kyc_status == KYCStatus.APPROVED.value]
            ),
            "kyc_pending": len(
                [
                    u
                    for u in users
                    if u.kyc_status
                    in [KYCStatus.PENDING_REVIEW.value, KYCStatus.IN_PROGRESS.value]
                ]
            ),
            "kyc_rejected": len(
                [u for u in users if u.kyc_status == KYCStatus.REJECTED.value]
            ),
            "by_risk_level": {
                "low": len(
                    [u for u in users if u.aml_risk_level == AMLRiskLevel.LOW.value]
                ),
                "medium": len(
                    [u for u in users if u.aml_risk_level == AMLRiskLevel.MEDIUM.value]
                ),
                "high": len(
                    [u for u in users if u.aml_risk_level == AMLRiskLevel.HIGH.value]
                ),
                "prohibited": len(
                    [
                        u
                        for u in users
                        if u.aml_risk_level == AMLRiskLevel.PROHIBITED.value
                    ]
                ),
            },
        }

        return kyc_stats

    def _generate_aml_activity_report(
        self, session, start_date: datetime, end_date: datetime
    ) -> Dict[str, Any]:
        """Generate AML activity report"""

        transactions = (
            session.query(Transaction)
            .filter(
                Transaction.created_at >= start_date, Transaction.created_at <= end_date
            )
            .all()
        )

        large_transactions = [
            t
            for t in transactions
            if t.total_amount >= self.aml_thresholds["large_transaction"]
        ]

        sars = (
            session.query(SuspiciousActivity)
            .filter(
                SuspiciousActivity.created_at >= start_date,
                SuspiciousActivity.created_at <= end_date,
            )
            .all()
        )

        total_volume = sum(t.total_amount for t in transactions)
        average_transaction_amount = (
            total_volume / len(transactions) if transactions else Decimal("0.00")
        )

        aml_stats = {
            "total_transactions": len(transactions),
            "large_transactions": len(large_transactions),
            "suspicious_activities": len(sars),
            "sars_filed": len([sar for sar in sars if sar.reported_to_authorities]),
            "average_transaction_amount": float(average_transaction_amount),
            "total_volume": float(total_volume),
        }

        return aml_stats

    def _generate_large_transactions_report(
        self, session, start_date: datetime, end_date: datetime
    ) -> Dict[str, Any]:
        """Generate large transactions report (CTR)"""

        large_transactions = (
            session.query(Transaction)
            .filter(
                Transaction.created_at >= start_date,
                Transaction.created_at <= end_date,
                Transaction.total_amount >= self.aml_thresholds["large_transaction"],
            )
            .all()
        )

        report_data = {
            "total_count": len(large_transactions),
            "total_amount": float(sum(t.total_amount for t in large_transactions)),
            "transactions": [],
        }

        for transaction in large_transactions:
            report_data["transactions"].append(
                {
                    "transaction_id": str(transaction.id),
                    "user_id": str(transaction.user_id),
                    "amount": float(transaction.total_amount),
                    "currency": transaction.currency,
                    "date": transaction.created_at.isoformat(),
                    "type": transaction.transaction_type,
                }
            )

        return report_data

    def _generate_suspicious_activity_report(
        self, session, start_date: datetime, end_date: datetime
    ) -> Dict[str, Any]:
        """Generate suspicious activity report"""

        sars = (
            session.query(SuspiciousActivity)
            .filter(
                SuspiciousActivity.created_at >= start_date,
                SuspiciousActivity.created_at <= end_date,
            )
            .all()
        )

        report_data = {
            "total_sars": len(sars),
            "filed_sars": len([sar for sar in sars if sar.reported_to_authorities]),
            "pending_sars": len(
                [sar for sar in sars if sar.status == "pending_filing"]
            ),
            "by_activity_type": {},
            "sars": [],
        }

        # Group by activity type
        for sar in sars:
            activity_type = sar.activity_type
            report_data["by_activity_type"][activity_type] = (
                report_data["by_activity_type"].get(activity_type, 0) + 1
            )

        # Add SAR details
        for sar in sars:
            report_data["sars"].append(
                {
                    "sar_number": str(sar.sar_number),
                    "user_id": str(sar.user_id),
                    "transaction_id": str(sar.transaction_id),
                    "activity_type": sar.activity_type,
                    "risk_score": sar.risk_score,
                    "status": sar.status,
                    "reported": sar.reported_to_authorities,
                    "created_at": sar.created_at.isoformat(),
                }
            )

        return report_data

    # --- Utility Functions ---

    def _generate_verification_id(self) -> str:
        """Generate unique verification ID"""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        random_suffix = hashlib.md5(os.urandom(16)).hexdigest()[:8].upper()
        return f"KYC-{timestamp}-{random_suffix}"

    def _generate_monitoring_id(self) -> str:
        """Generate unique monitoring ID"""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        random_suffix = hashlib.md5(os.urandom(16)).hexdigest()[:8].upper()
        return f"AML-{timestamp}-{random_suffix}"


# Global instance
enhanced_compliance_manager = EnhancedComplianceManager()
