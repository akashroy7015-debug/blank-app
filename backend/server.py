"""Sparkd Dating App — Backend API
FastAPI server with auth (JWT + OTP + Emergent Google), swipe deck, matches,
chat, Stripe subscriptions, safety/reports, admin compliance, AI moderation.
"""
import os
import uuid
import random
import logging
import secrets
import asyncio
import hashlib
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Header, Cookie, UploadFile, File, Query
from fastapi.responses import JSONResponse, Response
from starlette.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr, ConfigDict
import jwt
import bcrypt
import httpx
import requests

# ---------- env ----------
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALG = os.environ.get("JWT_ALGORITHM", "HS256")
JWT_DAYS = int(os.environ.get("JWT_EXPIRE_DAYS", "7"))
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
STRIPE_API_KEY = os.environ.get("STRIPE_API_KEY", "")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="Sparkd API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("sparkd")

# ---------- helpers ----------
def now_utc() -> datetime:
    return datetime.now(timezone.utc)

def iso(dt: datetime) -> str:
    return dt.isoformat()

def gen_id(prefix: str = "id") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:16]}"

def hash_pw(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

def check_pw(pw: str, h: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), h.encode())
    except Exception:
        return False

# ---------- object storage (Emergent) ----------
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
APP_NAME = "sparkd"
_storage_key: Optional[str] = None
ALLOWED_IMAGE_MIMES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_IMAGE_BYTES = 8 * 1024 * 1024  # 8 MB
MIME_EXT = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif"}

def init_storage() -> str:
    global _storage_key
    if _storage_key:
        return _storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_LLM_KEY}, timeout=30)
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    return _storage_key

def storage_put(path: str, data: bytes, content_type: str) -> Dict[str, Any]:
    key = init_storage()
    r = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120,
    )
    r.raise_for_status()
    return r.json()

def storage_get(path: str):
    key = init_storage()
    r = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60,
    )
    r.raise_for_status()
    return r.content, r.headers.get("Content-Type", "application/octet-stream")

