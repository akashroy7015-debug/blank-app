"""
translations.py — All text used in the app, in English and Hindi.

To add a new language:
  1. Copy the "en" block below.
  2. Change the key from "en" to your language code (e.g. "mr" for Marathi).
  3. Translate every value.
  4. Add a button for it on the language-selection screen in streamlit_app.py.
"""

# ── Puja data ──────────────────────────────────────────────────────────────────
# Each puja has: an icon (emoji), Hindi name, and a short description in both languages.
# Descriptions are written in very simple language for users of all ages.

PUJA_DATA = {
    "Satyanarayan Katha": {
        "icon": "🪔",
        "hi":      "सत्यनारायण कथा",
        "desc_en": "A special prayer for happiness and good luck in your home",
        "desc_hi": "घर में सुख, शांति और समृद्धि के लिए विशेष पूजा",
    },
    "Griha Pravesh Puja": {
        "icon": "🏠",
        "hi":      "गृह प्रवेश पूजा",
        "desc_en": "Sacred ceremony to bless your new home before moving in",
        "desc_hi": "नए घर में प्रवेश से पहले शुभ पूजा अनुष्ठान",
    },
    "Ganesh Puja": {
        "icon": "🐘",
        "hi":      "गणेश पूजा",
        "desc_en": "Worship Lord Ganesha before any new beginning or event",
        "desc_hi": "किसी भी शुभ काम से पहले गणेशजी की पूजा",
    },
    "Navgraha Shanti": {
        "icon": "⭐",
        "hi":      "नवग्रह शांति",
        "desc_en": "Remove bad effects of planets and bring peace in life",
        "desc_hi": "ग्रहों के बुरे प्रभाव दूर करने के लिए शांति पूजा",
    },
    "Vivah (Marriage)": {
        "icon": "💍",
        "hi":      "विवाह संस्कार",
        "desc_en": "Complete Hindu wedding ceremony performed by a learned Pandit",
        "desc_hi": "पूर्ण वैदिक विवाह संस्कार — शादी की पूरी रस्में",
    },
    "Mundan Ceremony": {
        "icon": "✂️",
        "hi":      "मुंडन संस्कार",
        "desc_en": "First hair-cutting ceremony for your baby child",
        "desc_hi": "बच्चे के पहले बाल उतारने का पवित्र संस्कार",
    },
    "Shradh / Pitru Tarpan": {
        "icon": "🙏",
        "hi":      "श्राद्ध / पितृ तर्पण",
        "desc_en": "Prayers and offerings for the peace of departed ancestors",
        "desc_hi": "पूर्वजों की आत्मा की शांति के लिए श्राद्ध और तर्पण",
    },
    "Rudrabhishek": {
        "icon": "🔱",
        "hi":      "रुद्राभिषेक",
        "desc_en": "Sacred bathing and worship of Lord Shiva with holy items",
        "desc_hi": "भगवान शिव का पवित्र जल, दूध और फूलों से अभिषेक",
    },
    "Bhagwat Katha": {
        "icon": "📖",
        "hi":      "भागवत कथा",
        "desc_en": "Recitation of the holy Srimad Bhagwat story at your home",
        "desc_hi": "घर पर श्रीमद् भागवत की पवित्र कथा का आयोजन",
    },
    "Lakshmi Puja": {
        "icon": "🌸",
        "hi":      "लक्ष्मी पूजा",
        "desc_en": "Worship Goddess Lakshmi for wealth, peace, and good fortune",
        "desc_hi": "माँ लक्ष्मी की पूजा — धन, सुख और सौभाग्य के लिए",
    },
    "Vastu Shanti": {
        "icon": "🏡",
        "hi":      "वास्तु शांति",
        "desc_en": "Remove Vastu defects from your home or office",
        "desc_hi": "घर या कार्यालय में वास्तु दोष दूर करने की पूजा",
    },
    "Namkaran Sanskar": {
        "icon": "👶",
        "hi":      "नामकरण संस्कार",
        "desc_en": "Official naming ceremony for your newborn baby",
        "desc_hi": "नवजात शिशु का शुभ नामकरण — नाम रखने की रस्म",
    },
    "Sundarkand Path": {
        "icon": "📿",
        "hi":      "सुंदरकांड पाठ",
        "desc_en": "Reading of the Sundarkand chapter from Ramcharitmanas",
        "desc_hi": "रामचरितमानस के सुंदरकांड का पाठ — सुख और शांति के लिए",
    },
    "Navratri Puja": {
        "icon": "🌺",
        "hi":      "नवरात्रि पूजा",
        "desc_en": "Nine-day Devi puja with all rituals and devotion",
        "desc_hi": "नौ दिन की माँ दुर्गा की पूजा — नवरात्रि अनुष्ठान",
    },
    "Bhoomi Puja": {
        "icon": "⛏️",
        "hi":      "भूमि पूजा",
        "desc_en": "Ceremony to bless land before starting any construction",
        "desc_hi": "निर्माण शुरू करने से पहले भूमि की पूजा",
    },
    "Annaprashan": {
        "icon": "🍚",
        "hi":      "अन्नप्राशन संस्कार",
        "desc_en": "Ceremony when baby eats solid food for the very first time",
        "desc_hi": "बच्चे को पहली बार अन्न खिलाने का पवित्र संस्कार",
    },
    "Ramayan Path": {
        "icon": "🛕",
        "hi":      "रामायण पाठ",
        "desc_en": "Full reading of the holy Ramayan scripture at your home",
        "desc_hi": "घर पर पूर्ण रामायण का पाठ — भक्ति और शांति के लिए",
    },
    "Other / Custom Puja": {
        "icon": "✨",
        "hi":      "अन्य / विशेष पूजा",
        "desc_en": "Any other puja or special ritual — just tell the Panditji",
        "desc_hi": "कोई भी अन्य पूजा — पंडितजी को बताएं, वो करेंगे",
    },
}


