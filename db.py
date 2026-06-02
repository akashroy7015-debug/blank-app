"""
db.py — Database layer for PanditJi app.
All SQLite operations are here. Each function does one clear thing.
"""

import sqlite3
import hashlib
import base64

DB_PATH = "pandit_booking.db"


# ── connection ─────────────────────────────────────────────────────────────────

def get_conn():
    """Open a SQLite connection. row_factory lets us access columns by name."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def hash_password(password):
    """One-way hash for storing passwords. Never store plain text passwords."""
    return hashlib.sha256(password.encode()).hexdigest()


# ── setup ──────────────────────────────────────────────────────────────────────

def init_db():
    """
    Create all tables if they don't exist yet, run any migrations needed
    for existing databases, and seed sample data on first run.
    """
    conn = get_conn()

    conn.executescript("""
        -- Users: devotees, pandits, and admins all share this table.
        -- The 'role' column says what kind of user they are.
        CREATE TABLE IF NOT EXISTS users (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            name          TEXT    NOT NULL,
            email         TEXT    UNIQUE NOT NULL,
            password_hash TEXT    NOT NULL,
            phone         TEXT,
            role          TEXT    DEFAULT 'user',   -- 'user', 'pandit', 'admin'
            created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Pandits: professional details for each priest.
        -- status: 'pending' (waiting for admin), 'approved' (live), 'rejected', 'deactivated'
        CREATE TABLE IF NOT EXISTS pandits (
            id               INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id          INTEGER,               -- linked user account (if self-registered)
            name             TEXT    NOT NULL,
            specialization   TEXT,
            experience_years INTEGER,
            languages        TEXT,
            location         TEXT,
            rating           REAL    DEFAULT 4.5,
            bio              TEXT,
            price_per_puja   INTEGER DEFAULT 1100,
            available        INTEGER DEFAULT 1,     -- 1 = available, 0 = not available
            status           TEXT    DEFAULT 'approved',
            photo            TEXT,                  -- base64-encoded image string
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        -- Puja types: the list of pujas users can book.
        CREATE TABLE IF NOT EXISTS puja_types (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            name           TEXT    NOT NULL,
            description    TEXT,
            duration_hours REAL    DEFAULT 2.0,
            category       TEXT
        );

        -- Bookings: one row per booking a devotee makes.
        CREATE TABLE IF NOT EXISTS bookings (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id       INTEGER NOT NULL,
            pandit_id     INTEGER NOT NULL,
            puja_type_id  INTEGER NOT NULL,
            booking_date  TEXT    NOT NULL,
            time_slot     TEXT    NOT NULL,
            address       TEXT    NOT NULL,
            special_notes TEXT,
            status        TEXT    DEFAULT 'confirmed',  -- 'confirmed', 'cancelled'
            created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id)      REFERENCES users(id),
            FOREIGN KEY (pandit_id)    REFERENCES pandits(id),
            FOREIGN KEY (puja_type_id) REFERENCES puja_types(id)
        );
    """)

    c = conn.cursor()

    # ── Migrations: safely add new columns to existing databases ──────────────
    # SQLite does not support IF NOT EXISTS for ALTER TABLE, so we catch errors.
    for sql in [
        "ALTER TABLE users   ADD COLUMN role TEXT DEFAULT 'user'",
        "ALTER TABLE pandits ADD COLUMN user_id INTEGER",
        "ALTER TABLE pandits ADD COLUMN status TEXT DEFAULT 'approved'",
        "ALTER TABLE pandits ADD COLUMN photo  TEXT",
    ]:
        try:
            c.execute(sql)
        except Exception:
            pass  # Column already exists — that's fine.

    # ── Seed admin account ────────────────────────────────────────────────────
    c.execute("SELECT COUNT(*) FROM users WHERE role = 'admin'")
    if c.fetchone()[0] == 0:
        c.execute(
            "INSERT OR IGNORE INTO users (name, email, password_hash, phone, role) VALUES (?,?,?,?,?)",
            ("Admin", "admin@panditji.in", hash_password("Admin@123"), "1800000000", "admin"),
        )

    # ── Seed sample pandits ───────────────────────────────────────────────────
    c.execute("SELECT COUNT(*) FROM pandits")
    if c.fetchone()[0] == 0:
        pandits = [
            ("Pt. Ramesh Sharma",  "Vedic Rituals & Havan",        15, "Hindi, Sanskrit",
             "Delhi",     4.8, "Experienced Vedic priest specialising in Havan, Satyanarayan Katha, and Griha Pravesh with authentic Vedic mantras.", 1100),
            ("Pt. Suresh Mishra",  "Marriage & Samskaras",          22, "Hindi, Sanskrit, Bengali",
             "Mumbai",    4.9, "Expert in all 16 Hindu Samskaras — Vivah, Namkaran, Mundan, and Annaprashan — with 22 years of ceremonial experience.", 1500),
            ("Pt. Anil Tiwari",    "Katha & Path",                  12, "Hindi, Sanskrit",
             "Lucknow",   4.7, "Specialist in Sundarkand Path, Ramayan Path, Bhagwat Katha, and Shiv Mahapuran recitations.", 900),
            ("Pt. Vijay Shastri",  "Vastu & Griha Pravesh",         18, "Hindi, Sanskrit, Gujarati",
             "Ahmedabad", 4.6, "Expert in Vastu Shanti, Griha Pravesh, and Bhoomi Pujan with deep knowledge of Vastu Shastra.", 1300),
            ("Pt. Deepak Pandey",  "Navgraha & Jyotish Remedies",   10, "Hindi, Sanskrit",
             "Varanasi",  4.8, "Specialist in Navgraha Shanti, Rudrabhishek, and astrological remedial pujas.", 1200),
            ("Pt. Mohan Das",      "Antim Sanskar & Pitru Karma",   25, "Hindi, Sanskrit",
             "Prayagraj", 4.9, "Expert in Antim Sanskar, Shradh, Pitru Tarpan, and all post-death rituals.", 2000),
        ]
        c.executemany(
            """INSERT INTO pandits
               (name, specialization, experience_years, languages, location, rating, bio, price_per_puja, status)
               VALUES (?,?,?,?,?,?,?,?,'approved')""",
            pandits,
        )

    # ── Seed puja types ───────────────────────────────────────────────────────
    c.execute("SELECT COUNT(*) FROM puja_types")
    if c.fetchone()[0] == 0:
        puja_types = [
            ("Satyanarayan Katha",   "Complete Satyanarayan Vrat Katha with Prasad",          3.0, "Katha"),
            ("Bhagwat Katha",        "Srimad Bhagwat Katha recitation",                       3.0, "Katha"),
            ("Sundarkand Path",      "Recitation of Sundarkand from Ramcharitmanas",           3.0, "Path"),
            ("Ramayan Path",         "Complete Ramayan Paath",                                 8.0, "Path"),
            ("Griha Pravesh Puja",   "House warming ceremony with Vastu Puja and Havan",       2.5, "Ceremony"),
            ("Bhoomi Puja",          "Ground breaking ceremony before construction",            2.0, "Ceremony"),
            ("Ganesh Puja",          "Ganesh Sthapana and Puja for auspicious beginnings",     1.5, "Puja"),
            ("Lakshmi Puja",         "Devi Lakshmi Puja for wealth and prosperity",            2.0, "Puja"),
            ("Navratri Puja",        "Nine nights Devi puja with all rituals",                 2.0, "Puja"),
            ("Rudrabhishek",         "Abhishek of Lord Shiva with Panchamrit offerings",       2.5, "Puja"),
            ("Navgraha Shanti",      "Puja for all nine planets to remove doshas",             3.0, "Shanti"),
            ("Vastu Shanti",         "Purification and peace of dwelling space",               2.5, "Shanti"),
            ("Vivah (Marriage)",     "Complete Hindu marriage ceremony with all rituals",       5.0, "Samskara"),
            ("Namkaran Sanskar",     "Baby naming ceremony as per Vedic tradition",            1.5, "Samskara"),
            ("Mundan Ceremony",      "First hair cutting ceremony for child",                  1.5, "Samskara"),
            ("Annaprashan",          "First solid food ceremony for infant",                   1.5, "Samskara"),
            ("Shradh / Pitru Tarpan","Ancestral rites and water offerings for departed souls", 2.0, "Pitru"),
            ("Other / Custom Puja",  "Any other puja or special ritual as per your need",      2.0, "Other"),
        ]
        c.executemany(
            "INSERT INTO puja_types (name, description, duration_hours, category) VALUES (?,?,?,?)",
            puja_types,
        )

    conn.commit()
    conn.close()


# ── user auth ──────────────────────────────────────────────────────────────────

def create_user(name, email, password, phone, role="user"):
    """Register a new devotee (or admin) account."""
    conn = get_conn()
    try:
        conn.execute(
            "INSERT INTO users (name, email, password_hash, phone, role) VALUES (?,?,?,?,?)",
            (name, email, hash_password(password), phone, role),
        )
        conn.commit()
        return True, "ok_registered"
    except Exception:
        return False, "err_email_taken"
    finally:
        conn.close()


def create_pandit_user(name, email, phone, password, specialization,
                       experience_years, languages, location, bio,
                       price_per_puja, photo_b64=None):
    """
    Register a new Pandit: creates a user account (role='pandit')
    AND a pandit profile (status='pending') in one transaction.
    Admin must approve before the pandit goes live.
    """
    conn = get_conn()
    try:
        c = conn.cursor()
        c.execute(
            "INSERT INTO users (name, email, password_hash, phone, role) VALUES (?,?,?,?,?)",
            (name, email, hash_password(password), phone, "pandit"),
        )
        user_id = c.lastrowid
        c.execute(
            """INSERT INTO pandits
               (user_id, name, specialization, experience_years, languages,
                location, bio, price_per_puja, photo, status)
               VALUES (?,?,?,?,?,?,?,?,?,'pending')""",
            (user_id, name, specialization, experience_years, languages,
             location, bio, price_per_puja, photo_b64),
        )
        conn.commit()
        return True, "pending_message"
    except Exception:
        conn.rollback()
        return False, "err_email_taken"
    finally:
        conn.close()


def get_user_by_email(email, password):
    """Check email + password and return the user row, or None if wrong."""
    conn = get_conn()
    row = conn.execute(
        "SELECT * FROM users WHERE email = ? AND password_hash = ?",
        (email, hash_password(password)),
    ).fetchone()
    conn.close()
    return dict(row) if row else None


# ── public pandit queries ──────────────────────────────────────────────────────

def get_all_pandits(search="", specialization=""):
    """
    Return only APPROVED pandits for the public listing.
    Optionally filter by a search term (name / city / languages).
    """
    conn = get_conn()
    query = "SELECT * FROM pandits WHERE available = 1 AND status = 'approved'"
    params = []
    if search:
        query += " AND (name LIKE ? OR specialization LIKE ? OR location LIKE ? OR languages LIKE ?)"
        params.extend([f"%{search}%"] * 4)
    if specialization:
        query += " AND specialization LIKE ?"
        params.append(f"%{specialization}%")
    rows = conn.execute(query, params).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_pandit_by_id(pandit_id):
    conn = get_conn()
    row = conn.execute("SELECT * FROM pandits WHERE id = ?", (pandit_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def get_pandit_by_user_id(user_id):
    """Find the pandit profile that belongs to a given user account."""
    conn = get_conn()
    row = conn.execute("SELECT * FROM pandits WHERE user_id = ?", (user_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def get_puja_types():
    conn = get_conn()
    rows = conn.execute("SELECT * FROM puja_types ORDER BY category, name").fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ── booking ────────────────────────────────────────────────────────────────────

def get_booked_slots(pandit_id, booking_date):
    """Return the list of already-booked time slots for a pandit on a given date."""
    conn = get_conn()
    rows = conn.execute(
        "SELECT time_slot FROM bookings WHERE pandit_id=? AND booking_date=? AND status!='cancelled'",
        (pandit_id, booking_date),
    ).fetchall()
    conn.close()
    return [r["time_slot"] for r in rows]


def create_booking(user_id, pandit_id, puja_type_id, booking_date,
                   time_slot, address, notes=""):
    conn = get_conn()
    conn.execute(
        """INSERT INTO bookings
           (user_id, pandit_id, puja_type_id, booking_date, time_slot, address, special_notes)
           VALUES (?,?,?,?,?,?,?)""",
        (user_id, pandit_id, puja_type_id, booking_date, time_slot, address, notes),
    )
    conn.commit()
    conn.close()


def get_user_bookings(user_id):
    """All bookings made by a devotee, newest first."""
    conn = get_conn()
    rows = conn.execute("""
        SELECT b.*, p.name AS pandit_name, p.specialization, p.price_per_puja,
               pt.name AS puja_name, pt.duration_hours, pt.category
        FROM bookings b
        JOIN pandits    p  ON b.pandit_id    = p.id
        JOIN puja_types pt ON b.puja_type_id = pt.id
        WHERE b.user_id = ?
        ORDER BY b.booking_date DESC, b.time_slot
    """, (user_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def cancel_booking(booking_id, user_id):
    """A devotee cancels their own booking."""
    conn = get_conn()
    conn.execute(
        "UPDATE bookings SET status='cancelled' WHERE id=? AND user_id=?",
        (booking_id, user_id),
    )
    conn.commit()
    conn.close()


def get_pandit_bookings(pandit_id):
    """All bookings assigned to a specific pandit — for the pandit's dashboard."""
    conn = get_conn()
    rows = conn.execute("""
        SELECT b.*, u.name AS devotee_name, u.phone AS devotee_phone,
               pt.name AS puja_name, pt.duration_hours, pt.category
        FROM bookings b
        JOIN users      u  ON b.user_id      = u.id
        JOIN puja_types pt ON b.puja_type_id = pt.id
        WHERE b.pandit_id = ?
        ORDER BY b.booking_date DESC, b.time_slot
    """, (pandit_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]


# ── admin ──────────────────────────────────────────────────────────────────────

def get_all_pandits_admin():
    """All pandits regardless of status — used in the admin panel."""
    conn = get_conn()
    rows = conn.execute("SELECT * FROM pandits ORDER BY status, name").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_all_users():
    """All user accounts (does not return password hashes)."""
    conn = get_conn()
    rows = conn.execute(
        "SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC"
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_all_bookings_admin():
    """All bookings with full details — for the admin bookings tab."""
    conn = get_conn()
    rows = conn.execute("""
        SELECT b.*, u.name AS devotee_name, u.phone AS devotee_phone,
               p.name AS pandit_name, pt.name AS puja_name, pt.category
        FROM bookings b
        JOIN users      u  ON b.user_id      = u.id
        JOIN pandits    p  ON b.pandit_id    = p.id
        JOIN puja_types pt ON b.puja_type_id = pt.id
        ORDER BY b.booking_date DESC, b.created_at DESC
    """).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def update_pandit_status(pandit_id, status):
    """Change a pandit's status: pending → approved / rejected / deactivated."""
    conn = get_conn()
    conn.execute("UPDATE pandits SET status=? WHERE id=?", (status, pandit_id))
    conn.commit()
    conn.close()


def add_pandit_by_admin(name, specialization, experience_years, languages,
                        location, bio, price_per_puja):
    """Admin adds a pandit directly — automatically approved, no linked user account."""
    conn = get_conn()
    conn.execute(
        """INSERT INTO pandits
           (name, specialization, experience_years, languages, location, bio, price_per_puja, status)
           VALUES (?,?,?,?,?,?,?,'approved')""",
        (name, specialization, experience_years, languages, location, bio, price_per_puja),
    )
    conn.commit()
    conn.close()


def update_pandit(pandit_id, name, specialization, experience_years,
                  languages, location, bio, price_per_puja, available):
    """Update all editable fields of a pandit profile."""
    conn = get_conn()
    conn.execute(
        """UPDATE pandits SET name=?, specialization=?, experience_years=?,
           languages=?, location=?, bio=?, price_per_puja=?, available=?
           WHERE id=?""",
        (name, specialization, experience_years, languages,
         location, bio, price_per_puja, available, pandit_id),
    )
    conn.commit()
    conn.close()


def delete_pandit(pandit_id):
    conn = get_conn()
    conn.execute("DELETE FROM pandits WHERE id=?", (pandit_id,))
    conn.commit()
    conn.close()


def admin_update_booking_status(booking_id, status):
    conn = get_conn()
    conn.execute("UPDATE bookings SET status=? WHERE id=?", (status, booking_id))
    conn.commit()
    conn.close()


def get_stats():
    """Quick stats for the admin dashboard."""
    conn = get_conn()
    c = conn.cursor()
    return {
        "total_users":        c.execute("SELECT COUNT(*) FROM users   WHERE role='user'").fetchone()[0],
        "total_pandits":      c.execute("SELECT COUNT(*) FROM pandits WHERE status='approved'").fetchone()[0],
        "pending_pandits":    c.execute("SELECT COUNT(*) FROM pandits WHERE status='pending'").fetchone()[0],
        "total_bookings":     c.execute("SELECT COUNT(*) FROM bookings").fetchone()[0],
        "confirmed_bookings": c.execute("SELECT COUNT(*) FROM bookings WHERE status='confirmed'").fetchone()[0],
        "cancelled_bookings": c.execute("SELECT COUNT(*) FROM bookings WHERE status='cancelled'").fetchone()[0],
    }


# ── photo helper ───────────────────────────────────────────────────────────────

def encode_photo(uploaded_file):
    """
    Convert a Streamlit uploaded file into a base64 string for storage.
    Returns None if no file was uploaded.
    """
    if uploaded_file is None:
        return None
    return base64.b64encode(uploaded_file.read()).decode("utf-8")