def make_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "iat": int(now_utc().timestamp()),
        "exp": int((now_utc() + timedelta(days=JWT_DAYS)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

def decode_token(token: str) -> Optional[str]:
    try:
        data = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        return data.get("sub")
    except Exception:
        return None

# ---------- models ----------
class RegisterReq(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: str
    dob: str  # YYYY-MM-DD
    accept_terms: bool
    accept_privacy: bool
    accept_community: bool

class LoginReq(BaseModel):
    email: EmailStr
    password: str

class OTPReq(BaseModel):
    email: EmailStr

class OTPVerifyReq(BaseModel):
    email: EmailStr
    code: str

class GoogleSessionReq(BaseModel):
    session_id: str

class CompleteProfileReq(BaseModel):
    gender: str
    interested_in: str
    photos: List[str] = []
    bio: str = ""
    prompts: List[Dict[str, str]] = []
    interests: List[str] = []
    location_city: str = ""

class SwipeActionReq(BaseModel):
    target_user_id: str
    action: str  # like, pass, super

class ChatMsgReq(BaseModel):
    text: str

class ReportReq(BaseModel):
    target_user_id: str
    category: str  # harassment, fake, scam, inappropriate, other
    description: str = ""

class BlockReq(BaseModel):
    target_user_id: str

class SafetyToggleReq(BaseModel):
    blur_photos_until_match: Optional[bool] = None
    verified_only_mode: Optional[bool] = None
    location_masking: Optional[bool] = None
    private_browsing: Optional[bool] = None
    emergency_contact: Optional[str] = None

class PrivacyToggleReq(BaseModel):
    profile_visible: Optional[bool] = None
    show_distance: Optional[bool] = None
    show_age: Optional[bool] = None
    ad_personalization: Optional[bool] = None
    push_notifications: Optional[bool] = None
    email_notifications: Optional[bool] = None

class CookieConsentReq(BaseModel):
    essential: bool = True
    analytics: bool
    marketing: bool

class CheckoutReq(BaseModel):
    package_id: str  # basic_monthly | premium_monthly | platinum_monthly | swipe_pack
    origin_url: str
    currency: Optional[str] = "usd"

class ModerateTextReq(BaseModel):
    text: str

class IcebreakerReq(BaseModel):
    target_user_id: str

class AdminActionReq(BaseModel):
    target_user_id: str
    action: str  # warn, suspend, ban, dismiss
    reason: str = ""

# ---------- subscription packages (server-side prices, multi-currency) ----------
PACKAGES: Dict[str, Dict[str, Any]] = {
    "basic_monthly":    {"name": "Basic",    "kind": "subscription", "perks": ["Unlimited likes", "Rewind last swipe", "5 super likes/day"]},
    "premium_monthly":  {"name": "Premium",  "kind": "subscription", "perks": ["Everything in Basic", "See who liked you", "Boost 1x/week", "Read receipts", "10 super likes/day"]},
    "platinum_monthly": {"name": "Platinum", "kind": "subscription", "perks": ["Everything in Premium", "Priority likes", "Message before match", "Boost 1x/day", "Unlimited super likes"]},
    "swipe_pack":       {"name": "Swipe Pack (+10 swipes)", "kind": "one_time", "perks": ["+10 extra swipes"]},
}

PRICES: Dict[str, Dict[str, float]] = {
    "usd": {"basic_monthly": 7.99,  "premium_monthly": 14.99, "platinum_monthly": 24.99, "swipe_pack": 0.99},
    "inr": {"basic_monthly": 199.0, "premium_monthly": 399.0, "platinum_monthly": 549.0, "swipe_pack": 100.0},
}

CURRENCY_META: Dict[str, Dict[str, Any]] = {
    "usd": {"symbol": "$", "code": "USD", "decimals": 2},
    "inr": {"symbol": "₹", "code": "INR", "decimals": 0},
}

COMPARISON: Dict[str, Dict[str, Any]] = {
    "usd": {"tinder": {"plus": 9.99, "gold": 19.99, "platinum": 29.99}, "bumble": {"premium": 17.99, "premium_plus": 35.99}},
    "inr": {"tinder": {"plus": 299.0, "gold": 749.0, "platinum": 1099.0}, "bumble": {"premium": 599.0, "premium_plus": 1299.0}},
}

def _normalize_currency(c: Optional[str]) -> str:
    if not c:
        return "usd"
    c = c.lower().strip()
    return c if c in PRICES else "usd"

def get_price(package_id: str, currency: str) -> float:
    currency = _normalize_currency(currency)
    return PRICES[currency][package_id]

# ---------- auth dep ----------
async def get_current_user(
    authorization: Optional[str] = Header(None),
    session_token: Optional[str] = Cookie(None),
) -> Dict[str, Any]:
    user_id = None
    # JWT bearer
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization.split(" ", 1)[1].strip()
        user_id = decode_token(token)
    # Emergent session cookie
    if not user_id and session_token:
        sess = await db.user_sessions.find_one({"session_token": session_token}, {"_id": 0})
        if sess:
            expires = sess["expires_at"]
            if isinstance(expires, str):
                expires = datetime.fromisoformat(expires)
            if expires.tzinfo is None:
                expires = expires.replace(tzinfo=timezone.utc)
            if expires >= now_utc():
                user_id = sess["user_id"]
    if not user_id:
        raise HTTPException(401, "Not authenticated")
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(401, "User not found")
    if user.get("status") == "banned":
        raise HTTPException(403, "Account banned")
    return user

async def require_admin(user: Dict = Depends(get_current_user)) -> Dict:
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin only")
    return user

# ---------- daily swipe logic ----------
async def get_daily_swipe_state(user_id: str) -> Dict[str, Any]:
    today = now_utc().strftime("%Y-%m-%d")
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(404, "User not found")
    state = user.get("daily_swipes", {})
    if state.get("date") != today:
        state = {"date": today, "used": 0, "bonus": user.get("bonus_swipes", 0)}
        await db.users.update_one({"user_id": user_id}, {"$set": {"daily_swipes": state}})
    base_limit = 10
    # premium/platinum unlimited
    sub = user.get("subscription", {}).get("plan", "free")
    unlimited = sub in ("premium_monthly", "platinum_monthly", "basic_monthly")
    remaining = (10_000 if unlimited else max(0, base_limit - state["used"])) + state.get("bonus", 0)
    # next reset = next UTC midnight
    tmrw = (now_utc() + timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    return {
        "date": state["date"],
        "used": state["used"],
        "bonus": state.get("bonus", 0),
        "remaining": remaining,
        "unlimited": unlimited,
        "limit": base_limit,
        "resets_at": iso(tmrw),
    }

async def consume_swipe(user_id: str):
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    today = now_utc().strftime("%Y-%m-%d")
    state = user.get("daily_swipes", {"date": today, "used": 0, "bonus": 0})
    if state.get("date") != today:
        state = {"date": today, "used": 0, "bonus": user.get("bonus_swipes", 0)}
    sub = user.get("subscription", {}).get("plan", "free")
    unlimited = sub in ("premium_monthly", "platinum_monthly", "basic_monthly")
    if not unlimited:
        if state["used"] >= 10:
            if state.get("bonus", 0) > 0:
                state["bonus"] -= 1
            else:
                raise HTTPException(402, "Daily swipe limit reached. Upgrade or buy a Swipe Pack.")
        else:
            state["used"] += 1
    await db.users.update_one({"user_id": user_id}, {"$set": {"daily_swipes": state}})

# ---------- AI moderation ----------
async def ai_moderate_text(text: str) -> Dict[str, Any]:
    """Use Emergent LLM key + Claude to moderate text content. Falls back to rule-based on error."""
    import re as _re
    bad_words = ["fuck", "bitch", "asshole", "kill yourself", "kys", "rape", "faggot"]
    lower = text.lower()
    rule_flag = any(_re.search(rf"\b{_re.escape(b)}\b", lower) for b in bad_words)
    if not EMERGENT_LLM_KEY:
        return {"flagged": rule_flag, "category": "rules" if rule_flag else "clean", "score": 1.0 if rule_flag else 0.0, "via": "rules"}
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"mod_{uuid.uuid4().hex[:8]}",
            system_message=(
                "You are a content moderation assistant for a dating app. "
                "Classify the user text as one of: clean, harassment, hate, sexual_explicit, scam, spam. "
                "Respond ONLY with JSON: {\"category\":\"<one>\",\"score\":<0..1>,\"reason\":\"...\"}. "
                "Score >= 0.6 means flag."
            ),
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        msg = UserMessage(text=text[:2000])
        resp = await chat.send_message(msg)
        import json as _json, re
        m = re.search(r"\{.*\}", resp, re.S)
        data = _json.loads(m.group(0)) if m else {"category": "clean", "score": 0.0}
        flagged = (data.get("category") != "clean") and float(data.get("score", 0)) >= 0.6
        return {"flagged": flagged or rule_flag, "category": data.get("category", "clean"), "score": float(data.get("score", 0)), "reason": data.get("reason", ""), "via": "ai"}
    except Exception as e:
        log.warning(f"AI mod failed: {e}")
        return {"flagged": rule_flag, "category": "rules" if rule_flag else "clean", "score": 1.0 if rule_flag else 0.0, "via": "rules"}

# ---------- routes ----------
@api.get("/")
async def root():
    return {"app": "Sparkd", "status": "ok", "time": iso(now_utc())}

# ---- AUTH ----
@api.post("/auth/register")
async def register(req: RegisterReq):
    if not (req.accept_terms and req.accept_privacy and req.accept_community):
        raise HTTPException(400, "You must accept all required policies")
    # age verification 18+
    try:
        dob = datetime.strptime(req.dob, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except Exception:
        raise HTTPException(400, "Invalid date of birth")
    age_years = (now_utc() - dob).days / 365.25
    if age_years < 18:
        raise HTTPException(403, "You must be 18+ to use Sparkd")

    existing = await db.users.find_one({"email": req.email.lower()}, {"_id": 0})
    if existing:
        raise HTTPException(409, "Email already registered")

    user_id = f"user_{uuid.uuid4().hex[:12]}"
    doc = {
        "user_id": user_id,
        "email": req.email.lower(),
        "password_hash": hash_pw(req.password),
        "name": req.name,
        "dob": req.dob,
        "role": "user",
        "status": "pending_verification",
        "email_verified": False,
        "created_at": iso(now_utc()),
        "onboarded": False,
        "consents": {
            "terms": True, "privacy": True, "community": True,
            "accepted_at": iso(now_utc()),
        },
        "safety_settings": {
            "blur_photos_until_match": False,
            "verified_only_mode": False,
            "location_masking": True,
            "private_browsing": False,
            "emergency_contact": "",
        },
        "privacy_settings": {
            "profile_visible": True,
            "show_distance": True,
            "show_age": True,
            "ad_personalization": True,
            "push_notifications": True,
            "email_notifications": True,
        },
        "subscription": {"plan": "free", "active": False, "renews_at": None},
        "bonus_swipes": 0,
        "verified_badge": False,
        "safety_score": 80,
        "photos": [],
        "interests": [],
    }
    await db.users.insert_one(doc)

    # generate OTP
    code = f"{random.randint(0, 999999):06d}"
    await db.otp_codes.insert_one({
        "email": req.email.lower(),
        "code": code,
        "expires_at": iso(now_utc() + timedelta(minutes=10)),
        "used": False,
    })
    log.info(f"OTP for {req.email}: {code}")

    token = make_token(user_id)
    return {"user_id": user_id, "token": token, "otp_code_dev": code, "email_verified": False}

@api.post("/auth/login")
async def login(req: LoginReq):
    user = await db.users.find_one({"email": req.email.lower()})
    if not user or not check_pw(req.password, user.get("password_hash", "")):
        raise HTTPException(401, "Invalid email or password")
    if user.get("status") == "banned":
        raise HTTPException(403, "Account banned")
    token = make_token(user["user_id"])
    return {"user_id": user["user_id"], "token": token, "email_verified": user.get("email_verified", False), "onboarded": user.get("onboarded", False)}

@api.post("/auth/otp/request")
async def otp_request(req: OTPReq):
    user = await db.users.find_one({"email": req.email.lower()}, {"_id": 0})
    if not user:
        raise HTTPException(404, "Email not found")
    code = f"{random.randint(0, 999999):06d}"
    await db.otp_codes.insert_one({
        "email": req.email.lower(),
        "code": code,
        "expires_at": iso(now_utc() + timedelta(minutes=10)),
        "used": False,
    })
    log.info(f"OTP for {req.email}: {code}")
    return {"sent": True, "otp_code_dev": code}

@api.post("/auth/otp/verify")
async def otp_verify(req: OTPVerifyReq):
    rec = await db.otp_codes.find_one(
        {"email": req.email.lower(), "code": req.code, "used": False},
        {"_id": 0},
        sort=[("expires_at", -1)],
    )
    if not rec:
        raise HTTPException(400, "Invalid code")
    exp = rec["expires_at"]
    if isinstance(exp, str):
        exp = datetime.fromisoformat(exp)
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if exp < now_utc():
        raise HTTPException(400, "Code expired")
    await db.otp_codes.update_many({"email": req.email.lower(), "code": req.code}, {"$set": {"used": True}})
    await db.users.update_one({"email": req.email.lower()}, {"$set": {"email_verified": True, "status": "active"}})
    return {"verified": True}

@api.post("/auth/google/session")
async def google_session(req: GoogleSessionReq):
    """Exchange Emergent session_id for our app token + create/find user."""
    async with httpx.AsyncClient(timeout=15) as cli:
        r = await cli.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": req.session_id},
        )
        if r.status_code != 200:
            raise HTTPException(401, "Invalid session")
        data = r.json()

    email = data["email"].lower()
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if not user:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        await db.users.insert_one({
            "user_id": user_id,
            "email": email,
            "name": data.get("name", email.split("@")[0]),
            "picture": data.get("picture", ""),
            "role": "user",
            "status": "active",
            "email_verified": True,
            "created_at": iso(now_utc()),
            "onboarded": False,
            "consents": {"terms": False, "privacy": False, "community": False},
            "safety_settings": {"blur_photos_until_match": False, "verified_only_mode": False, "location_masking": True, "private_browsing": False, "emergency_contact": ""},
            "privacy_settings": {"profile_visible": True, "show_distance": True, "show_age": True, "ad_personalization": True, "push_notifications": True, "email_notifications": True},
            "subscription": {"plan": "free", "active": False},
            "bonus_swipes": 0,
            "verified_badge": False,
            "safety_score": 80,
            "photos": ([data["picture"]] if data.get("picture") else []),
            "interests": [],
            "auth_provider": "google",
        })
        user = await db.users.find_one({"email": email}, {"_id": 0})

    session_token = data["session_token"]
    await db.user_sessions.insert_one({
        "user_id": user["user_id"],
        "session_token": session_token,
        "expires_at": iso(now_utc() + timedelta(days=7)),
        "created_at": iso(now_utc()),
    })
    token = make_token(user["user_id"])
    return {"user_id": user["user_id"], "token": token, "session_token": session_token, "onboarded": user.get("onboarded", False), "email_verified": True}

@api.get("/auth/me")
async def me(user: Dict = Depends(get_current_user)):
    user.pop("password_hash", None)
    return user

@api.post("/auth/logout")
async def logout(user: Dict = Depends(get_current_user)):
    await db.user_sessions.delete_many({"user_id": user["user_id"]})
    return {"ok": True}

# ---- ONBOARDING / PROFILE ----
@api.post("/profile/complete")
async def complete_profile(req: CompleteProfileReq, user: Dict = Depends(get_current_user)):
    # moderate bio
    if req.bio:
        mod = await ai_moderate_text(req.bio)
        if mod["flagged"]:
            raise HTTPException(400, f"Bio violates community guidelines ({mod['category']})")
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {
            "gender": req.gender,
            "interested_in": req.interested_in,
            "photos": req.photos[:6],
            "bio": req.bio,
            "prompts": req.prompts[:3],
            "interests": req.interests[:10],
            "location_city": req.location_city,
            "onboarded": True,
        }},
    )
    return {"ok": True, "onboarded": True}

@api.put("/profile")
async def update_profile(req: CompleteProfileReq, user: Dict = Depends(get_current_user)):
    return await complete_profile(req, user)

# ---- SWIPE DECK ----
@api.get("/swipes/state")
async def swipe_state(user: Dict = Depends(get_current_user)):
    return await get_daily_swipe_state(user["user_id"])

@api.get("/swipes/deck")
async def swipe_deck(limit: int = 10, user: Dict = Depends(get_current_user)):
    # exclude self, already-swiped, blocked
    already = await db.swipes.find({"user_id": user["user_id"]}, {"_id": 0, "target_user_id": 1}).to_list(5000)
    blocked = await db.blocks.find({"user_id": user["user_id"]}, {"_id": 0, "target_user_id": 1}).to_list(5000)
    exclude_ids = {s["target_user_id"] for s in already} | {b["target_user_id"] for b in blocked} | {user["user_id"]}

    q: Dict[str, Any] = {
        "user_id": {"$nin": list(exclude_ids)},
        "onboarded": True,
        "status": "active",
        "role": "user",
        "privacy_settings.profile_visible": True,
    }
    if user.get("safety_settings", {}).get("verified_only_mode"):
        q["verified_badge"] = True
    cursor = db.users.find(q, {"_id": 0, "password_hash": 0}).limit(limit)
    profiles = await cursor.to_list(limit)
    # respect blur
    for p in profiles:
        if p.get("safety_settings", {}).get("blur_photos_until_match"):
            p["photos_blurred"] = True
    return {"profiles": profiles, "state": await get_daily_swipe_state(user["user_id"])}

@api.post("/swipes/action")
async def swipe_action(req: SwipeActionReq, user: Dict = Depends(get_current_user)):
    if req.action not in ("like", "pass", "super"):
        raise HTTPException(400, "Invalid action")
    if req.target_user_id == user["user_id"]:
        raise HTTPException(400, "Cannot swipe on yourself")
    target = await db.users.find_one({"user_id": req.target_user_id}, {"_id": 0, "user_id": 1, "status": 1})
    if not target or target.get("status") == "banned":
        raise HTTPException(404, "Target not available")
    await consume_swipe(user["user_id"])
    await db.swipes.insert_one({
        "swipe_id": gen_id("swipe"),
        "user_id": user["user_id"],
        "target_user_id": req.target_user_id,
        "action": req.action,
        "created_at": iso(now_utc()),
    })
    is_match = False
    match_id = None
    if req.action in ("like", "super"):
        # check mutual
        mutual = await db.swipes.find_one({
            "user_id": req.target_user_id,
            "target_user_id": user["user_id"],
            "action": {"$in": ["like", "super"]},
        }, {"_id": 0})
        if mutual:
            is_match = True
            match_id = gen_id("match")
            await db.matches.insert_one({
                "match_id": match_id,
                "user_a": user["user_id"],
                "user_b": req.target_user_id,
                "created_at": iso(now_utc()),
            })
    state = await get_daily_swipe_state(user["user_id"])
    return {"ok": True, "is_match": is_match, "match_id": match_id, "state": state}

# ---- MATCHES & CHAT ----
@api.get("/matches")
async def list_matches(user: Dict = Depends(get_current_user)):
    uid = user["user_id"]
    cursor = db.matches.find({"$or": [{"user_a": uid}, {"user_b": uid}]}, {"_id": 0})
    matches = await cursor.to_list(500)
    out = []
    for m in matches:
        other_id = m["user_b"] if m["user_a"] == uid else m["user_a"]
        other = await db.users.find_one({"user_id": other_id}, {"_id": 0, "password_hash": 0})
        if not other:
            continue
        last = await db.messages.find_one({"match_id": m["match_id"]}, {"_id": 0}, sort=[("created_at", -1)])
        out.append({
            "match_id": m["match_id"],
            "user": {"user_id": other["user_id"], "name": other.get("name"), "photos": other.get("photos", [])[:1], "verified_badge": other.get("verified_badge", False)},
            "last_message": last,
            "created_at": m["created_at"],
        })
    return {"matches": out}

@api.get("/matches/{match_id}/messages")
async def list_messages(match_id: str, user: Dict = Depends(get_current_user)):
    m = await db.matches.find_one({"match_id": match_id}, {"_id": 0})
    if not m or user["user_id"] not in (m["user_a"], m["user_b"]):
        raise HTTPException(404, "Match not found")
    msgs = await db.messages.find({"match_id": match_id}, {"_id": 0}).sort("created_at", 1).to_list(1000)
    return {"messages": msgs}

@api.post("/matches/{match_id}/messages")
async def send_message(match_id: str, req: ChatMsgReq, user: Dict = Depends(get_current_user)):
    m = await db.matches.find_one({"match_id": match_id}, {"_id": 0})
    if not m or user["user_id"] not in (m["user_a"], m["user_b"]):
        raise HTTPException(404, "Match not found")
    mod = await ai_moderate_text(req.text)
    if mod["flagged"]:
        raise HTTPException(400, f"Message blocked by safety filters ({mod['category']})")
    msg = {
        "message_id": gen_id("msg"),
        "match_id": match_id,
        "sender_id": user["user_id"],
        "text": req.text,
        "created_at": iso(now_utc()),
        "moderation": {"score": mod["score"], "via": mod["via"]},
    }
    await db.messages.insert_one(msg)
    msg.pop("_id", None)
    return msg

@api.post("/matches/{match_id}/icebreaker")
async def icebreaker(match_id: str, user: Dict = Depends(get_current_user)):
    m = await db.matches.find_one({"match_id": match_id}, {"_id": 0})
    if not m:
        raise HTTPException(404, "Match not found")
    other_id = m["user_b"] if m["user_a"] == user["user_id"] else m["user_a"]
    other = await db.users.find_one({"user_id": other_id}, {"_id": 0, "password_hash": 0})
    if not other:
        raise HTTPException(404)
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"ice_{match_id[:8]}",
            system_message="You write warm, witty, respectful first-message icebreakers (max 25 words) for a dating app, referencing the recipient's interests/bio.",
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        prompt = f"Recipient name: {other.get('name')}, bio: {other.get('bio','')}, interests: {', '.join(other.get('interests', []))}. Give 3 distinct icebreakers as a JSON array of strings."
        resp = await chat.send_message(UserMessage(text=prompt))
        import json as _json, re
        m2 = re.search(r"\[.*\]", resp, re.S)
        ideas = _json.loads(m2.group(0)) if m2 else [resp.strip()]
    except Exception as e:
        log.warning(f"icebreaker ai failed: {e}")
        ideas = [
            f"Hey {other.get('name','there')} — what's your favorite weekend ritual?",
            "If we grabbed coffee tomorrow, what's your order?",
            "Pick one: mountains, oceans, or city rooftops?",
        ]
    return {"icebreakers": ideas[:3]}

# ---- SAFETY ----
@api.post("/safety/report")
async def report_user(req: ReportReq, user: Dict = Depends(get_current_user)):
    target = await db.users.find_one({"user_id": req.target_user_id}, {"_id": 0, "user_id": 1})
    if not target:
        raise HTTPException(404, "Target user not found")
    if req.target_user_id == user["user_id"]:
        raise HTTPException(400, "Cannot report yourself")
    doc = {
        "report_id": gen_id("rep"),
        "reporter_id": user["user_id"],
        "target_user_id": req.target_user_id,
        "category": req.category,
        "description": req.description,
        "status": "open",
        "created_at": iso(now_utc()),
    }
    await db.reports.insert_one(doc)
    # auto-flag user if 3+ open reports
    count = await db.reports.count_documents({"target_user_id": req.target_user_id, "status": "open"})
    if count >= 3:
        await db.users.update_one({"user_id": req.target_user_id}, {"$set": {"status": "shadow_banned"}, "$inc": {"safety_score": -10}})
    return {"ok": True, "report_id": doc["report_id"]}

@api.post("/safety/block")
async def block_user(req: BlockReq, user: Dict = Depends(get_current_user)):
    await db.blocks.insert_one({
        "block_id": gen_id("blk"),
        "user_id": user["user_id"],
        "target_user_id": req.target_user_id,
        "created_at": iso(now_utc()),
    })
    return {"ok": True}

@api.get("/safety/settings")
async def get_safety_settings(user: Dict = Depends(get_current_user)):
    return user.get("safety_settings", {})

@api.put("/safety/settings")
async def update_safety_settings(req: SafetyToggleReq, user: Dict = Depends(get_current_user)):
    cur = user.get("safety_settings", {})
    upd = {**cur, **{k: v for k, v in req.dict().items() if v is not None}}
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"safety_settings": upd}})
    return upd

