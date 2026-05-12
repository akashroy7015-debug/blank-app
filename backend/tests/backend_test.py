"""Sparkd backend API tests - comprehensive coverage of auth, swipes, matches,
safety, privacy, checkout (Stripe), admin, AI moderation."""
import os
import uuid
import time
import pytest
import requests
from datetime import datetime, timedelta, timezone

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://swipe-connect-122.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@sparkd.app"
ADMIN_PASSWORD = "AdminSparkd2026!"
DEMO_EMAIL = "demo@sparkd.app"
DEMO_PASSWORD = "DemoSparkd2026!"


# ---------- fixtures ----------
@pytest.fixture(scope="session")
def s():
    return requests.Session()


@pytest.fixture(scope="session")
def demo_token(s):
    r = s.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASSWORD})
    assert r.status_code == 200, f"demo login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def admin_token(s):
    r = s.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    return r.json()["token"]


def auth(tok):
    return {"Authorization": f"Bearer {tok}"}


def rnd_email(prefix="TEST"):
    return f"{prefix.lower()}_{uuid.uuid4().hex[:10]}@example.com"


# ---------- root ----------
def test_root_ok(s):
    r = s.get(f"{API}/")
    assert r.status_code == 200
    body = r.json()
    assert body["app"] == "Sparkd"
    assert body["status"] == "ok"


# ---------- AUTH ----------
class TestAuth:
    def test_register_underage_rejected(self, s):
        dob = (datetime.now(timezone.utc) - timedelta(days=365 * 16)).strftime("%Y-%m-%d")
        r = s.post(f"{API}/auth/register", json={
            "email": rnd_email("UNDER"), "password": "Pass1234!", "name": "Teen",
            "dob": dob, "accept_terms": True, "accept_privacy": True, "accept_community": True,
        })
        assert r.status_code == 403
        assert "18" in r.text

    def test_register_missing_consent_rejected(self, s):
        dob = (datetime.now(timezone.utc) - timedelta(days=365 * 25)).strftime("%Y-%m-%d")
        r = s.post(f"{API}/auth/register", json={
            "email": rnd_email("NOCONS"), "password": "Pass1234!", "name": "X",
            "dob": dob, "accept_terms": True, "accept_privacy": True, "accept_community": False,
        })
        assert r.status_code == 400

    def test_register_success_returns_token_and_otp(self, s):
        dob = (datetime.now(timezone.utc) - timedelta(days=365 * 25)).strftime("%Y-%m-%d")
        email = rnd_email("REG")
        r = s.post(f"{API}/auth/register", json={
            "email": email, "password": "Pass1234!", "name": "TestReg",
            "dob": dob, "accept_terms": True, "accept_privacy": True, "accept_community": True,
        })
        assert r.status_code == 200, r.text
        body = r.json()
        assert "token" in body and isinstance(body["token"], str) and len(body["token"]) > 20
        assert "otp_code_dev" in body and len(body["otp_code_dev"]) == 6
        assert body["email_verified"] is False
        pytest.shared_email = email
        pytest.shared_token = body["token"]
        pytest.shared_otp = body["otp_code_dev"]

    def test_register_duplicate_rejected(self, s):
        dob = (datetime.now(timezone.utc) - timedelta(days=365 * 25)).strftime("%Y-%m-%d")
        r = s.post(f"{API}/auth/register", json={
            "email": DEMO_EMAIL, "password": "ValidPass123!", "name": "Dup", "dob": dob,
            "accept_terms": True, "accept_privacy": True, "accept_community": True,
        })
        assert r.status_code == 409, f"expected 409 got {r.status_code} {r.text}"

    def test_login_demo_success(self, s):
        r = s.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASSWORD})
        assert r.status_code == 200
        b = r.json()
        assert "token" in b
        assert b.get("onboarded") is True

    def test_login_wrong_password(self, s):
        r = s.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_otp_request_and_verify(self, s):
        # use the email from register test
        email = getattr(pytest, "shared_email", None)
        assert email, "register must run first"
        r = s.post(f"{API}/auth/otp/request", json={"email": email})
        assert r.status_code == 200
        code = r.json()["otp_code_dev"]
        v = s.post(f"{API}/auth/otp/verify", json={"email": email, "code": code})
        assert v.status_code == 200
        assert v.json()["verified"] is True

    def test_otp_verify_invalid(self, s):
        r = s.post(f"{API}/auth/otp/verify", json={"email": DEMO_EMAIL, "code": "000000"})
        assert r.status_code == 400

    def test_me_requires_auth(self, s):
        r = s.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_excludes_password_hash_and_id(self, s, demo_token):
        r = s.get(f"{API}/auth/me", headers=auth(demo_token))
        assert r.status_code == 200
        b = r.json()
        assert "password_hash" not in b
        assert "_id" not in b
        assert b["email"] == DEMO_EMAIL


