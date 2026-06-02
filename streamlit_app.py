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
    text-align: center; font-size: 3rem; font-weight: 900;
    background: linear-gradient(135deg, #c0390b, #ff6b35, #ffd700);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    margin-bottom: 0.2rem;
}
.hero-sub { text-align: center; color: #7a3000; font-size: 1.1rem; margin-bottom: 2rem; }
.pandit-card {
    background: white; border-radius: 16px; padding: 1.4rem 1.6rem;
    box-shadow: 0 4px 18px rgba(192,57,11,0.12); border-left: 5px solid #ff6b35;
    margin-bottom: 0.5rem;
}
.pandit-card h4 { margin: 0 0 0.3rem; color: #3d0c02; font-size: 1.15rem; }
.pandit-card p  { margin: 0.15rem 0; color: #5a2a00; font-size: 0.9rem; }
.price-chip {
    display: inline-block; background: linear-gradient(135deg, #ff6b35, #c0390b);
    color: white; border-radius: 20px; padding: 0.15rem 0.75rem;
    font-weight: 700; font-size: 0.85rem;
}
.avail-chip {
    display: inline-block; background: #e6f4ea; color: #2d6a4f;
    border-radius: 20px; padding: 0.15rem 0.75rem; font-weight: 600;
    font-size: 0.8rem; margin-left: 0.4rem;
}
.pending-chip {
    display: inline-block; background: #fff3e0; color: #e65100;
    border-radius: 20px; padding: 0.15rem 0.75rem; font-weight: 600; font-size: 0.8rem;
}
.suspended-chip {
    display: inline-block; background: #fce4ec; color: #b71c1c;
    border-radius: 20px; padding: 0.15rem 0.75rem; font-weight: 600; font-size: 0.8rem;
}
.booking-card {
    background: white; border-radius: 12px; padding: 1rem 1.3rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.07); border-left: 5px solid #ccc;
    margin-bottom: 0.6rem;
}
.booking-card.confirmed { border-color: #4caf50; }
.booking-card.cancelled { border-color: #f44336; opacity: 0.7; }
.booking-card h5 { margin: 0 0 0.3rem; color: #3d0c02; }
.booking-card p  { margin: 0.1rem 0; color: #5a2a00; font-size: 0.88rem; }
.status-confirmed { color: #2d6a4f; font-weight: 700; }
.status-cancelled { color: #c62828; font-weight: 700; }
.section-title {
    font-size: 1.4rem; font-weight: 700; color: #3d0c02;
    margin: 1.2rem 0 0.6rem; border-bottom: 2px solid #ff6b35; padding-bottom: 0.3rem;
}
.admin-badge {
    display: inline-block; background: #1a237e; color: white;
    border-radius: 6px; padding: 0.1rem 0.5rem; font-size: 0.75rem; font-weight: 700;
}
.pandit-badge {
    display: inline-block; background: #1b5e20; color: white;
    border-radius: 6px; padding: 0.1rem 0.5rem; font-size: 0.75rem; font-weight: 700;
}
.role-user   { background:#e8f5e9; color:#2e7d32; border-radius:10px; padding:0.1rem 0.5rem; font-size:0.75rem; }
.role-pandit { background:#e3f2fd; color:#1565c0; border-radius:10px; padding:0.1rem 0.5rem; font-size:0.75rem; }
.role-admin  { background:#fce4ec; color:#880e4f; border-radius:10px; padding:0.1rem 0.5rem; font-size:0.75rem; }
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
    "All Specialties", "Vedic Rituals", "Marriage", "Katha",
    "Vastu", "Navgraha", "Samskara", "Pitru Karma",
]


# ── session helpers ────────────────────────────────────────────────────────────

def init_state():
    defaults = {
        "user": None, "page": "home",
        "selected_pandit_id": None, "booking_success": None,
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v


def go(page, **kw):
    st.session_state.page = page
    for k, v in kw.items():
        st.session_state[k] = v
    st.rerun()


def role():
    u = st.session_state.get("user")
    return u["role"] if u else None


def require_role(*roles):
    if role() not in roles:
        go("login")


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

        u = st.session_state.user
        if u:
            first = u["name"].split()[0]
            role_label = {"admin": "🔧 Admin", "pandit": "🙏 Pandit", "user": "👤 Devotee"}.get(u["role"], "")
            st.markdown(f"**Namaste, {first}!** {role_label}")
            st.markdown(f"📧 {u['email']}")
            st.markdown("---")

            r = u["role"]
            if r == "admin":
                if st.button("🔧 Admin Panel", use_container_width=True):
                    go("admin_panel")
                if st.button("🏠 Browse Pandits", use_container_width=True):
                    go("home")
            elif r == "pandit":
                if st.button("📊 My Dashboard", use_container_width=True):
                    go("pandit_dashboard")
                if st.button("🏠 Browse Pandits", use_container_width=True):
                    go("home")
            else:
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
            if st.button("📝 Register as Devotee", use_container_width=True):
                go("register")
            if st.button("🙏 Register as Pandit", use_container_width=True):
                go("pandit_register")

        st.markdown("---")
        st.markdown("**📞 Support:** 1800-PANDITJI")
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
                        # Role-based redirect
                        if user["role"] == "admin":
                            go("admin_panel")
                        elif user["role"] == "pandit":
                            go("pandit_dashboard")
                        else:
                            go("home")
                    else:
                        st.error("Invalid email or password. Please try again.")
                else:
                    st.warning("Please enter your email and password.")
        st.markdown("---")
        col_a, col_b = st.columns(2)
        with col_a:
            if st.button("Register as Devotee →", use_container_width=True):
                go("register")
        with col_b:
            if st.button("Register as Pandit →", use_container_width=True):
                go("pandit_register")


# ── devotee register ───────────────────────────────────────────────────────────

def page_register():
    _, col, _ = st.columns([1, 1.4, 1])
    with col:
        st.markdown("## 📝 Register as Devotee")
        st.markdown("Create an account to book pandits for your sacred ceremonies.")
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


# ── pandit self-registration ───────────────────────────────────────────────────

def page_pandit_register():
    _, col, _ = st.columns([1, 2, 1])
    with col:
        st.markdown("## 🙏 Register as Pandit")
        st.markdown(
            "Submit your profile for review. Once approved by our admin, "
            "you will appear in the pandit listing."
        )
        st.info("📋 After registration your profile will be **pending admin approval** before going live.")

        with st.form("pandit_register"):
            st.markdown("**Account Details**")
            name = st.text_input("👤 Full Name (as it will appear to devotees)")
            email = st.text_input("📧 Email Address")
            phone = st.text_input("📱 Phone Number")
            password = st.text_input("🔒 Password", type="password")
            confirm = st.text_input("🔒 Confirm Password", type="password")

            st.markdown("---")
            st.markdown("**Professional Details**")
            specialization = st.text_input("📿 Area of Specialization",
                                            placeholder="e.g. Vedic Rituals & Havan, Marriage Ceremonies…")
            col_a, col_b = st.columns(2)
            with col_a:
                experience_years = st.number_input("📅 Years of Experience", min_value=1, max_value=60, value=5)
            with col_b:
                price_per_puja = st.number_input("💰 Base Price per Puja (₹)", min_value=100, max_value=50000,
                                                  value=1100, step=100)
            languages = st.text_input("🗣️ Languages Spoken",
                                       placeholder="e.g. Hindi, Sanskrit, Bengali")
            location = st.text_input("📍 City / Location", placeholder="e.g. Delhi, Mumbai")
            bio = st.text_area("📖 Short Bio",
                                placeholder="Describe your expertise, training, and services…",
                                height=100)

            submitted = st.form_submit_button("Submit for Approval 🙏", use_container_width=True, type="primary")
            if submitted:
                if not all([name, email, phone, password, confirm, specialization, languages, location, bio]):
                    st.warning("Please fill in all fields.")
                elif password != confirm:
                    st.error("Passwords do not match.")
                elif len(password) < 6:
                    st.error("Password must be at least 6 characters.")
                else:
                    ok, msg = db.create_pandit_user(
                        name.strip(), email.strip(), phone.strip(), password,
                        specialization.strip(), int(experience_years),
                        languages.strip(), location.strip(), bio.strip(), int(price_per_puja),
                    )
                    if ok:
                        st.success(msg)
                        st.balloons()
                        go("login")
                    else:
                        st.error(msg)

        if st.button("← Back to Login"):
            go("login")


# ── home — browse pandits ──────────────────────────────────────────────────────

def page_home():
    st.markdown('<h1 class="hero-title">🕉️ PanditJi</h1>', unsafe_allow_html=True)
    st.markdown(
        '<p class="hero-sub">Book Expert Pandits for Puja, Path, Katha & All Sacred Ceremonies</p>',
        unsafe_allow_html=True,
    )

    col1, col2 = st.columns([3, 2])
    with col1:
        search = st.text_input("🔍 Search", placeholder="Name, specialty, city…", label_visibility="collapsed")
    with col2:
        spec = st.selectbox("Specialty", SPECIALTIES, label_visibility="collapsed")

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
                    elif st.session_state.user["role"] == "pandit":
                        st.warning("Pandits cannot book other pandits.")
                    elif st.session_state.user["role"] == "admin":
                        st.info("Admins can view but cannot make bookings.")
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
            puja_name = st.selectbox("🙏 Select Puja / Ceremony", list(puja_map.keys()))
            selected_puja = puja_map[puja_name]
            st.info(
                f"📖 {selected_puja['description']}  |  "
                f"⏱️ {selected_puja['duration_hours']} hrs  |  🏷️ {selected_puja['category']}"
            )

            min_date = date.today() + timedelta(days=1)
            max_date = date.today() + timedelta(days=30)
            booking_date = st.date_input("📅 Select Date", value=min_date,
                                          min_value=min_date, max_value=max_date)

            booked_slots = db.get_booked_slots(pandit_id, str(booking_date))
            free_slots = [s for s in TIME_SLOTS if s not in booked_slots]
            if not free_slots:
                st.error("⚠️ No time slots available on this date. Please choose another date.")
                time_slot = None
            else:
                time_slot = st.selectbox("⏰ Select Time Slot", free_slots)
                st.caption(f"✅ {len(free_slots)} free  |  ❌ {len(booked_slots)} booked")

            address = st.text_area("🏠 Puja Venue Address",
                                    placeholder="Enter complete address…", height=90)
            notes = st.text_area("📝 Special Instructions (optional)",
                                  placeholder="Samagri requirements, notes for the Pandit…", height=70)

            col_price, col_btn = st.columns([1, 1])
            with col_price:
                st.markdown(f"**Estimated cost:** ₹{pandit['price_per_puja']}+")
                st.caption("Final amount may vary by puja type.")
            with col_btn:
                submitted = st.form_submit_button("Confirm Booking 🙏", use_container_width=True, type="primary")

            if submitted:
                if not address.strip():
                    st.error("Please enter the puja venue address.")
                elif time_slot is None:
                    st.error("No time slot selected.")
                else:
                    db.create_booking(
                        st.session_state.user["id"], pandit_id, selected_puja["id"],
                        str(booking_date), time_slot, address.strip(), notes.strip(),
                    )
                    st.session_state.booking_success = {
                        "pandit": pandit["name"], "puja": puja_name,
                        "date": str(booking_date), "slot": time_slot.split("(")[0].strip(),
                    }
                    st.balloons()
                    go("my_bookings")


# ── my bookings (devotee) ──────────────────────────────────────────────────────

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
    c1, c2, c3 = st.columns(3)
    c1.metric("Total Bookings", total)
    c2.metric("✅ Confirmed", confirmed)
    c3.metric("❌ Cancelled", total - confirmed)
    st.markdown("---")

    upcoming = [b for b in bookings
                if b["status"] == "confirmed" and date.fromisoformat(b["booking_date"]) >= today]
    past = [b for b in bookings if b not in upcoming]

    if upcoming:
        st.markdown('<div class="section-title">🔔 Upcoming Bookings</div>', unsafe_allow_html=True)
        for b in upcoming:
            _booking_card_devotee(b, show_cancel=True)
    if past:
        st.markdown('<div class="section-title">📜 Past / Cancelled Bookings</div>', unsafe_allow_html=True)
        for b in past:
            _booking_card_devotee(b, show_cancel=False)


def _booking_card_devotee(b, show_cancel=False):
    status_cls = "confirmed" if b["status"] == "confirmed" else "cancelled"
    status_label = "✅ Confirmed" if b["status"] == "confirmed" else "❌ Cancelled"
    slot_short = b["time_slot"].split("(")[0].strip()
    col_info, col_act = st.columns([5, 1])
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
    with col_act:
        st.markdown("<br><br>", unsafe_allow_html=True)
        if show_cancel:
            if st.button("Cancel", key=f"cancel_{b['id']}"):
                db.cancel_booking(b["id"], st.session_state.user["id"])
                st.rerun()


# ── pandit dashboard ───────────────────────────────────────────────────────────

def page_pandit_dashboard():
    require_role("pandit")
    u = st.session_state.user
    pandit = db.get_pandit_by_user_id(u["id"])

    if not pandit:
        st.error("Pandit profile not found. Please contact support.")
        return

    st.markdown(f"## 📊 Pandit Dashboard — {pandit['name']}")

    # Status banner
    if pandit["status"] == "pending":
        st.warning("⏳ Your profile is **pending admin approval**. You will appear in search once approved.")
    elif pandit["status"] == "approved":
        st.success("✅ Your profile is **live** and visible to devotees.")
    else:
        st.error("🚫 Your profile has been **suspended**. Please contact admin.")

    tab1, tab2 = st.tabs(["📅 My Bookings", "👤 My Profile"])

    with tab1:
        bookings = db.get_pandit_bookings(pandit["id"])
        if not bookings:
            st.info("No bookings assigned to you yet.")
        else:
            today = date.today()
            confirmed = sum(1 for b in bookings if b["status"] == "confirmed")
            c1, c2, c3 = st.columns(3)
            c1.metric("Total Bookings", len(bookings))
            c2.metric("✅ Confirmed", confirmed)
            c3.metric("❌ Cancelled", len(bookings) - confirmed)
            st.markdown("---")

            upcoming = [b for b in bookings
                        if b["status"] == "confirmed" and date.fromisoformat(b["booking_date"]) >= today]
            past = [b for b in bookings if b not in upcoming]

            if upcoming:
                st.markdown('<div class="section-title">🔔 Upcoming</div>', unsafe_allow_html=True)
                for b in upcoming:
                    _booking_card_pandit(b)
            if past:
                st.markdown('<div class="section-title">📜 Past / Cancelled</div>', unsafe_allow_html=True)
                for b in past:
                    _booking_card_pandit(b)

    with tab2:
        st.markdown("### Edit Your Profile")
        st.caption("Changes will be visible to devotees immediately after saving.")
        with st.form("edit_profile"):
            spec = st.text_input("📿 Specialization", value=pandit["specialization"] or "")
            col_a, col_b = st.columns(2)
            with col_a:
                exp = st.number_input("📅 Experience (years)", min_value=1, max_value=60,
                                       value=int(pandit["experience_years"] or 1))
            with col_b:
                price = st.number_input("💰 Base Price (₹)", min_value=100, max_value=50000,
                                         value=int(pandit["price_per_puja"] or 1100), step=100)
            langs = st.text_input("🗣️ Languages", value=pandit["languages"] or "")
            loc = st.text_input("📍 Location", value=pandit["location"] or "")
            bio = st.text_area("📖 Bio", value=pandit["bio"] or "", height=120)
            avail = st.checkbox("✅ Mark as Available", value=bool(pandit["available"]))
            if st.form_submit_button("Save Changes", type="primary", use_container_width=True):
                db.update_pandit(
                    pandit["id"], pandit["name"], spec, exp, langs, loc, bio, price, int(avail)
                )
                st.success("Profile updated successfully!")
                st.rerun()


def _booking_card_pandit(b):
    status_cls = "confirmed" if b["status"] == "confirmed" else "cancelled"
    status_label = "✅ Confirmed" if b["status"] == "confirmed" else "❌ Cancelled"
    slot_short = b["time_slot"].split("(")[0].strip()
    st.markdown(f"""
    <div class="booking-card {status_cls}">
        <h5>🙏 {b['puja_name']} &nbsp;·&nbsp; {b['devotee_name']}</h5>
        <p>📱 {b.get('devotee_phone', '—')} &nbsp;|&nbsp; 🏷️ {b['category']}</p>
        <p>📅 {b['booking_date']} &nbsp;&nbsp; ⏰ {slot_short}</p>
        <p>🏠 {b['address'][:100]}{'…' if len(b['address']) > 100 else ''}</p>
        {f"<p>📝 {b['special_notes']}</p>" if b.get('special_notes') else ''}
        <p class="status-{b['status']}">{status_label}</p>
    </div>
    """, unsafe_allow_html=True)


# ── admin panel ────────────────────────────────────────────────────────────────

def page_admin_panel():
    require_role("admin")
    st.markdown("## 🔧 Admin Panel")

    tab1, tab2, tab3, tab4 = st.tabs(["📊 Dashboard", "🙏 Pandits", "📅 Bookings", "👥 Users"])

    # ── Tab 1: Dashboard ────────────────────────────────────────────────────────
    with tab1:
        stats = db.get_stats()
        c1, c2, c3, c4, c5, c6 = st.columns(6)
        c1.metric("👤 Users", stats["total_users"])
        c2.metric("🙏 Active Pandits", stats["total_pandits"])
        c3.metric("⏳ Pending Approval", stats["pending_pandits"],
                  delta=f"{stats['pending_pandits']} awaiting" if stats["pending_pandits"] else None,
                  delta_color="inverse")
        c4.metric("📅 Total Bookings", stats["total_bookings"])
        c5.metric("✅ Confirmed", stats["confirmed_bookings"])
        c6.metric("❌ Cancelled", stats["cancelled_bookings"])

        if stats["pending_pandits"] > 0:
            st.warning(f"⚠️ {stats['pending_pandits']} pandit(s) are awaiting approval. Go to the **Pandits** tab.")

    # ── Tab 2: Pandits ──────────────────────────────────────────────────────────
    with tab2:
        pandits = db.get_all_pandits_admin()
        pending = [p for p in pandits if p["status"] == "pending"]
        approved = [p for p in pandits if p["status"] == "approved"]
        suspended = [p for p in pandits if p["status"] == "suspended"]

        # Pending approvals
        if pending:
            st.markdown('<div class="section-title">⏳ Pending Approval</div>', unsafe_allow_html=True)
            for p in pending:
                with st.container():
                    col_info, col_act = st.columns([4, 1])
                    with col_info:
                        st.markdown(f"""
                        <div class="pandit-card" style="border-color:#ff9800;">
                            <h4>🙏 {p['name']} &nbsp; <span class="pending-chip">Pending</span></h4>
                            <p>📿 {p['specialization']} &nbsp;|&nbsp; 📍 {p['location']}</p>
                            <p>🗣️ {p['languages']} &nbsp;|&nbsp; 📅 {p['experience_years']} yrs</p>
                            <p>{p['bio']}</p>
                            <p><span class="price-chip">₹{p['price_per_puja']}+</span></p>
                        </div>
                        """, unsafe_allow_html=True)
                    with col_act:
                        st.markdown("<br><br>", unsafe_allow_html=True)
                        if st.button("✅ Approve", key=f"approve_{p['id']}", use_container_width=True, type="primary"):
                            db.update_pandit_status(p["id"], "approved")
                            st.success(f"{p['name']} approved!")
                            st.rerun()
                        if st.button("❌ Reject", key=f"reject_{p['id']}", use_container_width=True):
                            db.update_pandit_status(p["id"], "suspended")
                            st.rerun()

        # All approved/suspended pandits
        st.markdown('<div class="section-title">🙏 All Pandits</div>', unsafe_allow_html=True)
        for p in approved + suspended:
            status_chip = (
                '<span class="avail-chip">✓ Approved</span>'
                if p["status"] == "approved"
                else '<span class="suspended-chip">✗ Suspended</span>'
            )
            with st.expander(f"🙏 {p['name']} — {p['specialization']} — {p['location']}"):
                with st.form(f"edit_pandit_{p['id']}"):
                    col_a, col_b = st.columns(2)
                    with col_a:
                        e_name = st.text_input("Name", value=p["name"])
                        e_spec = st.text_input("Specialization", value=p["specialization"] or "")
                        e_exp  = st.number_input("Experience (yrs)", min_value=1, max_value=60,
                                                  value=int(p["experience_years"] or 1))
                        e_price = st.number_input("Base Price (₹)", min_value=100, value=int(p["price_per_puja"] or 1100),
                                                   step=100)
                    with col_b:
                        e_langs = st.text_input("Languages", value=p["languages"] or "")
                        e_loc   = st.text_input("Location", value=p["location"] or "")
                        e_avail = st.checkbox("Available", value=bool(p["available"]))
                        e_status = st.selectbox("Status", ["approved", "suspended", "pending"],
                                                 index=["approved", "suspended", "pending"].index(p["status"]))
                    e_bio = st.text_area("Bio", value=p["bio"] or "", height=80)

                    col_save, col_del = st.columns([2, 1])
                    with col_save:
                        if st.form_submit_button("💾 Save Changes", use_container_width=True, type="primary"):
                            db.update_pandit(p["id"], e_name, e_spec, e_exp, e_langs,
                                             e_loc, e_bio, e_price, int(e_avail))
                            db.update_pandit_status(p["id"], e_status)
                            st.success("Saved!")
                            st.rerun()
                    with col_del:
                        if st.form_submit_button("🗑️ Delete", use_container_width=True):
                            db.delete_pandit(p["id"])
                            st.warning(f"{p['name']} deleted.")
                            st.rerun()

        # Add new pandit (admin direct)
        st.markdown('<div class="section-title">➕ Add New Pandit</div>', unsafe_allow_html=True)
        with st.expander("Click to add a new Pandit directly"):
            with st.form("add_pandit"):
                col_a, col_b = st.columns(2)
                with col_a:
                    a_name  = st.text_input("Full Name")
                    a_spec  = st.text_input("Specialization")
                    a_exp   = st.number_input("Experience (yrs)", min_value=1, max_value=60, value=5)
                    a_price = st.number_input("Base Price (₹)", min_value=100, value=1100, step=100)
                with col_b:
                    a_langs = st.text_input("Languages")
                    a_loc   = st.text_input("Location / City")
                a_bio = st.text_area("Bio", height=80)
                if st.form_submit_button("Add Pandit (Auto-Approved)", use_container_width=True, type="primary"):
                    if all([a_name, a_spec, a_langs, a_loc, a_bio]):
                        db.add_pandit_by_admin(a_name, a_spec, int(a_exp), a_langs,
                                               a_loc, a_bio, int(a_price))
                        st.success(f"{a_name} added successfully!")
                        st.rerun()
                    else:
                        st.warning("Please fill in all required fields.")

    # ── Tab 3: Bookings ─────────────────────────────────────────────────────────
    with tab3:
        bookings = db.get_all_bookings_admin()
        if not bookings:
            st.info("No bookings yet.")
        else:
            # Quick filters
            col_f1, col_f2 = st.columns(2)
            with col_f1:
                f_status = st.selectbox("Filter by Status", ["All", "confirmed", "cancelled"])
            with col_f2:
                f_pandit = st.selectbox(
                    "Filter by Pandit",
                    ["All"] + list({b["pandit_name"] for b in bookings}),
                )

            filtered = bookings
            if f_status != "All":
                filtered = [b for b in filtered if b["status"] == f_status]
            if f_pandit != "All":
                filtered = [b for b in filtered if b["pandit_name"] == f_pandit]

            st.markdown(f"**Showing {len(filtered)} of {len(bookings)} bookings**")
            st.markdown("---")

            for b in filtered:
                status_cls = "confirmed" if b["status"] == "confirmed" else "cancelled"
                status_label = "✅ Confirmed" if b["status"] == "confirmed" else "❌ Cancelled"
                slot_short = b["time_slot"].split("(")[0].strip()
                col_info, col_act = st.columns([5, 1])
                with col_info:
                    st.markdown(f"""
                    <div class="booking-card {status_cls}">
                        <h5>🙏 {b['puja_name']} &nbsp;·&nbsp; {b['pandit_name']}</h5>
                        <p>👤 Devotee: <strong>{b['devotee_name']}</strong>
                           &nbsp;|&nbsp; 📱 {b.get('devotee_phone','—')}</p>
                        <p>📅 {b['booking_date']} &nbsp;&nbsp; ⏰ {slot_short}</p>
                        <p>🏠 {b['address'][:90]}{'…' if len(b['address'])>90 else ''}</p>
                        {f"<p>📝 {b['special_notes']}</p>" if b.get('special_notes') else ''}
                        <p class="status-{b['status']}">{status_label}</p>
                    </div>
                    """, unsafe_allow_html=True)
                with col_act:
                    st.markdown("<br><br>", unsafe_allow_html=True)
                    new_status = "cancelled" if b["status"] == "confirmed" else "confirmed"
                    btn_label = "❌ Cancel" if b["status"] == "confirmed" else "✅ Restore"
                    if st.button(btn_label, key=f"admin_b_{b['id']}"):
                        db.admin_update_booking_status(b["id"], new_status)
                        st.rerun()

    # ── Tab 4: Users ────────────────────────────────────────────────────────────
    with tab4:
        users = db.get_all_users()
        st.markdown(f"**{len(users)} registered users**")
        st.markdown("---")

        role_filter = st.selectbox("Filter by Role", ["All", "user", "pandit", "admin"])
        if role_filter != "All":
            users = [u for u in users if u["role"] == role_filter]

        for u in users:
            role_cls = f"role-{u['role']}"
            st.markdown(f"""
            <div style="background:white;border-radius:10px;padding:0.8rem 1.2rem;
                        margin-bottom:0.5rem;box-shadow:0 1px 6px rgba(0,0,0,0.07);">
                <strong>{u['name']}</strong> &nbsp;
                <span class="{role_cls}">{u['role']}</span><br>
                <small>📧 {u['email']} &nbsp;|&nbsp; 📱 {u.get('phone','—')}
                       &nbsp;|&nbsp; 🗓️ Joined {u['created_at'][:10]}</small>
            </div>
            """, unsafe_allow_html=True)


# ── main ───────────────────────────────────────────────────────────────────────

def main():
    db.init_db()
    init_state()
    st.markdown(CSS, unsafe_allow_html=True)
    sidebar()

    page = st.session_state.page
    routes = {
        "login":            page_login,
        "register":         page_register,
        "pandit_register":  page_pandit_register,
        "booking":          lambda: page_booking() if st.session_state.user else go("login"),
        "my_bookings":      lambda: page_my_bookings() if st.session_state.user else go("login"),
        "pandit_dashboard": page_pandit_dashboard,
        "admin_panel":      page_admin_panel,
    }
    routes.get(page, page_home)()


main()