# ---- PRIVACY ----
@api.get("/privacy/settings")
async def get_privacy(user: Dict = Depends(get_current_user)):
    return user.get("privacy_settings", {})

@api.put("/privacy/settings")
async def update_privacy(req: PrivacyToggleReq, user: Dict = Depends(get_current_user)):
    cur = user.get("privacy_settings", {})
    upd = {**cur, **{k: v for k, v in req.dict().items() if v is not None}}
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"privacy_settings": upd}})
    return upd

@api.get("/privacy/export")
async def export_data(user: Dict = Depends(get_current_user)):
    uid = user["user_id"]
    profile = await db.users.find_one({"user_id": uid}, {"_id": 0, "password_hash": 0})
    swipes = await db.swipes.find({"user_id": uid}, {"_id": 0}).to_list(10000)
    matches = await db.matches.find({"$or": [{"user_a": uid}, {"user_b": uid}]}, {"_id": 0}).to_list(5000)
    messages = await db.messages.find({"sender_id": uid}, {"_id": 0}).to_list(20000)
    reports = await db.reports.find({"reporter_id": uid}, {"_id": 0}).to_list(1000)
    return {"profile": profile, "swipes": swipes, "matches": matches, "messages": messages, "reports": reports, "exported_at": iso(now_utc())}