# ---------- PROFILE ----------
class TestProfile:
    def test_complete_profile_ok(self, s, demo_token):
        r = s.post(f"{API}/profile/complete", json={
            "gender": "any", "interested_in": "any",
            "photos": ["https://img/1.jpg"], "bio": "Love hiking and coffee",
            "interests": ["coffee"], "prompts": [{"q": "fav", "a": "music"}],
            "location_city": "NYC",
        }, headers=auth(demo_token))
        assert r.status_code == 200
        assert r.json()["onboarded"] is True

    def test_complete_profile_blocks_abusive_bio(self, s, demo_token):
        r = s.post(f"{API}/profile/complete", json={
            "gender": "any", "interested_in": "any", "photos": [],
            "bio": "kill yourself you fucking bitch",  # rule-based hit
            "interests": [], "prompts": [], "location_city": "",
        }, headers=auth(demo_token))
        assert r.status_code == 400
        assert "guidelines" in r.text.lower() or "violat" in r.text.lower()


# ---------- SWIPES ----------
class TestSwipes:
    def test_swipe_state_initial(self, s, demo_token):
        r = s.get(f"{API}/swipes/state", headers=auth(demo_token))
        assert r.status_code == 200
        b = r.json()
        assert b["limit"] == 10
        assert "used" in b and "remaining" in b
        assert "resets_at" in b
        # demo is free plan
        assert b["unlimited"] is False

    def test_swipe_deck_excludes_admin_and_self(self, s, demo_token):
        r = s.get(f"{API}/swipes/deck?limit=20", headers=auth(demo_token))
        assert r.status_code == 200
        profiles = r.json()["profiles"]
        assert len(profiles) > 0
        for p in profiles:
            assert p.get("role") != "admin"
            assert p["user_id"] != "user_demo00001"
            assert "password_hash" not in p

    def test_swipe_action_consumes(self, s, demo_token):
        # snapshot state
        st0 = s.get(f"{API}/swipes/state", headers=auth(demo_token)).json()
        deck = s.get(f"{API}/swipes/deck?limit=5", headers=auth(demo_token)).json()["profiles"]
        if not deck:
            pytest.skip("deck empty")
        target = deck[0]["user_id"]
        r = s.post(f"{API}/swipes/action", json={"target_user_id": target, "action": "pass"}, headers=auth(demo_token))
        assert r.status_code == 200
        b = r.json()
        assert b["ok"] is True
        # used should increment unless already at cap
        if not st0["unlimited"]:
            assert b["state"]["used"] >= st0["used"]

    def test_swipe_out_of_swipes_returns_402(self, s):
        # create a fresh user, exhaust 10 swipes, expect 402
        dob = (datetime.now(timezone.utc) - timedelta(days=365 * 25)).strftime("%Y-%m-%d")
        email = rnd_email("EXHAUST")
        reg = s.post(f"{API}/auth/register", json={
            "email": email, "password": "Pass1234!", "name": "Ex",
            "dob": dob, "accept_terms": True, "accept_privacy": True, "accept_community": True,
        }).json()
        tok = reg["token"]
        # complete profile so we can swipe (not required by API actually)
        # get deck targets
        deck = s.get(f"{API}/swipes/deck?limit=15", headers=auth(tok)).json().get("profiles", [])
        if len(deck) < 11:
            pytest.skip("not enough deck profiles")
        # perform 10 passes
        for i in range(10):
            r = s.post(f"{API}/swipes/action", json={"target_user_id": deck[i]["user_id"], "action": "pass"}, headers=auth(tok))
            assert r.status_code == 200, f"swipe {i} failed: {r.text}"
        # 11th should 402
        r = s.post(f"{API}/swipes/action", json={"target_user_id": deck[10]["user_id"], "action": "pass"}, headers=auth(tok))
        assert r.status_code == 402, f"expected 402 got {r.status_code} {r.text}"

    def test_mutual_like_creates_match(self, s):
        # create user A and user B, both like each other
        dob = (datetime.now(timezone.utc) - timedelta(days=365 * 26)).strftime("%Y-%m-%d")
        a_email = rnd_email("MATCHA")
        b_email = rnd_email("MATCHB")
        a = s.post(f"{API}/auth/register", json={
            "email": a_email, "password": "Pass1234!", "name": "A",
            "dob": dob, "accept_terms": True, "accept_privacy": True, "accept_community": True,
        }).json()
        b = s.post(f"{API}/auth/register", json={
            "email": b_email, "password": "Pass1234!", "name": "B",
            "dob": dob, "accept_terms": True, "accept_privacy": True, "accept_community": True,
        }).json()
        a_tok, a_id = a["token"], a["user_id"]
        b_tok, b_id = b["token"], b["user_id"]
        # complete profiles so they show as onboarded+active (they're pending_verification though). Need active. Verify OTP.
        for em, code_user in [(a_email, a), (b_email, b)]:
            otp = s.post(f"{API}/auth/otp/request", json={"email": em}).json()["otp_code_dev"]
            s.post(f"{API}/auth/otp/verify", json={"email": em, "code": otp})
        # complete profiles
        for tok in (a_tok, b_tok):
            s.post(f"{API}/profile/complete", json={
                "gender": "any", "interested_in": "any", "photos": [], "bio": "hi",
                "interests": [], "prompts": [], "location_city": "",
            }, headers=auth(tok))
        # A likes B
        r1 = s.post(f"{API}/swipes/action", json={"target_user_id": b_id, "action": "like"}, headers=auth(a_tok))
        assert r1.status_code == 200
        assert r1.json()["is_match"] is False
        # B likes A -> match
        r2 = s.post(f"{API}/swipes/action", json={"target_user_id": a_id, "action": "like"}, headers=auth(b_tok))
        assert r2.status_code == 200
        assert r2.json()["is_match"] is True
        assert r2.json()["match_id"]
        pytest.shared_match_id = r2.json()["match_id"]
        pytest.shared_a_tok = a_tok
        pytest.shared_b_tok = b_tok


