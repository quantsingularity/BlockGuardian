"""
Enhanced Compliance System for Financial Services
Implements KYC/AML, regulatory reporting, and comprehensive compliance monitoring
"""

import os
import json
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional, List, Tuple
from decimal import Decimal
from enum import Enum
from dataclasses import dataclass
import requests
import hashlib

from ..models.user import User
from ..models.transaction import Transaction, SuspiciousActivity
from ..models.base import db_manager


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
            'basic': Decimal('1000.00'),
            'enhanced': Decimal('10000.00'),
            'premium': Decimal('100000.00')
        }
        
        # AML thresholds
        self.aml_thresholds = {
            'large_transaction': Decimal('10000.00'),
            'suspicious_pattern': Decimal('5000.00'),
            'daily_limit': Decimal('50000.00'),
            'monthly_limit': Decimal('500000.00')
        }
        
        # Sanctions lists (would be loaded from external sources)
        self.sanctions_lists = {
            'ofac_sdn': [],  # OFAC Specially Designated Nationals
            'eu_sanctions': [],  # EU Sanctions List
            'un_sanctions': [],  # UN Sanctions List
            'pep_list': []  # Politically Exposed Persons
        }
        
        # Compliance rules
        self.compliance_rules = self._load_compliance_rules()
        
        # Regulatory requirements
        self.regulatory_requirements = self._load_regulatory_requirements()
    
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
                    "required_documents": ["government_id", "proof_of_address"]
                },
                actions=["request_documents", "verify_identity"],
                severity="medium"
            ),
            ComplianceRule(
                id="aml_large_transaction",
                name="Large Transaction Monitoring",
                description="Monitor transactions above threshold",
                rule_type="aml",
                conditions={
                    "amount_threshold": 10000.00,
                    "frequency_threshold": 3
                },
                actions=["flag_transaction", "generate_sar"],
                severity="high"
            ),
            ComplianceRule(
                id="sanctions_screening",
                name="Sanctions List Screening",
                description="Screen against sanctions lists",
                rule_type="aml",
                conditions={
                    "check_frequency": "daily",
                    "lists": ["ofac_sdn", "eu_sanctions", "un_sanctions"]
                },
                actions=["block_transaction", "freeze_account"],
                severity="critical"
            )
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
                mandatory=True
            ),
            RegulatoryRequirement(
                regulation="BSA",
                requirement_id="SAR_FILING",
                description="Suspicious Activity Report filing within 30 days",
                applicable_jurisdictions=["US"],
                compliance_deadline=None,
                mandatory=True
            ),
            RegulatoryRequirement(
                regulation="GDPR",
                requirement_id="DATA_PROTECTION",
                description="General Data Protection Regulation compliance",
                applicable_jurisdictions=["EU"],
                compliance_deadline=None,
                mandatory=True
            )
        ]
    
    def perform_kyc_verification(self, user: User, documents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Perform comprehensive KYC verification"""
        
        verification_result = {
            'user_id': str(user.id),
            'verification_id': self._generate_verification_id(),
            'status': ComplianceStatus.IN_PROGRESS.value,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'documents_verified': [],
            'verification_steps': [],
            'risk_score': 0,
            'issues': []
        }
        
        try:
            # Step 1: Document verification
            doc_verification = self._verify_documents(documents)
            verification_result['documents_verified'] = doc_verification['verified_documents']
            verification_result['verification_steps'].append({
                'step': 'document_verification',
                'status': 'completed' if doc_verification['success'] else 'failed',
                'details': doc_verification
            })
            
            # Step 2: Identity verification
            identity_verification = self._verify_identity(user, documents)
            verification_result['verification_steps'].append({
                'step': 'identity_verification',
                'status': 'completed' if identity_verification['success'] else 'failed',
                'details': identity_verification
            })
            
            # Step 3: Address verification
            address_verification = self._verify_address(user, documents)
            verification_result['verification_steps'].append({
                'step': 'address_verification',
                'status': 'completed' if address_verification['success'] else 'failed',
                'details': address_verification
            })
            
            # Step 4: Sanctions screening
            sanctions_screening = self._screen_sanctions(user)
            verification_result['verification_steps'].append({
                'step': 'sanctions_screening',
                'status': 'completed' if sanctions_screening['success'] else 'failed',
                'details': sanctions_screening
            })
            
            # Step 5: PEP screening
            pep_screening = self._screen_pep(user)
            verification_result['verification_steps'].append({
                'step': 'pep_screening',
                'status': 'completed' if pep_screening['success'] else 'failed',
                'details': pep_screening
            })
            
            # Calculate overall risk score
            risk_score = self._calculate_kyc_risk_score(user, verification_result)
            verification_result['risk_score'] = risk_score
            
            # Determine final status
            if all(step['status'] == 'completed' for step in verification_result['verification_steps']):
                if risk_score < 30:
                    verification_result['status'] = ComplianceStatus.APPROVED.value
                elif risk_score < 70:
                    verification_result['status'] = ComplianceStatus.REQUIRES_REVIEW.value
                else:
                    verification_result['status'] = ComplianceStatus.REJECTED.value
            else:
                verification_result['status'] = ComplianceStatus.REJECTED.value
            
            # Update user KYC status
            self._update_user_kyc_status(user, verification_result)
            
            # Log verification
            self.logger.info(f"KYC verification completed for user {user.id}: {verification_result['status']}")
            
            return verification_result
            
        except Exception as e:
            self.logger.error(f"KYC verification error for user {user.id}: {e}")
            verification_result['status'] = ComplianceStatus.REJECTED.value
            verification_result['issues'].append(f"Verification error: {str(e)}")
            return verification_result
    
    def _verify_documents(self, documents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Verify submitted documents"""
        
        result = {
            'success': True,
            'verified_documents': [],
            'issues': []
        }
        
        required_doc_types = ['government_id', 'proof_of_address']
        provided_doc_types = [doc.get('type') for doc in documents]
        
        # Check if all required documents are provided
        for required_type in required_doc_types:
            if required_type not in provided_doc_types:
                result['success'] = False
                result['issues'].append(f"Missing required document: {required_type}")
        
        # Verify each document
        for document in documents:
            doc_verification = self._verify_single_document(document)
            if doc_verification['valid']:
                result['verified_documents'].append(document['type'])
            else:
                result['success'] = False
                result['issues'].extend(doc_verification['issues'])
        
        return result
    
    def _verify_single_document(self, document: Dict[str, Any]) -> Dict[str, Any]:
        """Verify a single document"""
        
        # This would integrate with document verification services
        # For now, implementing basic checks
        
        result = {
            'valid': True,
            'issues': []
        }
        
        # Check required fields
        required_fields = ['type', 'document_number', 'expiry_date', 'file_path']
        for field in required_fields:
            if field not in document or not document[field]:
                result['valid'] = False
                result['issues'].append(f"Missing required field: {field}")
        
        # Check expiry date
        if 'expiry_date' in document:
            try:
                expiry_date = datetime.fromisoformat(document['expiry_date'])
                if expiry_date < datetime.now(timezone.utc):
                    result['valid'] = False
                    result['issues'].append("Document has expired")
            except ValueError:
                result['valid'] = False
                result['issues'].append("Invalid expiry date format")
        
        return result
    
    def _verify_identity(self, user: User, documents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Verify user identity against documents"""
        
        # This would integrate with identity verification services
        result = {
            'success': True,
            'confidence_score': 85,  # Mock score
            'issues': []
        }
        
        # Basic name matching
        gov_id_docs = [doc for doc in documents if doc.get('type') == 'government_id']
        if gov_id_docs:
            doc_name = gov_id_docs[0].get('name', '').lower()
            user_name = f"{user.first_name} {user.last_name}".lower()
            
            if doc_name != user_name:
                result['success'] = False
                result['issues'].append("Name mismatch between user profile and document")
        
        return result
    
    def _verify_address(self, user: User, documents: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Verify user address against documents"""
        
        result = {
            'success': True,
            'confidence_score': 80,  # Mock score
            'issues': []
        }
        
        # Check for proof of address document
        address_docs = [doc for doc in documents if doc.get('type') == 'proof_of_address']
        if not address_docs:
            result['success'] = False
            result['issues'].append("No proof of address document provided")
        
        return result
    
    def _screen_sanctions(self, user: User) -> Dict[str, Any]:
        """Screen user against sanctions lists"""
        
        result = {
            'success': True,
            'matches': [],
            'lists_checked': ['ofac_sdn', 'eu_sanctions', 'un_sanctions']
        }
        
        # This would integrate with real sanctions screening services
        # For now, implementing mock screening
        
        user_name = f"{user.first_name} {user.last_name}".lower()
        
        # Mock sanctions check (would use real API)
        high_risk_names = ['john doe', 'jane smith']  # Mock list
        if user_name in high_risk_names:
            result['success'] = False
            result['matches'].append({
                'list': 'mock_sanctions',
                'name': user_name,
                'confidence': 95
            })
        
        return result
    
    def _screen_pep(self, user: User) -> Dict[str, Any]:
        """Screen for Politically Exposed Persons"""
        
        result = {
            'success': True,
            'is_pep': False,
            'pep_category': None,
            'details': []
        }
        
        # This would integrate with PEP screening services
        # Mock implementation
        
        return result
    
    def _calculate_kyc_risk_score(self, user: User, verification_result: Dict[str, Any]) -> int:
        """Calculate KYC risk score (0-100)"""
        
        risk_score = 0
        
        # Document verification issues
        failed_steps = [step for step in verification_result['verification_steps'] if step['status'] == 'failed']
        risk_score += len(failed_steps) * 20
        
        # Country risk
        high_risk_countries = ['AF', 'IR', 'KP', 'SY']  # Mock list
        if user.country in high_risk_countries:
            risk_score += 30
        
        # Age of account
        account_age = datetime.now(timezone.utc) - user.created_at
        if account_age < timedelta(days=1):
            risk_score += 15
        
        # Sanctions matches
        sanctions_step = next((step for step in verification_result['verification_steps'] 
                             if step['step'] == 'sanctions_screening'), None)
        if sanctions_step and not sanctions_step['details']['success']:
            risk_score += 50
        
        return min(risk_score, 100)
    
    def _update_user_kyc_status(self, user: User, verification_result: Dict[str, Any]):
        """Update user KYC status based on verification result"""
        
        session = db_manager.get_session()
        try:
            user.update_kyc_status(
                verification_result['status'],
                f"KYC verification completed with risk score: {verification_result['risk_score']}"
            )
            
            # Store verification details in metadata
            if not user.metadata:
                user.metadata = {}
            
            user.metadata['kyc_verification'] = verification_result
            
            session.commit()
            
        except Exception as e:
            session.rollback()
            self.logger.error(f"Failed to update user KYC status: {e}")
        finally:
            session.close()
    
    def monitor_transaction(self, transaction: Transaction) -> Dict[str, Any]:
        """Monitor transaction for AML compliance"""
        
        monitoring_result = {
            'transaction_id': str(transaction.id),
            'monitoring_id': self._generate_monitoring_id(),
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'risk_score': 0,
            'flags': [],
            'actions_required': [],
            'status': 'approved'
        }
        
        try:
            # Check transaction amount thresholds
            if transaction.total_amount >= self.aml_thresholds['large_transaction']:
                monitoring_result['flags'].append({
                    'type': 'large_transaction',
                    'description': f"Transaction amount ${transaction.total_amount} exceeds threshold",
                    'severity': 'high'
                })
                monitoring_result['risk_score'] += 30
                monitoring_result['actions_required'].append('generate_ctr')
            
            # Check for suspicious patterns
            pattern_analysis = self._analyze_transaction_patterns(transaction)
            if pattern_analysis['suspicious']:
                monitoring_result['flags'].extend(pattern_analysis['flags'])
                monitoring_result['risk_score'] += pattern_analysis['risk_score']
                monitoring_result['actions_required'].extend(pattern_analysis['actions'])
            
            # Check user risk profile
            user_risk = self._assess_user_transaction_risk(transaction.user, transaction)
            monitoring_result['risk_score'] += user_risk['risk_score']
            monitoring_result['flags'].extend(user_risk['flags'])
            
            # Determine final status
            if monitoring_result['risk_score'] >= 70:
                monitoring_result['status'] = 'blocked'
                monitoring_result['actions_required'].append('manual_review')
            elif monitoring_result['risk_score'] >= 40:
                monitoring_result['status'] = 'requires_review'
                monitoring_result['actions_required'].append('enhanced_monitoring')
            
            # Generate SAR if required
            if 'generate_sar' in monitoring_result['actions_required']:
                self._generate_sar(transaction, monitoring_result)
            
            # Log monitoring result
            self.logger.info(f"Transaction monitoring completed for {transaction.id}: {monitoring_result['status']}")
            
            return monitoring_result
            
        except Exception as e:
            self.logger.error(f"Transaction monitoring error for {transaction.id}: {e}")
            monitoring_result['status'] = 'error'
            monitoring_result['flags'].append({
                'type': 'monitoring_error',
                'description': f"Monitoring error: {str(e)}",
                'severity': 'critical'
            })
            return monitoring_result
    
    def _analyze_transaction_patterns(self, transaction: Transaction) -> Dict[str, Any]:
        """Analyze transaction patterns for suspicious activity"""
        
        result = {
            'suspicious': False,
            'flags': [],
            'risk_score': 0,
            'actions': []
        }
        
        # Get user's recent transactions
        session = db_manager.get_session()
        try:
            recent_transactions = session.query(Transaction).filter(
                Transaction.user_id == transaction.user_id,
                Transaction.created_at >= datetime.now(timezone.utc) - timedelta(days=30),
                Transaction.id != transaction.id
            ).all()
            
            # Pattern 1: Rapid succession of transactions
            recent_count = len([t for t in recent_transactions 
                              if t.created_at >= datetime.now(timezone.utc) - timedelta(hours=1)])
            if recent_count > 5:
                result['suspicious'] = True
                result['flags'].append({
                    'type': 'rapid_transactions',
                    'description': f"{recent_count} transactions in the last hour",
                    'severity': 'medium'
                })
                result['risk_score'] += 20
            
            # Pattern 2: Round number transactions
            if transaction.total_amount % 1000 == 0 and transaction.total_amount >= 5000:
                result['flags'].append({
                    'type': 'round_amount',
                    'description': f"Round amount transaction: ${transaction.total_amount}",
                    'severity': 'low'
                })
                result['risk_score'] += 10
            
            # Pattern 3: Structuring (multiple transactions just under reporting threshold)
            structuring_transactions = [
                t for t in recent_transactions 
                if 9000 <= t.total_amount < 10000
            ]
            if len(structuring_transactions) >= 2:
                result['suspicious'] = True
                result['flags'].append({
                    'type': 'potential_structuring',
                    'description': f"{len(structuring_transactions)} transactions just under $10,000 threshold",
                    'severity': 'high'
                })
                result['risk_score'] += 40
                result['actions'].append('generate_sar')
            
            # Pattern 4: Unusual transaction times
            transaction_hour = transaction.created_at.hour
            if transaction_hour < 6 or transaction_hour > 22:  # Outside normal hours
                result['flags'].append({
                    'type': 'unusual_timing',
                    'description': f"Transaction at unusual hour: {transaction_hour}:00",
                    'severity': 'low'
                })
                result['risk_score'] += 5
            
        except Exception as e:
            self.logger.error(f"Pattern analysis error: {e}")
        finally:
            session.close()
        
        return result
    
    def _assess_user_transaction_risk(self, user: User, transaction: Transaction) -> Dict[str, Any]:
        """Assess user-specific transaction risk"""
        
        result = {
            'risk_score': 0,
            'flags': []
        }
        
        # User KYC status
        if user.kyc_status != 'approved':
            result['risk_score'] += 25
            result['flags'].append({
                'type': 'kyc_not_approved',
                'description': f"User KYC status: {user.kyc_status}",
                'severity': 'medium'
            })
        
        # User AML risk level
        if user.aml_risk_level == 'high':
            result['risk_score'] += 30
            result['flags'].append({
                'type': 'high_risk_user',
                'description': "User classified as high AML risk",
                'severity': 'high'
            })
        elif user.aml_risk_level == 'critical':
            result['risk_score'] += 50
            result['flags'].append({
                'type': 'critical_risk_user',
                'description': "User classified as critical AML risk",
                'severity': 'critical'
            })
        
        # Transaction vs. user profile
        if user.annual_income and transaction.total_amount > user.annual_income * Decimal('0.1'):
            result['risk_score'] += 20
            result['flags'].append({
                'type': 'transaction_vs_income',
                'description': f"Transaction amount high relative to declared income",
                'severity': 'medium'
            })
        
        return result
    
    def _generate_sar(self, transaction: Transaction, monitoring_result: Dict[str, Any]):
        """Generate Suspicious Activity Report"""
        
        try:
            sar = SuspiciousActivity(
                transaction_id=transaction.id,
                user_id=transaction.user_id,
                activity_type='unusual_transaction_pattern',
                description=f"Suspicious transaction patterns detected. Flags: {monitoring_result['flags']}",
                risk_score=monitoring_result['risk_score']
            )
            
            session = db_manager.get_session()
            session.add(sar)
            session.commit()
            session.close()
            
            self.logger.info(f"SAR generated for transaction {transaction.id}: {sar.sar_number}")
            
        except Exception as e:
            self.logger.error(f"Failed to generate SAR for transaction {transaction.id}: {e}")
    
    def generate_compliance_report(self, report_type: str, start_date: datetime, 
                                 end_date: datetime) -> Dict[str, Any]:
        """Generate compliance report"""
        
        report = {
            'report_type': report_type,
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            },
            'generated_at': datetime.now(timezone.utc).isoformat(),
            'data': {}
        }
        
        session = db_manager.get_session()
        try:
            if report_type == 'kyc_summary':
                report['data'] = self._generate_kyc_summary_report(session, start_date, end_date)
            elif report_type == 'aml_activity':
                report['data'] = self._generate_aml_activity_report(session, start_date, end_date)
            elif report_type == 'large_transactions':
                report['data'] = self._generate_large_transactions_report(session, start_date, end_date)
            elif report_type == 'suspicious_activity':
                report['data'] = self._generate_suspicious_activity_report(session, start_date, end_date)
            else:
                raise ValueError(f"Unknown report type: {report_type}")
            
            return report
            
        except Exception as e:
            self.logger.error(f"Failed to generate {report_type} report: {e}")
            report['error'] = str(e)
            return report
        finally:
            session.close()
    
    def _generate_kyc_summary_report(self, session, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Generate KYC summary report"""
        
        users = session.query(User).filter(
            User.created_at >= start_date,
            User.created_at <= end_date
        ).all()
        
        kyc_stats = {
            'total_users': len(users),
            'kyc_approved': len([u for u in users if u.kyc_status == 'approved']),
            'kyc_pending': len([u for u in users if u.kyc_status in ['pending', 'in_progress']]),
            'kyc_rejected': len([u for u in users if u.kyc_status == 'rejected']),
            'by_risk_level': {
                'low': len([u for u in users if u.aml_risk_level == 'low']),
                'medium': len([u for u in users if u.aml_risk_level == 'medium']),
                'high': len([u for u in users if u.aml_risk_level == 'high']),
                'critical': len([u for u in users if u.aml_risk_level == 'critical'])
            }
        }
        
        return kyc_stats
    
    def _generate_aml_activity_report(self, session, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Generate AML activity report"""
        
        transactions = session.query(Transaction).filter(
            Transaction.created_at >= start_date,
            Transaction.created_at <= end_date
        ).all()
        
        large_transactions = [t for t in transactions if t.total_amount >= self.aml_thresholds['large_transaction']]
        
        sars = session.query(SuspiciousActivity).filter(
            SuspiciousActivity.created_at >= start_date,
            SuspiciousActivity.created_at <= end_date
        ).all()
        
        aml_stats = {
            'total_transactions': len(transactions),
            'large_transactions': len(large_transactions),
            'suspicious_activities': len(sars),
            'sars_filed': len([sar for sar in sars if sar.reported_to_authorities]),
            'average_transaction_amount': float(sum(t.total_amount for t in transactions) / len(transactions)) if transactions else 0,
            'total_volume': float(sum(t.total_amount for t in transactions))
        }
        
        return aml_stats
    
    def _generate_large_transactions_report(self, session, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Generate large transactions report (CTR)"""
        
        large_transactions = session.query(Transaction).filter(
            Transaction.created_at >= start_date,
            Transaction.created_at <= end_date,
            Transaction.total_amount >= self.aml_thresholds['large_transaction']
        ).all()
        
        report_data = {
            'total_count': len(large_transactions),
            'total_amount': float(sum(t.total_amount for t in large_transactions)),
            'transactions': []
        }
        
        for transaction in large_transactions:
            report_data['transactions'].append({
                'transaction_id': transaction.transaction_id,
                'user_id': str(transaction.user_id),
                'amount': float(transaction.total_amount),
                'currency': transaction.currency,
                'date': transaction.created_at.isoformat(),
                'type': transaction.transaction_type
            })
        
        return report_data
    
    def _generate_suspicious_activity_report(self, session, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Generate suspicious activity report"""
        
        sars = session.query(SuspiciousActivity).filter(
            SuspiciousActivity.created_at >= start_date,
            SuspiciousActivity.created_at <= end_date
        ).all()
        
        report_data = {
            'total_sars': len(sars),
            'filed_sars': len([sar for sar in sars if sar.reported_to_authorities]),
            'pending_sars': len([sar for sar in sars if not sar.reported_to_authorities]),
            'by_activity_type': {},
            'sars': []
        }
        
        # Group by activity type
        for sar in sars:
            activity_type = sar.activity_type
            if activity_type not in report_data['by_activity_type']:
                report_data['by_activity_type'][activity_type] = 0
            report_data['by_activity_type'][activity_type] += 1
        
        # Add SAR details
        for sar in sars:
            report_data['sars'].append({
                'sar_number': sar.sar_number,
                'user_id': str(sar.user_id),
                'transaction_id': str(sar.transaction_id),
                'activity_type': sar.activity_type,
                'risk_score': sar.risk_score,
                'status': sar.status,
                'reported': sar.reported_to_authorities,
                'created_at': sar.created_at.isoformat()
            })
        
        return report_data
    
    def _generate_verification_id(self) -> str:
        """Generate unique verification ID"""
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        random_suffix = hashlib.md5(os.urandom(16)).hexdigest()[:8].upper()
        return f"KYC-{timestamp}-{random_suffix}"
    
    def _generate_monitoring_id(self) -> str:
        """Generate unique monitoring ID"""
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        random_suffix = hashlib.md5(os.urandom(16)).hexdigest()[:8].upper()
        return f"AML-{timestamp}-{random_suffix}"


# Global instance
enhanced_compliance_manager = EnhancedComplianceManager()

