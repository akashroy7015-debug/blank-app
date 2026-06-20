import streamlit as st
import base64
import datetime
from db import (
    login_user, register_user, get_user,
    upsert_profile, get_profile, browse_profiles,
    all_profiles_admin, approve_profile, delete_user,
    send_interest, respond_interest,
    get_interests_received, get_interests_sent,
    interest_status, is_mutual, get_matches, get_stats,
)
from translations import (
    TRANSLATIONS, RELIGIONS, CASTES, MOTHER_TONGUES,
    EDUCATION_LEVELS, PROFESSIONS, INCOME_BRACKETS,
    INDIAN_STATES, HEIGHTS, HEIGHT_CM_TO_LABEL,
)

# ── Page config ───────────────────────────────────────────────────────────────

st.set_page_config(
    page_title="Vivah Milan",
    page_icon="💍",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Session defaults ──────────────────────────────────────────────────────────

def ss(key, default=None):
    if key not in st.session_state:
        st.session_state[key] = default
    return st.session_state[key]


ss("lang", "en")
ss("user", None)
ss("page", "home")
ss("view_uid", None)   # user_id of profile being viewed
ss("msg", None)        # (type, text) flash message


def go(page, uid=None):
    st.session_state.page = page
    if uid is not None:
        st.session_state.view_uid = uid
    st.rerun()


def flash(kind, text):
    st.session_state.msg = (kind, text)


def t(key):
    lang = st.session_state.lang
    return TRANSLATIONS[lang].get(key, TRANSLATIONS["en"].get(key, key))


# ── Helpers ───────────────────────────────────────────────────────────────────

def age_from_dob(dob_str):
    try:
        dob = datetime.date.fromisoformat(dob_str)
        today = datetime.date.today()
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    except Exception:
        return None


def show_photo(b64, size=100):
    if b64:
        st.markdown(
            f'<img src="data:image/jpeg;base64,{b64}" '
            f'style="width:{size}px;height:{size}px;object-fit:cover;border-radius:50%;border:3px solid #e74c8b;">',
            unsafe_allow_html=True,
        )
    else:
        st.markdown(
            f'<div style="width:{size}px;height:{size}px;border-radius:50%;background:#f0e6f6;'
            f'display:flex;align-items:center;justify-content:center;font-size:{size//3}px;border:3px solid #e74c8b;">👤</div>',
            unsafe_allow_html=True,
        )


# ── CSS ───────────────────────────────────────────────────────────────────────

st.markdown("""
<style>
:root {
    --primary: #e74c8b;
    --accent:  #f9a8d4;
    --bg:      #fff8fc;
    --card:    #ffffff;
    --text:    #1a1a2e;
    --muted:   #6b7280;
}
body, .main { background: var(--bg) !important; }

[data-testid="stSidebar"] {
    background: linear-gradient(180deg, #2d1b4e 0%, #1a0a2e 100%) !important;
}
[data-testid="stSidebar"] * { color: #f3e8ff !important; }
[data-testid="stSidebar"] button {
    background: rgba(255,255,255,0.08) !important;
    border: 1px solid rgba(255,255,255,0.15) !important;
    color: #f3e8ff !important;
    border-radius: 8px !important;
    margin-bottom: 4px !important;
    min-height: 44px !important;
}
[data-testid="stSidebar"] button:hover {
    background: rgba(231,76,139,0.3) !important;
}

.hero {
    background: linear-gradient(135deg, #2d1b4e 0%, #e74c8b 100%);
    padding: 3rem 2rem;
    border-radius: 16px;
    color: white;
    text-align: center;
    margin-bottom: 2rem;
}
.hero h1 { font-size: clamp(1.8rem, 4vw, 3rem); margin: 0 0 0.5rem; }
.hero p  { font-size: 1.1rem; opacity: 0.9; margin: 0 0 1.5rem; }

.stat-card {
    background: white;
    border-radius: 12px;
    padding: 1.2rem;
    text-align: center;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    border-top: 4px solid var(--primary);
}
.stat-num  { font-size: 2rem; font-weight: 700; color: var(--primary); }
.stat-label{ font-size: 0.85rem; color: var(--muted); margin-top: 4px; }

.profile-card {
    background: white;
    border-radius: 14px;
    padding: 1.2rem;
    box-shadow: 0 2px 16px rgba(0,0,0,0.08);
    border: 1px solid #f3e8ff;
    height: 100%;
    transition: transform 0.15s;
}
.profile-card:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(0,0,0,0.12); }
.profile-name { font-weight: 700; font-size: 1.05rem; color: var(--text); margin: 8px 0 4px; }
.profile-meta { font-size: 0.82rem; color: var(--muted); line-height: 1.6; }
.badge {
    display:inline-block; padding:2px 10px; border-radius:20px;
    font-size:0.75rem; font-weight:600; margin: 4px 2px;
}
.badge-green  { background:#dcfce7; color:#166534; }
.badge-yellow { background:#fef9c3; color:#854d0e; }
.badge-red    { background:#fee2e2; color:#991b1b; }
.badge-purple { background:#f3e8ff; color:#6b21a8; }
.badge-pink   { background:#fce7f3; color:#9d174d; }

.section-title {
    font-size: 1.4rem; font-weight: 700; color: var(--text);
    border-left: 4px solid var(--primary);
    padding-left: 12px; margin: 1.5rem 0 1rem;
}
.step-card {
    background: white; border-radius: 12px; padding: 1.5rem;
    text-align: center; box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    border: 1px solid #f3e8ff;
}
.step-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }
.step-title { font-weight: 700; color: var(--text); margin-bottom: 0.3rem; }
.step-desc  { font-size: 0.88rem; color: var(--muted); }

.interest-card {
    background: white; border-radius: 12px; padding: 1rem 1.2rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.06); border: 1px solid #f3e8ff;
    margin-bottom: 0.8rem; display: flex; align-items: center; gap: 1rem;
}
.detail-row { padding: 0.5rem 0; border-bottom: 1px solid #f5f5f5; }
.detail-label { font-size: 0.82rem; color: var(--muted); margin-bottom: 2px; }
.detail-value { font-weight: 600; color: var(--text); }

@media (max-width: 640px) {
    .hero { padding: 2rem 1rem; }
    .profile-card { padding: 1rem; }
}
</style>
""", unsafe_allow_html=True)


# ── Sidebar ───────────────────────────────────────────────────────────────────

with st.sidebar:
    # Language toggle
    col_logo, col_lang = st.columns([2, 1])
    with col_logo:
        st.markdown(f"### 💍 {t('app_name')}")
    with col_lang:
        if st.button(t("lang_toggle"), key="lang_btn"):
            st.session_state.lang = "hi" if st.session_state.lang == "en" else "en"
            st.rerun()

    st.markdown(f"*{t('app_tagline')}*")
    st.markdown("---")

    user = st.session_state.user

    if user and user["role"] == "admin":
        if st.button(t("dashboard"),        use_container_width=True): go("admin")
        if st.button(t("manage_profiles"),  use_container_width=True): go("admin_profiles")
        if st.button(t("all_users"),        use_container_width=True): go("admin_users")
        st.markdown("---")
        if st.button(t("logout"),           use_container_width=True):
            st.session_state.user = None; go("home")

    elif user:
        profile = get_profile(user["id"])
        if st.button(t("home"),             use_container_width=True): go("home")
        if st.button(t("browse"),           use_container_width=True): go("browse")
        if st.button(t("interests"),        use_container_width=True): go("interests")
        if st.button(t("matches"),          use_container_width=True): go("matches")
        if st.button(t("my_profile"),       use_container_width=True): go("profile")
        st.markdown("---")
        st.markdown(f"**{user['name']}**")
        if profile:
            status = profile["status"]
            badge = "badge-green" if status == "approved" else "badge-yellow" if status == "pending" else "badge-red"
            st.markdown(f'<span class="badge {badge}">{status.upper()}</span>', unsafe_allow_html=True)
        if st.button(t("logout"),           use_container_width=True):
            st.session_state.user = None; go("home")

    else:
        if st.button(t("home"),             use_container_width=True): go("home")
        if st.button(t("browse"),           use_container_width=True): go("browse")
        st.markdown("---")
        if st.button(t("login_nav"),        use_container_width=True, type="primary"): go("login")
        if st.button(t("register_nav"),     use_container_width=True): go("register")


# ── Flash message ──────────────────────────────────────────────────────────────

if st.session_state.msg:
    kind, text = st.session_state.msg
    if kind == "success":
        st.success(text)
    elif kind == "error":
        st.error(text)
    elif kind == "info":
        st.info(text)
    st.session_state.msg = None


# ── Pages ─────────────────────────────────────────────────────────────────────

page = st.session_state.page


# ── HOME ──────────────────────────────────────────────────────────────────────

if page == "home":
    stats = get_stats()

    st.markdown(f"""
    <div class="hero">
        <h1>💍 {t('hero_title')}</h1>
        <p>{t('hero_sub')}</p>
    </div>
    """, unsafe_allow_html=True)

    if not st.session_state.user:
        col1, col2 = st.columns(2)
        with col1:
            if st.button(t("get_started"), use_container_width=True, type="primary"):
                go("register")
        with col2:
            if st.button(t("login_nav"), use_container_width=True):
                go("login")

    st.markdown("---")
    c1, c2, c3, c4 = st.columns(4)
    for col, num, label in [
        (c1, stats["total"],    t("stat_members")),
        (c2, stats["approved"], t("stat_approved")),
        (c3, stats["matches"],  t("stat_matches")),
        (c4, stats["pending"],  t("stat_pending")),
    ]:
        with col:
            st.markdown(f"""
            <div class="stat-card">
                <div class="stat-num">{num}</div>
                <div class="stat-label">{label}</div>
            </div>""", unsafe_allow_html=True)

    st.markdown(f'<div class="section-title">{t("how_it_works")}</div>', unsafe_allow_html=True)
    s1, s2, s3 = st.columns(3)
    steps = [
        (s1, "📝", t("step1_title"), t("step1_desc")),
        (s2, "🔍", t("step2_title"), t("step2_desc")),
        (s3, "💌", t("step3_title"), t("step3_desc")),
    ]
    for col, icon, title, desc in steps:
        with col:
            st.markdown(f"""
            <div class="step-card">
                <div class="step-icon">{icon}</div>
                <div class="step-title">{title}</div>
                <div class="step-desc">{desc}</div>
            </div>""", unsafe_allow_html=True)


# ── LOGIN ─────────────────────────────────────────────────────────────────────

elif page == "login":
    st.markdown(f"## {t('login')}")
    with st.form("login_form"):
        email = st.text_input(t("email"))
        pwd   = st.text_input(t("password"), type="password")
        sub   = st.form_submit_button(t("login_btn"), use_container_width=True, type="primary")

    if sub:
        user = login_user(email.strip(), pwd)
        if user:
            st.session_state.user = user
            if user["role"] == "admin":
                go("admin")
            else:
                p = get_profile(user["id"])
                go("profile" if not p else "browse")
        else:
            st.error(t("invalid_login"))

    st.markdown("---")
    st.markdown(t("no_account"))
    if st.button(t("register_nav")):
        go("register")


# ── REGISTER ──────────────────────────────────────────────────────────────────

elif page == "register":
    st.markdown(f"## {t('register')}")
    with st.form("reg_form"):
        name  = st.text_input(t("name"))
        email = st.text_input(t("email"))
        phone = st.text_input(t("phone"))
        pwd   = st.text_input(t("password"),         type="password")
        pwd2  = st.text_input(t("confirm_password"), type="password")
        sub   = st.form_submit_button(t("register_btn"), use_container_width=True, type="primary")

    if sub:
        if len(pwd) < 6:
            st.error(t("pw_short"))
        elif pwd != pwd2:
            st.error(t("pw_mismatch"))
        else:
            user, err = register_user(name.strip(), email.strip().lower(), pwd, phone.strip())
            if err == "email_exists":
                st.error(t("email_exists"))
            elif user:
                st.session_state.user = user
                flash("success", t("reg_success"))
                go("profile")

    st.markdown("---")
    st.markdown(t("have_account"))
    if st.button(t("login_nav")):
        go("login")


# ── PROFILE (edit / create) ───────────────────────────────────────────────────

elif page == "profile":
    if not st.session_state.user:
        go("login")

    user    = st.session_state.user
    profile = get_profile(user["id"])

    if profile and profile["status"] == "pending":
        st.info(t("profile_pending"))
    elif profile and profile["status"] == "rejected":
        st.warning(t("profile_rejected"))

    title = t("edit_profile") if profile else t("complete_profile")
    st.markdown(f"## {title}")

    # Pre-fill
    p = profile or {}

    with st.form("profile_form"):
        col1, col2 = st.columns(2)

        with col1:
            st.markdown(f"**{t('gender')}**")
            gender = st.radio(
                t("gender"),
                [t("male"), t("female"), t("other_gender")],
                index=["Male", "Female", "Other"].index(p.get("gender", "Male"))
                      if p.get("gender") else 0,
                horizontal=True,
                label_visibility="collapsed",
            )
            gender_map = {t("male"): "Male", t("female"): "Female", t("other_gender"): "Other"}
            gender = gender_map[gender]

            dob_val = datetime.date.fromisoformat(p["dob"]) if p.get("dob") else datetime.date(1995, 1, 1)
            dob = st.date_input(t("dob"), value=dob_val,
                                min_value=datetime.date(1950, 1, 1),
                                max_value=datetime.date.today() - datetime.timedelta(days=18*365))

            height_label_list = list(HEIGHTS.keys())
            cur_cm = p.get("height_cm")
            cur_label = HEIGHT_CM_TO_LABEL.get(cur_cm, height_label_list[12])
            height_idx = height_label_list.index(cur_label) if cur_label in height_label_list else 12
            height_label = st.selectbox(t("height"), height_label_list, index=height_idx)
            height_cm = HEIGHTS[height_label]

            religion = st.selectbox(t("religion"), RELIGIONS,
                                    index=RELIGIONS.index(p["religion"]) if p.get("religion") in RELIGIONS else 0)
            caste = st.selectbox(t("caste"), CASTES,
                                 index=CASTES.index(p["caste"]) if p.get("caste") in CASTES else 0)
            mother_tongue = st.selectbox(t("mother_tongue"), MOTHER_TONGUES,
                                         index=MOTHER_TONGUES.index(p["mother_tongue"])
                                         if p.get("mother_tongue") in MOTHER_TONGUES else 0)

        with col2:
            education = st.selectbox(t("education"), EDUCATION_LEVELS,
                                     index=EDUCATION_LEVELS.index(p["education"])
                                     if p.get("education") in EDUCATION_LEVELS else 0)
            profession = st.selectbox(t("profession"), PROFESSIONS,
                                      index=PROFESSIONS.index(p["profession"])
                                      if p.get("profession") in PROFESSIONS else 0)
            annual_income = st.selectbox(t("annual_income"), INCOME_BRACKETS,
                                         index=INCOME_BRACKETS.index(p["annual_income"])
                                         if p.get("annual_income") in INCOME_BRACKETS else 0)
            city  = st.text_input(t("city"),  value=p.get("city", ""))
            state = st.selectbox(t("state"), INDIAN_STATES,
                                 index=INDIAN_STATES.index(p["state"])
                                 if p.get("state") in INDIAN_STATES else 0)

            diet_opts = [t("vegetarian"), t("non_veg"), t("eggetarian")]
            diet_map  = {t("vegetarian"): "Vegetarian", t("non_veg"): "Non-Vegetarian", t("eggetarian"): "Eggetarian"}
            rev_diet  = {v: k for k, v in diet_map.items()}
            diet_label = st.selectbox(t("diet"), diet_opts,
                                      index=diet_opts.index(rev_diet.get(p.get("diet", "Vegetarian"), diet_opts[0])))
            diet = diet_map[diet_label]

            yn_opts = [t("no"), t("yes"), t("occasionally")]
            yn_map  = {t("no"): "No", t("yes"): "Yes", t("occasionally"): "Occasionally"}
            rev_yn  = {v: k for k, v in yn_map.items()}

            smoke_label = st.selectbox(t("smoke"), yn_opts,
                                       index=yn_opts.index(rev_yn.get(p.get("smoke", "No"), yn_opts[0])))
            smoke = yn_map[smoke_label]

            drink_label = st.selectbox(t("drink"), yn_opts,
                                       index=yn_opts.index(rev_yn.get(p.get("drink", "No"), yn_opts[0])))
            drink = yn_map[drink_label]

            mang_opts  = [t("mangalik_no"), t("mangalik_yes"), t("mangalik_dont_know")]
            mang_map   = {t("mangalik_no"): "No", t("mangalik_yes"): "Yes", t("mangalik_dont_know"): "Don't Know"}
            rev_mang   = {v: k for k, v in mang_map.items()}
            mang_label = st.selectbox(t("mangalik"), mang_opts,
                                      index=mang_opts.index(rev_mang.get(p.get("mangalik", "No"), mang_opts[0])))
            mangalik = mang_map[mang_label]

        st.markdown("---")
        col3, col4 = st.columns(2)
        with col3:
            ft_opts = [t("joint"), t("nuclear")]
            ft_map  = {t("joint"): "Joint", t("nuclear"): "Nuclear"}
            rev_ft  = {v: k for k, v in ft_map.items()}
            ft_label = st.selectbox(t("family_type"), ft_opts,
                                    index=ft_opts.index(rev_ft.get(p.get("family_type", "Joint"), ft_opts[0])))
            family_type = ft_map[ft_label]

        with col4:
            fv_opts = [t("traditional"), t("moderate"), t("liberal")]
            fv_map  = {t("traditional"): "Traditional", t("moderate"): "Moderate", t("liberal"): "Liberal"}
            rev_fv  = {v: k for k, v in fv_map.items()}
            fv_label = st.selectbox(t("family_values"), fv_opts,
                                    index=fv_opts.index(rev_fv.get(p.get("family_values", "Moderate"), fv_opts[0])))
            family_values = fv_map[fv_label]

        about_me = st.text_area(t("about_me"), value=p.get("about_me", ""),
                                placeholder=t("about_placeholder"), height=120)

        photo_file = st.file_uploader(t("photo"), type=["jpg", "jpeg", "png"])

        submitted = st.form_submit_button(t("save_profile"), use_container_width=True, type="primary")

    if submitted:
        photo_b64 = p.get("photo_base64")
        if photo_file:
            photo_b64 = base64.b64encode(photo_file.read()).decode()

        upsert_profile(user["id"], {
            "gender":        gender,
            "dob":           str(dob),
            "height_cm":     height_cm,
            "religion":      religion,
            "caste":         caste,
            "mother_tongue": mother_tongue,
            "education":     education,
            "profession":    profession,
            "annual_income": annual_income,
            "city":          city.strip(),
            "state":         state,
            "diet":          diet,
            "smoke":         smoke,
            "drink":         drink,
            "mangalik":      mangalik,
            "family_type":   family_type,
            "family_values": family_values,
            "about_me":      about_me.strip(),
            "photo_base64":  photo_b64,
        })
        flash("success", t("profile_saved"))
        go("browse")


# ── BROWSE ────────────────────────────────────────────────────────────────────

elif page == "browse":
    user = st.session_state.user

    st.markdown(f'<div class="section-title">{t("browse")}</div>', unsafe_allow_html=True)

    # Filters
    with st.expander("🔍 Filters", expanded=True):
        fc1, fc2, fc3, fc4, fc5 = st.columns(5)
        with fc1:
            gender_opts = [t("female"), t("male"), t("other_gender")]
            gender_map  = {t("female"): "Female", t("male"): "Male", t("other_gender"): "Other"}
            g_label = st.selectbox(t("filter_gender"), gender_opts, label_visibility="visible")
            f_gender = gender_map[g_label]
        with fc2:
            rel_opts = ["Any"] + RELIGIONS
            f_religion = st.selectbox(t("filter_religion"), rel_opts)
        with fc3:
            state_opts = ["Any"] + INDIAN_STATES
            f_state = st.selectbox(t("filter_state"), state_opts)
        with fc4:
            edu_opts = ["Any"] + EDUCATION_LEVELS
            f_edu = st.selectbox(t("filter_education"), edu_opts)
        with fc5:
            age_range = st.slider(t("filter_age"), 18, 60, (22, 35))

    filters = {
        "gender":    f_gender,
        "religion":  f_religion,
        "state":     f_state,
        "education": f_edu,
        "min_age":   age_range[0],
        "max_age":   age_range[1],
    }

    uid = user["id"] if user else -1
    profiles = browse_profiles(uid, filters)

    if not profiles:
        st.info(t("no_profiles"))
    else:
        cols = st.columns(3)
        for i, prof in enumerate(profiles):
            with cols[i % 3]:
                with st.container():
                    st.markdown('<div class="profile-card">', unsafe_allow_html=True)

                    show_photo(prof.get("photo_base64"), size=80)

                    age = age_from_dob(prof.get("dob", "")) or "?"
                    st.markdown(f'<div class="profile-name">{prof["name"]}</div>', unsafe_allow_html=True)
                    st.markdown(
                        f'<div class="profile-meta">'
                        f'{age} {t("yrs")} &bull; {prof.get("religion", "")} &bull; {prof.get("profession", "")}<br>'
                        f'📍 {prof.get("city", "")}, {prof.get("state", "")}'
                        f'</div>',
                        unsafe_allow_html=True,
                    )

                    col_a, col_b = st.columns(2)
                    with col_a:
                        if st.button(t("view_profile"), key=f"view_{prof['user_id']}",
                                     use_container_width=True):
                            go("view_profile", uid=prof["user_id"])
                    with col_b:
                        if not user:
                            st.button(t("send_interest"), key=f"si_{prof['user_id']}",
                                      disabled=True, use_container_width=True,
                                      help=t("login_to_interact"))
                        else:
                            status = interest_status(user["id"], prof["user_id"])
                            if status == "pending":
                                st.button(t("interest_sent"), key=f"si_{prof['user_id']}",
                                          disabled=True, use_container_width=True)
                            elif status == "accepted":
                                st.button(t("interest_accepted"), key=f"si_{prof['user_id']}",
                                          disabled=True, use_container_width=True)
                            elif status == "declined":
                                st.button(t("interest_declined"), key=f"si_{prof['user_id']}",
                                          disabled=True, use_container_width=True)
                            else:
                                if st.button(t("send_interest"), key=f"si_{prof['user_id']}",
                                             use_container_width=True, type="primary"):
                                    send_interest(user["id"], prof["user_id"])
                                    st.rerun()

                    st.markdown('</div>', unsafe_allow_html=True)
                st.markdown("<br>", unsafe_allow_html=True)


# ── VIEW PROFILE ──────────────────────────────────────────────────────────────

elif page == "view_profile":
    view_uid = st.session_state.view_uid
    if not view_uid:
        go("browse")

    prof = get_profile(view_uid)
    if not prof:
        st.error("Profile not found.")
        if st.button(t("back")): go("browse")
    else:
        if st.button(f"← {t('back')}"):
            go("browse")

        user = st.session_state.user
        mutual = user and is_mutual(user["id"], view_uid)

        col_photo, col_info = st.columns([1, 3])
        with col_photo:
            show_photo(prof.get("photo_base64"), size=150)
        with col_info:
            age = age_from_dob(prof.get("dob", "")) or "?"
            st.markdown(f"## {prof['name']}")
            st.markdown(f"{age} {t('yrs')} &bull; {prof.get('religion', '')} &bull; {prof.get('profession', '')}")
            st.markdown(f"📍 {prof.get('city', '')}, {prof.get('state', '')}")

            if user and user["id"] != view_uid:
                status = interest_status(user["id"], view_uid)
                if status is None:
                    if st.button(t("send_interest"), type="primary"):
                        send_interest(user["id"], view_uid)
                        st.rerun()
                elif status == "pending":
                    st.button(t("interest_sent"), disabled=True)
                elif status == "accepted":
                    st.button(t("interest_accepted"), disabled=True)
                else:
                    st.button(t("interest_declined"), disabled=True)

        st.markdown("---")

        tab1, tab2, tab3, tab4 = st.tabs([
            t("personal_details"), t("career"), t("family"), t("lifestyle")
        ])

        with tab1:
            c1, c2 = st.columns(2)
            with c1:
                for lbl, val in [
                    (t("gender"),       prof.get("gender")),
                    (t("dob"),          prof.get("dob")),
                    (t("height"),       HEIGHT_CM_TO_LABEL.get(prof.get("height_cm"), t("not_specified"))),
                    (t("religion"),     prof.get("religion")),
                    (t("caste"),        prof.get("caste")),
                    (t("mother_tongue"),prof.get("mother_tongue")),
                ]:
                    st.markdown(f'<div class="detail-row"><div class="detail-label">{lbl}</div>'
                                f'<div class="detail-value">{val or t("not_specified")}</div></div>',
                                unsafe_allow_html=True)
            with c2:
                if prof.get("about_me"):
                    st.markdown(f"**{t('about_me')}**")
                    st.write(prof["about_me"])

        with tab2:
            for lbl, val in [
                (t("education"),     prof.get("education")),
                (t("profession"),    prof.get("profession")),
                (t("annual_income"), prof.get("annual_income")),
            ]:
                st.markdown(f'<div class="detail-row"><div class="detail-label">{lbl}</div>'
                            f'<div class="detail-value">{val or t("not_specified")}</div></div>',
                            unsafe_allow_html=True)

        with tab3:
            for lbl, val in [
                (t("city"),          prof.get("city")),
                (t("state"),         prof.get("state")),
                (t("family_type"),   prof.get("family_type")),
                (t("family_values"), prof.get("family_values")),
            ]:
                st.markdown(f'<div class="detail-row"><div class="detail-label">{lbl}</div>'
                            f'<div class="detail-value">{val or t("not_specified")}</div></div>',
                            unsafe_allow_html=True)

        with tab4:
            for lbl, val in [
                (t("diet"),     prof.get("diet")),
                (t("smoke"),    prof.get("smoke")),
                (t("drink"),    prof.get("drink")),
                (t("mangalik"), prof.get("mangalik")),
            ]:
                st.markdown(f'<div class="detail-row"><div class="detail-label">{lbl}</div>'
                            f'<div class="detail-value">{val or t("not_specified")}</div></div>',
                            unsafe_allow_html=True)

        st.markdown("---")
        st.markdown(f"**{t('contact_info')}**")
        if mutual:
            st.success(t("mutual_match"))
            st.markdown(f"📞 {prof.get('phone', t('not_specified'))}")
            st.markdown(f"✉️ {prof.get('email', t('not_specified'))}")
        else:
            st.info(t("contact_visible"))


# ── INTERESTS ─────────────────────────────────────────────────────────────────

elif page == "interests":
    if not st.session_state.user:
        go("login")

    user = st.session_state.user
    st.markdown(f'<div class="section-title">{t("interests")}</div>', unsafe_allow_html=True)

    tab_rcv, tab_snt = st.tabs([t("received"), t("sent")])

    with tab_rcv:
        received = get_interests_received(user["id"])
        if not received:
            st.info(t("no_interests"))
        for r in received:
            with st.container():
                c1, c2, c3 = st.columns([1, 4, 2])
                with c1:
                    show_photo(r.get("photo_base64"), size=60)
                with c2:
                    age = age_from_dob(r.get("dob", "")) or "?"
                    st.markdown(f"**{r['sender_name']}**")
                    st.markdown(f"{age} {t('yrs')} &bull; {r.get('religion','')} &bull; {r.get('profession','')}")
                    st.markdown(f"📍 {r.get('city','')}, {r.get('state','')}")
                with c3:
                    if r["status"] == "pending":
                        if st.button(t("accept"),  key=f"acc_{r['id']}", type="primary"):
                            respond_interest(r["id"], "accepted"); st.rerun()
                        if st.button(t("decline"), key=f"dec_{r['id']}"):
                            respond_interest(r["id"], "declined"); st.rerun()
                    else:
                        badge = "badge-green" if r["status"] == "accepted" else "badge-red"
                        label = t("accepted") if r["status"] == "accepted" else t("declined")
                        st.markdown(f'<span class="badge {badge}">{label}</span>', unsafe_allow_html=True)
                st.markdown("---")

    with tab_snt:
        sent = get_interests_sent(user["id"])
        if not sent:
            st.info(t("no_interests"))
        for r in sent:
            with st.container():
                c1, c2, c3 = st.columns([1, 4, 2])
                with c1:
                    show_photo(r.get("photo_base64"), size=60)
                with c2:
                    age = age_from_dob(r.get("dob", "")) or "?"
                    st.markdown(f"**{r['receiver_name']}**")
                    st.markdown(f"{age} {t('yrs')} &bull; {r.get('religion','')} &bull; {r.get('profession','')}")
                    st.markdown(f"📍 {r.get('city','')}, {r.get('state','')}")
                with c3:
                    badge = "badge-yellow" if r["status"] == "pending" else \
                            "badge-green"  if r["status"] == "accepted" else "badge-red"
                    label = t(r["status"]) if r["status"] in ("pending","accepted","declined") else r["status"]
                    st.markdown(f'<span class="badge {badge}">{label}</span>', unsafe_allow_html=True)
                st.markdown("---")


# ── MATCHES ───────────────────────────────────────────────────────────────────

elif page == "matches":
    if not st.session_state.user:
        go("login")

    user = st.session_state.user
    st.markdown(f'<div class="section-title">{t("my_matches_title")}</div>', unsafe_allow_html=True)

    matches = get_matches(user["id"])
    if not matches:
        st.info(t("no_matches"))
    else:
        for m in matches:
            with st.container():
                c1, c2, c3 = st.columns([1, 4, 2])
                with c1:
                    show_photo(m.get("photo_base64"), size=70)
                with c2:
                    age = age_from_dob(m.get("dob", "")) or "?"
                    st.markdown(f"**{m['name']}**")
                    st.markdown(f"{age} {t('yrs')} &bull; {m.get('religion','')} &bull; {m.get('profession','')}")
                    st.markdown(f"📍 {m.get('city','')}, {m.get('state','')}")
                with c3:
                    st.markdown(f"📞 {m.get('phone', t('not_specified'))}")
                    st.markdown(f"✉️ {m.get('email', t('not_specified'))}")
                    if st.button(t("view_profile"), key=f"mv_{m['user_id']}"):
                        go("view_profile", uid=m["user_id"])
                st.markdown("---")


# ── ADMIN DASHBOARD ───────────────────────────────────────────────────────────

elif page == "admin":
    if not st.session_state.user or st.session_state.user["role"] != "admin":
        go("login")

    st.markdown(f"## {t('admin_panel')}")
    stats = get_stats()
    c1, c2, c3, c4 = st.columns(4)
    for col, num, label in [
        (c1, stats["total"],    t("total_members")),
        (c2, stats["approved"], t("approved_profiles")),
        (c3, stats["pending"],  t("pending_profiles")),
        (c4, stats["matches"],  t("happy_matches")),
    ]:
        with col:
            st.markdown(f"""
            <div class="stat-card">
                <div class="stat-num">{num}</div>
                <div class="stat-label">{label}</div>
            </div>""", unsafe_allow_html=True)

    st.markdown("---")
    st.markdown(f"### {t('manage_profiles')} — {t('pending_profiles')}")
    all_profs = all_profiles_admin()
    pending = [p for p in all_profs if p["status"] == "pending"]

    if not pending:
        st.info(t("no_pending"))
    for p in pending:
        with st.expander(f"{p['name']} — {p.get('city','')}, {p.get('state','')} | {p.get('religion','')} | {p.get('profession','')}"):
            cc1, cc2 = st.columns([1, 3])
            with cc1:
                show_photo(p.get("photo_base64"), size=100)
            with cc2:
                age = age_from_dob(p.get("dob", "")) or "?"
                st.write(f"**{t('age')}:** {age} {t('yrs')}  |  **{t('education')}:** {p.get('education','')}  |  **{t('annual_income')}:** {p.get('annual_income','')}")
                st.write(f"**{t('diet')}:** {p.get('diet','')}  |  **{t('smoke')}:** {p.get('smoke','')}  |  **{t('drink')}:** {p.get('drink','')}")
                st.write(f"**{t('family_type')}:** {p.get('family_type','')}  |  **{t('mangalik')}:** {p.get('mangalik','')}")
                if p.get("about_me"):
                    st.write(f"**{t('about_me')}:** {p['about_me']}")

            ba, br = st.columns(2)
            with ba:
                if st.button(t("approve"), key=f"apr_{p['user_id']}", type="primary"):
                    approve_profile(p["user_id"], "approved")
                    flash("success", t("profile_approved"))
                    st.rerun()
            with br:
                if st.button(t("reject"), key=f"rej_{p['user_id']}"):
                    approve_profile(p["user_id"], "rejected")
                    flash("info", t("profile_rejected_msg"))
                    st.rerun()


# ── ADMIN PROFILES ────────────────────────────────────────────────────────────

elif page == "admin_profiles":
    if not st.session_state.user or st.session_state.user["role"] != "admin":
        go("login")

    st.markdown(f"## {t('manage_profiles')}")
    all_profs = all_profiles_admin()

    status_filter = st.selectbox(t("status"), ["All", "approved", "pending", "rejected"])
    filtered = all_profs if status_filter == "All" else [p for p in all_profs if p["status"] == status_filter]

    for p in filtered:
        badge = "badge-green" if p["status"]=="approved" else "badge-yellow" if p["status"]=="pending" else "badge-red"
        with st.expander(f"{p['name']} — {p.get('city','')}, {p.get('state','')}"):
            c1, c2 = st.columns([1, 4])
            with c1:
                show_photo(p.get("photo_base64"), size=80)
            with c2:
                age = age_from_dob(p.get("dob", "")) or "?"
                st.markdown(f'<span class="badge {badge}">{p["status"].upper()}</span>', unsafe_allow_html=True)
                st.write(f"{age} {t('yrs')} | {p.get('religion','')} | {p.get('profession','')} | {p.get('education','')}")
                st.write(f"✉️ {p['email']}")

            ba, br, bd = st.columns(3)
            with ba:
                if p["status"] != "approved":
                    if st.button(t("approve"), key=f"a2_{p['user_id']}", type="primary"):
                        approve_profile(p["user_id"], "approved"); st.rerun()
            with br:
                if p["status"] != "rejected":
                    if st.button(t("reject"), key=f"r2_{p['user_id']}"):
                        approve_profile(p["user_id"], "rejected"); st.rerun()
            with bd:
                if st.button(t("delete"), key=f"d2_{p['user_id']}"):
                    delete_user(p["user_id"])
                    flash("info", t("user_deleted"))
                    st.rerun()


# ── ADMIN USERS ───────────────────────────────────────────────────────────────

elif page == "admin_users":
    if not st.session_state.user or st.session_state.user["role"] != "admin":
        go("login")

    st.markdown(f"## {t('all_users')}")
    all_profs = all_profiles_admin()

    st.markdown(f"**{len(all_profs)}** profiles registered")
    st.markdown("---")

    for p in all_profs:
        badge = "badge-green" if p["status"]=="approved" else "badge-yellow" if p["status"]=="pending" else "badge-red"
        col1, col2, col3 = st.columns([3, 2, 1])
        with col1:
            age = age_from_dob(p.get("dob", "")) or "?"
            st.markdown(f"**{p['name']}** &nbsp; <span class='badge {badge}'>{p['status'].upper()}</span>", unsafe_allow_html=True)
            st.markdown(f"<small>✉️ {p['email']} &bull; {age} {t('yrs')} &bull; {p.get('city','')}, {p.get('state','')}</small>", unsafe_allow_html=True)
        with col2:
            st.markdown(f"<small>{p.get('religion','')} | {p.get('profession','')}</small>", unsafe_allow_html=True)
        with col3:
            if st.button(t("delete"), key=f"du_{p['user_id']}"):
                delete_user(p["user_id"])
                flash("info", t("user_deleted"))
                st.rerun()
        st.markdown("---")
