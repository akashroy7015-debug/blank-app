import sqlite3
import hashlib

DB_PATH = "pandit_booking.db"


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


def init_db():
    conn = get_conn()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            phone TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS pandits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            specialization TEXT,
            experience_years INTEGER,
            languages TEXT,
            location TEXT,
            rating REAL DEFAULT 4.5,
            bio TEXT,
            price_per_puja INTEGER DEFAULT 1100,
            available INTEGER DEFAULT 1
        );

        CREATE TABLE IF NOT EXISTS puja_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            duration_hours REAL DEFAULT 2.0,
            category TEXT
        );

        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            pandit_id INTEGER NOT NULL,
            puja_type_id INTEGER NOT NULL,
            booking_date TEXT NOT NULL,
            time_slot TEXT NOT NULL,
            address TEXT NOT NULL,
            special_notes TEXT,
            status TEXT DEFAULT 'confirmed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (pandit_id) REFERENCES pandits(id),
            FOREIGN KEY (puja_type_id) REFERENCES puja_types(id)
        );
    """)

    c = conn.cursor()

    c.execute("SELECT COUNT(*) FROM pandits")
    if c.fetchone()[0] == 0:
        pandits = [
            ("Pt. Ramesh Sharma", "Vedic Rituals & Havan", 15, "Hindi, Sanskrit",
             "Delhi", 4.8,
             "Experienced Vedic priest specialising in traditional Havan, Satyanarayan Katha, and Griha Pravesh ceremonies with authentic Vedic mantras.",
             1100),
            ("Pt. Suresh Mishra", "Marriage & Samskaras", 22, "Hindi, Sanskrit, Bengali",
             "Mumbai", 4.9,
             "Expert in all 16 Hindu Samskaras — Vivah, Namkaran, Mundan, and Annaprashan — with 22 years of ceremonial experience.",
             1500),
            ("Pt. Anil Tiwari", "Katha & Path", 12, "Hindi, Sanskrit",
             "Lucknow", 4.7,
             "Specialist in Sundarkand Path, Ramayan Path, Bhagwat Katha, and Shiv Mahapuran recitations with melodious rendition.",
             900),
            ("Pt. Vijay Shastri", "Vastu & Griha Pravesh", 18, "Hindi, Sanskrit, Gujarati",
             "Ahmedabad", 4.6,
             "Expert in Vastu Shanti, Griha Pravesh, and Bhoomi Pujan with deep knowledge of Vastu Shastra principles.",
             1300),
            ("Pt. Deepak Pandey", "Navgraha & Jyotish Remedies", 10, "Hindi, Sanskrit",
             "Varanasi", 4.8,
             "Specialist in Navgraha Shanti, Rudrabhishek, and astrological remedial pujas for planetary peace and dosh nivaran.",
             1200),
            ("Pt. Mohan Das", "Antim Sanskar & Pitru Karma", 25, "Hindi, Sanskrit",
             "Prayagraj", 4.9,
             "Expert in Antim Sanskar, Shradh, Pitru Tarpan, and all post-death rituals as per Vedic and Shastra tradition.",
             2000),
        ]
        c.executemany(
            "INSERT INTO pandits (name, specialization, experience_years, languages, location, rating, bio, price_per_puja) VALUES (?,?,?,?,?,?,?,?)",
            pandits,
        )

    c.execute("SELECT COUNT(*) FROM puja_types")
    if c.fetchone()[0] == 0:
        puja_types = [
            ("Satyanarayan Katha", "Complete Satyanarayan Vrat Katha with Prasad distribution", 3.0, "Katha"),
            ("Bhagwat Katha", "Srimad Bhagwat Katha recitation", 3.0, "Katha"),
            ("Sundarkand Path", "Recitation of Sundarkand from Ramcharitmanas", 3.0, "Path"),
            ("Ramayan Path", "Complete Ramayan Paath", 8.0, "Path"),
            ("Griha Pravesh Puja", "House warming ceremony with Vastu Puja and Havan", 2.5, "Ceremony"),
            ("Bhoomi Puja", "Ground breaking ceremony before construction", 2.0, "Ceremony"),
            ("Ganesh Puja", "Ganesh Sthapana and Puja for auspicious beginnings", 1.5, "Puja"),
            ("Lakshmi Puja", "Devi Lakshmi Puja for wealth and prosperity", 2.0, "Puja"),
            ("Navratri Puja", "Nine nights Devi puja with all rituals", 2.0, "Puja"),
            ("Rudrabhishek", "Abhishek of Lord Shiva with Panchamrit and sacred offerings", 2.5, "Puja"),
            ("Navgraha Shanti", "Puja for all nine planets to remove doshas", 3.0, "Shanti"),
            ("Vastu Shanti", "Purification and peace of dwelling space", 2.5, "Shanti"),
            ("Vivah (Marriage)", "Complete Hindu marriage ceremony with all rituals", 5.0, "Samskara"),
            ("Namkaran Sanskar", "Baby naming ceremony as per Vedic tradition", 1.5, "Samskara"),
            ("Mundan Ceremony", "First hair cutting ceremony for child", 1.5, "Samskara"),
            ("Annaprashan", "First solid food ceremony for infant", 1.5, "Samskara"),
            ("Shradh / Pitru Tarpan", "Ancestral rites and water offerings for departed souls", 2.0, "Pitru"),
        ]
        c.executemany(
            "INSERT INTO puja_types (name, description, duration_hours, category) VALUES (?,?,?,?)",
            puja_types,
        )

    conn.commit()
    conn.close()


def create_user(name, email, password, phone):
    conn = get_conn()
    try:
        conn.execute(
            "INSERT INTO users (name, email, password_hash, phone) VALUES (?,?,?,?)",
            (name, email, hash_password(password), phone),
        )
        conn.commit()
        return True, "Account created successfully!"
    except Exception:
        return False, "Email already registered. Please login."
    finally:
        conn.close()


def get_user_by_email(email, password):
    conn = get_conn()
    row = conn.execute(
        "SELECT * FROM users WHERE email = ? AND password_hash = ?",
        (email, hash_password(password)),
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def get_all_pandits(search="", specialization=""):
    conn = get_conn()
    query = "SELECT * FROM pandits WHERE available = 1"
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


def get_puja_types():
    conn = get_conn()
    rows = conn.execute("SELECT * FROM puja_types ORDER BY category, name").fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_booked_slots(pandit_id, booking_date):
    conn = get_conn()
    rows = conn.execute(
        "SELECT time_slot FROM bookings WHERE pandit_id = ? AND booking_date = ? AND status != 'cancelled'",
        (pandit_id, booking_date),
    ).fetchall()
    conn.close()
    return [r["time_slot"] for r in rows]


def create_booking(user_id, pandit_id, puja_type_id, booking_date, time_slot, address, notes=""):
    conn = get_conn()
    conn.execute(
        "INSERT INTO bookings (user_id, pandit_id, puja_type_id, booking_date, time_slot, address, special_notes) VALUES (?,?,?,?,?,?,?)",
        (user_id, pandit_id, puja_type_id, booking_date, time_slot, address, notes),
    )
    conn.commit()
    conn.close()


def get_user_bookings(user_id):
    conn = get_conn()
    rows = conn.execute("""
        SELECT b.*, p.name AS pandit_name, p.specialization, p.price_per_puja,
               pt.name AS puja_name, pt.duration_hours, pt.category
        FROM bookings b
        JOIN pandits p ON b.pandit_id = p.id
        JOIN puja_types pt ON b.puja_type_id = pt.id
        WHERE b.user_id = ?
        ORDER BY b.booking_date DESC, b.time_slot
    """, (user_id,)).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def cancel_booking(booking_id, user_id):
    conn = get_conn()
    conn.execute(
        "UPDATE bookings SET status = 'cancelled' WHERE id = ? AND user_id = ?",
        (booking_id, user_id),
    )
    conn.commit()
    conn.close()