@api.post("/privacy/delete-account")
async def delete_account(user: Dict = Depends(get_current_user)):
    uid = user["user_id"]
    await db.users.update_one({"user_id": uid}, {"$set": {"status": "deleted", "deleted_at": iso(now_utc()), "privacy_settings.profile_visible": False, "onboarded": False}, "$unset": {"name": "", "photos": "", "bio": "", "prompts": "", "interests": ""}})
    await db.swipes.delete_many({"user_id": uid})
    await db.messages.update_many({"sender_id": uid}, {"$set": {"text": "[deleted]"}})
    await db.user_sessions.delete_many({"user_id": uid})
    return {"ok": True, "right_to_be_forgotten": True}

@api.post("/privacy/cookie-consent")
async def cookie_consent(req: CookieConsentReq, request: Request):
    ip = request.client.host if request.client else "?"
    await db.cookie_consents.insert_one({
        "consent_id": gen_id("cc"),
        "ip_hash": hashlib.sha256(ip.encode()).hexdigest()[:32],
        "essential": req.essential, "analytics": req.analytics, "marketing": req.marketing,
        "created_at": iso(now_utc()),
    })
    return {"ok": True}

# ---- AI MODERATION endpoint ----
@api.post("/moderate")
async def moderate(req: ModerateTextReq):
    return await ai_moderate_text(req.text)

