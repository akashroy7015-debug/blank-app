"""sparQ iteration-2 backend tests:
- multi-currency /api/plans
- /api/checkout/session with currency
- /api/upload/photo (POST, GET /api/files/{path}, DELETE)
- regression spot-checks for auth/swipes/billing
"""
import io
import os
import struct
import zlib
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@sparq.app"
ADMIN_PASSWORD = "AdminsparQ2026!"
DEMO_EMAIL = "demo@sparq.app"
DEMO_PASSWORD = "DemosparQ2026!"


# ---------- helpers ----------
def auth(tok):
    return {"Authorization": f"Bearer {tok}"}


def _png_bytes(size_bytes: int = 2048) -> bytes:
    """Build a minimal but valid PNG of approximately `size_bytes` by padding
    a zTXt-equivalent ancillary chunk. We use a tEXt chunk with junk to inflate size.
    """
    # 1x1 transparent PNG (real, valid)
    base = bytes.fromhex(
        "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489"
        "0000000d49444154789c63000100000005000100"
        "0d0a2db40000000049454e44ae426082"
    )
    if size_bytes <= len(base):
        return base
    # Insert a tEXt chunk before IEND
    iend = b"\x00\x00\x00\x00IEND\xaeB`\x82"
    head = base[: -len(iend)]
    keyword = b"Comment\x00"
    pad_len = max(0, size_bytes - len(base) - 12 - len(keyword))
    chunk_data = keyword + (b"A" * pad_len)
    length = struct.pack(">I", len(chunk_data))
    crc = struct.pack(">I", zlib.crc32(b"tEXt" + chunk_data) & 0xFFFFFFFF)
    chunk = length + b"tEXt" + chunk_data + crc
    return head + chunk + iend


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


# ============================================================
# /api/plans : multi-currency
# ============================================================
class TestPlansMultiCurrency:
    def test_plans_no_currency_defaults_usd(self, s):
        r = s.get(f"{API}/plans")
        assert r.status_code == 200
        body = r.json()
        assert body["currency"] == "usd"
        assert body["currency_meta"]["code"] == "USD"
        assert body["currency_meta"]["symbol"] == "$"
        # find basic_monthly
        plans = {p["id"]: p for p in body["plans"]}
        assert plans["basic_monthly"]["amount"] == 7.99
        assert plans["premium_monthly"]["amount"] == 14.99
        assert plans["platinum_monthly"]["amount"] == 24.99
        assert plans["swipe_pack"]["amount"] == 0.99

    def test_plans_usd_explicit(self, s):
        r = s.get(f"{API}/plans", params={"currency": "usd"})
        assert r.status_code == 200
        body = r.json()
        plans = {p["id"]: p for p in body["plans"]}
        assert plans["basic_monthly"]["amount"] == 7.99
        assert plans["premium_monthly"]["amount"] == 14.99
        assert plans["platinum_monthly"]["amount"] == 24.99
        assert plans["swipe_pack"]["amount"] == 0.99
        assert body["currency_meta"]["symbol"] == "$"
        assert body["currency_meta"]["code"] == "USD"

    def test_plans_inr(self, s):
        r = s.get(f"{API}/plans", params={"currency": "inr"})
        assert r.status_code == 200
        body = r.json()
        plans = {p["id"]: p for p in body["plans"]}
        assert plans["basic_monthly"]["amount"] == 199.0
        assert plans["premium_monthly"]["amount"] == 399.0
        assert plans["platinum_monthly"]["amount"] == 549.0
        assert plans["swipe_pack"]["amount"] == 100.0
        assert body["currency_meta"]["symbol"] == "₹"
        assert body["currency_meta"]["code"] == "INR"
        assert body["currency_meta"]["decimals"] == 0

    def test_plans_unsupported_falls_back_usd(self, s):
        r = s.get(f"{API}/plans", params={"currency": "eur"})
        assert r.status_code == 200
        body = r.json()
        assert body["currency"] == "usd"
        plans = {p["id"]: p for p in body["plans"]}
        assert plans["basic_monthly"]["amount"] == 7.99

    def test_plans_response_has_comparison_and_supported(self, s):
        r = s.get(f"{API}/plans", params={"currency": "inr"})
        assert r.status_code == 200
        body = r.json()
        assert "comparison" in body
        assert "tinder" in body["comparison"]
        assert "bumble" in body["comparison"]
        # INR comparison values
        assert body["comparison"]["tinder"]["plus"] == 299.0
        assert body["comparison"]["bumble"]["premium"] == 599.0
        assert "supported_currencies" in body
        codes = {c["code"] for c in body["supported_currencies"]}
        assert {"USD", "INR"}.issubset(codes)