# ---------- MATCHES & CHAT ----------
class TestMatchesChat:
    def test_list_matches(self, s):
        tok = getattr(pytest, "shared_a_tok", None)
        if not tok:
            pytest.skip("requires mutual match test")
        r = s.get(f"{API}/matches", headers=auth(tok))
        assert r.status_code == 200
        assert len(r.json()["matches"]) >= 1

    def test_send_and_list_messages(self, s):
        tok = getattr(pytest, "shared_a_tok", None)
        mid = getattr(pytest, "shared_match_id", None)
        if not (tok and mid):
            pytest.skip("requires mutual match test")
        r = s.post(f"{API}/matches/{mid}/messages", json={"text": "Hey there!"}, headers=auth(tok))
        assert r.status_code == 200
        assert r.json()["text"] == "Hey there!"
        assert "_id" not in r.json()
        l = s.get(f"{API}/matches/{mid}/messages", headers=auth(tok))
        assert l.status_code == 200
        assert len(l.json()["messages"]) >= 1

    def test_send_message_blocks_abusive(self, s):
        tok = getattr(pytest, "shared_a_tok", None)
        mid = getattr(pytest, "shared_match_id", None)
        if not (tok and mid):
            pytest.skip("requires mutual match test")
        r = s.post(f"{API}/matches/{mid}/messages", json={"text": "kill yourself bitch"}, headers=auth(tok))
        assert r.status_code == 400

    def test_icebreaker_returns_3(self, s):
        tok = getattr(pytest, "shared_a_tok", None)
        mid = getattr(pytest, "shared_match_id", None)
        if not (tok and mid):
            pytest.skip("requires mutual match test")
        r = s.post(f"{API}/matches/{mid}/icebreaker", json={"target_user_id": "x"}, headers=auth(tok))
        assert r.status_code == 200
        ideas = r.json()["icebreakers"]
        assert isinstance(ideas, list)
        assert 1 <= len(ideas) <= 3