# ---- PHOTO UPLOAD ----
@api.post("/upload/photo")
async def upload_photo(file: UploadFile = File(...), user: Dict = Depends(get_current_user)):
    if (file.content_type or "").lower() not in ALLOWED_IMAGE_MIMES:
        raise HTTPException(400, "Only JPEG, PNG, WEBP, or GIF allowed")
    data = await file.read()
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(413, "Image must be 8 MB or smaller")
    if len(data) < 200:
        raise HTTPException(400, "Image looks empty or corrupted")
    ct = file.content_type.lower()
    ext = MIME_EXT.get(ct, "bin")
    path = f"{APP_NAME}/photos/{user['user_id']}/{uuid.uuid4().hex}.{ext}"
    try:
        result = storage_put(path, data, ct)
    except Exception as e:
        log.error(f"upload failed: {e}")
        raise HTTPException(503, "Storage unavailable")
    record = {
        "file_id": gen_id("file"),
        "user_id": user["user_id"],
        "storage_path": result.get("path", path),
        "content_type": ct,
        "size": len(data),
        "is_deleted": False,
        "created_at": iso(now_utc()),
    }
    await db.files.insert_one(record)
    return {"file_id": record["file_id"], "path": record["storage_path"], "url": f"/api/files/{record['storage_path']}", "size": record["size"]}

