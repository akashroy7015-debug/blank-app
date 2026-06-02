"""
streamlit_app.py — Main app file for PanditJi.

How this file is organised:
  1. Imports and page config
  2. CSS styles (mobile-friendly, saffron/gold theme)
  3. Session state helpers (language, user, current page)
  4. Translation helper t()
  5. Sidebar
  6. Language selection screen (first screen the user ever sees)
  7. Login page
  8. Register pages (devotee and pandit)
  9. Home page (puja type selection)
 10. Pandit listing page
 11. Booking form page
 12. My Bookings page (devotee)
 13. Pandit Dashboard
 14. Admin Panel (4 tabs)
 15. Settings page
 16. Main router — decides which page to show
"""

import streamlit as st
from datetime import date, timedelta

import db
from translations import TRANSLATIONS, PUJA_DATA, get_puja_icon, get_puja_hi_name, get_puja_desc

# ══════════════════════════════════════════════════════════════════════════════
# 1. Page configuration
# ══════════════════════════════════════════════════════════════════════════════

st.set_page_config(
    page_title="PanditJi",
    page_icon="🕉️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ══════════════════════════════════════════════════════════════════════════════
# 2. CSS — warm saffron theme, mobile-friendly, large tap targets
# ══════════════════════════════════════════════════════════════════════════════

CSS = """
<style>
/* ── Page background ───────────────────────────────────────────────────────── */
[data-testid="stAppViewContainer"] {
    background: linear-gradient(160deg, #fff8f0 0%, #ffe9cc 100%);
    font-size: 1.05rem;
}

/* ── Sidebar ───────────────────────────────────────────────────────────────── */
[data-testid="stSidebar"] {
    background: linear-gradient(180deg, #3d0c02 0%, #7a1e00 100%);
}
[data-testid="stSidebar"] * { color: #ffe0c0 !important; }
[data-testid="stSidebar"] h3 { color: #ffd700 !important; font-size: 1.3rem; }

/* ── All buttons: large and easy to tap ────────────────────────────────────── */
.stButton > button {
    min-height: 52px !important;
    font-size: 1rem !important;
    border-radius: 12px !important;
    font-weight: 600 !important;
}

/* ── Hero title on home screen ─────────────────────────────────────────────── */
.hero-title {
    text-align: center; font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 900;
    background: linear-gradient(135deg, #c0390b, #ff6b35, #ffd700);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    margin-bottom: 0.1rem;
}
.hero-sub {
    text-align: center; color: #7a3000; font-size: 1.1rem;
    margin-bottom: 1.5rem;
}

/* ── Language selection screen ─────────────────────────────────────────────── */
.lang-screen {
    min-height: 70vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; text-align: center;
    padding: 2rem;
}
.lang-title {
    font-size: clamp(1.8rem, 5vw, 2.8rem); font-weight: 900;
    color: #3d0c02; margin-bottom: 0.5rem;
}
.lang-sub { color: #7a3000; font-size: 1.15rem; margin-bottom: 2.5rem; }

/* ── Puja cards on home screen ─────────────────────────────────────────────── */
.puja-card {
    background: white; border-radius: 16px; padding: 1.1rem 1rem;
    text-align: center; box-shadow: 0 3px 14px rgba(192,57,11,0.12);
    border-top: 4px solid #ff6b35; margin-bottom: 0.3rem;
    min-height: 140px;
}
.puja-card .puja-icon { font-size: 2.4rem; display: block; margin-bottom: 0.4rem; }
.puja-card h5 { margin: 0 0 0.3rem; color: #3d0c02; font-size: 0.98rem; font-weight: 700; }
.puja-card p  { color: #6b3300; font-size: 0.82rem; margin: 0; line-height: 1.35; }

/* ── Pandit cards ───────────────────────────────────────────────────────────── */
.pandit-card {
    background: white; border-radius: 16px; padding: 1.2rem 1.4rem;
    box-shadow: 0 4px 18px rgba(192,57,11,0.12); border-left: 5px solid #ff6b35;
    margin-bottom: 0.4rem;
}
.pandit-card h4 { margin: 0 0 0.25rem; color: #3d0c02; font-size: 1.1rem; }
.pandit-card p  { margin: 0.12rem 0; color: #5a2a00; font-size: 0.9rem; }

/* ── Pandit photo (circle) ──────────────────────────────────────────────────── */
.pandit-photo {
    width: 72px; height: 72px; border-radius: 50%;
    object-fit: cover; border: 3px solid #ff6b35;
    display: block; margin-bottom: 0.5rem;
}
.pandit-avatar {
    width: 72px; height: 72px; border-radius: 50%;
    background: linear-gradient(135deg, #ff6b35, #c0390b);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.6rem; color: white; font-weight: 700;
    border: 3px solid #ff6b35; margin-bottom: 0.5rem;
}

/* ── Price chip ─────────────────────────────────────────────────────────────── */
.price-chip {
    display: inline-block;
    background: linear-gradient(135deg, #ff6b35, #c0390b);
    color: white; border-radius: 20px; padding: 0.15rem 0.8rem;
    font-weight: 700; font-size: 0.88rem;
}
.avail-chip {
    display: inline-block; background: #e6f4ea; color: #2d6a4f;
    border-radius: 20px; padding: 0.15rem 0.75rem;
    font-weight: 600; font-size: 0.8rem; margin-left: 0.4rem;
}
.pending-chip  { display:inline-block; background:#fff3e0; color:#e65100; border-radius:20px; padding:.15rem .75rem; font-weight:600; font-size:.8rem; }
.rejected-chip { display:inline-block; background:#fce4ec; color:#b71c1c; border-radius:20px; padding:.15rem .75rem; font-weight:600; font-size:.8rem; }
.deact-chip    { display:inline-block; background:#eeeeee; color:#555;    border-radius:20px; padding:.15rem .75rem; font-weight:600; font-size:.8rem; }

/* ── Booking cards ──────────────────────────────────────────────────────────── */
.booking-card {
    background: white; border-radius: 12px; padding: 1rem 1.3rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.07); border-left: 5px solid #ccc;
    margin-bottom: 0.5rem;
}
.booking-card.confirmed { border-color: #4caf50; }
.booking-card.cancelled { border-color: #f44336; opacity: 0.7; }
.booking-card h5 { margin: 0 0 0.3rem; color: #3d0c02; font-size: 1rem; }
.booking-card p  { margin: 0.1rem 0; color: #5a2a00; font-size: 0.88rem; }
.status-confirmed { color: #2d6a4f; font-weight: 700; }
.status-cancelled { color: #c62828; font-weight: 700; }

/* ── Section heading ────────────────────────────────────────────────────────── */
.section-title {
    font-size: 1.35rem; font-weight: 700; color: #3d0c02;
    margin: 1rem 0 0.6rem; border-bottom: 2px solid #ff6b35;
    padding-bottom: 0.3rem;
}

/* ── Role / status badges ───────────────────────────────────────────────────── */
.role-user   { background:#e8f5e9; color:#2e7d32; border-radius:10px; padding:.1rem .5rem; font-size:.75rem; }
.role-pandit { background:#e3f2fd; color:#1565c0; border-radius:.5rem; padding:.1rem .5rem; font-size:.75rem; }
.role-admin  { background:#fce4ec; color:#880e4f; border-radius:.5rem; padding:.1rem .5rem; font-size:.75rem; }

/* ── Mobile: stack everything to single column on small screens ─────────────── */
@media (max-width: 640px) {
    .hero-title  { font-size: 2rem; }
    .puja-card   { min-height: 120px; padding: 0.8rem; }
    .pandit-card { padding: 1rem; }
    .stButton > button { min-height: 56px !important; font-size: 1.05rem !important; }
}
</style>
"""

# ══════════════════════════════════════════════════════════════════════════════
# 3. Session state helpers
# ══════════════════════════════════════════════════════════════════════════════

def init_state():
    """Set default values for session variables if they don't exist yet."""
    defaults = {
        "language":          "en",    # chosen language code
        "lang_selected":     False,   # whether the language screen has been passed
        "user":              None,    # logged-in user dict, or None
        "page":              "home",  # current page name
        "selected_puja":     None,    # puja name chosen on home screen
        "selected_pandit_id":None,    # pandit id chosen on pandit list
        "booking_success":   None,    # dict with booking details to show on success
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v


def go(page, **kw):
    """Navigate to a page, optionally setting extra session state values."""
    st.session_state.page = page
    for k, v in kw.items():
        st.session_state[k] = v
    st.rerun()


def user_role():
    """Return the role of the logged-in user, or None."""
    u = st.session_state.get("user")
    return u["role"] if u else None


def require_role(*roles):
    """If the current user doesn't have one of the required roles, send to login."""
    if user_role() not in roles:
        go("login")

# ══════════════════════════════════════════════════════════════════════════════
# 4. Translation helper
# ══════════════════════════════════════════════════════════════════════════════

def t(key):
    """
    Return the translated string for `key` in the current language.
    Falls back to English, then to the key itself if not found.
    """
    lang = st.session_state.get("language", "en")
    return (
        TRANSLATIONS.get(lang, TRANSLATIONS["en"]).get(key)
        or TRANSLATIONS["en"].get(key)
        or key
    )


def stars(rating):
    """Turn a numeric rating like 4.8 into star emojis."""
    full  = int(rating)
    half  = 1 if rating % 1 >= 0.5 else 0
    empty = 5 - full - half
    return "⭐" * full + ("✨" if half else "") + "☆" * empty


def pandit_display_name(name):
    """Short name for use in buttons (remove 'Pt. ' prefix)."""
    return name.replace("Pt. ", "").split()[0]


def photo_html(pandit, size=72):
    """Return an <img> tag if the pandit has a photo, else a letter-avatar div."""
    if pandit.get("photo"):
        return (
            f'<img class="pandit-photo" style="width:{size}px;height:{size}px" '
            f'src="data:image/jpeg;base64,{pandit["photo"]}" alt="photo">'
        )
    initials = "".join(w[0].upper() for w in pandit["name"].split()[:2] if w)
    return (
        f'<div class="pandit-avatar" style="width:{size}px;height:{size}px;'
        f'font-size:{size//2.5:.0f}px">{initials}</div>'
    )


# ══════════════════════════════════════════════════════════════════════════════
# 5. Sidebar
# ══════════════════════════════════════════════════════════════════════════════

def sidebar():
    """Render the left sidebar with navigation buttons based on who is logged in."""
    with st.sidebar:
        st.markdown(f"### 🕉️ {t('app_name')}")
        st.markdown(f"*{t('app_tagline')}*")
        st.markdown("---")

        u = st.session_state.user
        r = user_role()

        if u:
            first = u["name"].split()[0]
            role_label = {"admin": "🔧 Admin", "pandit": "🙏 Panditji", "user": "🪷 Devotee"}.get(r, "")
            st.markdown(f"**{t('namaste') if 'namaste' in TRANSLATIONS['en'] else 'Namaste'}, {first}!**  {role_label}")
            st.markdown("---")

            # Navigation changes based on role
            if r == "admin":
                if st.button(t("admin_panel"),    use_container_width=True): go("admin_panel")
                if st.button(t("browse_pandits"), use_container_width=True): go("pandits")
            elif r == "pandit":
                if st.button(t("my_dashboard"),   use_container_width=True): go("pandit_dashboard")
                if st.button(t("browse_pandits"), use_container_width=True): go("pandits")
            else:
                if st.button(t("home"),           use_container_width=True): go("home")
                if st.button(t("browse_pandits"), use_container_width=True): go("pandits")
                if st.button(t("my_bookings"),    use_container_width=True): go("my_bookings")

            st.markdown("---")
            if st.button(t("settings_nav"), use_container_width=True): go("settings")
            if st.button(t("logout"),        use_container_width=True):
                st.session_state.user = None
                go("home")
        else:
            st.markdown("---")
            if st.button(t("home"),                use_container_width=True): go("home")
            if st.button(t("browse_pandits"),      use_container_width=True): go("pandits")
            st.markdown("---")
            if st.button(t("login_nav"),           use_container_width=True, type="primary"): go("login")
            if st.button(t("register_as_devotee"), use_container_width=True): go("register")
            if st.button(t("register_as_pandit"),  use_container_width=True): go("pandit_register")

        st.markdown("---")
        st.markdown(f"**{t('support_label')}**")
        st.markdown("📞 1800-PANDITJI")
        st.markdown("✉️ help@panditji.in")


# ══════════════════════════════════════════════════════════════════════════════
# 6. Language selection screen
# ══════════════════════════════════════════════════════════════════════════════

def page_language_select():
    """
    First screen shown to new visitors.
    Two big buttons: English and हिंदी.
    Once chosen, this screen is never shown again in the same session.
    """
    st.markdown(CSS, unsafe_allow_html=True)
    st.markdown("""
    <div class="lang-screen">
        <div style="font-size:4rem">🕉️</div>
        <div class="lang-title">PanditJi &nbsp;·&nbsp; पंडितजी</div>
        <div class="lang-sub">Book a Pandit for your sacred ceremonies<br>
             अपनी पूजा के लिए पंडितजी बुक करें</div>
    </div>
    """, unsafe_allow_html=True)

    st.markdown(f"<h3 style='text-align:center;color:#3d0c02'>{t('choose_language')}</h3>",
                unsafe_allow_html=True)

    _, col_en, col_hi, _ = st.columns([1, 1.5, 1.5, 1])
    with col_en:
        if st.button("🇬🇧  English", use_container_width=True, type="primary"):
            st.session_state.language = "en"
            st.session_state.lang_selected = True
            st.rerun()
    with col_hi:
        if st.button("🇮🇳  हिंदी", use_container_width=True, type="primary"):
            st.session_state.language = "hi"
            st.session_state.lang_selected = True
            st.rerun()


# ══════════════════════════════════════════════════════════════════════════════
# 7. Login page
# ══════════════════════════════════════════════════════════════════════════════

def page_login():
    _, col, _ = st.columns([1, 1.4, 1])
    with col:
        st.markdown(f"## 🔐 {t('login_title')}")
        with st.form("login_form"):
            email    = st.text_input(t("email_label"))
            password = st.text_input(t("password_label"), type="password")
            submitted = st.form_submit_button(t("login_btn"), use_container_width=True, type="primary")
            if submitted:
                if email and password:
                    user = db.get_user_by_email(email.strip(), password)
                    if user:
                        st.session_state.user = user
                        # Send each role to their own home
                        if user["role"] == "admin":
                            go("admin_panel")
                        elif user["role"] == "pandit":
                            go("pandit_dashboard")
                        else:
                            go("home")
                    else:
                        st.error(t("err_invalid_login"))
                else:
                    st.warning(t("err_fill_all"))

        st.markdown("---")
        st.markdown(t("no_account"))
        col_a, col_b = st.columns(2)
        with col_a:
            if st.button(t("register_as_devotee"), use_container_width=True): go("register")
        with col_b:
            if st.button(t("register_as_pandit"),  use_container_width=True): go("pandit_register")


# ══════════════════════════════════════════════════════════════════════════════
# 8a. Register as Devotee
# ══════════════════════════════════════════════════════════════════════════════

def page_register():
    _, col, _ = st.columns([1, 1.4, 1])
    with col:
        st.markdown(f"## 📝 {t('register_devotee_title')}")
        st.markdown(t("register_devotee_sub"))
        with st.form("register_form"):
            name     = st.text_input(t("full_name_label"))
            email    = st.text_input(t("email_label"))
            phone    = st.text_input(t("phone_label"))
            password = st.text_input(t("password_label"),         type="password")
            confirm  = st.text_input(t("confirm_password_label"), type="password")
            submitted = st.form_submit_button(t("register_btn"), use_container_width=True, type="primary")
            if submitted:
                if not all([name, email, phone, password, confirm]):
                    st.warning(t("err_fill_all"))
                elif password != confirm:
                    st.error(t("err_password_match"))
                elif len(password) < 6:
                    st.error(t("err_password_short"))
                else:
                    ok, key = db.create_user(name.strip(), email.strip(), password, phone.strip())
                    if ok:
                        st.success(t("ok_registered"))
                        go("login")
                    else:
                        st.error(t(key))
        if st.button(t("back_to_login")): go("login")


# ══════════════════════════════════════════════════════════════════════════════
# 8b. Register as Pandit
# ══════════════════════════════════════════════════════════════════════════════

def page_pandit_register():
    _, col, _ = st.columns([1, 2, 1])
    with col:
        st.markdown(f"## 🙏 {t('register_pandit_title')}")
        st.markdown(t("register_pandit_sub"))
        st.info(t("pending_info_banner"))

        with st.form("pandit_reg_form"):
            # ── Step 1: account details ────────────────────────────────────
            st.markdown(f"**{t('account_section')}**")
            name     = st.text_input(t("full_name_label"))
            email    = st.text_input(t("email_label"))
            phone    = st.text_input(t("phone_label"))
            password = st.text_input(t("password_label"),         type="password")
            confirm  = st.text_input(t("confirm_password_label"), type="password")

            st.markdown("---")

            # ── Step 2: professional details ───────────────────────────────
            st.markdown(f"**{t('professional_section')}**")

            # Photo upload — stored as base64 in the database
            photo_file = st.file_uploader(
                t("photo_label"),
                type=["jpg", "jpeg", "png"],
                help=t("upload_photo_hint"),
            )

            spec = st.text_input(t("specialization_label"), placeholder=t("specialization_hint"))

            col_a, col_b = st.columns(2)
            with col_a:
                exp = st.number_input(t("experience_label"), min_value=1, max_value=60, value=5)
            with col_b:
                price = st.number_input(t("price_label"), min_value=100, max_value=50000,
                                         value=1100, step=100)

            langs = st.text_input(t("languages_label"), placeholder=t("languages_hint"))
            loc   = st.text_input(t("location_label"),  placeholder=t("location_hint"))
            bio   = st.text_area(t("about_label"),       placeholder=t("about_hint"), height=100)

            submitted = st.form_submit_button(t("submit_approval_btn"),
                                               use_container_width=True, type="primary")
            if submitted:
                if not all([name, email, phone, password, confirm, spec, langs, loc, bio]):
                    st.warning(t("err_fill_all"))
                elif password != confirm:
                    st.error(t("err_password_match"))
                elif len(password) < 6:
                    st.error(t("err_password_short"))
                else:
                    photo_b64 = db.encode_photo(photo_file)
                    ok, key = db.create_pandit_user(
                        name.strip(), email.strip(), phone.strip(), password,
                        spec.strip(), int(exp), langs.strip(), loc.strip(),
                        bio.strip(), int(price), photo_b64,
                    )
                    if ok:
                        st.success(t("pending_message"))
                        st.balloons()
                        go("login")
                    else:
                        st.error(t(key))

        if st.button(t("back_to_login")): go("login")


# ══════════════════════════════════════════════════════════════════════════════
# 9. Home page — puja type selection grid
# ══════════════════════════════════════════════════════════════════════════════

def page_home():
    lang = st.session_state.get("language", "en")

    st.markdown(f'<h1 class="hero-title">🕉️ {t("app_name")}</h1>', unsafe_allow_html=True)
    st.markdown(f'<p class="hero-sub">{t("app_tagline")}</p>', unsafe_allow_html=True)

    # Search box at the top
    search = st.text_input(t("search_puja_placeholder"), placeholder=t("search_puja_placeholder"),
                            label_visibility="collapsed")

    # Filter puja list by search
    puja_names = list(PUJA_DATA.keys())
    if search.strip():
        s = search.strip().lower()
        puja_names = [
            p for p in puja_names
            if s in p.lower() or s in PUJA_DATA[p].get("hi", "").lower()
            or s in PUJA_DATA[p].get("desc_en", "").lower()
        ]

    st.markdown(f'<p class="hero-sub">{t("choose_puja_sub")}</p>', unsafe_allow_html=True)

    if not puja_names:
        st.info("No puja found. Try a different search.")
        return

    # Render puja cards in a 2-column grid
    for row_start in range(0, len(puja_names), 2):
        cols = st.columns(2)
        for idx, col in enumerate(cols):
            if row_start + idx >= len(puja_names):
                break
            puja = puja_names[row_start + idx]
            icon = get_puja_icon(puja)
            name_display = get_puja_hi_name(puja) if lang == "hi" else puja
            desc = get_puja_desc(puja, lang)

            with col:
                # The card itself is HTML (for styling); the button is a Streamlit widget
                st.markdown(f"""
                <div class="puja-card">
                    <span class="puja-icon">{icon}</span>
                    <h5>{name_display}</h5>
                    <p>{desc}</p>
                </div>
                """, unsafe_allow_html=True)

                btn_label = t("book_this_puja_btn")
                if st.button(btn_label, key=f"puja_{puja}", use_container_width=True, type="primary"):
                    if not st.session_state.user:
                        st.warning(t("info_login_to_book"))
                        go("login")
                    elif user_role() == "admin":
                        st.info(t("info_admin_no_book"))
                    elif user_role() == "pandit":
                        st.warning(t("info_pandit_no_book"))
                    else:
                        go("pandits", selected_puja=puja)

    st.markdown("---")
    # "See all pandits" shortcut — skips puja pre-selection
    if st.button(t("see_all_pandits_btn"), use_container_width=True):
        go("pandits", selected_puja=None)


# ══════════════════════════════════════════════════════════════════════════════
# 10. Pandit listing page
# ══════════════════════════════════════════════════════════════════════════════

def page_pandits():
    selected_puja = st.session_state.get("selected_puja")
    lang = st.session_state.get("language", "en")

    if st.button(t("back_to_home_btn")):
        go("home")

    # Show the puja context if a puja was chosen
    if selected_puja:
        icon = get_puja_icon(selected_puja)
        name_display = get_puja_hi_name(selected_puja) if lang == "hi" else selected_puja
        st.markdown(f"## {icon} {name_display}")

    st.markdown(f"### {t('select_pandit_title')}")
    st.caption(t("select_pandit_sub"))

    search = st.text_input(t("search_pandit_placeholder"), placeholder=t("search_pandit_placeholder"),
                            label_visibility="collapsed")
    pandits = db.get_all_pandits(search=search.strip())

    if not pandits:
        st.info(t("no_pandits_msg"))
        return

    st.markdown(f"**{len(pandits)} {t('select_pandit_title')}**")
    st.markdown("---")

    # Two-column grid of pandit cards
    for row_start in range(0, len(pandits), 2):
        cols = st.columns(2)
        for idx, col in enumerate(cols):
            if row_start + idx >= len(pandits):
                break
            p = pandits[row_start + idx]
            with col:
                # Photo + details in HTML, Book button as a Streamlit widget
                st.markdown(f"""
                <div class="pandit-card">
                    {photo_html(p)}
                    <h4>🙏 {p['name']}</h4>
                    <p>{stars(p['rating'])} &nbsp;<strong>{p['rating']}/5</strong></p>
                    <p>📿 <strong>{p['specialization']}</strong></p>
                    <p>📅 {p['experience_years']} {t('yrs_exp')} &nbsp;|&nbsp; 📍 {p['location']}</p>
                    <p>🗣️ {t('speaks_label')}: {p['languages']}</p>
                    <p style="margin-top:0.5rem">{p['bio']}</p>
                    <p style="margin-top:0.5rem">
                        <span class="price-chip">₹{p['price_per_puja']}+</span>
                        <span class="avail-chip">✓ Available</span>
                    </p>
                </div>
                """, unsafe_allow_html=True)

                short = pandit_display_name(p["name"])
                if st.button(f"{t('book_btn')} — {short}", key=f"book_{p['id']}",
                             use_container_width=True, type="primary"):
                    go("booking", selected_pandit_id=p["id"])


# ══════════════════════════════════════════════════════════════════════════════
# 11. Booking form
# ══════════════════════════════════════════════════════════════════════════════

# Slot labels come from translations so they display in the right language.
def _time_slots():
    return [
        t("slot_brahma"), t("slot_morning"), t("slot_forenoon"),
        t("slot_noon"),   t("slot_evening"), t("slot_sandhya"),
    ]


def page_booking():
    pandit_id = st.session_state.get("selected_pandit_id")
    if not pandit_id:
        go("home"); return

    pandit     = db.get_pandit_by_id(pandit_id)
    puja_types = db.get_puja_types()
    if not pandit:
        go("home"); return

    lang          = st.session_state.get("language", "en")
    selected_puja = st.session_state.get("selected_puja")

    if st.button(t("back_to_pandits_btn")):
        go("pandits")

    st.markdown(f"## 📅 {t('booking_success_title').replace('🎉','').strip()} — {pandit['name']}")
    st.markdown("---")

    left, right = st.columns([1, 2])

    # ── Left: pandit summary card ────────────────────────────────────────────
    with left:
        st.markdown(f"""
        <div class="pandit-card">
            {photo_html(pandit, size=80)}
            <h4>🙏 {pandit['name']}</h4>
            <p>{stars(pandit['rating'])} <strong>{pandit['rating']}/5.0</strong></p>
            <p>📿 {pandit['specialization']}</p>
            <p>📍 {pandit['location']}</p>
            <p>🗣️ {pandit['languages']}</p>
            <p>📅 {pandit['experience_years']} {t('yrs_exp')}</p>
            <p style="margin-top:0.5rem">{pandit['bio']}</p>
            <p style="margin-top:0.5rem"><span class="price-chip">₹{pandit['price_per_puja']}+</span></p>
        </div>
        """, unsafe_allow_html=True)

    # ── Right: booking form ──────────────────────────────────────────────────
    with right:
        with st.form("booking_form"):
            # Build a friendly puja name list — pre-select if one was chosen
            puja_map      = {p["name"]: p for p in puja_types}
            puja_names    = list(puja_map.keys())
            default_index = puja_names.index(selected_puja) if selected_puja in puja_names else 0

            puja_name = st.selectbox(t("select_puja_label"), puja_names, index=default_index)
            sel_puja  = puja_map[puja_name]

            st.info(
                f"📖 {sel_puja['description']}  |  "
                f"⏱️ {sel_puja['duration_hours']} hrs  |  🏷️ {sel_puja['category']}"
            )

            min_date = date.today() + timedelta(days=1)
            max_date = date.today() + timedelta(days=30)
            booking_date = st.date_input(t("select_date_label"), value=min_date,
                                          min_value=min_date, max_value=max_date)

            booked = db.get_booked_slots(pandit_id, str(booking_date))
            free   = [s for s in _time_slots() if s not in booked]

            if not free:
                st.error(t("no_slots_msg"))
                time_slot = None
            else:
                time_slot = st.selectbox(t("select_time_label"), free)
                st.caption(f"✅ {len(free)} {t('slots_free_label')}  |  ❌ {len(booked)} {t('slots_booked_label')}")

            address = st.text_area(t("address_label"), placeholder=t("address_hint"), height=90)
            notes   = st.text_area(t("notes_label"),   placeholder=t("notes_hint"),   height=70)

            col_cost, col_btn = st.columns([1, 1])
            with col_cost:
                st.markdown(f"**{t('estimated_cost_label')}:** ₹{pandit['price_per_puja']}+")
                st.caption(t("cost_varies_note"))
            with col_btn:
                submitted = st.form_submit_button(t("confirm_booking_btn"),
                                                   use_container_width=True, type="primary")

            if submitted:
                if not address.strip():
                    st.error(t("err_no_address"))
                elif time_slot is None:
                    st.error(t("err_no_slot"))
                else:
                    db.create_booking(
                        st.session_state.user["id"], pandit_id, sel_puja["id"],
                        str(booking_date), time_slot, address.strip(), notes.strip(),
                    )
                    st.session_state.booking_success = {
                        "pandit": pandit["name"],
                        "puja":   puja_name,
                        "date":   str(booking_date),
                        "slot":   time_slot.split("(")[0].strip(),
                    }
                    st.balloons()
                    go("my_bookings")


# ══════════════════════════════════════════════════════════════════════════════
# 12. My Bookings (devotee view)
# ══════════════════════════════════════════════════════════════════════════════

def page_my_bookings():
    st.markdown(f"## 📅 {t('my_bookings_title')}")

    # Show success message if we just came from a booking
    if st.session_state.get("booking_success"):
        b = st.session_state.booking_success
        st.success(
            f"{t('booking_success_title')}  "
            f"**{b['pandit']}** — **{b['puja']}** — {b['date']} — {b['slot']} 🙏"
        )
        st.session_state.booking_success = None

    bookings = db.get_user_bookings(st.session_state.user["id"])

    if not bookings:
        st.info(t("no_bookings_msg"))
        if st.button(t("browse_pandits"), type="primary"):
            go("home")
        return

    today     = date.today()
    total     = len(bookings)
    confirmed = sum(1 for b in bookings if b["status"] == "confirmed")

    c1, c2, c3 = st.columns(3)
    c1.metric(t("total_label"),     total)
    c2.metric(t("confirmed_label"), confirmed)
    c3.metric(t("cancelled_label"), total - confirmed)
    st.markdown("---")

    upcoming = [b for b in bookings
                if b["status"] == "confirmed" and date.fromisoformat(b["booking_date"]) >= today]
    past     = [b for b in bookings if b not in upcoming]

    if upcoming:
        st.markdown(f'<div class="section-title">{t("upcoming_label")}</div>', unsafe_allow_html=True)
        for b in upcoming:
            _booking_card_devotee(b, show_cancel=True)

    if past:
        st.markdown(f'<div class="section-title">{t("past_label")}</div>', unsafe_allow_html=True)
        for b in past:
            _booking_card_devotee(b, show_cancel=False)


def _booking_card_devotee(b, show_cancel=False):
    status_cls   = "confirmed" if b["status"] == "confirmed" else "cancelled"
    status_label = t("status_confirmed") if b["status"] == "confirmed" else t("status_cancelled")
    slot_short   = b["time_slot"].split("(")[0].strip()

    col_info, col_act = st.columns([5, 1])
    with col_info:
        st.markdown(f"""
        <div class="booking-card {status_cls}">
            <h5>🙏 {b['puja_name']} &nbsp;·&nbsp; {b['pandit_name']}</h5>
            <p>📿 {b['specialization']} &nbsp;|&nbsp; 🏷️ {b['category']}</p>
            <p>📅 {b['booking_date']} &nbsp;&nbsp; ⏰ {slot_short}</p>
            <p>🏠 {b['address'][:100]}{'…' if len(b['address'])>100 else ''}</p>
            <p class="status-{b['status']}">{status_label}</p>
        </div>
        """, unsafe_allow_html=True)
    with col_act:
        st.markdown("<br><br>", unsafe_allow_html=True)
        if show_cancel:
            if st.button(t("cancel_btn"), key=f"cancel_{b['id']}"):
                db.cancel_booking(b["id"], st.session_state.user["id"])
                st.success(t("ok_cancelled"))
                st.rerun()


# ══════════════════════════════════════════════════════════════════════════════
# 13. Pandit Dashboard
# ══════════════════════════════════════════════════════════════════════════════

def page_pandit_dashboard():
    require_role("pandit")
    u      = st.session_state.user
    pandit = db.get_pandit_by_user_id(u["id"])

    if not pandit:
        st.error("Profile not found. Please contact support.")
        return

    st.markdown(f"## 📊 {t('pandit_dash_title')} — {pandit['name']}")

    # Profile status banner
    if pandit["status"] == "pending":
        st.warning(t("profile_pending_msg"))
    elif pandit["status"] == "approved":
        st.success(t("profile_live_msg"))
    else:
        st.error(t("profile_deactivated_msg"))

    tab_bookings, tab_profile = st.tabs([t("my_bookings_tab"), t("my_profile_tab")])

    # ── Bookings tab ─────────────────────────────────────────────────────────
    with tab_bookings:
        bookings = db.get_pandit_bookings(pandit["id"])
        if not bookings:
            st.info(t("no_bookings_msg"))
        else:
            today     = date.today()
            confirmed = sum(1 for b in bookings if b["status"] == "confirmed")
            c1, c2, c3 = st.columns(3)
            c1.metric(t("total_label"),     len(bookings))
            c2.metric(t("confirmed_label"), confirmed)
            c3.metric(t("cancelled_label"), len(bookings) - confirmed)
            st.markdown("---")

            upcoming = [b for b in bookings
                        if b["status"] == "confirmed" and date.fromisoformat(b["booking_date"]) >= today]
            past     = [b for b in bookings if b not in upcoming]

            if upcoming:
                st.markdown(f'<div class="section-title">{t("upcoming_label")}</div>',
                            unsafe_allow_html=True)
                for b in upcoming:
                    _booking_card_pandit(b)
            if past:
                st.markdown(f'<div class="section-title">{t("past_label")}</div>',
                            unsafe_allow_html=True)
                for b in past:
                    _booking_card_pandit(b)

    # ── Profile edit tab ─────────────────────────────────────────────────────
    with tab_profile:
        st.markdown(f"### {t('my_profile_tab')}")
        with st.form("edit_profile_form"):
            # Show current photo
            if pandit.get("photo"):
                st.markdown(
                    f'<img class="pandit-photo" style="width:90px;height:90px" '
                    f'src="data:image/jpeg;base64,{pandit["photo"]}" alt="photo">',
                    unsafe_allow_html=True,
                )
            new_photo = st.file_uploader(t("photo_label"), type=["jpg","jpeg","png"])

            spec  = st.text_input(t("specialization_label"), value=pandit["specialization"] or "")
            col_a, col_b = st.columns(2)
            with col_a:
                exp   = st.number_input(t("experience_label"), min_value=1, max_value=60,
                                         value=int(pandit["experience_years"] or 1))
            with col_b:
                price = st.number_input(t("price_label"), min_value=100, max_value=50000,
                                         value=int(pandit["price_per_puja"] or 1100), step=100)
            langs = st.text_input(t("languages_label"), value=pandit["languages"] or "")
            loc   = st.text_input(t("location_label"),  value=pandit["location"] or "")
            bio   = st.text_area(t("about_label"),       value=pandit["bio"] or "", height=110)
            avail = st.checkbox(t("available_checkbox"), value=bool(pandit["available"]))

            if st.form_submit_button(t("save_btn"), type="primary", use_container_width=True):
                # Update photo only if a new one was uploaded
                photo_b64 = db.encode_photo(new_photo) if new_photo else pandit.get("photo")
                db.update_pandit(pandit["id"], pandit["name"], spec, int(exp), langs,
                                  loc, bio, int(price), int(avail))
                # Save photo separately
                conn = db.get_conn()
                conn.execute("UPDATE pandits SET photo=? WHERE id=?", (photo_b64, pandit["id"]))
                conn.commit(); conn.close()
                st.success(t("ok_saved"))
                st.rerun()


def _booking_card_pandit(b):
    """Booking card shown on the pandit's dashboard — shows devotee info."""
    status_cls   = "confirmed" if b["status"] == "confirmed" else "cancelled"
    status_label = t("status_confirmed") if b["status"] == "confirmed" else t("status_cancelled")
    slot_short   = b["time_slot"].split("(")[0].strip()
    st.markdown(f"""
    <div class="booking-card {status_cls}">
        <h5>🙏 {b['puja_name']} &nbsp;·&nbsp; {b['devotee_name']}</h5>
        <p>📱 {b.get('devotee_phone','—')} &nbsp;|&nbsp; 🏷️ {b['category']}</p>
        <p>📅 {b['booking_date']} &nbsp;&nbsp; ⏰ {slot_short}</p>
        <p>🏠 {b['address'][:100]}{'…' if len(b['address'])>100 else ''}</p>
        {f"<p>📝 {b['special_notes']}</p>" if b.get('special_notes') else ''}
        <p class="status-{b['status']}">{status_label}</p>
    </div>
    """, unsafe_allow_html=True)


# ══════════════════════════════════════════════════════════════════════════════
# 14. Admin Panel (4 tabs)
# ══════════════════════════════════════════════════════════════════════════════

def page_admin_panel():
    require_role("admin")
    st.markdown(f"## 🔧 {t('admin_title')}")

    tab_dash, tab_pandits, tab_bookings, tab_users = st.tabs([
        t("dash_tab"), t("pandits_tab"), t("bookings_tab"), t("users_tab"),
    ])

    # ── Dashboard tab ─────────────────────────────────────────────────────────
    with tab_dash:
        s = db.get_stats()
        c1,c2,c3,c4,c5,c6 = st.columns(6)
        c1.metric(t("stat_users"),     s["total_users"])
        c2.metric(t("stat_pandits"),   s["total_pandits"])
        c3.metric(t("stat_pending"),   s["pending_pandits"],
                  delta=f"{s['pending_pandits']} new" if s["pending_pandits"] else None,
                  delta_color="inverse")
        c4.metric(t("stat_bookings"),  s["total_bookings"])
        c5.metric(t("stat_confirmed"), s["confirmed_bookings"])
        c6.metric(t("stat_cancelled"), s["cancelled_bookings"])

        if s["pending_pandits"] > 0:
            st.warning(f"⚠️ {s['pending_pandits']} {t('pending_warning_msg')}")

    # ── Pandits tab ───────────────────────────────────────────────────────────
    with tab_pandits:
        all_pandits = db.get_all_pandits_admin()
        pending   = [p for p in all_pandits if p["status"] == "pending"]
        rest      = [p for p in all_pandits if p["status"] != "pending"]

        # Pending approvals section
        if pending:
            st.markdown(f'<div class="section-title">{t("pending_section")}</div>',
                        unsafe_allow_html=True)
            for p in pending:
                col_info, col_act = st.columns([4, 1])
                with col_info:
                    st.markdown(f"""
                    <div class="pandit-card" style="border-color:#ff9800">
                        <div style="display:flex;gap:12px;align-items:flex-start">
                            {photo_html(p, size=60)}
                            <div>
                                <h4>🙏 {p['name']} &nbsp; <span class="pending-chip">{t('status_pending')}</span></h4>
                                <p>📿 {p['specialization']} &nbsp;|&nbsp; 📍 {p['location']}</p>
                                <p>🗣️ {p['languages']} &nbsp;|&nbsp; 📅 {p['experience_years']} {t('yrs_exp')}</p>
                                <p style="margin-top:0.3rem">{p['bio']}</p>
                                <p><span class="price-chip">₹{p['price_per_puja']}+</span></p>
                            </div>
                        </div>
                    </div>
                    """, unsafe_allow_html=True)
                with col_act:
                    st.markdown("<br>", unsafe_allow_html=True)
                    if st.button(t("approve_btn"), key=f"ap_{p['id']}", use_container_width=True, type="primary"):
                        db.update_pandit_status(p["id"], "approved")
                        st.success(t("ok_approved")); st.rerun()
                    if st.button(t("reject_btn"),  key=f"rj_{p['id']}", use_container_width=True):
                        db.update_pandit_status(p["id"], "rejected")
                        st.rerun()

        # All approved / deactivated pandits
        st.markdown(f'<div class="section-title">{t("all_pandits_section")}</div>',
                    unsafe_allow_html=True)

        if not rest:
            st.info(t("no_pandits_msg"))
        else:
            for p in rest:
                status_chip = {
                    "approved":    f'<span class="avail-chip">✓ {t("status_approved")}</span>',
                    "rejected":    f'<span class="rejected-chip">✗ {t("status_rejected")}</span>',
                    "deactivated": f'<span class="deact-chip">— {t("status_deactivated")}</span>',
                }.get(p["status"], "")

                with st.expander(f"🙏 {p['name']} — {p['specialization']} — {p['location']}"):
                    col_ph, col_form = st.columns([1, 4])
                    with col_ph:
                        st.markdown(photo_html(p, size=80), unsafe_allow_html=True)
                        # Deactivate / reactivate toggle
                        if p["status"] == "approved":
                            if st.button(t("deactivate_btn"), key=f"deact_{p['id']}", use_container_width=True):
                                db.update_pandit_status(p["id"], "deactivated"); st.rerun()
                        else:
                            if st.button(t("reactivate_btn"), key=f"react_{p['id']}", use_container_width=True, type="primary"):
                                db.update_pandit_status(p["id"], "approved"); st.rerun()

                    with col_form:
                        with st.form(f"edit_p_{p['id']}"):
                            c_a, c_b = st.columns(2)
                            with c_a:
                                e_name  = st.text_input("Name",           value=p["name"])
                                e_spec  = st.text_input("Specialization", value=p["specialization"] or "")
                                e_exp   = st.number_input("Exp (yrs)", min_value=1, max_value=60,
                                                           value=int(p["experience_years"] or 1))
                                e_price = st.number_input("Price (₹)", min_value=100,
                                                           value=int(p["price_per_puja"] or 1100), step=100)
                            with c_b:
                                e_langs = st.text_input("Languages", value=p["languages"] or "")
                                e_loc   = st.text_input("Location",  value=p["location"] or "")
                                e_avail = st.checkbox("Available",   value=bool(p["available"]))
                            e_bio = st.text_area("Bio", value=p["bio"] or "", height=70)

                            c_save, c_del = st.columns([2,1])
                            with c_save:
                                if st.form_submit_button(t("save_changes_btn"),
                                                          use_container_width=True, type="primary"):
                                    db.update_pandit(p["id"], e_name, e_spec, int(e_exp), e_langs,
                                                      e_loc, e_bio, int(e_price), int(e_avail))
                                    st.success(t("ok_saved")); st.rerun()
                            with c_del:
                                if st.form_submit_button(t("delete_btn"), use_container_width=True):
                                    db.delete_pandit(p["id"])
                                    st.warning(t("ok_deleted")); st.rerun()

        # Add new pandit directly (admin shortcut — auto-approved)
        st.markdown(f'<div class="section-title">{t("add_pandit_section")}</div>',
                    unsafe_allow_html=True)
        with st.expander(t("add_pandit_expander")):
            with st.form("add_pandit_form"):
                c_a, c_b = st.columns(2)
                with c_a:
                    a_name  = st.text_input("Full Name")
                    a_spec  = st.text_input("Specialization")
                    a_exp   = st.number_input("Experience (yrs)", min_value=1, max_value=60, value=5)
                    a_price = st.number_input("Base Price (₹)", min_value=100, value=1100, step=100)
                with c_b:
                    a_langs = st.text_input("Languages")
                    a_loc   = st.text_input("City / Location")
                a_bio = st.text_area("Bio / About", height=80)
                if st.form_submit_button(t("add_pandit_btn"), use_container_width=True, type="primary"):
                    if all([a_name, a_spec, a_langs, a_loc, a_bio]):
                        db.add_pandit_by_admin(a_name, a_spec, int(a_exp), a_langs,
                                               a_loc, a_bio, int(a_price))
                        st.success(t("ok_added")); st.rerun()
                    else:
                        st.warning(t("err_fill_all"))

    # ── Bookings tab ──────────────────────────────────────────────────────────
    with tab_bookings:
        bookings = db.get_all_bookings_admin()
        if not bookings:
            st.info(t("no_bookings_admin_msg"))
        else:
            # Filters
            c_f1, c_f2 = st.columns(2)
            with c_f1:
                f_status = st.selectbox(t("filter_status_label"),
                                         [t("all_option"), "confirmed", "cancelled"])
            with c_f2:
                f_pandit = st.selectbox(t("filter_pandit_label"),
                                         [t("all_option")] + list({b["pandit_name"] for b in bookings}))
            filt = bookings
            if f_status != t("all_option"): filt = [b for b in filt if b["status"] == f_status]
            if f_pandit != t("all_option"): filt = [b for b in filt if b["pandit_name"] == f_pandit]

            st.caption(f"{t('showing_label')} {len(filt)} {t('of_label')} {len(bookings)}")
            st.markdown("---")

            for b in filt:
                status_cls   = "confirmed" if b["status"] == "confirmed" else "cancelled"
                status_label = t("status_confirmed") if b["status"] == "confirmed" else t("status_cancelled")
                slot_short   = b["time_slot"].split("(")[0].strip()
                c_info, c_act = st.columns([5, 1])
                with c_info:
                    st.markdown(f"""
                    <div class="booking-card {status_cls}">
                        <h5>🙏 {b['puja_name']} &nbsp;·&nbsp; {b['pandit_name']}</h5>
                        <p>👤 {t('devotee_label')}: <strong>{b['devotee_name']}</strong>
                           &nbsp;|&nbsp; 📱 {b.get('devotee_phone','—')}</p>
                        <p>📅 {b['booking_date']} &nbsp;&nbsp; ⏰ {slot_short}</p>
                        <p>🏠 {b['address'][:90]}{'…' if len(b['address'])>90 else ''}</p>
                        {f"<p>📝 {b['special_notes']}</p>" if b.get('special_notes') else ''}
                        <p class="status-{b['status']}">{status_label}</p>
                    </div>
                    """, unsafe_allow_html=True)
                with c_act:
                    st.markdown("<br><br>", unsafe_allow_html=True)
                    new_s  = "cancelled" if b["status"] == "confirmed" else "confirmed"
                    btn_lbl= t("cancel_booking_btn") if b["status"] == "confirmed" else t("restore_btn")
                    if st.button(btn_lbl, key=f"ab_{b['id']}"):
                        db.admin_update_booking_status(b["id"], new_s); st.rerun()

    # ── Users tab ─────────────────────────────────────────────────────────────
    with tab_users:
        users = db.get_all_users()
        if not users:
            st.info(t("no_users_msg"))
        else:
            role_opts = [t("all_option"), "user", "pandit", "admin"]
            f_role = st.selectbox(t("filter_role_label"), role_opts)
            if f_role != t("all_option"):
                users = [u for u in users if u["role"] == f_role]

            st.caption(f"{len(users)} {t('registered_users_label')}")
            st.markdown("---")

            for u in users:
                role_cls = f"role-{u['role']}"
                role_name = t(f"role_{u['role']}")
                st.markdown(f"""
                <div style="background:white;border-radius:10px;padding:.8rem 1.2rem;
                            margin-bottom:.4rem;box-shadow:0 1px 6px rgba(0,0,0,.07);">
                    <strong>{u['name']}</strong> &nbsp;
                    <span class="{role_cls}">{role_name}</span><br>
                    <small>📧 {u['email']} &nbsp;|&nbsp; 📱 {u.get('phone','—')}
                           &nbsp;|&nbsp; 🗓️ {t('joined_label')} {u['created_at'][:10]}</small>
                </div>
                """, unsafe_allow_html=True)


# ══════════════════════════════════════════════════════════════════════════════
# 15. Settings page
# ══════════════════════════════════════════════════════════════════════════════

def page_settings():
    st.markdown(f"## ⚙️ {t('settings_title')}")
    st.markdown(f"**{t('language_label')}**")

    lang = st.session_state.get("language", "en")
    current = "🇬🇧 English" if lang == "en" else "🇮🇳 हिंदी"
    st.markdown(f"Current: **{current}**")
    st.markdown("---")

    col_en, col_hi = st.columns(2)
    with col_en:
        if st.button("🇬🇧  English", use_container_width=True,
                     type="primary" if lang == "en" else "secondary"):
            st.session_state.language = "en"
            st.rerun()
    with col_hi:
        if st.button("🇮🇳  हिंदी", use_container_width=True,
                     type="primary" if lang == "hi" else "secondary"):
            st.session_state.language = "hi"
            st.rerun()


# ══════════════════════════════════════════════════════════════════════════════
# 16. Main router — decides which page to show
# ══════════════════════════════════════════════════════════════════════════════

def main():
    # Set up database (creates tables and seeds data on first run)
    db.init_db()

    # Set up session state defaults
    init_state()

    # Inject CSS styles
    st.markdown(CSS, unsafe_allow_html=True)

    # ── First screen: language selection ────────────────────────────────────
    # If the user has not chosen a language yet, show that screen and stop.
    if not st.session_state.lang_selected:
        page_language_select()
        return

    # ── Sidebar (always visible after language is chosen) ───────────────────
    sidebar()

    # ── Route to the correct page ────────────────────────────────────────────
    page = st.session_state.page

    # Pages that need authentication — redirect to login if not logged in
    auth_pages = {"booking", "my_bookings", "pandit_dashboard", "admin_panel"}
    if page in auth_pages and not st.session_state.user:
        go("login")
        return

    # Page dispatch table
    pages = {
        "home":              page_home,
        "login":             page_login,
        "register":          page_register,
        "pandit_register":   page_pandit_register,
        "pandits":           page_pandits,
        "booking":           page_booking,
        "my_bookings":       page_my_bookings,
        "pandit_dashboard":  page_pandit_dashboard,
        "admin_panel":       page_admin_panel,
        "settings":          page_settings,
    }

    pages.get(page, page_home)()


# Entry point
main()