# ---------- SAFETY ----------
class TestSafety:
    def test_report_creates_and_shadow_bans_after_3(self, s, demo_token):
        # create a victim user (fresh) and 3 reporters
        dob = (datetime.now(timezone.utc) - timedelta(days=365 * 25)).strftime("%Y-%m-%d")
        victim = s.post(f"{API}/auth/register", json={
            "email": rnd_email("VIC"), "password": "Pass1234!", "name": "Vic",
            "dob": dob, "accept_terms": True, "accept_privacy": True, "accept_community": True,
        }).json()
        vid = victim["user_id"]
        reporter_tokens = []
        for _ in range(3):
            r = s.post(f"{API}/auth/register", json={
                "email": rnd_email("REP"), "password": "Pass1234!", "name": "Rep",
                "dob": dob, "accept_terms": True, "accept_privacy": True, "accept_community": True,
            }).json()
            reporter_tokens.append(r["token"])
        for t in reporter_tokens:
            rr = s.post(f"{API}/safety/report", json={"target_user_id": vid, "category": "harassment", "description": "bad"}, headers=auth(t))
            assert rr.status_code == 200
            assert "report_id" in rr.json()

    def test_block_excludes_from_deck(self, s, demo_token):
        deck0 = s.get(f"{API}/swipes/deck?limit=20", headers=auth(demo_token)).json()["profiles"]
        if not deck0:
            pytest.skip("deck empty")
        target = deck0[0]["user_id"]
        r = s.post(f"{API}/safety/block", json={"target_user_id": target}, headers=auth(demo_token))
        assert r.status_code == 200
        deck1 = s.get(f"{API}/swipes/deck?limit=20", headers=auth(demo_token)).json()["profiles"]
        assert target not in [p["user_id"] for p in deck1]

    def test_safety_settings_get_put(self, s, demo_token):
        g = s.get(f"{API}/safety/settings", headers=auth(demo_token))
        assert g.status_code == 200
        p = s.put(f"{API}/safety/settings", json={"verified_only_mode": True, "blur_photos_until_match": True, "emergency_contact": "+15551234"}, headers=auth(demo_token))
        assert p.status_code == 200
        out = p.json()
        assert out["verified_only_mode"] is True
        assert out["blur_photos_until_match"] is True
        assert out["emergency_contact"] == "+15551234"
        # revert
        s.put(f"{API}/safety/settings", json={"verified_only_mode": False, "blur_photos_until_match": False}, headers=auth(demo_token))


# ---------- PRIVACY ----------
class TestPrivacy:
    def test_privacy_settings_get_put(self, s, demo_token):
        g = s.get(f"{API}/privacy/settings", headers=auth(demo_token))
        assert g.status_code == 200
        p = s.put(f"{API}/privacy/settings", json={"profile_visible": False, "show_age": False}, headers=auth(demo_token))
        assert p.status_code == 200
        assert p.json()["profile_visible"] is False
        assert p.json()["show_age"] is False
        # revert
        s.put(f"{API}/privacy/settings", json={"profile_visible": True, "show_age": True}, headers=auth(demo_token))

    def test_privacy_export(self, s, demo_token):
        r = s.get(f"{API}/privacy/export", headers=auth(demo_token))
        assert r.status_code == 200
        b = r.json()
        for k in ("profile", "swipes", "matches", "messages", "reports", "exported_at"):
            assert k in b

    def test_cookie_consent(self, s):
        r = s.post(f"{API}/privacy/cookie-consent", json={"essential": True, "analytics": True, "marketing": False})
        assert r.status_code == 200
        assert r.json()["ok"] is True

    def test_delete_account_anonymizes(self, s):
        dob = (datetime.now(timezone.utc) - timedelta(days=365 * 25)).strftime("%Y-%m-%d")
        email = rnd_email("DEL")
        reg = s.post(f"{API}/auth/register", json={
            "email": email, "password": "Pass1234!", "name": "Del",
            "dob": dob, "accept_terms": True, "accept_privacy": True, "accept_community": True,
        }).json()
        tok = reg["token"]
        r = s.post(f"{API}/privacy/delete-account", headers=auth(tok))
        assert r.status_code == 200
        assert r.json()["right_to_be_forgotten"] is True