@api.get("/files/{path:path}")
async def get_file(path: str, authorization: Optional[str] = Header(None), auth: Optional[str] = Query(None)):
    # img tags can't send Authorization headers, so accept ?auth=<jwt> as fallback.
    # Any authenticated user may view photos (profiles are visible to logged-in users).
    user_id = None
    if authorization and authorization.lower().startswith("bearer "):
        user_id = decode_token(authorization.split(" ", 1)[1].strip())
    if not user_id and auth:
        user_id = decode_token(auth)
    if not user_id:
        raise HTTPException(401, "Authentication required")
    rec = await db.files.find_one({"storage_path": path, "is_deleted": False}, {"_id": 0})
    if not rec:
        raise HTTPException(404, "File not found")
    try:
        data, ct = storage_get(path)
    except Exception as e:
        log.error(f"file fetch err: {e}")
        raise HTTPException(503, "Storage unavailable")
    return Response(content=data, media_type=rec.get("content_type", ct), headers={"Cache-Control": "private, max-age=3600"})

@api.delete("/upload/photo")
async def delete_photo(path: str, user: Dict = Depends(get_current_user)):
    rec = await db.files.find_one({"storage_path": path, "user_id": user["user_id"]}, {"_id": 0})
    if not rec:
        raise HTTPException(404, "Not found")
    await db.files.update_one({"storage_path": path}, {"$set": {"is_deleted": True, "deleted_at": iso(now_utc())}})
    # remove from user's photos array too
    await db.users.update_one({"user_id": user["user_id"]}, {"$pull": {"photos": f"/api/files/{path}"}})
    return {"ok": True}

# ---- STRIPE ----
@api.post("/checkout/session")
async def create_checkout(req: CheckoutReq, request: Request, user: Dict = Depends(get_current_user)):
    if req.package_id not in PACKAGES:
        raise HTTPException(400, "Invalid package")
    pkg = PACKAGES[req.package_id]
    currency = _normalize_currency(req.currency)
    amount = float(get_price(req.package_id, currency))

    success_url = f"{req.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{req.origin_url}/app/plans"

    try:
        from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutSessionRequest
        host_url = str(request.base_url)
        webhook_url = f"{host_url}api/webhook/stripe"
        stripe = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        ck_req = CheckoutSessionRequest(
            amount=amount, currency=currency,
            success_url=success_url, cancel_url=cancel_url,
            metadata={"user_id": user["user_id"], "package_id": req.package_id, "kind": pkg["kind"], "currency": currency},
        )
        session = await stripe.create_checkout_session(ck_req)
    except Exception as e:
        log.error(f"stripe checkout error: {e}")
        raise HTTPException(502, f"Payment provider error: {str(e)[:120]}")

    await db.payment_transactions.insert_one({
        "tx_id": gen_id("tx"),
        "session_id": session.session_id,
        "user_id": user["user_id"],
        "email": user.get("email"),
        "amount": amount, "currency": currency,
        "package_id": req.package_id,
        "kind": pkg["kind"],
        "payment_status": "initiated",
        "status": "open",
        "metadata": {"user_id": user["user_id"], "package_id": req.package_id, "kind": pkg["kind"], "currency": currency},
        "created_at": iso(now_utc()),
    })
    return {"url": session.url, "session_id": session.session_id, "amount": amount, "currency": currency}

@api.get("/checkout/status/{session_id}")
async def checkout_status(session_id: str, request: Request, user: Dict = Depends(get_current_user)):
    tx = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
    if not tx:
        raise HTTPException(404, "Transaction not found")
    # If already finalized via webhook, return DB state without re-calling Stripe
    if tx.get("payment_status") in ("paid", "expired", "failed"):
        return {"status": tx.get("status", "complete"), "payment_status": tx["payment_status"], "amount_total": int(tx["amount"] * 100), "currency": tx["currency"]}
    try:
        from emergentintegrations.payments.stripe.checkout import StripeCheckout
        host_url = str(request.base_url)
        stripe = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=f"{host_url}api/webhook/stripe")
        st = await stripe.get_checkout_status(session_id)
    except Exception as e:
        log.warning(f"stripe status soft-error (will rely on webhook): {e}")
        # Gracefully return "open" so frontend keeps polling; webhook will finalize tx
        return {"status": "open", "payment_status": tx.get("payment_status", "initiated"), "amount_total": int(tx["amount"] * 100), "currency": tx["currency"]}

    # idempotent update
    if tx["payment_status"] != "paid" and st.payment_status == "paid":
        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {"payment_status": "paid", "status": st.status, "completed_at": iso(now_utc())}},
        )
        pkg_id = tx["package_id"]
        pkg = PACKAGES.get(pkg_id, {})
        if pkg.get("kind") == "subscription":
            await db.users.update_one({"user_id": tx["user_id"]}, {"$set": {
                "subscription": {"plan": pkg_id, "active": True, "renews_at": iso(now_utc() + timedelta(days=30))},
            }})
        elif pkg.get("kind") == "one_time" and pkg_id == "swipe_pack":
            await db.users.update_one({"user_id": tx["user_id"]}, {"$inc": {"bonus_swipes": 10, "daily_swipes.bonus": 10}})
    elif st.status == "expired":
        await db.payment_transactions.update_one({"session_id": session_id}, {"$set": {"status": "expired"}})

    return {"status": st.status, "payment_status": st.payment_status, "amount_total": st.amount_total, "currency": st.currency}

