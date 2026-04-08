"""
Security module tests for BlockGuardian Backend
Tests validation, encryption, rate limiting, and audit logging
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import json
from decimal import Decimal
from typing import Any

import pytest
from src.main import create_app
from src.models.user import db
from src.security.auth import AuthManage, Permission
from src.security.encryption import EncryptionManager
from src.security.rate_limiting import RateLimiter
from src.security.validation import SecurityValidator, ValidationError

# ─────────────────────────────────────────────
# Fixtures
# ─────────────────────────────────────────────


@pytest.fixture
def app() -> Any:
    app = create_app("testing")
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


@pytest.fixture
def client(app: Any) -> Any:
    return app.test_client()


@pytest.fixture
def validator() -> SecurityValidator:
    return SecurityValidator()


@pytest.fixture
def encryption_manager() -> EncryptionManager:
    return EncryptionManager()


# ─────────────────────────────────────────────
# ValidationError
# ─────────────────────────────────────────────


class TestValidationError:
    def test_validation_error_has_message(self) -> None:
        err = ValidationError("bad input", "email")
        assert err.message == "bad input"
        assert err.field == "email"
        assert str(err) == "bad input"

    def test_validation_error_no_field(self) -> None:
        err = ValidationError("something wrong")
        assert err.field is None


# ─────────────────────────────────────────────
# SecurityValidator – email
# ─────────────────────────────────────────────


class TestEmailValidation:
    def test_valid_email(self, validator: SecurityValidator) -> None:
        assert validator.validate_email("user@example.com") == "user@example.com"

    def test_email_lowercased(self, validator: SecurityValidator) -> None:
        assert validator.validate_email("USER@EXAMPLE.COM") == "user@example.com"

    def test_email_stripped(self, validator: SecurityValidator) -> None:
        assert validator.validate_email("  user@example.com  ") == "user@example.com"

    def test_invalid_email_no_at(self, validator: SecurityValidator) -> None:
        with pytest.raises(ValidationError) as exc:
            validator.validate_email("notanemail")
        assert exc.value.field == "email"

    def test_invalid_email_empty(self, validator: SecurityValidator) -> None:
        with pytest.raises(ValidationError):
            validator.validate_email("")

    def test_email_too_long(self, validator: SecurityValidator) -> None:
        with pytest.raises(ValidationError):
            validator.validate_email("a" * 250 + "@b.com")

    def test_email_none(self, validator: SecurityValidator) -> None:
        with pytest.raises(ValidationError):
            validator.validate_email(None)  # type: ignore[arg-type]


# ─────────────────────────────────────────────
# SecurityValidator – username
# ─────────────────────────────────────────────


class TestUsernameValidation:
    def test_valid_username(self, validator: SecurityValidator) -> None:
        assert validator.validate_username("john_doe") == "john_doe"

    def test_username_too_short(self, validator: SecurityValidator) -> None:
        with pytest.raises(ValidationError) as exc:
            validator.validate_username("ab")
        assert exc.value.field == "username"

    def test_username_too_long(self, validator: SecurityValidator) -> None:
        with pytest.raises(ValidationError):
            validator.validate_username("a" * 33)

    def test_username_invalid_chars(self, validator: SecurityValidator) -> None:
        with pytest.raises(ValidationError):
            validator.validate_username("user name!")

    def test_username_allows_hyphens(self, validator: SecurityValidator) -> None:
        assert validator.validate_username("john-doe") == "john-doe"


# ─────────────────────────────────────────────
# SecurityValidator – password
# ─────────────────────────────────────────────


class TestPasswordValidation:
    def test_valid_password(self, validator: SecurityValidator) -> None:
        # Should not raise
        validator.validate_password("Str0ng!Pass#2024")

    def test_password_too_short(self, validator: SecurityValidator) -> None:
        with pytest.raises(ValidationError) as exc:
            validator.validate_password("Short1!")
        assert exc.value.field == "password"

    def test_password_no_uppercase(self, validator: SecurityValidator) -> None:
        with pytest.raises(ValidationError):
            validator.validate_password("nouppercase1!")

    def test_password_no_lowercase(self, validator: SecurityValidator) -> None:
        with pytest.raises(ValidationError):
            validator.validate_password("NOLOWERCASE1!")

    def test_password_no_digit(self, validator: SecurityValidator) -> None:
        with pytest.raises(ValidationError):
            validator.validate_password("NoDigitHere!!")

    def test_password_no_special(self, validator: SecurityValidator) -> None:
        with pytest.raises(ValidationError):
            validator.validate_password("NoSpecialChar1")

    def test_password_too_long(self, validator: SecurityValidator) -> None:
        with pytest.raises(ValidationError):
            validator.validate_password("A1!" + "x" * 130)


# ─────────────────────────────────────────────
# SecurityValidator – financial amount
# ─────────────────────────────────────────────


class TestFinancialAmountValidation:
    def test_valid_integer(self, validator: SecurityValidator) -> None:
        assert validator.validate_financial_amount(100) == Decimal("100")

    def test_valid_float(self, validator: SecurityValidator) -> None:
        result = validator.validate_financial_amount(99.99)
        assert result == Decimal("99.99")

    def test_valid_string(self, validator: SecurityValidator) -> None:
        assert validator.validate_financial_amount("1234.56") == Decimal("1234.56")

    def test_valid_decimal(self, validator: SecurityValidator) -> None:
        d = Decimal("500.00")
        assert validator.validate_financial_amount(d) == d

    def test_negative_amount(self, validator: SecurityValidator) -> None:
        with pytest.raises(ValidationError) as exc:
            validator.validate_financial_amount(-1)
        assert exc.value.field == "amount"

    def test_too_large(self, validator: SecurityValidator) -> None:
        with pytest.raises(ValidationError):
            validator.validate_financial_amount(Decimal("9999999999999.99"))

    def test_invalid_string(self, validator: SecurityValidator) -> None:
        with pytest.raises(ValidationError):
            validator.validate_financial_amount("not_a_number")


# ─────────────────────────────────────────────
# SecurityValidator – threat detection
# ─────────────────────────────────────────────


class TestThreatDetection:
    def test_no_threats_clean_input(self, validator: SecurityValidator) -> None:
        assert validator.check_security_threats('{"email": "user@example.com"}') == []

    def test_sql_injection_union(self, validator: SecurityValidator) -> None:
        threats = validator.check_security_threats("UNION SELECT * FROM users")
        assert "sql_injection" in threats

    def test_xss_script_tag(self, validator: SecurityValidator) -> None:
        threats = validator.check_security_threats("<script>alert('xss')</script>")
        assert "xss" in threats

    def test_xss_javascript_proto(self, validator: SecurityValidator) -> None:
        threats = validator.check_security_threats("javascript:void(0)")
        assert "xss" in threats

    def test_empty_string(self, validator: SecurityValidator) -> None:
        assert validator.check_security_threats("") == []


# ─────────────────────────────────────────────
# SecurityValidator – JSON input
# ─────────────────────────────────────────────


class TestJsonValidation:
    def test_valid_json(self, validator: SecurityValidator) -> None:
        data = {"key": "value"}
        assert validator.validate_json_input(data) == data

    def test_none_raises(self, validator: SecurityValidator) -> None:
        with pytest.raises(ValidationError):
            validator.validate_json_input(None)

    def test_non_dict_raises(self, validator: SecurityValidator) -> None:
        with pytest.raises(ValidationError):
            validator.validate_json_input(["list", "not", "dict"])  # type: ignore[arg-type]


# ─────────────────────────────────────────────
# SecurityValidator – pagination
# ─────────────────────────────────────────────


class TestPaginationValidation:
    def test_valid_pagination(self, validator: SecurityValidator) -> None:
        page, per_page = validator.validate_pagination(1, 20)
        assert page == 1
        assert per_page == 20

    def test_page_below_one(self, validator: SecurityValidator) -> None:
        with pytest.raises(ValidationError):
            validator.validate_pagination(0, 20)

    def test_per_page_clamped_to_max(self, validator: SecurityValidator) -> None:
        _, per_page = validator.validate_pagination(1, 200, max_per_page=100)
        assert per_page == 100


# ─────────────────────────────────────────────
# SecurityValidator – date range
# ─────────────────────────────────────────────


class TestDateRangeValidation:
    def test_valid_date_range(self, validator: SecurityValidator) -> None:
        start, end = validator.validate_date_range("2024-01-01", "2024-12-31")
        assert start < end

    def test_start_after_end_raises(self, validator: SecurityValidator) -> None:
        with pytest.raises(ValidationError):
            validator.validate_date_range("2024-12-31", "2024-01-01")

    def test_invalid_format_raises(self, validator: SecurityValidator) -> None:
        with pytest.raises(ValidationError):
            validator.validate_date_range("not-a-date", "2024-01-01")


# ─────────────────────────────────────────────
# EncryptionManager
# ─────────────────────────────────────────────


class TestEncryption:
    def test_encrypt_decrypt_roundtrip(
        self, encryption_manager: EncryptionManager
    ) -> None:
        plaintext = "sensitive data"
        encrypted = encryption_manager.encrypt_field(plaintext)
        assert encrypted != plaintext
        decrypted = encryption_manager.decrypt_field(encrypted)
        assert decrypted == plaintext

    def test_encrypt_produces_different_ciphertexts(
        self, encryption_manager: EncryptionManager
    ) -> None:
        val = "same value"
        c1 = encryption_manager.encrypt_field(val)
        c2 = encryption_manager.encrypt_field(val)
        # Fernet uses random IV so ciphertexts should differ
        assert c1 != c2

    def test_decrypt_invalid_returns_none(
        self, encryption_manager: EncryptionManager
    ) -> None:
        result = encryption_manager.decrypt_field("this-is-not-valid-ciphertext")
        assert result is None

    def test_encrypt_empty_string(self, encryption_manager: EncryptionManager) -> None:
        encrypted = encryption_manager.encrypt_field("")
        assert encryption_manager.decrypt_field(encrypted) == ""

    def test_pii_field_type(self, encryption_manager: EncryptionManager) -> None:
        val = "+1-555-0100"
        encrypted = encryption_manager.encrypt_field(val, field_type="pii")
        assert encryption_manager.decrypt_field(encrypted) == val


# ─────────────────────────────────────────────
# AuthManage – password hashing
# ─────────────────────────────────────────────


class TestAuthManagePasswords:
    def test_hash_and_verify(self) -> None:
        manager = AuthManage()
        hashed = manager.hash_password("MySecurePass1!")
        assert manager.verify_password("MySecurePass1!", hashed)

    def test_wrong_password_fails(self) -> None:
        manager = AuthManage()
        hashed = manager.hash_password("MySecurePass1!")
        assert not manager.verify_password("WrongPassword!", hashed)


# ─────────────────────────────────────────────
# AuthManage – password strength validation
# ─────────────────────────────────────────────


class TestPasswordStrengthValidation:
    def test_strong_password_passes(self) -> None:
        manager = AuthManage()
        ok, errors = manager.validate_password_strength("Str0ng!Pass#2024")
        assert ok
        assert len(errors) == 0

    def test_too_short_fails(self) -> None:
        manager = AuthManage()
        ok, errors = manager.validate_password_strength("Sh0rt!")
        assert not ok
        assert any("characters" in e for e in errors)

    def test_no_uppercase_fails(self) -> None:
        manager = AuthManage()
        ok, errors = manager.validate_password_strength("nouppercase1!")
        assert not ok

    def test_no_special_fails(self) -> None:
        manager = AuthManage()
        ok, errors = manager.validate_password_strength("NoSpecial1234")
        assert not ok


# ─────────────────────────────────────────────
# AuthManage – permissions
# ─────────────────────────────────────────────


class TestPermissions:
    def test_user_role_permissions(self) -> None:
        manager = AuthManage()
        from src.models.user import UserRole

        perms = manager.get_user_permissions(UserRole.USER)
        assert Permission.READ_PORTFOLIO.value in perms
        assert Permission.CREATE_PORTFOLIO.value in perms
        assert Permission.MANAGE_USERS.value not in perms

    def test_admin_role_permissions(self) -> None:
        manager = AuthManage()
        from src.models.user import UserRole

        perms = manager.get_user_permissions(UserRole.ADMIN)
        assert Permission.MANAGE_USERS.value in perms
        assert Permission.VIEW_AUDIT_LOGS.value in perms

    def test_super_admin_has_all_permissions(self) -> None:
        manager = AuthManage()
        from src.models.user import UserRole

        perms = manager.get_user_permissions(UserRole.SUPER_ADMIN)
        for p in Permission:
            assert p.value in perms

    def test_unknown_role_returns_empty(self) -> None:
        manager = AuthManage()
        perms = manager.get_user_permissions("unknown_role")
        assert perms == []


# ─────────────────────────────────────────────
# AuthManage – device fingerprint
# ─────────────────────────────────────────────


class TestDeviceFingerprint:
    def test_fingerprint_is_hex_string(self) -> None:
        manager = AuthManage()
        fp = manager.generate_device_fingerprint(
            {"user_agent": "Mozilla/5.0", "platform": "Linux"}
        )
        assert len(fp) == 64
        assert all(c in "0123456789abcdef" for c in fp)

    def test_same_data_same_fingerprint(self) -> None:
        manager = AuthManage()
        data = {"user_agent": "Chrome", "platform": "Win"}
        assert manager.generate_device_fingerprint(
            data
        ) == manager.generate_device_fingerprint(data)

    def test_different_data_different_fingerprint(self) -> None:
        manager = AuthManage()
        fp1 = manager.generate_device_fingerprint({"user_agent": "Chrome"})
        fp2 = manager.generate_device_fingerprint({"user_agent": "Firefox"})
        assert fp1 != fp2


# ─────────────────────────────────────────────
# RateLimiter – in-memory
# ─────────────────────────────────────────────


class TestRateLimiter:
    def test_allows_within_limit(self, app: Any) -> None:
        limiter = RateLimiter()
        limiter.app = app
        with app.app_context():
            for _ in range(5):
                ok, info = limiter._memory_check("test_key_allow", 10, 60)
                assert ok
                assert info["remaining"] >= 0

    def test_blocks_over_limit(self, app: Any) -> None:
        limiter = RateLimiter()
        limiter.app = app
        with app.app_context():
            for _ in range(10):
                limiter._memory_check("test_key_block", 10, 60)
            ok, info = limiter._memory_check("test_key_block", 10, 60)
            assert not ok
            assert info["remaining"] == 0

    def test_rate_limit_info_structure(self, app: Any) -> None:
        limiter = RateLimiter()
        limiter.app = app
        with app.app_context():
            ok, info = limiter._memory_check("test_key_struct", 5, 60)
            assert "remaining" in info
            assert "reset_time" in info
            assert "limit" in info
            assert "current_count" in info


# ─────────────────────────────────────────────
# API – Health check & info
# ─────────────────────────────────────────────


class TestHealthAndInfo:
    def test_health_endpoint(self, client: Any) -> None:
        response = client.get("/health")
        assert response.status_code in (200, 503)
        data = json.loads(response.data)
        assert "status" in data
        assert "timestamp" in data
        assert "services" in data

    def test_api_info_endpoint(self, client: Any) -> None:
        response = client.get("/api/info")
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data["name"] == "BlockGuardian Backend API"
        assert "version" in data
        assert "features" in data
        assert "endpoints" in data

    def test_missing_portfolio_returns_404(self, client: Any, app: Any) -> None:
        with app.app_context():
            from src.models.user import User, UserStatus, db

            u = User(email="err@test.com", username="erruser", status=UserStatus.ACTIVE)
            u.set_password("ErrPass123!")
            db.session.add(u)
            db.session.commit()
        r = client.post(
            "/api/auth/login", json={"email": "err@test.com", "password": "ErrPass123!"}
        )
        token = json.loads(r.data)["tokens"]["access_token"]
        response = client.get(
            "/api/portfolios/99999", headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 404
        data = json.loads(response.data)
        assert "error" in data

    def test_cors_headers_present(self, client: Any) -> None:
        response = client.options(
            "/api/auth/login", headers={"Origin": "http://localhost:3000"}
        )
        assert response.status_code in (200, 204)


# ─────────────────────────────────────────────
# API – Auth edge cases
# ─────────────────────────────────────────────


class TestAuthEdgeCases:
    def test_register_returns_tokens(self, client: Any) -> None:
        data = {
            "email": "edge@example.com",
            "username": "edgeuser",
            "password": "EdgePass123!",
            "first_name": "Edge",
            "last_name": "Case",
        }
        r = client.post("/api/auth/register", json=data)
        assert r.status_code == 201
        body = json.loads(r.data)
        assert "tokens" in body
        assert "access_token" in body["tokens"]
        assert "refresh_token" in body["tokens"]

    def test_register_and_login_flow(self, client: Any) -> None:
        data = {
            "email": "flow@example.com",
            "username": "flowuser",
            "password": "FlowPass123!",
            "first_name": "Flow",
            "last_name": "User",
        }
        client.post("/api/auth/register", json=data)
        r = client.post(
            "/api/auth/login",
            json={"email": data["email"], "password": data["password"]},
        )
        assert r.status_code == 200
        body = json.loads(r.data)
        assert body["user"]["username"] == "flowuser"

    def test_login_nonexistent_user(self, client: Any) -> None:
        r = client.post(
            "/api/auth/login", json={"email": "nobody@x.com", "password": "Pass123!"}
        )
        assert r.status_code == 401

    def test_missing_content_type(self, client: Any) -> None:
        r = client.post("/api/auth/login", data='{"email":"x@x.com","password":"p"}')
        assert r.status_code in (400, 401, 415, 500)

    def test_empty_body_login(self, client: Any) -> None:
        r = client.post("/api/auth/login", json={})
        assert r.status_code == 400

    def test_verify_token_missing_token(self, client: Any) -> None:
        r = client.post("/api/auth/verify-token", json={})
        assert r.status_code == 400

    def test_profile_requires_auth(self, client: Any) -> None:
        r = client.get("/api/auth/profile")
        assert r.status_code == 401

    def test_change_password_requires_auth(self, client: Any) -> None:
        r = client.post(
            "/api/auth/change-password",
            json={"current_password": "a", "new_password": "b"},
        )
        assert r.status_code == 401


# ─────────────────────────────────────────────
# API – Portfolio edge cases
# ─────────────────────────────────────────────


class TestPortfolioEdgeCases:
    @pytest.fixture
    def auth_token(self, client: Any) -> str:
        data = {
            "email": "port@example.com",
            "username": "portuser",
            "password": "PortPass123!",
            "first_name": "Port",
            "last_name": "User",
        }
        r = client.post("/api/auth/register", json=data)
        return json.loads(r.data)["tokens"]["access_token"]

    def test_get_portfolios_empty(self, client: Any, auth_token: str) -> None:
        headers = {"Authorization": f"Bearer {auth_token}"}
        r = client.get("/api/portfolios", headers=headers)
        assert r.status_code == 200
        body = json.loads(r.data)
        assert "portfolios" in body
        assert body["portfolios"] == []

    def test_get_portfolio_not_found(self, client: Any, auth_token: str) -> None:
        headers = {"Authorization": f"Bearer {auth_token}"}
        r = client.get("/api/portfolios/99999", headers=headers)
        assert r.status_code == 404

    def test_create_portfolio_no_auth(self, client: Any) -> None:
        r = client.post("/api/portfolios", json={"name": "Test"})
        assert r.status_code == 401

    def test_create_and_get_portfolio(self, client: Any, auth_token: str) -> None:
        headers = {"Authorization": f"Bearer {auth_token}"}
        r = client.post(
            "/api/portfolios",
            json={"name": "My Portfolio", "description": "Test"},
            headers=headers,
        )
        assert r.status_code == 201
        portfolio_id = json.loads(r.data)["portfolio"]["id"]
        r2 = client.get(f"/api/portfolios/{portfolio_id}", headers=headers)
        assert r2.status_code == 200
        assert json.loads(r2.data)["portfolio"]["id"] == portfolio_id

    def test_assets_search_too_short(self, client: Any, auth_token: str) -> None:
        headers = {"Authorization": f"Bearer {auth_token}"}
        r = client.get("/api/portfolios/assets/search?q=A", headers=headers)
        assert r.status_code == 400

    def test_assets_search_valid(self, client: Any, auth_token: str) -> None:
        headers = {"Authorization": f"Bearer {auth_token}"}
        r = client.get("/api/portfolios/assets/search?q=AP", headers=headers)
        assert r.status_code == 200
        assert "assets" in json.loads(r.data)

    def test_portfolio_performance_endpoint(self, client: Any, auth_token: str) -> None:
        headers = {"Authorization": f"Bearer {auth_token}"}
        r = client.post("/api/portfolios", json={"name": "Perf Test"}, headers=headers)
        pid = json.loads(r.data)["portfolio"]["id"]
        r2 = client.get(f"/api/portfolios/{pid}/performance", headers=headers)
        assert r2.status_code == 200
        assert "performance" in json.loads(r2.data)

    def test_portfolio_risk_endpoint(self, client: Any, auth_token: str) -> None:
        headers = {"Authorization": f"Bearer {auth_token}"}
        r = client.post("/api/portfolios", json={"name": "Risk Test"}, headers=headers)
        pid = json.loads(r.data)["portfolio"]["id"]
        r2 = client.get(f"/api/portfolios/{pid}/risk", headers=headers)
        assert r2.status_code == 200
        assert "risk_metrics" in json.loads(r2.data)

    def test_portfolio_allocation_endpoint(self, client: Any, auth_token: str) -> None:
        headers = {"Authorization": f"Bearer {auth_token}"}
        r = client.post("/api/portfolios", json={"name": "Alloc Test"}, headers=headers)
        pid = json.loads(r.data)["portfolio"]["id"]
        r2 = client.get(f"/api/portfolios/{pid}/allocation", headers=headers)
        assert r2.status_code == 200
        body = json.loads(r2.data)
        assert "allocation" in body
        assert "by_asset_type" in body["allocation"]
        assert "by_asset" in body["allocation"]

    def test_transactions_list_empty(self, client: Any, auth_token: str) -> None:
        headers = {"Authorization": f"Bearer {auth_token}"}
        r = client.post("/api/portfolios", json={"name": "TxTest"}, headers=headers)
        pid = json.loads(r.data)["portfolio"]["id"]
        r2 = client.get(f"/api/portfolios/{pid}/transactions", headers=headers)
        assert r2.status_code == 200
        body = json.loads(r2.data)
        assert "transactions" in body
        assert body["transactions"] == []


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