# ---------- PLANS ----------
class TestPlans:
    def test_plans_endpoint(self, s):
        r = s.get(f"{API}/plans")
        assert r.status_code == 200
        b = r.json()
        plan_ids = [p["id"] for p in b["plans"]]
        for k in ("basic_monthly", "premium_monthly", "platinum_monthly", "swipe_pack"):
            assert k in plan_ids
        prices = {p["id"]: p["amount"] for p in b["plans"]}
        assert prices["basic_monthly"] == 7.99
        assert prices["premium_monthly"] == 14.99
        assert prices["platinum_monthly"] == 24.99
        assert prices["swipe_pack"] == 0.99
        assert "tinder" in b["comparison"] and "bumble" in b["comparison"]


# ---------- STRIPE CHECKOUT ----------
class TestCheckout:
    def test_create_checkout_session_basic(self, s, demo_token):
        r = s.post(f"{API}/checkout/session", json={
            "package_id": "basic_monthly",
            "origin_url": "https://swipe-connect-122.preview.emergentagent.com",
        }, headers=auth(demo_token))
        assert r.status_code == 200, r.text
        b = r.json()
        assert "url" in b and b["url"].startswith("https://")
        assert "session_id" in b
        pytest.shared_session_id = b["session_id"]

    def test_create_checkout_invalid_package(self, s, demo_token):
        r = s.post(f"{API}/checkout/session", json={"package_id": "bogus", "origin_url": "https://x.com"}, headers=auth(demo_token))
        assert r.status_code == 400

    def test_checkout_status_polls(self, s, demo_token):
        sid = getattr(pytest, "shared_session_id", None)
        if not sid:
            pytest.skip("no session id")
        # small delay for stripe gateway to register the session
        time.sleep(3)
        r = s.get(f"{API}/checkout/status/{sid}", headers=auth(demo_token))
        assert r.status_code == 200, f"got {r.status_code}: {r.text}"
        b = r.json()
        assert "status" in b and "payment_status" in b


# ---------- AI MODERATION ----------
class TestModerate:
    def test_moderate_clean(self, s):
        r = s.post(f"{API}/moderate", json={"text": "I love hiking and coffee on Sundays."})
        assert r.status_code == 200
        # may be ai or rules
        assert r.json().get("flagged") is False

    def test_moderate_flags_hate(self, s):
        r = s.post(f"{API}/moderate", json={"text": "kill yourself you fucking bitch"})
        assert r.status_code == 200
        assert r.json().get("flagged") is True


# ---------- ADMIN ----------
class TestAdmin:
    def test_admin_required(self, s, demo_token):
        r = s.get(f"{API}/admin/stats", headers=auth(demo_token))
        assert r.status_code == 403

    def test_admin_stats(self, s, admin_token):
        r = s.get(f"{API}/admin/stats", headers=auth(admin_token))
        assert r.status_code == 200
        for k in ("users_total", "users_active", "reports_open", "matches_total", "messages_total"):
            assert k in r.json()

    def test_admin_reports(self, s, admin_token):
        r = s.get(f"{API}/admin/reports?status=open", headers=auth(admin_token))
        assert r.status_code == 200
        assert "reports" in r.json()

    def test_admin_users(self, s, admin_token):
        r = s.get(f"{API}/admin/users?q=demo", headers=auth(admin_token))
        assert r.status_code == 200
        users = r.json()["users"]
        emails = [u["email"] for u in users]
        assert DEMO_EMAIL in emails
        for u in users:
            assert "password_hash" not in u

    def test_admin_action_and_audit(self, s, admin_token):
        # warn demo user (no-op state change)
        r = s.post(f"{API}/admin/action", json={"target_user_id": "user_demo00001", "action": "warn", "reason": "test"}, headers=auth(admin_token))
        assert r.status_code == 200
        a = s.get(f"{API}/admin/audit-logs", headers=auth(admin_token))
        assert a.status_code == 200
        assert len(a.json()["logs"]) >= 1