@api.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    body = await request.body()
    sig = request.headers.get("Stripe-Signature", "")
    try:
        from emergentintegrations.payments.stripe.checkout import StripeCheckout
        host_url = str(request.base_url)
        stripe = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=f"{host_url}api/webhook/stripe")
        evt = await stripe.handle_webhook(body, sig)
    except Exception as e:
        log.error(f"webhook err: {e}")
        return JSONResponse({"ok": False}, status_code=400)
    if evt.payment_status == "paid":
        tx = await db.payment_transactions.find_one({"session_id": evt.session_id}, {"_id": 0})
        if tx and tx["payment_status"] != "paid":
            await db.payment_transactions.update_one(
                {"session_id": evt.session_id},
                {"$set": {"payment_status": "paid", "status": "complete", "completed_at": iso(now_utc())}},
            )
            pkg_id = tx["package_id"]
            pkg = PACKAGES.get(pkg_id, {})
            if pkg.get("kind") == "subscription":
                await db.users.update_one({"user_id": tx["user_id"]}, {"$set": {
                    "subscription": {"plan": pkg_id, "active": True, "renews_at": iso(now_utc() + timedelta(days=30))},
                }})
            elif pkg.get("kind") == "one_time" and pkg_id == "swipe_pack":
                await db.users.update_one({"user_id": tx["user_id"]}, {"$inc": {"bonus_swipes": 10, "daily_swipes.bonus": 10}})
    return {"ok": True}

