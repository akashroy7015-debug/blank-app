import streamlit as st
from datetime import date, timedelta
import db

st.set_page_config(
    page_title="PanditJi — Book a Pandit for Puja",
    page_icon="🕉️",
    layout="wide",
)

CSS = """
<style>
[data-testid="stAppViewContainer"] {
    background: linear-gradient(160deg, #fff8f0 0%, #ffe9cc 100%);
}
[data-testid="stSidebar"] {
    background: linear-gradient(180deg, #3d0c02 0%, #7a1e00 100%);
}
[data-testid="stSidebar"] * { color: #ffe0c0 !important; }
[data-testid="stSidebar"] h3 { color: #ffd700 !important; font-size: 1.4rem; }
.hero-title {
    text-align: center;
    font-size: 3rem;
    font-weight: 900;
    background: linear-gradient(135deg, #c0390b, #ff6b35, #ffd700);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: 0.2rem;
}
.hero-sub {
    text-align: center;
    color: #7a3000;
    font-size: 1.1rem;
    margin-bottom: 2rem;
}
.pandit-card {
    background: white;
    border-radius: 16px;
    padding: 1.4rem 1.6rem;
    box-shadow: 0 4px 18px rgba(192,57,11,0.12);
    border-left: 5px solid #ff6b35;
    margin-bottom: 0.5rem;
}
.pandit-card h4 { margin: 0 0 0.3rem; color: #3d0c02; font-size: 1.15rem; }
.pandit-card p  { margin: 0.15rem 0; color: #5a2a00; font-size: 0.9rem; }
.price-chip {
    display: inline-block;
    background: linear-gradient(135deg, #ff6b35, #c0390b);
    color: white;
    border-radius: 20px;
    padding: 0.15rem 0.75rem;
    font-weight: 700;
    font-size: 0.85rem;
}
.avail-chip {
    display: inline-block;
    background: #e6f4ea;
    color: #2d6a4f;
    border-radius: 20px;
    padding: 0.15rem 0.75rem;
    font-weight: 600;
    font-size: 0.8rem;
    margin-left: 0.4rem;
}
.booking-card {
    background: white;
    border-radius: 12px;
    padding: 1rem 1.3rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.07);
    border-left: 5px solid #ccc;
    margin-bottom: 0.6rem;
}
.booking-card.confirmed { border-color: #4caf50; }
.booking-card.cancelled { border-color: #f44336; opacity: 0.7; }
.booking-card h5 { margin: 0 0 0.3rem; color: #3d0c02; }
.booking-card p  { margin: 0.1rem 0; color: #5a2a00; font-size: 0.88rem; }
.status-confirmed { color: #2d6a4f; font-weight: 700; }
.status-cancelled { color: #c62828; font-weight: 700; }
.section-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: #3d0c02;
    margin: 1.2rem 0 0.6rem;
    border-bottom: 2px solid #ff6b35;
    padding-bottom: 0.3rem;
}
.metric-box {
    background: white;
    border-radius: 12px;
    padding: 1rem;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
</style>
"""

TIME_SLOTS = [
    "🌅 6:00 AM – 8:00 AM  (Brahma Muhurta)",
    "☀️ 8:00 AM – 10:00 AM (Morning)",
    "🌤️ 10:00 AM – 12:00 PM (Forenoon)",
    "🕛 12:00 PM – 2:00 PM  (Madhyahna)",
    "🌞 4:00 PM – 6:00 PM  (Evening)",
    "🌆 6:00 PM – 8:00 PM  (Sandhya)",
]

SPECIALTIES = [
    "All Specialties",
    "Vedic Rituals",
    "Marriage",
    "Katha",
    "Vastu",
    "Navgraha",
    "Samskara",
    "Pitru Karma",
]


# ── session helpers ────────────────────────────────────────────────────────────