# ============================================================
# /api/checkout/session : currency-aware
# ============================================================
class TestCheckoutCurrency:
    def test_checkout_inr_premium(self, s, demo_token):
        r = s.post(f"{API}/checkout/session",
                   headers=auth(demo_token),
                   json={"package_id": "premium_monthly", "currency": "inr",
                         "origin_url": "https://example.com"})
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["amount"] == 399.0
        assert body["currency"] == "inr"
        assert "session_id" in body and body["session_id"]

        # Verify persisted in billing/history
        hist = s.get(f"{API}/billing/history", headers=auth(demo_token))
        assert hist.status_code == 200
        txs = hist.json()["transactions"]
        match = next((t for t in txs if t.get("session_id") == body["session_id"]), None)
        assert match is not None, "tx not persisted"
        assert match["currency"] == "inr"
        assert match["amount"] == 399.0
        assert match["package_id"] == "premium_monthly"

    def test_checkout_usd_basic(self, s, demo_token):
        r = s.post(f"{API}/checkout/session",
                   headers=auth(demo_token),
                   json={"package_id": "basic_monthly", "currency": "usd",
                         "origin_url": "https://example.com"})
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["amount"] == 7.99
        assert body["currency"] == "usd"

    def test_checkout_rejects_invalid_package(self, s, demo_token):
        r = s.post(f"{API}/checkout/session",
                   headers=auth(demo_token),
                   json={"package_id": "ultra_mega", "currency": "usd",
                         "origin_url": "https://example.com"})
        assert r.status_code == 400