@api.get("/billing/history")
async def billing_history(user: Dict = Depends(get_current_user)):
    rows = await db.payment_transactions.find({"user_id": user["user_id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return {"transactions": rows}

@api.post("/billing/cancel")
async def cancel_subscription(user: Dict = Depends(get_current_user)):
    await db.users.update_one({"user_id": user["user_id"]}, {"$set": {"subscription.active": False, "subscription.canceled_at": iso(now_utc())}})
    return {"ok": True}

@api.get("/plans")
async def get_plans(currency: str = Query("usd")):
    currency = _normalize_currency(currency)
    meta = CURRENCY_META[currency]
    plans = []
    for k, v in PACKAGES.items():
        plans.append({
            "id": k,
            "name": v["name"],
            "kind": v["kind"],
            "perks": v["perks"],
            "amount": PRICES[currency][k],
            "currency": currency,
        })
    return {
        "plans": plans,
        "currency": currency,
        "currency_meta": meta,
        "comparison": COMPARISON[currency],
        "supported_currencies": [{"code": c, **CURRENCY_META[c]} for c in PRICES.keys()],
    }

# ---- ADMIN ----
@api.get("/admin/stats")
async def admin_stats(_: Dict = Depends(require_admin)):
    return {
        "users_total": await db.users.count_documents({}),
        "users_active": await db.users.count_documents({"status": "active"}),
        "users_pending": await db.users.count_documents({"status": "pending_verification"}),
        "users_banned": await db.users.count_documents({"status": "banned"}),
        "reports_open": await db.reports.count_documents({"status": "open"}),
        "matches_total": await db.matches.count_documents({}),
        "messages_total": await db.messages.count_documents({}),
        "tx_paid": await db.payment_transactions.count_documents({"payment_status": "paid"}),
    }

@api.get("/admin/reports")
async def admin_reports(status: str = "open", _: Dict = Depends(require_admin)):
    rows = await db.reports.find({"status": status}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return {"reports": rows}

@api.get("/admin/users")
async def admin_users(_: Dict = Depends(require_admin), q: str = ""):
    flt: Dict = {}
    if q:
        flt = {"$or": [{"email": {"$regex": q, "$options": "i"}}, {"name": {"$regex": q, "$options": "i"}}]}
    rows = await db.users.find(flt, {"_id": 0, "password_hash": 0}).limit(200).to_list(200)
    return {"users": rows}

@api.post("/admin/action")
async def admin_action(req: AdminActionReq, admin: Dict = Depends(require_admin)):
    if req.action not in ("warn", "suspend", "ban", "dismiss", "verify"):
        raise HTTPException(400, "Invalid action")
    status_map = {"warn": "active", "suspend": "suspended", "ban": "banned", "dismiss": None, "verify": "active"}
    upd: Dict[str, Any] = {}
    if req.action == "verify":
        upd["verified_badge"] = True
    elif status_map[req.action]:
        upd["status"] = status_map[req.action]
    if upd:
        await db.users.update_one({"user_id": req.target_user_id}, {"$set": upd})
    await db.reports.update_many({"target_user_id": req.target_user_id, "status": "open"}, {"$set": {"status": "resolved", "resolved_by": admin["user_id"], "resolution": req.action, "resolved_at": iso(now_utc())}})
    await db.audit_logs.insert_one({
        "log_id": gen_id("log"),
        "admin_id": admin["user_id"],
        "target_user_id": req.target_user_id,
        "action": req.action,
        "reason": req.reason,
        "created_at": iso(now_utc()),
    })
    return {"ok": True}

@api.get("/admin/audit-logs")
async def audit_logs(_: Dict = Depends(require_admin)):
    rows = await db.audit_logs.find({}, {"_id": 0}).sort("created_at", -1).limit(200).to_list(200)
    return {"logs": rows}

# ---------- seeding ----------
DEMO_PROFILES = [
    {"name": "Ava",    "gender": "female", "interested_in": "male",   "bio": "Architect by day, ceramicist by night. Looking for someone with their own world to share.", "interests": ["ceramics", "modern art", "hiking"], "photos": ["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&q=80"]},
    {"name": "Liam",   "gender": "male",   "interested_in": "female", "bio": "Coffee, climbing, and slow Sunday mornings.", "interests": ["climbing", "specialty coffee", "vinyl"], "photos": ["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&q=80"]},
    {"name": "Maya",   "gender": "female", "interested_in": "any",    "bio": "Trying every ramen spot in the city. Pace yourself.", "interests": ["food", "travel", "design"], "photos": ["https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=900&q=80"]},
    {"name": "Noah",   "gender": "male",   "interested_in": "female", "bio": "Writer, dog dad to Miso the corgi.", "interests": ["writing", "dogs", "indie films"], "photos": ["https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=900&q=80"]},
    {"name": "Zara",   "gender": "female", "interested_in": "male",   "bio": "Backpacked 23 countries. Always plotting the next trip.", "interests": ["travel", "languages", "photography"], "photos": ["https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&q=80"]},
    {"name": "Eli",    "gender": "male",   "interested_in": "any",    "bio": "Synth nerd. Will play you my favorite track.", "interests": ["music production", "concerts", "books"], "photos": ["https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=900&q=80"]},
    {"name": "Sienna", "gender": "female", "interested_in": "male",   "bio": "ER nurse. Loves slow weekends and good wine.", "interests": ["wine", "yoga", "cooking"], "photos": ["https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&q=80"]},
    {"name": "Kai",    "gender": "male",   "interested_in": "female", "bio": "Surfer, product designer, weekend potter.", "interests": ["surfing", "design", "ceramics"], "photos": ["https://images.unsplash.com/photo-1463453091185-61582044d556?w=900&q=80"]},
    {"name": "Iris",   "gender": "female", "interested_in": "female", "bio": "Bookshop owner. Plant person. Cat name: Comma.", "interests": ["books", "plants", "tea"], "photos": ["https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=900&q=80"]},
    {"name": "Theo",   "gender": "male",   "interested_in": "male",   "bio": "Trail runner. Espresso snob. Slow texter sometimes.", "interests": ["running", "coffee", "podcasts"], "photos": ["https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=900&q=80"]},
    {"name": "Luna",   "gender": "female", "interested_in": "any",    "bio": "Astrophysics PhD. I will explain dark matter, I'm sorry.", "interests": ["science", "stargazing", "sci-fi"], "photos": ["https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=900&q=80"]},
    {"name": "Nico",   "gender": "male",   "interested_in": "female", "bio": "Chef. Will cook you breakfast, no strings attached.", "interests": ["cooking", "farmers markets", "jazz"], "photos": ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=80"]},
]

async def seed_db():
    # admin
    if not await db.users.find_one({"email": "admin@sparkd.app"}):
        await db.users.insert_one({
            "user_id": "user_admin0001",
            "email": "admin@sparkd.app",
            "password_hash": hash_pw("AdminSparkd2026!"),
            "name": "Sparkd Admin",
            "role": "admin",
            "status": "active",
            "email_verified": True,
            "onboarded": True,
            "verified_badge": True,
            "safety_score": 100,
            "created_at": iso(now_utc()),
            "subscription": {"plan": "platinum_monthly", "active": True},
            "safety_settings": {"blur_photos_until_match": False, "verified_only_mode": False, "location_masking": True, "private_browsing": False, "emergency_contact": ""},
            "privacy_settings": {"profile_visible": False, "show_distance": False, "show_age": False, "ad_personalization": False, "push_notifications": True, "email_notifications": True},
            "photos": [],
            "interests": [],
        })
    # demo user
    if not await db.users.find_one({"email": "demo@sparkd.app"}):
        await db.users.insert_one({
            "user_id": "user_demo00001",
            "email": "demo@sparkd.app",
            "password_hash": hash_pw("DemoSparkd2026!"),
            "name": "Demo User",
            "dob": "1995-06-15",
            "gender": "any",
            "interested_in": "any",
            "role": "user",
            "status": "active",
            "email_verified": True,
            "onboarded": True,
            "verified_badge": True,
            "safety_score": 90,
            "created_at": iso(now_utc()),
            "subscription": {"plan": "free", "active": False},
            "safety_settings": {"blur_photos_until_match": False, "verified_only_mode": False, "location_masking": True, "private_browsing": False, "emergency_contact": ""},
            "privacy_settings": {"profile_visible": True, "show_distance": True, "show_age": True, "ad_personalization": True, "push_notifications": True, "email_notifications": True},
            "photos": ["https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=900&q=80"],
            "bio": "Welcome to Sparkd! Swipe to meet people.",
            "interests": ["design", "coffee", "books"],
            "consents": {"terms": True, "privacy": True, "community": True},
        })
    # demo swipe targets
    for i, p in enumerate(DEMO_PROFILES):
        email = f"{p['name'].lower()}@sparkd.demo"
        if await db.users.find_one({"email": email}):
            continue
        await db.users.insert_one({
            "user_id": f"user_demo_{i:04d}",
            "email": email,
            "password_hash": hash_pw("DemoSparkd2026!"),
            "name": p["name"],
            "dob": "1996-01-01",
            "gender": p["gender"],
            "interested_in": p["interested_in"],
            "role": "user",
            "status": "active",
            "email_verified": True,
            "onboarded": True,
            "verified_badge": (i % 3 == 0),
            "safety_score": random.randint(75, 99),
            "created_at": iso(now_utc()),
            "subscription": {"plan": "free", "active": False},
            "safety_settings": {"blur_photos_until_match": False, "verified_only_mode": False, "location_masking": True, "private_browsing": False, "emergency_contact": ""},
            "privacy_settings": {"profile_visible": True, "show_distance": True, "show_age": True, "ad_personalization": True, "push_notifications": True, "email_notifications": True},
            "photos": p["photos"],
            "bio": p["bio"],
            "interests": p["interests"],
            "prompts": [],
            "consents": {"terms": True, "privacy": True, "community": True},
            "location_city": random.choice(["NYC", "LA", "London", "Tokyo", "Berlin"]),
        })

@app.on_event("startup")
async def startup():
    await seed_db()
    try:
        init_storage()
        log.info("Object storage initialized.")
    except Exception as e:
        log.error(f"Storage init failed (uploads will return 503): {e}")
    log.info("Sparkd seeded.")

@app.on_event("shutdown")
async def shutdown():
    client.close()

# ---------- mount ----------
app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
