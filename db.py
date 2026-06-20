import sqlite3
import hashlib
import os

DB_PATH = os.environ.get("DB_PATH", "matrimony.db")


def get_conn():
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def hash_password(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()


def init_db():
    conn = get_conn()
    c = conn.cursor()

    c.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            name          TEXT    NOT NULL,
            email         TEXT    NOT NULL UNIQUE,
            password_hash TEXT    NOT NULL,
            phone         TEXT,
            role          TEXT    NOT NULL DEFAULT 'user',
            created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS profiles (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id         INTEGER NOT NULL UNIQUE REFERENCES users(id),
            gender          TEXT,
            dob             TEXT,
            height_cm       INTEGER,
            religion        TEXT,
            caste           TEXT,
            mother_tongue   TEXT,
            education       TEXT,
            profession      TEXT,
            annual_income   TEXT,
            city            TEXT,
            state           TEXT,
            diet            TEXT,
            smoke           TEXT,
            drink           TEXT,
            mangalik        TEXT,
            family_type     TEXT,
            family_values   TEXT,
            about_me        TEXT,
            photo_base64    TEXT,
            status          TEXT    NOT NULL DEFAULT 'pending',
            created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS interests (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id   INTEGER NOT NULL REFERENCES users(id),
            receiver_id INTEGER NOT NULL REFERENCES users(id),
            status      TEXT    NOT NULL DEFAULT 'pending',
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(sender_id, receiver_id)
        );
    """)

    # Seed admin — always refresh so password changes take effect
    c.execute("DELETE FROM users WHERE email = 'admin@matrimony.in'")
    c.execute(
        "INSERT INTO users (name, email, password_hash, phone, role) VALUES (?,?,?,?,?)",
        ("Admin", "admin@matrimony.in", hash_password("Admin2024"), "1800000000", "admin"),
    )
    conn.commit()
    conn.close()


# ── Auth ──────────────────────────────────────────────────────────────────────

def register_user(name, email, password, phone):
    conn = get_conn()
    try:
        conn.execute(
            "INSERT INTO users (name, email, password_hash, phone) VALUES (?,?,?,?)",
            (name, email, hash_password(password), phone),
        )
        conn.commit()
        user = conn.execute("SELECT * FROM users WHERE email=?", (email,)).fetchone()
        return dict(user), None
    except sqlite3.IntegrityError:
        return None, "email_exists"
    finally:
        conn.close()


def login_user(email, password):
    conn = get_conn()
    user = conn.execute(
        "SELECT * FROM users WHERE email=? AND password_hash=?",
        (email, hash_password(password)),
    ).fetchone()
    conn.close()
    return dict(user) if user else None


def get_user(user_id):
    conn = get_conn()
    u = conn.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
    conn.close()
    return dict(u) if u else None


# ── Profiles ──────────────────────────────────────────────────────────────────

def upsert_profile(user_id, data: dict):
    conn = get_conn()
    existing = conn.execute("SELECT id FROM profiles WHERE user_id=?", (user_id,)).fetchone()
    fields = [
        "gender", "dob", "height_cm", "religion", "caste", "mother_tongue",
        "education", "profession", "annual_income", "city", "state",
        "diet", "smoke", "drink", "mangalik", "family_type", "family_values",
        "about_me", "photo_base64",
    ]
    if existing:
        sets = ", ".join(f"{f}=?" for f in fields if f in data)
        vals = [data[f] for f in fields if f in data] + [user_id]
        conn.execute(f"UPDATE profiles SET {sets}, status='pending' WHERE user_id=?", vals)
    else:
        cols = ["user_id"] + [f for f in fields if f in data]
        placeholders = ",".join("?" * len(cols))
        vals = [user_id] + [data[f] for f in fields if f in data]
        conn.execute(f"INSERT INTO profiles ({','.join(cols)}) VALUES ({placeholders})", vals)
    conn.commit()
    conn.close()


def get_profile(user_id):
    conn = get_conn()
    p = conn.execute(
        """SELECT p.*, u.name, u.email, u.phone
           FROM profiles p JOIN users u ON u.id=p.user_id
           WHERE p.user_id=?""",
        (user_id,),
    ).fetchone()
    conn.close()
    return dict(p) if p else None


def browse_profiles(current_user_id, filters: dict):
    conn = get_conn()
    query = """
        SELECT p.*, u.name, u.email
        FROM profiles p JOIN users u ON u.id=p.user_id
        WHERE p.status='approved'
        AND p.user_id != ?
    """
    params = [current_user_id]

    if filters.get("gender"):
        query += " AND p.gender=?"
        params.append(filters["gender"])
    if filters.get("religion") and filters["religion"] != "Any":
        query += " AND p.religion=?"
        params.append(filters["religion"])
    if filters.get("min_age") and filters.get("max_age"):
        query += " AND CAST((strftime('%Y','now') - strftime('%Y', p.dob)) AS INTEGER) BETWEEN ? AND ?"
        params += [int(filters["min_age"]), int(filters["max_age"])]
    if filters.get("state") and filters["state"] != "Any":
        query += " AND p.state=?"
        params.append(filters["state"])
    if filters.get("education") and filters["education"] != "Any":
        query += " AND p.education=?"
        params.append(filters["education"])

    query += " ORDER BY p.created_at DESC"
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def all_profiles_admin():
    conn = get_conn()
    rows = conn.execute(
        "SELECT p.*, u.name, u.email FROM profiles p JOIN users u ON u.id=p.user_id ORDER BY p.created_at DESC"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def approve_profile(user_id, action):
    conn = get_conn()
    conn.execute("UPDATE profiles SET status=? WHERE user_id=?", (action, user_id))
    conn.commit()
    conn.close()


def delete_user(user_id):
    conn = get_conn()
    conn.execute("DELETE FROM interests WHERE sender_id=? OR receiver_id=?", (user_id, user_id))
    conn.execute("DELETE FROM profiles WHERE user_id=?", (user_id,))
    conn.execute("DELETE FROM users WHERE id=? AND role != 'admin'", (user_id,))
    conn.commit()
    conn.close()


# ── Interests ─────────────────────────────────────────────────────────────────

def send_interest(sender_id, receiver_id):
    conn = get_conn()
    try:
        conn.execute(
            "INSERT INTO interests (sender_id, receiver_id) VALUES (?,?)",
            (sender_id, receiver_id),
        )
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()


def respond_interest(interest_id, action):
    conn = get_conn()
    conn.execute("UPDATE interests SET status=? WHERE id=?", (action, interest_id))
    conn.commit()
    conn.close()


def get_interests_received(user_id):
    conn = get_conn()
    rows = conn.execute(
        """SELECT i.*, u.name AS sender_name, p.city, p.state, p.profession,
                  p.photo_base64, p.dob, p.religion
           FROM interests i
           JOIN users u ON u.id=i.sender_id
           LEFT JOIN profiles p ON p.user_id=i.sender_id
           WHERE i.receiver_id=? ORDER BY i.created_at DESC""",
        (user_id,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_interests_sent(user_id):
    conn = get_conn()
    rows = conn.execute(
        """SELECT i.*, u.name AS receiver_name, p.city, p.state, p.profession,
                  p.photo_base64, p.dob, p.religion
           FROM interests i
           JOIN users u ON u.id=i.receiver_id
           LEFT JOIN profiles p ON p.user_id=i.receiver_id
           WHERE i.sender_id=? ORDER BY i.created_at DESC""",
        (user_id,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def interest_status(sender_id, receiver_id):
    conn = get_conn()
    row = conn.execute(
        "SELECT status FROM interests WHERE sender_id=? AND receiver_id=?",
        (sender_id, receiver_id),
    ).fetchone()
    conn.close()
    return row["status"] if row else None


def is_mutual(user_a, user_b):
    conn = get_conn()
    ab = conn.execute(
        "SELECT 1 FROM interests WHERE sender_id=? AND receiver_id=? AND status='accepted'",
        (user_a, user_b),
    ).fetchone()
    ba = conn.execute(
        "SELECT 1 FROM interests WHERE sender_id=? AND receiver_id=? AND status='accepted'",
        (user_b, user_a),
    ).fetchone()
    conn.close()
    return bool(ab and ba)


def get_matches(user_id):
    conn = get_conn()
    rows = conn.execute(
        """SELECT u.name, u.phone, u.email, p.city, p.state, p.profession,
                  p.photo_base64, p.dob, p.religion, p.user_id
           FROM interests a
           JOIN interests b ON a.sender_id=b.receiver_id AND a.receiver_id=b.sender_id
           JOIN users u ON u.id=a.receiver_id
           LEFT JOIN profiles p ON p.user_id=a.receiver_id
           WHERE a.sender_id=? AND a.status='accepted' AND b.status='accepted'""",
        (user_id,),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ── Stats ─────────────────────────────────────────────────────────────────────

def get_stats():
    conn = get_conn()
    total    = conn.execute("SELECT COUNT(*) FROM users WHERE role='user'").fetchone()[0]
    approved = conn.execute("SELECT COUNT(*) FROM profiles WHERE status='approved'").fetchone()[0]
    pending  = conn.execute("SELECT COUNT(*) FROM profiles WHERE status='pending'").fetchone()[0]
    matches  = conn.execute(
        """SELECT COUNT(*) FROM interests a
           JOIN interests b ON a.sender_id=b.receiver_id AND a.receiver_id=b.sender_id
           WHERE a.status='accepted' AND b.status='accepted'"""
    ).fetchone()[0]
    conn.close()
    return {"total": total, "approved": approved, "pending": pending, "matches": matches // 2}


init_db()