# ── Translation strings ────────────────────────────────────────────────────────
# Keep every key in BOTH "en" and "hi". The t() function in the main app
# uses these to show text in the user's chosen language.

TRANSLATIONS = {

    # ── English ────────────────────────────────────────────────────────────────
    "en": {
        # App identity
        "app_name":    "PanditJi",
        "app_tagline": "Book a Pandit for your sacred ceremonies",

        # Language selection screen
        "choose_language": "Please choose your language",
        "lang_en":         "English",
        "lang_hi":         "हिंदी (Hindi)",

        # Sidebar navigation
        "home":               "Home",
        "my_bookings":        "My Bookings",
        "my_dashboard":       "My Dashboard",
        "admin_panel":        "Admin Panel",
        "browse_pandits":     "Browse Pandits",
        "settings_nav":       "⚙️ Settings",
        "logout":             "Logout",
        "login_nav":          "Login",
        "register_as_devotee":"Register as Devotee",
        "register_as_pandit": "Register as Panditji",

        # Login page
        "login_title":    "Login",
        "email_label":    "Email Address",
        "password_label": "Password",
        "login_btn":      "Login 🙏",
        "no_account":     "Don't have an account?",
        "already_account":"Already have an account?",
        "back_to_login":  "← Back to Login",

        # Register devotee page
        "register_devotee_title": "Register — Create Account",
        "register_devotee_sub":   "Create your free account to book a Panditji for your puja.",
        "full_name_label":        "Your Full Name",
        "phone_label":            "Your Phone Number",
        "confirm_password_label": "Repeat Password",
        "register_btn":           "Create Account 🙏",

        # Register pandit page
        "register_pandit_title":  "Register as Panditji",
        "register_pandit_sub":    "Fill in your details. Our team will review and approve your profile.",
        "account_section":        "Step 1 — Your Login Details",
        "professional_section":   "Step 2 — Your Professional Details",
        "specialization_label":   "What are you expert in?",
        "specialization_hint":    "e.g. Vedic Rituals, Wedding Ceremonies, Katha…",
        "experience_label":       "How many years of experience do you have?",
        "languages_label":        "Which languages do you speak?",
        "languages_hint":         "e.g. Hindi, Sanskrit, Bengali",
        "location_label":         "Your City or Area",
        "location_hint":          "e.g. Delhi, Mumbai, Varanasi",
        "about_label":            "Tell us about yourself",
        "about_hint":             "Describe your training, experience, and the pujas you can do…",
        "price_label":            "Your minimum charge per puja (₹)",
        "photo_label":            "Upload your photo",
        "upload_photo_hint":      "A clear, recent photo of yourself (JPG or PNG)",
        "submit_approval_btn":    "Submit for Approval 🙏",
        "pending_message":        "Your registration has been sent for approval. You will be notified once approved.",
        "pending_info_banner":    "ℹ️ After you submit, our team will review your profile. You will appear in search results only after approval.",

        # Home screen (puja selection)
        "choose_puja_title":      "What puja do you need?",
        "choose_puja_sub":        "Tap a puja to book a Panditji",
        "search_puja_placeholder":"Search for a puja…",
        "book_this_puja_btn":     "Book this Puja →",
        "see_all_pandits_btn":    "See All Pandits",

        # Pandit listing page
        "select_pandit_title":    "Choose a Panditji",
        "select_pandit_sub":      "All Pandits are verified and experienced",
        "yrs_exp":                "yrs experience",
        "speaks_label":           "Speaks",
        "rating_label":           "Rating",
        "book_btn":               "Book 🙏",
        "search_pandit_placeholder": "Search by name or city…",

        # Booking form
        "select_puja_label":  "Which puja do you need?",
        "select_date_label":  "Choose a date",
        "select_time_label":  "Choose a time",
        "address_label":      "Where should the Panditji come? (Full address)",
        "address_hint":       "House number, street, area, city — as complete as possible",
        "notes_label":        "Any special requests? (optional)",
        "notes_hint":         "Tell the Panditji anything they should know…",
        "estimated_cost_label":"Estimated cost",
        "confirm_booking_btn":"Confirm Booking 🙏",
        "slots_free_label":   "slots available",
        "slots_booked_label": "already booked",
        "no_slots_msg":       "No free slots on this date. Please pick a different date.",
        "booking_success_title": "🎉 Booking Confirmed!",
        "cost_varies_note":   "Final amount depends on the puja type and duration.",
        "back_to_pandits_btn":"← Back to Pandits",
        "back_to_home_btn":   "← Back to Home",

        # My Bookings page (devotee)
        "my_bookings_title": "My Bookings",
        "upcoming_label":    "🔔 Coming Up",
        "past_label":        "📜 Past & Cancelled",
        "no_bookings_msg":   "You haven't made any bookings yet.",
        "total_label":       "Total",
        "confirmed_label":   "Confirmed",
        "cancelled_label":   "Cancelled",
        "cancel_btn":        "Cancel",
        "status_confirmed":  "✅ Confirmed",
        "status_cancelled":  "❌ Cancelled",
        "devotee_label":     "Devotee",

        # Pandit dashboard
        "pandit_dash_title":       "My Dashboard",
        "profile_pending_msg":     "⏳ Your profile is waiting for admin approval. You will be visible to devotees once approved.",
        "profile_live_msg":        "✅ Your profile is LIVE. Devotees can see you and book you.",
        "profile_deactivated_msg": "🚫 Your profile has been paused by admin. Please contact support.",
        "my_profile_tab":          "My Profile",
        "my_bookings_tab":         "My Bookings",
        "save_btn":                "Save Changes",
        "available_checkbox":      "I am available for bookings right now",

        # Admin panel
        "admin_title":          "Admin Panel",
        "dash_tab":             "📊 Dashboard",
        "pandits_tab":          "🙏 Pandits",
        "bookings_tab":         "📅 Bookings",
        "users_tab":            "👥 Users",
        "stat_users":           "Devotees",
        "stat_pandits":         "Active Pandits",
        "stat_pending":         "Pending Approval",
        "stat_bookings":        "Total Bookings",
        "stat_confirmed":       "Confirmed",
        "stat_cancelled":       "Cancelled",
        "pending_section":      "⏳ Waiting for Approval",
        "all_pandits_section":  "All Pandits",
        "approve_btn":          "✅ Approve",
        "reject_btn":           "❌ Reject",
        "deactivate_btn":       "🚫 Deactivate",
        "reactivate_btn":       "✅ Re-activate",
        "add_pandit_section":   "➕ Add a New Panditji",
        "add_pandit_expander":  "Click here to add a Panditji directly (will be auto-approved)",
        "add_pandit_btn":       "Add Panditji",
        "filter_status_label":  "Filter by status",
        "filter_pandit_label":  "Filter by Panditji",
        "all_option":           "All",
        "restore_btn":          "✅ Restore",
        "cancel_booking_btn":   "❌ Cancel",
        "registered_users_label": "registered users",
        "filter_role_label":    "Filter by type",
        "joined_label":         "Joined",
        "delete_btn":           "🗑️ Delete",
        "save_changes_btn":     "💾 Save Changes",
        "pending_warning_msg":  "pandit(s) are waiting for approval. See the Pandits tab.",
        "no_pandits_msg":       "No pandits found.",
        "no_bookings_admin_msg":"No bookings yet.",
        "no_users_msg":         "No users found.",
        "showing_label":        "Showing",
        "of_label":             "of",

        # Error and success messages
        "err_fill_all":       "Please fill in all the fields.",
        "err_password_match": "The two passwords do not match. Please try again.",
        "err_password_short": "Password must be at least 6 characters long.",
        "err_email_taken":    "This email is already registered. Please log in instead.",
        "err_invalid_login":  "Wrong email or password. Please try again.",
        "err_no_address":     "Please type the address where the puja will happen.",
        "err_no_slot":        "Please choose a time slot.",
        "ok_registered":      "Account created! You can now log in.",
        "ok_booking":         "Your booking is confirmed!",
        "ok_cancelled":       "Booking has been cancelled.",
        "ok_saved":           "Your changes have been saved.",
        "ok_approved":        "Panditji has been approved and is now live.",
        "ok_added":           "Panditji has been added successfully.",
        "ok_deleted":         "Panditji has been removed.",
        "info_login_to_book": "Please log in first to make a booking.",
        "info_admin_no_book": "Admin accounts cannot make bookings.",
        "info_pandit_no_book":"Panditjis cannot book other Panditjis.",

        # Settings page
        "settings_title":      "Settings",
        "language_label":      "App Language",
        "change_language_btn": "Change Language",

        # Support footer
        "support_label": "Need help?",

        # Role display names
        "role_user":   "Devotee",
        "role_pandit": "Panditji",
        "role_admin":  "Admin",

        # Pandit status display names
        "status_approved":    "Approved",
        "status_pending":     "Pending",
        "status_rejected":    "Rejected",
        "status_deactivated": "Deactivated",

        # Time slots — shown on the booking form
        "slot_brahma":   "🌅  6:00 AM – 8:00 AM  (Early Morning)",
        "slot_morning":  "☀️  8:00 AM – 10:00 AM (Morning)",
        "slot_forenoon": "🌤️ 10:00 AM – 12:00 PM (Forenoon)",
        "slot_noon":     "🕛 12:00 PM –  2:00 PM (Afternoon)",
        "slot_evening":  "🌞  4:00 PM –  6:00 PM (Evening)",
        "slot_sandhya":  "🌆  6:00 PM –  8:00 PM (Dusk)",
    },

    # ── Hindi ──────────────────────────────────────────────────────────────────
    "hi": {
        # App identity
        "app_name":    "पंडितजी",
        "app_tagline": "अपने पवित्र अनुष्ठानों के लिए पंडित बुक करें",

        # Language selection screen
        "choose_language": "कृपया अपनी भाषा चुनें",
        "lang_en":         "English",
        "lang_hi":         "हिंदी",

        # Sidebar navigation
        "home":               "होम",
        "my_bookings":        "मेरी बुकिंग",
        "my_dashboard":       "मेरा डैशबोर्ड",
        "admin_panel":        "एडमिन पैनल",
        "browse_pandits":     "पंडित देखें",
        "settings_nav":       "⚙️ सेटिंग्स",
        "logout":             "लॉग आउट",
        "login_nav":          "लॉग इन",
        "register_as_devotee":"श्रद्धालु बनें — रजिस्टर करें",
        "register_as_pandit": "पंडितजी बनें — रजिस्टर करें",

        # Login page
        "login_title":    "लॉग इन करें",
        "email_label":    "ईमेल पता",
        "password_label": "पासवर्ड",
        "login_btn":      "लॉग इन करें 🙏",
        "no_account":     "खाता नहीं है?",
        "already_account":"पहले से खाता है?",
        "back_to_login":  "← वापस लॉग इन पर जाएं",

        # Register devotee page
        "register_devotee_title": "रजिस्टर करें — नया खाता बनाएं",
        "register_devotee_sub":   "पूजा बुक करने के लिए अपना मुफ़्त खाता बनाएं।",
        "full_name_label":        "आपका पूरा नाम",
        "phone_label":            "आपका फ़ोन नंबर",
        "confirm_password_label": "पासवर्ड दोबारा लिखें",
        "register_btn":           "खाता बनाएं 🙏",

        # Register pandit page
        "register_pandit_title":  "पंडितजी के रूप में रजिस्टर करें",
        "register_pandit_sub":    "अपनी जानकारी भरें। हमारी टीम आपकी प्रोफ़ाइल देखकर मंज़ूरी देगी।",
        "account_section":        "कदम 1 — आपके लॉग इन की जानकारी",
        "professional_section":   "कदम 2 — आपकी व्यावसायिक जानकारी",
        "specialization_label":   "आप किस क्षेत्र में माहिर हैं?",
        "specialization_hint":    "जैसे वैदिक अनुष्ठान, विवाह संस्कार, कथा-पाठ…",
        "experience_label":       "आपको कितने साल का अनुभव है?",
        "languages_label":        "आप कौन-कौन सी भाषाएँ बोलते हैं?",
        "languages_hint":         "जैसे हिंदी, संस्कृत, बंगाली",
        "location_label":         "आपका शहर या क्षेत्र",
        "location_hint":          "जैसे दिल्ली, मुंबई, वाराणसी",
        "about_label":            "अपने बारे में बताएं",
        "about_hint":             "अपनी शिक्षा, अनुभव और जो पूजाएं आप करते हैं उनके बारे में लिखें…",
        "price_label":            "एक पूजा का आपका न्यूनतम शुल्क (₹)",
        "photo_label":            "अपनी फ़ोटो अपलोड करें",
        "upload_photo_hint":      "अपनी एक साफ़ और ताज़ी फ़ोटो (JPG या PNG)",
        "submit_approval_btn":    "मंज़ूरी के लिए जमा करें 🙏",
        "pending_message":        "आपका पंजीकरण मंज़ूरी के लिए भेज दिया गया है। मंज़ूरी मिलते ही आपको सूचित किया जाएगा।",
        "pending_info_banner":    "ℹ️ जमा करने के बाद, हमारी टीम आपकी प्रोफ़ाइल देखेगी। मंज़ूरी के बाद ही आप खोज में दिखेंगे।",

        # Home screen (puja selection)
        "choose_puja_title":      "आज आपको कौन सी पूजा चाहिए?",
        "choose_puja_sub":        "पूजा पर टैप करें और पंडितजी बुक करें",
        "search_puja_placeholder":"पूजा का नाम खोजें…",
        "book_this_puja_btn":     "यह पूजा बुक करें →",
        "see_all_pandits_btn":    "सभी पंडित देखें",

        # Pandit listing page
        "select_pandit_title":    "पंडितजी चुनें",
        "select_pandit_sub":      "सभी पंडितजी जाँचे-परखे और अनुभवी हैं",
        "yrs_exp":                "साल का अनुभव",
        "speaks_label":           "भाषाएँ",
        "rating_label":           "रेटिंग",
        "book_btn":               "बुक करें 🙏",
        "search_pandit_placeholder": "नाम या शहर से खोजें…",

        # Booking form
        "select_puja_label":  "कौन सी पूजा चाहिए?",
        "select_date_label":  "तारीख चुनें",
        "select_time_label":  "समय चुनें",
        "address_label":      "पंडितजी कहाँ आएंगे? (पूरा पता)",
        "address_hint":       "मकान नंबर, गली, मोहल्ला, शहर — जितना हो सके पूरा लिखें",
        "notes_label":        "कोई खास बात बताएं? (ज़रूरी नहीं)",
        "notes_hint":         "पंडितजी के लिए कोई ज़रूरी जानकारी हो तो लिखें…",
        "estimated_cost_label":"अनुमानित शुल्क",
        "confirm_booking_btn":"बुकिंग पक्की करें 🙏",
        "slots_free_label":   "समय खाली है",
        "slots_booked_label": "पहले से बुक",
        "no_slots_msg":       "इस तारीख पर कोई समय खाली नहीं है। कोई और तारीख चुनें।",
        "booking_success_title": "🎉 बुकिंग हो गई!",
        "cost_varies_note":   "पूजा के प्रकार और समय के हिसाब से शुल्क बदल सकता है।",
        "back_to_pandits_btn":"← वापस पंडित सूची पर",
        "back_to_home_btn":   "← वापस होम पर",

        # My Bookings page (devotee)
        "my_bookings_title": "मेरी बुकिंग",
        "upcoming_label":    "🔔 आने वाली बुकिंग",
        "past_label":        "📜 पुरानी और रद्द बुकिंग",
        "no_bookings_msg":   "अभी तक कोई बुकिंग नहीं की है।",
        "total_label":       "कुल",
        "confirmed_label":   "पक्की",
        "cancelled_label":   "रद्द",
        "cancel_btn":        "रद्द करें",
        "status_confirmed":  "✅ पक्की",
        "status_cancelled":  "❌ रद्द",
        "devotee_label":     "श्रद्धालु",

        # Pandit dashboard
        "pandit_dash_title":       "मेरा डैशबोर्ड",
        "profile_pending_msg":     "⏳ आपकी प्रोफ़ाइल एडमिन की मंज़ूरी के इंतज़ार में है। मंज़ूरी के बाद आप श्रद्धालुओं को दिखेंगे।",
        "profile_live_msg":        "✅ आपकी प्रोफ़ाइल लाइव है। श्रद्धालु आपको देख और बुक कर सकते हैं।",
        "profile_deactivated_msg": "🚫 आपकी प्रोफ़ाइल एडमिन ने रोक दी है। सहायता के लिए संपर्क करें।",
        "my_profile_tab":          "मेरी प्रोफ़ाइल",
        "my_bookings_tab":         "मेरी बुकिंग",
        "save_btn":                "बदलाव सहेजें",
        "available_checkbox":      "मैं अभी बुकिंग के लिए उपलब्ध हूँ",

        # Admin panel
        "admin_title":          "एडमिन पैनल",
        "dash_tab":             "📊 डैशबोर्ड",
        "pandits_tab":          "🙏 पंडित",
        "bookings_tab":         "📅 बुकिंग",
        "users_tab":            "👥 उपयोगकर्ता",
        "stat_users":           "श्रद्धालु",
        "stat_pandits":         "सक्रिय पंडित",
        "stat_pending":         "मंज़ूरी प्रतीक्षारत",
        "stat_bookings":        "कुल बुकिंग",
        "stat_confirmed":       "पक्की",
        "stat_cancelled":       "रद्द",
        "pending_section":      "⏳ मंज़ूरी की प्रतीक्षा में",
        "all_pandits_section":  "सभी पंडित",
        "approve_btn":          "✅ मंज़ूर करें",
        "reject_btn":           "❌ अस्वीकार करें",
        "deactivate_btn":       "🚫 निष्क्रिय करें",
        "reactivate_btn":       "✅ फिर सक्रिय करें",
        "add_pandit_section":   "➕ नया पंडितजी जोड़ें",
        "add_pandit_expander":  "यहाँ क्लिक करें — पंडितजी को सीधे जोड़ें",
        "add_pandit_btn":       "पंडितजी जोड़ें",
        "filter_status_label":  "स्थिति से छाँटें",
        "filter_pandit_label":  "पंडितजी से छाँटें",
        "all_option":           "सभी",
        "restore_btn":          "✅ वापस लाएं",
        "cancel_booking_btn":   "❌ रद्द करें",
        "registered_users_label": "पंजीकृत उपयोगकर्ता",
        "filter_role_label":    "प्रकार से छाँटें",
        "joined_label":         "जुड़े",
        "delete_btn":           "🗑️ हटाएं",
        "save_changes_btn":     "💾 बदलाव सहेजें",
        "pending_warning_msg":  "पंडित मंज़ूरी की प्रतीक्षा में हैं। पंडित टैब देखें।",
        "no_pandits_msg":       "कोई पंडित नहीं मिला।",
        "no_bookings_admin_msg":"अभी कोई बुकिंग नहीं है।",
        "no_users_msg":         "कोई उपयोगकर्ता नहीं मिला।",
        "showing_label":        "दिख रहे हैं",
        "of_label":             "में से",

        # Error and success messages
        "err_fill_all":       "कृपया सभी ज़रूरी जानकारी भरें।",
        "err_password_match": "दोनों पासवर्ड एक जैसे नहीं हैं। फिर कोशिश करें।",
        "err_password_short": "पासवर्ड कम से कम 6 अक्षर का होना चाहिए।",
        "err_email_taken":    "यह ईमेल पहले से पंजीकृत है। कृपया लॉग इन करें।",
        "err_invalid_login":  "ईमेल या पासवर्ड गलत है। फिर कोशिश करें।",
        "err_no_address":     "कृपया पूजा का पूरा पता लिखें।",
        "err_no_slot":        "कृपया एक समय चुनें।",
        "ok_registered":      "खाता बन गया! अब लॉग इन करें।",
        "ok_booking":         "आपकी बुकिंग पक्की हो गई!",
        "ok_cancelled":       "बुकिंग रद्द हो गई।",
        "ok_saved":           "बदलाव सफलतापूर्वक सहेज लिए गए।",
        "ok_approved":        "पंडितजी को मंज़ूर कर लिया गया। वे अब लाइव हैं।",
        "ok_added":           "पंडितजी सफलतापूर्वक जोड़ दिए गए।",
        "ok_deleted":         "पंडितजी को हटा दिया गया।",
        "info_login_to_book": "बुकिंग करने के लिए पहले लॉग इन करें।",
        "info_admin_no_book": "एडमिन खाते से बुकिंग नहीं की जा सकती।",
        "info_pandit_no_book":"पंडितजी दूसरे पंडितजी को बुक नहीं कर सकते।",

        # Settings page
        "settings_title":      "सेटिंग्स",
        "language_label":      "ऐप की भाषा",
        "change_language_btn": "भाषा बदलें",

        # Support footer
        "support_label": "मदद चाहिए?",

        # Role display names
        "role_user":   "श्रद्धालु",
        "role_pandit": "पंडितजी",
        "role_admin":  "एडमिन",

        # Pandit status display names
        "status_approved":    "मंज़ूर",
        "status_pending":     "प्रतीक्षारत",
        "status_rejected":    "अस्वीकृत",
        "status_deactivated": "निष्क्रिय",

        # Time slots — shown on the booking form
        "slot_brahma":   "🌅  सुबह 6:00 – 8:00  (ब्रह्म मुहूर्त)",
        "slot_morning":  "☀️  सुबह 8:00 – 10:00",
        "slot_forenoon": "🌤️ सुबह 10:00 – दोपहर 12:00",
        "slot_noon":     "🕛 दोपहर 12:00 – 2:00",
        "slot_evening":  "🌞 शाम 4:00 – 6:00",
        "slot_sandhya":  "🌆 संध्या 6:00 – 8:00",
    },
}


# ── Helper functions ───────────────────────────────────────────────────────────

def get_puja_icon(name):
    """Return the emoji icon for a puja. Falls back to the general OM symbol."""
    return PUJA_DATA.get(name, {}).get("icon", "🕉️")


def get_puja_hi_name(name):
    """Return the Hindi name for a puja. Falls back to the English name."""
    return PUJA_DATA.get(name, {}).get("hi", name)


def get_puja_desc(name, lang="en"):
    """Return the puja description in the given language (en or hi)."""
    data = PUJA_DATA.get(name, {})
    if lang == "hi":
        return data.get("desc_hi", data.get("desc_en", ""))
    return data.get("desc_en", "")