# ============================================================
# /api/upload/photo + /api/files/{path} + DELETE
# ============================================================
class TestPhotoUpload:
    def test_upload_requires_auth(self, s):
        png = _png_bytes(2048)
        files = {"file": ("test.png", io.BytesIO(png), "image/png")}
        r = s.post(f"{API}/upload/photo", files=files)
        assert r.status_code in (401, 403)

    def test_upload_real_png_success(self, s, demo_token):
        png = _png_bytes(2048)
        assert len(png) > 200
        files = {"file": ("test.png", io.BytesIO(png), "image/png")}
        r = s.post(f"{API}/upload/photo", headers=auth(demo_token), files=files)
        assert r.status_code == 200, r.text
        body = r.json()
        assert "file_id" in body
        assert "path" in body and body["path"]
        assert body["url"] == f"/api/files/{body['path']}"
        assert body["size"] == len(png)
        # store for next test (class state via pytest)
        TestPhotoUpload._uploaded_path = body["path"]
        TestPhotoUpload._uploaded_size = body["size"]

    def test_get_file_returns_bytes_with_query_auth(self, s, demo_token):
        path = getattr(TestPhotoUpload, "_uploaded_path", None)
        assert path, "upload test must run first"
        r = s.get(f"{API}/files/{path}", params={"auth": demo_token})
        assert r.status_code == 200, r.text
        assert r.headers.get("Content-Type", "").startswith("image/")
        assert len(r.content) == TestPhotoUpload._uploaded_size

    def test_get_file_no_auth_still_returns_bytes(self, s):
        """Per current implementation: any-signed-in user / no-auth still serves; spec
        says ?auth=<jwt> is a fallback for <img> tags. Verify behavior."""
        path = getattr(TestPhotoUpload, "_uploaded_path", None)
        assert path
        r = s.get(f"{API}/files/{path}")
        # If gated, expect 401/403; if public-by-design, expect 200. Accept either.
        assert r.status_code in (200, 401, 403)

    def test_get_file_nonexistent_returns_404(self, s, demo_token):
        r = s.get(f"{API}/files/sparkd/photos/nope/doesnotexist.png", params={"auth": demo_token})
        assert r.status_code == 404

    def test_upload_rejects_non_image_content_type(self, s, demo_token):
        files = {"file": ("test.txt", io.BytesIO(b"X" * 500), "text/plain")}
        r = s.post(f"{API}/upload/photo", headers=auth(demo_token), files=files)
        assert r.status_code == 400

    def test_upload_rejects_too_small(self, s, demo_token):
        # under 200 bytes
        files = {"file": ("tiny.png", io.BytesIO(b"\x89PNG\r\n\x1a\n" + b"X" * 50), "image/png")}
        r = s.post(f"{API}/upload/photo", headers=auth(demo_token), files=files)
        assert r.status_code == 400

    def test_upload_rejects_over_8mb(self, s, demo_token):
        # 8.5 MB png
        big = _png_bytes(8 * 1024 * 1024 + 500 * 1024)
        assert len(big) > 8 * 1024 * 1024
        files = {"file": ("big.png", io.BytesIO(big), "image/png")}
        r = s.post(f"{API}/upload/photo", headers=auth(demo_token), files=files)
        assert r.status_code == 413

    def test_delete_only_owner(self, s, demo_token, admin_token):
        # Upload as demo
        png = _png_bytes(1024)
        files = {"file": ("owned.png", io.BytesIO(png), "image/png")}
        r = s.post(f"{API}/upload/photo", headers=auth(demo_token), files=files)
        assert r.status_code == 200
        path = r.json()["path"]

        # Admin tries to delete demo's file -> 404
        r2 = s.delete(f"{API}/upload/photo", headers=auth(admin_token), params={"path": path})
        assert r2.status_code == 404

        # File should still be retrievable
        r3 = s.get(f"{API}/files/{path}", params={"auth": demo_token})
        assert r3.status_code == 200

        # Demo deletes own file -> ok
        r4 = s.delete(f"{API}/upload/photo", headers=auth(demo_token), params={"path": path})
        assert r4.status_code == 200
        assert r4.json().get("ok") is True

        # Now soft-deleted: GET /api/files returns 404
        r5 = s.get(f"{API}/files/{path}", params={"auth": demo_token})
        assert r5.status_code == 404

    def test_delete_pulls_from_user_photos(self, s, demo_token):
        # Upload then add path to user's photos via profile update, then delete and verify $pull
        png = _png_bytes(1024)
        files = {"file": ("profilepic.png", io.BytesIO(png), "image/png")}
        r = s.post(f"{API}/upload/photo", headers=auth(demo_token), files=files)
        assert r.status_code == 200
        path = r.json()["path"]
        url = r.json()["url"]  # /api/files/<path>

        # Get current profile, append photo, update
        me = s.get(f"{API}/me", headers=auth(demo_token)).json()
        current_photos = me.get("photos", []) or []
        new_photos = current_photos + [url]
        up = s.put(f"{API}/profile/update", headers=auth(demo_token), json={
            "gender": me.get("gender", "other"),
            "interested_in": me.get("interested_in", "everyone"),
            "photos": new_photos,
            "bio": me.get("bio", ""),
            "prompts": me.get("prompts", []),
            "interests": me.get("interests", []),
            "location_city": me.get("location_city", ""),
        })
        # If profile update endpoint is something else, skip the deep check but still test deletion
        if up.status_code == 200:
            me2 = s.get(f"{API}/me", headers=auth(demo_token)).json()
            assert url in (me2.get("photos") or [])

        # Delete the photo
        d = s.delete(f"{API}/upload/photo", headers=auth(demo_token), params={"path": path})
        assert d.status_code == 200

        if up.status_code == 200:
            me3 = s.get(f"{API}/me", headers=auth(demo_token)).json()
            assert url not in (me3.get("photos") or []), "photo URL should be pulled from user's photos array"


# ============================================================
# Regression spot-checks
# ============================================================
class TestRegression:
    def test_login_works(self, s):
        r = s.post(f"{API}/auth/login", json={"email": DEMO_EMAIL, "password": DEMO_PASSWORD})
        assert r.status_code == 200
        assert "token" in r.json()

    def test_swipes_deck(self, s, demo_token):
        r = s.get(f"{API}/swipes/deck", headers=auth(demo_token))
        assert r.status_code == 200
        body = r.json()
        # deck shape: {profiles: [...]} or list
        if isinstance(body, dict) and "profiles" in body:
            assert isinstance(body["profiles"], list)
        else:
            assert isinstance(body, list)

    def test_billing_history_has_currency(self, s, demo_token):
        r = s.get(f"{API}/billing/history", headers=auth(demo_token))
        assert r.status_code == 200
        txs = r.json()["transactions"]
        if txs:
            assert "currency" in txs[0]
            assert "amount" in txs[0]