def init_state():
    defaults = {
        "user": None,
        "page": "home",
        "selected_pandit_id": None,
        "booking_success": None,
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v


def go(page, **kw):
    st.session_state.page = page
    for k, v in kw.items():
        st.session_state[k] = v
    st.rerun()


def stars(rating):
    full = int(rating)
    half = rating % 1 >= 0.5
    empty = 5 - full - int(half)
    return "⭐" * full + ("✨" if half else "") + "☆" * empty


# ── sidebar ────────────────────────────────────────────────────────────────────

def sidebar():
    with st.sidebar:
        st.markdown("### 🕉️ PanditJi")
        st.markdown("*Connecting Devotees with Learned Pandits*")
        st.markdown("---")

        if st.session_state.user:
            u = st.session_state.user
            first = u["name"].split()[0]
            st.markdown(f"**Namaste, {first}! 🙏**")
            st.markdown(f"📧 {u['email']}")
            if u.get("phone"):
                st.markdown(f"📱 {u['phone']}")
            st.markdown("---")

            if st.button("🏠 Browse Pandits", use_container_width=True):
                go("home")
            if st.button("📅 My Bookings", use_container_width=True):
                go("my_bookings")
            st.markdown("---")
            if st.button("🚪 Logout", use_container_width=True):
                st.session_state.user = None
                go("home")
        else:
            st.markdown("Login to book a Pandit for your puja.")
            st.markdown("---")
            if st.button("🔐 Login", use_container_width=True, type="primary"):
                go("login")
            if st.button("📝 Register", use_container_width=True):
                go("register")

        st.markdown("---")
        st.markdown("**📞 Support**")
        st.markdown("1800-PANDITJI")
        st.markdown("help@panditji.in")


# ── login ──────────────────────────────────────────────────────────────────────

def page_login():
    _, col, _ = st.columns([1, 1.4, 1])
    with col:
        st.markdown("## 🔐 Login")
        st.markdown("Welcome back! Please sign in to continue.")
        with st.form("login"):
            email = st.text_input("📧 Email")
            password = st.text_input("🔒 Password", type="password")
            submitted = st.form_submit_button("Login 🙏", use_container_width=True, type="primary")
            if submitted:
                if email and password:
                    user = db.get_user_by_email(email.strip(), password)
                    if user:
                        st.session_state.user = user
                        st.success(f"Welcome back, {user['name']}! 🙏")
                        go("home")
                    else:
                        st.error("Invalid email or password. Please try again.")
                else:
                    st.warning("Please enter your email and password.")
        st.markdown("---")
        st.markdown("Don't have an account?")
        if st.button("Create Account →", use_container_width=True):
            go("register")


# ── register ───────────────────────────────────────────────────────────────────

def page_register():
    _, col, _ = st.columns([1, 1.4, 1])
    with col:
        st.markdown("## 📝 Create Account")
        st.markdown("Join PanditJi to book pandits for your sacred ceremonies.")
        with st.form("register"):
            name = st.text_input("👤 Full Name")
            email = st.text_input("📧 Email Address")
            phone = st.text_input("📱 Phone Number")
            password = st.text_input("🔒 Password", type="password")
            confirm = st.text_input("🔒 Confirm Password", type="password")
            submitted = st.form_submit_button("Register 🙏", use_container_width=True, type="primary")
            if submitted:
                if all([name, email, phone, password, confirm]):
                    if password != confirm:
                        st.error("Passwords do not match.")
                    elif len(password) < 6:
                        st.error("Password must be at least 6 characters.")
                    else:
                        ok, msg = db.create_user(name.strip(), email.strip(), password, phone.strip())
                        if ok:
                            st.success(msg + " Please login.")
                            go("login")
                        else:
                            st.error(msg)
                else:
                    st.warning("Please fill in all fields.")
        if st.button("← Back to Login"):
            go("login")


# ── home — browse pandits ──────────────────────────────────────────────────────

def page_home():
    st.markdown(f'<h1 class="hero-title">🕉️ PanditJi</h1>', unsafe_allow_html=True)
    st.markdown(
        '<p class="hero-sub">Book Expert Pandits for Puja, Path, Katha & All Sacred Ceremonies</p>',
        unsafe_allow_html=True,
    )

    col1, col2, col3 = st.columns([3, 2, 1])
    with col1:
        search = st.text_input("🔍 Search", placeholder="Name, specialty, city…", label_visibility="collapsed")
    with col2:
        spec = st.selectbox("Specialty", SPECIALTIES, label_visibility="collapsed")
    with col3:
        st.markdown("<br>", unsafe_allow_html=True)

    spec_filter = "" if spec == "All Specialties" else spec
    pandits = db.get_all_pandits(search=search.strip(), specialization=spec_filter)

    st.markdown(f"**{len(pandits)} Pandits available**")
    st.markdown("---")

    if not pandits:
        st.info("No pandits found for your search. Try different keywords.")
        return

    for row_start in range(0, len(pandits), 2):
        cols = st.columns(2)
        for idx, col in enumerate(cols):
            if row_start + idx >= len(pandits):
                break
            p = pandits[row_start + idx]
            with col:
                st.markdown(f"""
                <div class="pandit-card">
                    <h4>🙏 {p['name']}</h4>
                    <p>{stars(p['rating'])} &nbsp;<strong>{p['rating']}/5</strong></p>
                    <p>📿 <strong>{p['specialization']}</strong></p>
                    <p>📅 {p['experience_years']} yrs experience &nbsp;|&nbsp; 📍 {p['location']}</p>
                    <p>🗣️ {p['languages']}</p>
                    <p style="margin-top:0.5rem">{p['bio']}</p>
                    <p style="margin-top:0.6rem">
                        <span class="price-chip">₹{p['price_per_puja']}+</span>
                        <span class="avail-chip">✓ Available</span>
                    </p>
                </div>
                """, unsafe_allow_html=True)

                short_name = p["name"].replace("Pt. ", "").split()[0]
                if st.button(f"Book {short_name} 🙏", key=f"book_{p['id']}", use_container_width=True, type="primary"):
                    if not st.session_state.user:
                        st.warning("Please login to book a Pandit.")
                        go("login")
                    else:
                        go("booking", selected_pandit_id=p["id"])


# ── booking ────────────────────────────────────────────────────────────────────

def page_booking():
    pandit_id = st.session_state.get("selected_pandit_id")
    if not pandit_id:
        go("home")
        return

    pandit = db.get_pandit_by_id(pandit_id)
    if not pandit:
        go("home")
        return

    puja_types = db.get_puja_types()

    if st.button("← Back to Pandits"):
        go("home")

    st.markdown(f"## 📅 Book {pandit['name']}")
    st.markdown("---")

    left, right = st.columns([1, 2])

    with left:
        st.markdown(f"""
        <div class="pandit-card">
            <h4>🙏 {pandit['name']}</h4>
            <p>{stars(pandit['rating'])} <strong>{pandit['rating']}/5.0</strong></p>
            <p>📿 {pandit['specialization']}</p>
            <p>📍 {pandit['location']}</p>
            <p>🗣️ {pandit['languages']}</p>
            <p>📅 {pandit['experience_years']} years experience</p>
            <p style="margin-top:0.6rem">{pandit['bio']}</p>
            <p style="margin-top:0.6rem"><span class="price-chip">₹{pandit['price_per_puja']}+</span></p>
        </div>
        """, unsafe_allow_html=True)

    with right:
        st.markdown('<div class="section-title">Booking Details</div>', unsafe_allow_html=True)

        with st.form("booking_form"):
            puja_map = {p["name"]: p for p in puja_types}

            # Group puja types by category for display
            categories = {}
            for p in puja_types:
                categories.setdefault(p["category"], []).append(p["name"])

            puja_name = st.selectbox("🙏 Select Puja / Ceremony", list(puja_map.keys()))
            selected_puja = puja_map[puja_name]

            st.info(
                f"📖 {selected_puja['description']}  |  "
                f"⏱️ Duration: {selected_puja['duration_hours']} hrs  |  "
                f"🏷️ {selected_puja['category']}"
            )

            min_date = date.today() + timedelta(days=1)
            max_date = date.today() + timedelta(days=30)
            booking_date = st.date_input(
                "📅 Select Date",
                value=min_date,
                min_value=min_date,
                max_value=max_date,
            )

            booked_slots = db.get_booked_slots(pandit_id, str(booking_date))
            free_slots = [s for s in TIME_SLOTS if s not in booked_slots]

            if not free_slots:
                st.error("⚠️ No time slots available on this date. Please choose another date.")
                time_slot = None
            else:
                time_slot = st.selectbox("⏰ Select Time Slot", free_slots)
                st.caption(f"✅ {len(free_slots)} slots free  |  ❌ {len(booked_slots)} already booked")

            address = st.text_area(
                "🏠 Puja Venue Address",
                placeholder="Enter complete address where puja will be performed…",
                height=90,
            )
            notes = st.text_area(
                "📝 Special Instructions (optional)",
                placeholder="Any specific requirements, samagri preferences, or notes for the Pandit…",
                height=70,
            )

            col_price, col_btn = st.columns([1, 1])
            with col_price:
                st.markdown(f"**Estimated cost:** ₹{pandit['price_per_puja']}+")
                st.caption("Final amount may vary by puja type.")
            with col_btn:
                submitted = st.form_submit_button(
                    "Confirm Booking 🙏", use_container_width=True, type="primary"
                )

            if submitted:
                if not address.strip():
                    st.error("Please enter the puja venue address.")
                elif time_slot is None:
                    st.error("No time slot selected.")
                else:
                    db.create_booking(
                        st.session_state.user["id"],
                        pandit_id,
                        selected_puja["id"],
                        str(booking_date),
                        time_slot,
                        address.strip(),
                        notes.strip(),
                    )
                    st.session_state.booking_success = {
                        "pandit": pandit["name"],
                        "puja": puja_name,
                        "date": str(booking_date),
                        "slot": time_slot.split("(")[0].strip(),
                    }
                    st.balloons()
                    go("my_bookings")


# ── my bookings ────────────────────────────────────────────────────────────────

def page_my_bookings():
    st.markdown("## 📅 My Bookings")

    if st.session_state.get("booking_success"):
        b = st.session_state.booking_success
        st.success(
            f"🎉 Booking Confirmed!  **{b['pandit']}** will perform **{b['puja']}** "
            f"on **{b['date']}** at **{b['slot']}**. 🙏"
        )
        st.session_state.booking_success = None

    bookings = db.get_user_bookings(st.session_state.user["id"])

    if not bookings:
        st.info("You have no bookings yet. 🙏")
        if st.button("Browse Pandits", type="primary"):
            go("home")
        return

    today = date.today()
    total = len(bookings)
    confirmed = sum(1 for b in bookings if b["status"] == "confirmed")
    cancelled = total - confirmed

    c1, c2, c3 = st.columns(3)
    c1.metric("Total Bookings", total)
    c2.metric("✅ Confirmed", confirmed)
    c3.metric("❌ Cancelled", cancelled)
    st.markdown("---")

    upcoming = [
        b for b in bookings
        if b["status"] == "confirmed" and date.fromisoformat(b["booking_date"]) >= today
    ]
    past = [b for b in bookings if b not in upcoming]

    if upcoming:
        st.markdown('<div class="section-title">🔔 Upcoming Bookings</div>', unsafe_allow_html=True)
        for b in upcoming:
            _booking_card(b, show_cancel=True)

    if past:
        st.markdown('<div class="section-title">📜 Past / Cancelled Bookings</div>', unsafe_allow_html=True)
        for b in past:
            _booking_card(b, show_cancel=False)


def _booking_card(b, show_cancel=False):
    status_cls = "confirmed" if b["status"] == "confirmed" else "cancelled"
    status_label = "✅ Confirmed" if b["status"] == "confirmed" else "❌ Cancelled"
    slot_short = b["time_slot"].split("(")[0].strip()

    col_info, col_action = st.columns([5, 1])
    with col_info:
        st.markdown(f"""
        <div class="booking-card {status_cls}">
            <h5>🙏 {b['puja_name']} &nbsp;·&nbsp; {b['pandit_name']}</h5>
            <p>📿 {b['specialization']} &nbsp;|&nbsp; 🏷️ {b['category']}</p>
            <p>📅 {b['booking_date']} &nbsp;&nbsp; ⏰ {slot_short}</p>
            <p>🏠 {b['address'][:100]}{'…' if len(b['address']) > 100 else ''}</p>
            <p class="status-{b['status']}">{status_label}</p>
        </div>
        """, unsafe_allow_html=True)
    with col_action:
        st.markdown("<br><br>", unsafe_allow_html=True)
        if show_cancel:
            if st.button("Cancel", key=f"cancel_{b['id']}"):
                db.cancel_booking(b["id"], st.session_state.user["id"])
                st.rerun()


# ── main ───────────────────────────────────────────────────────────────────────

def main():
    db.init_db()
    init_state()
    st.markdown(CSS, unsafe_allow_html=True)
    sidebar()

    page = st.session_state.page
    if page == "login":
        page_login()
    elif page == "register":
        page_register()
    elif page == "booking":
        if not st.session_state.user:
            go("login")
        else:
            page_booking()
    elif page == "my_bookings":
        if not st.session_state.user:
            go("login")
        else:
            page_my_bookings()
    else:
        page_home()


main()
