'use client'

import { useState, useEffect } from 'react'
import ImageUploader from '@/components/ImageUploader'
import AnalysisResult from '@/components/AnalysisResult'
import OpenerGenerator from '@/components/OpenerGenerator'
import { FREE_LIMIT } from '@/lib/usage'
import { Sparkles, AlertCircle, Crown, Infinity, Coins, Lock, ImageIcon, MessageSquarePlus, Camera, CalendarDays, Zap } from 'lucide-react'
import Link from 'next/link'
import { createBrowserClient } from '@/lib/supabase'
import { useLanguage, type Lang } from '@/lib/language'

const dashCopy: Record<Lang, {
  badge: string; analyzeTitle: string; analyzeSpan: string; openerTitle: string; openerSpan: string
  analyzeDesc: string; openerDesc: string; analyzeMode: string; openerMode: string
  accountStatus: string; upgrade: string; plan: string; renewsIn: string; resetsIn: string
  analyses: string; credits: string; freeLeft: string; limitMsg: string; getCredits: string
  loginTitle: string; loginDesc: string; signUp: string; logIn: string
  hint: string; analyzing: string; analyzeCta: string
}> = {
  en: {
    badge: 'AI Dating Coach',
    analyzeTitle: 'Analyze Your', analyzeSpan: 'Chat',
    openerTitle: 'Write an', openerSpan: 'Opener',
    analyzeDesc: 'Upload a screenshot to get 4 perfect replies, a compatibility score, and expert strategy',
    openerDesc: "Describe your match's profile and get 4 personalized opening lines — no screenshot needed",
    analyzeMode: 'Analyze Chat', openerMode: 'Write Opener',
    accountStatus: 'Account Status', upgrade: 'Upgrade',
    plan: 'Plan', renewsIn: 'Renews in', resetsIn: 'Resets in',
    analyses: 'Analyses', credits: 'Credits', freeLeft: 'Free left',
    limitMsg: 'Daily limit reached — buy credits or upgrade to continue',
    getCredits: 'Get Credits',
    loginTitle: 'Create a free account to start',
    loginDesc: 'Sign up free to get 3 analyses every day — no card required.',
    signUp: 'Sign Up Free', logIn: 'Log In',
    hint: 'Try uploading any chat screenshot from Tinder, Bumble, Hinge, Instagram DMs, or WhatsApp.',
    analyzing: 'Analyzing...', analyzeCta: 'Analyze My Chat',
  },
  hi: {
    badge: 'AI Dating Coach',
    analyzeTitle: 'Analyze Karo Apna', analyzeSpan: 'Chat',
    openerTitle: 'Likho Ek', openerSpan: 'Opener',
    analyzeDesc: 'Screenshot upload karo — 4 perfect replies, compatibility score aur expert strategy pao',
    openerDesc: 'Match ka profile describe karo aur 4 personalized opening lines pao — koi screenshot nahi chahiye',
    analyzeMode: 'Chat Analyze', openerMode: 'Opener Likho',
    accountStatus: 'Account Status', upgrade: 'Upgrade Karo',
    plan: 'Plan', renewsIn: 'Renew hoga', resetsIn: 'Reset hoga',
    analyses: 'Analyses', credits: 'Credits', freeLeft: 'Free bache',
    limitMsg: 'Aaj ki limit khatam — credits kharido ya upgrade karo',
    getCredits: 'Credits Lo',
    loginTitle: 'Free account banao shuru karne ke liye',
    loginDesc: 'Free signup karo aur roz 3 analyses pao — koi card nahi chahiye.',
    signUp: 'Free Signup', logIn: 'Log In',
    hint: 'Koi bhi chat screenshot upload karo — Tinder, Bumble, Hinge, Instagram DMs, ya WhatsApp.',
    analyzing: 'Analyze ho raha hai...', analyzeCta: 'Mera Chat Analyze Karo',
  },
  es: {
    badge: 'Coach de Citas IA',
    analyzeTitle: 'Analiza tu', analyzeSpan: 'Chat',
    openerTitle: 'Escribe un', openerSpan: 'Opener',
    analyzeDesc: 'Sube una captura de pantalla para obtener 4 respuestas perfectas, una puntuación de compatibilidad y estrategia experta',
    openerDesc: 'Describe el perfil de tu match y obtén 4 líneas de apertura personalizadas — sin captura de pantalla',
    analyzeMode: 'Analizar Chat', openerMode: 'Escribir Opener',
    accountStatus: 'Estado de Cuenta', upgrade: 'Mejorar Plan',
    plan: 'Plan', renewsIn: 'Se renueva en', resetsIn: 'Se reinicia en',
    analyses: 'Análisis', credits: 'Créditos', freeLeft: 'Gratis restantes',
    limitMsg: 'Límite diario alcanzado — compra créditos o mejora para continuar',
    getCredits: 'Obtener Créditos',
    loginTitle: 'Crea una cuenta gratis para empezar',
    loginDesc: 'Regístrate gratis para obtener 3 análisis cada día — sin tarjeta requerida.',
    signUp: 'Registrarse Gratis', logIn: 'Iniciar Sesión',
    hint: 'Sube cualquier captura de chat de Tinder, Bumble, Hinge, Instagram DMs o WhatsApp.',
    analyzing: 'Analizando...', analyzeCta: 'Analizar mi Chat',
  },
  fr: {
    badge: 'Coach Dating IA',
    analyzeTitle: 'Analyse ton', analyzeSpan: 'Chat',
    openerTitle: 'Écris un', openerSpan: 'Opener',
    analyzeDesc: 'Télécharge une capture d\'écran pour obtenir 4 réponses parfaites, un score de compatibilité et une stratégie d\'expert',
    openerDesc: 'Décris le profil de ton match et obtiens 4 lignes d\'ouverture personnalisées — sans capture d\'écran',
    analyzeMode: 'Analyser le Chat', openerMode: 'Écrire un Opener',
    accountStatus: 'Statut du Compte', upgrade: 'Améliorer',
    plan: 'Plan', renewsIn: 'Renouvellement dans', resetsIn: 'Réinitialisation dans',
    analyses: 'Analyses', credits: 'Crédits', freeLeft: 'Gratuits restants',
    limitMsg: 'Limite quotidienne atteinte — achetez des crédits ou améliorez pour continuer',
    getCredits: 'Obtenir des Crédits',
    loginTitle: 'Crée un compte gratuit pour commencer',
    loginDesc: 'Inscris-toi gratuitement pour obtenir 3 analyses par jour — aucune carte requise.',
    signUp: "S'inscrire Gratuitement", logIn: 'Se connecter',
    hint: 'Essaie de télécharger une capture de chat de Tinder, Bumble, Hinge, Instagram DMs ou WhatsApp.',
    analyzing: 'Analyse en cours...', analyzeCta: 'Analyser mon Chat',
  },
  pt: {
    badge: 'Coach de Encontros IA',
    analyzeTitle: 'Analise seu', analyzeSpan: 'Chat',
    openerTitle: 'Escreva um', openerSpan: 'Opener',
    analyzeDesc: 'Envie uma captura de tela para obter 4 respostas perfeitas, uma pontuação de compatibilidade e estratégia especializada',
    openerDesc: 'Descreva o perfil do seu match e obtenha 4 linhas de abertura personalizadas — sem captura de tela',
    analyzeMode: 'Analisar Chat', openerMode: 'Escrever Opener',
    accountStatus: 'Status da Conta', upgrade: 'Fazer Upgrade',
    plan: 'Plano', renewsIn: 'Renova em', resetsIn: 'Reinicia em',
    analyses: 'Análises', credits: 'Créditos', freeLeft: 'Grátis restantes',
    limitMsg: 'Limite diário atingido — compre créditos ou faça upgrade para continuar',
    getCredits: 'Obter Créditos',
    loginTitle: 'Crie uma conta gratuita para começar',
    loginDesc: 'Cadastre-se gratuitamente para obter 3 análises por dia — sem cartão necessário.',
    signUp: 'Cadastrar Grátis', logIn: 'Entrar',
    hint: 'Tente enviar qualquer captura de chat do Tinder, Bumble, Hinge, Instagram DMs ou WhatsApp.',
    analyzing: 'Analisando...', analyzeCta: 'Analisar meu Chat',
  },
  ar: {
    badge: 'مدرب المواعدة الذكي',
    analyzeTitle: 'حلّل', analyzeSpan: 'محادثتك',
    openerTitle: 'اكتب', openerSpan: 'رسالة افتتاحية',
    analyzeDesc: 'ارفع لقطة شاشة للحصول على 4 ردود مثالية ودرجة توافق واستراتيجية من الخبراء',
    openerDesc: 'صف ملف تعريف مطابقتك واحصل على 4 جمل افتتاحية مخصصة — بدون لقطة شاشة',
    analyzeMode: 'تحليل المحادثة', openerMode: 'كتابة افتتاحية',
    accountStatus: 'حالة الحساب', upgrade: 'ترقية',
    plan: 'الخطة', renewsIn: 'يتجدد في', resetsIn: 'يُعاد ضبطه في',
    analyses: 'تحليلات', credits: 'رصيد', freeLeft: 'مجاناً متبقي',
    limitMsg: 'تم الوصول إلى الحد اليومي — اشترِ رصيداً أو قم بالترقية للمتابعة',
    getCredits: 'احصل على رصيد',
    loginTitle: 'أنشئ حساباً مجانياً للبدء',
    loginDesc: 'سجّل مجاناً للحصول على 3 تحليلات كل يوم — لا حاجة لبطاقة.',
    signUp: 'التسجيل مجاناً', logIn: 'تسجيل الدخول',
    hint: 'جرّب رفع أي لقطة محادثة من Tinder أو Bumble أو Hinge أو Instagram أو WhatsApp.',
    analyzing: 'جاري التحليل...', analyzeCta: 'حلّل محادثتي',
  },
  de: {
    badge: 'KI Dating Coach',
    analyzeTitle: 'Analysiere deinen', analyzeSpan: 'Chat',
    openerTitle: 'Schreibe einen', openerSpan: 'Opener',
    analyzeDesc: 'Lade einen Screenshot hoch und erhalte 4 perfekte Antworten, einen Kompatibilitätsscore und Expertenstrategien',
    openerDesc: 'Beschreibe das Profil deines Matches und erhalte 4 personalisierte Eröffnungszeilen — kein Screenshot erforderlich',
    analyzeMode: 'Chat analysieren', openerMode: 'Opener schreiben',
    accountStatus: 'Kontostatus', upgrade: 'Upgrade',
    plan: 'Plan', renewsIn: 'Verlängerung in', resetsIn: 'Zurücksetzung in',
    analyses: 'Analysen', credits: 'Credits', freeLeft: 'Kostenlos übrig',
    limitMsg: 'Tageslimit erreicht — kaufe Credits oder mache ein Upgrade, um fortzufahren',
    getCredits: 'Credits kaufen',
    loginTitle: 'Erstelle ein kostenloses Konto, um zu starten',
    loginDesc: 'Melde dich kostenlos an und erhalte täglich 3 Analysen — keine Karte erforderlich.',
    signUp: 'Kostenlos registrieren', logIn: 'Anmelden',
    hint: 'Lade einen Chat-Screenshot von Tinder, Bumble, Hinge, Instagram DMs oder WhatsApp hoch.',
    analyzing: 'Analysiere...', analyzeCta: 'Meinen Chat analysieren',
  },
  zh: {
    badge: 'AI 约会教练',
    analyzeTitle: '分析你的', analyzeSpan: '聊天',
    openerTitle: '写一条', openerSpan: '开场白',
    analyzeDesc: '上传截图，获得4条完美回复、兼容性评分和专家策略',
    openerDesc: '描述你的匹配对象资料，获得4条个性化开场白 — 无需截图',
    analyzeMode: '分析聊天', openerMode: '写开场白',
    accountStatus: '账户状态', upgrade: '升级',
    plan: '套餐', renewsIn: '续费于', resetsIn: '重置于',
    analyses: '分析次数', credits: '积分', freeLeft: '免费剩余',
    limitMsg: '已达每日上限 — 购买积分或升级以继续',
    getCredits: '获取积分',
    loginTitle: '创建免费账户开始使用',
    loginDesc: '免费注册，每天获得3次分析 — 无需银行卡。',
    signUp: '免费注册', logIn: '登录',
    hint: '尝试上传来自Tinder、Bumble、Hinge、Instagram私信或WhatsApp的聊天截图。',
    analyzing: '分析中...', analyzeCta: '分析我的聊天',
  },
  ja: {
    badge: 'AI デーティングコーチ',
    analyzeTitle: 'チャットを', analyzeSpan: '分析する',
    openerTitle: '最初の', openerSpan: 'メッセージを書く',
    analyzeDesc: 'スクリーンショットをアップロードして、4つの完璧な返信、相性スコア、専門家の戦略を取得',
    openerDesc: 'マッチ相手のプロフィールを説明して、4つの個人化されたオープナーを取得 — スクリーンショット不要',
    analyzeMode: 'チャットを分析', openerMode: 'オープナーを書く',
    accountStatus: 'アカウント状況', upgrade: 'アップグレード',
    plan: 'プラン', renewsIn: '更新まで', resetsIn: 'リセットまで',
    analyses: '分析', credits: 'クレジット', freeLeft: '無料残り',
    limitMsg: '1日の制限に達しました — クレジットを購入するかアップグレードして続ける',
    getCredits: 'クレジットを取得',
    loginTitle: '無料アカウントを作成して開始',
    loginDesc: '無料で登録して毎日3回の分析を取得 — カード不要。',
    signUp: '無料で登録', logIn: 'ログイン',
    hint: 'Tinder、Bumble、Hinge、Instagram DM、またはWhatsAppのチャットスクリーンショットをアップロードしてみてください。',
    analyzing: '分析中...', analyzeCta: 'チャットを分析する',
  },
  ko: {
    badge: 'AI 데이팅 코치',
    analyzeTitle: '채팅을', analyzeSpan: '분석하기',
    openerTitle: '첫', openerSpan: '메시지 작성',
    analyzeDesc: '스크린샷을 업로드하여 4가지 완벽한 답장, 호환성 점수 및 전문가 전략을 받으세요',
    openerDesc: '상대방 프로필을 설명하고 4가지 개인화된 오프너를 받으세요 — 스크린샷 불필요',
    analyzeMode: '채팅 분석', openerMode: '오프너 작성',
    accountStatus: '계정 상태', upgrade: '업그레이드',
    plan: '플랜', renewsIn: '갱신까지', resetsIn: '초기화까지',
    analyses: '분석', credits: '크레딧', freeLeft: '무료 남음',
    limitMsg: '일일 한도 도달 — 크레딧을 구매하거나 업그레이드하여 계속하세요',
    getCredits: '크레딧 받기',
    loginTitle: '무료 계정을 만들어 시작하세요',
    loginDesc: '무료로 가입하고 매일 3번의 분석을 받으세요 — 카드 불필요.',
    signUp: '무료 가입', logIn: '로그인',
    hint: 'Tinder, Bumble, Hinge, Instagram DM 또는 WhatsApp의 채팅 스크린샷을 업로드해 보세요.',
    analyzing: '분석 중...', analyzeCta: '내 채팅 분석하기',
  },
}

type Mode = 'analyze' | 'opener'

interface AnalysisResultData {
  replies: { aura: string; cool: string; bold: string; gentleman: string }
  compatibilityScore: number
  strategyNote: string
  creditsUsed?: boolean
  freeTierCount?: number
}


export default function DashboardPage() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResultData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [usageCount, setUsageCount] = useState(0)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [credits, setCredits] = useState(0)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [imageMime, setImageMime] = useState<string>('image/jpeg')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [mode, setMode] = useState<Mode>('analyze')
  const [plan, setPlan] = useState<string | null>(null)
  const [periodEnd, setPeriodEnd] = useState<string | null>(null)
  const { lang } = useLanguage()
  const dc = dashCopy[lang]

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'true') {
      setSuccessMessage('Payment successful! Your account has been updated.')
    }
    if (params.get('mode') === 'opener') {
      setMode('opener')
    }

    const checkSubscription = async () => {
      const supabase = createBrowserClient()
      if (!supabase) { setAuthChecked(true); return }
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setAuthChecked(true); return }

      setAccessToken(session.access_token)
      setIsLoggedIn(true)

      const { data } = await supabase
        .from('subscriptions')
        .select('status, credits, free_analyses_count, free_analyses_date, plan, current_period_end')
        .eq('user_id', session.user.id)
        .single()

      if (data?.status === 'active') setIsSubscribed(true)
      if ((data?.credits ?? 0) > 0) setCredits(data?.credits ?? 0)
      if (data?.plan) setPlan(data.plan)
      if (data?.current_period_end) setPeriodEnd(data.current_period_end)

      const today = new Date().toISOString().split('T')[0]
      const isToday = data?.free_analyses_date === today
      setUsageCount(isToday ? (data?.free_analyses_count ?? 0) : 0)
      setAuthChecked(true)
    }
    checkSubscription()
  }, [])

  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
    })

  const handleAnalyze = async () => {
    if (!imageFile) { setError('Please upload a chat screenshot first.'); return }

    if (!isLoggedIn) {
      setError('Please sign in or create a free account to analyze your chat.')
      return
    }

    const hasAccess = isSubscribed || credits > 0 || usageCount < FREE_LIMIT
    if (!hasAccess) {
      setError('You have used all 3 free analyses for today. Buy credits or upgrade to continue.')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setResult(null)
    try {
      const base64Full = await getBase64(imageFile)
      const b64 = base64Full.split(',')[1]
      setImageBase64(b64)
      setImageMime(imageFile.type)

      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({ imageBase64: b64, mimeType: imageFile.type }),
      })
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || 'Analysis failed. Please try again.')
      }
      const data = await response.json()
      setResult(data)

      if (data.creditsUsed) {
        setCredits(c => Math.max(0, c - 1))
      } else if (!isSubscribed && data.freeTierCount !== undefined) {
        setUsageCount(data.freeTierCount)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleRegenerate = async (key: string): Promise<string | null> => {
    if (!imageBase64 || !accessToken) return null
    try {
      const response = await fetch('/api/analyze/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify({ imageBase64, mimeType: imageMime, style: key }),
      })
      if (!response.ok) return null
      const data = await response.json()
      return data.reply ?? null
    } catch {
      return null
    }
  }

  const remaining = FREE_LIMIT - usageCount
  const isLimitReached = !isSubscribed && credits === 0 && usageCount >= FREE_LIMIT

  const bannerIcon = isLimitReached
    ? <AlertCircle size={19} style={{ color: 'oklch(0.577 0.245 27.325)', flexShrink: 0 }} />
    : isSubscribed
      ? <Infinity size={19} style={{ color: 'var(--primary)', flexShrink: 0 }} />
      : credits > 0
        ? <Coins size={19} style={{ color: 'oklch(0.7 0.19 55)', flexShrink: 0 }} />
        : <Sparkles size={19} style={{ color: 'var(--primary)', flexShrink: 0 }} />

  const bannerText = isLimitReached
    ? 'Daily limit reached — buy credits or upgrade'
    : isSubscribed
      ? 'Unlimited analyses — Pro plan active'
      : credits > 0
        ? `${credits} credit${credits !== 1 ? 's' : ''} remaining`
        : `${remaining} of ${FREE_LIMIT} free analyses remaining today`

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium mb-4"
            style={{ background: 'oklch(0.64 0.24 5 / 0.1)', color: 'var(--primary)', border: '1px solid oklch(0.64 0.24 5 / 0.2)' }}>
            <Sparkles size={14} /> {dc.badge}
          </div>
          <h1 className="font-display text-4xl md:text-5xl mb-4" style={{ color: 'var(--foreground)' }}>
            {mode === 'analyze'
              ? <>{dc.analyzeTitle} <span className="italic" style={{ color: 'var(--primary)' }}>{dc.analyzeSpan}</span></>
              : <>{dc.openerTitle} <span className="italic" style={{ color: 'var(--primary)' }}>{dc.openerSpan}</span></>}
          </h1>
          <p className="text-lg mb-6" style={{ color: 'var(--muted-foreground)' }}>
            {mode === 'analyze' ? dc.analyzeDesc : dc.openerDesc}
          </p>

          {/* Mode switcher */}
          <div className="inline-flex rounded-2xl p-1 gap-1" style={{ background: 'var(--muted)' }}>
            <button
              onClick={() => setMode('analyze')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={mode === 'analyze'
                ? { background: 'white', color: 'var(--foreground)', boxShadow: '0 2px 8px oklch(0 0 0 / 0.1)' }
                : { color: 'var(--muted-foreground)' }}>
              <Camera size={15} /> {dc.analyzeMode}
            </button>
            <button
              onClick={() => setMode('opener')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={mode === 'opener'
                ? { background: 'white', color: 'var(--foreground)', boxShadow: '0 2px 8px oklch(0 0 0 / 0.1)' }
                : { color: 'var(--muted-foreground)' }}>
              <MessageSquarePlus size={15} /> {dc.openerMode}
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 rounded-2xl p-4 flex items-center gap-3"
            style={{ background: 'oklch(0.6 0.18 160 / 0.08)', border: '1px solid oklch(0.6 0.18 160 / 0.3)' }}>
            <Crown size={19} style={{ color: 'oklch(0.6 0.18 160)', flexShrink: 0 }} />
            <p className="text-sm" style={{ color: 'oklch(0.6 0.18 160)' }}>{successMessage}</p>
          </div>
        )}

        {!authChecked ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 rounded-full animate-spin"
              style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary)' }} />
          </div>
        ) : !isLoggedIn ? (
          <div className="rounded-3xl p-8 md:p-12 text-center shadow-soft" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'oklch(0.64 0.24 5 / 0.1)' }}>
              <Lock size={24} style={{ color: 'var(--primary)' }} />
            </div>
            <h2 className="font-display text-2xl md:text-3xl mb-3" style={{ color: 'var(--foreground)' }}>
              {dc.loginTitle}
            </h2>
            <p className="text-sm md:text-base mb-7 max-w-md mx-auto" style={{ color: 'var(--muted-foreground)' }}>
              {dc.loginDesc}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/auth/signup"
                className="w-full sm:w-auto rounded-full px-7 py-3 text-sm font-semibold text-white shadow-pill transition-transform hover:scale-105"
                style={{ background: 'var(--gradient-primary)' }}>
                {dc.signUp}
              </Link>
              <Link href="/auth/login"
                className="w-full sm:w-auto rounded-full px-7 py-3 text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: 'var(--muted)', color: 'var(--foreground)' }}>
                {dc.logIn}
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Account Status Card */}
            <div className="mb-6 rounded-2xl p-5 shadow-soft" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{dc.accountStatus}</h2>
                {!isSubscribed && (
                  <Link href="/pricing"
                    className="text-xs font-semibold rounded-full px-3 py-1.5 text-white shadow-pill transition-transform hover:scale-105"
                    style={{ background: 'var(--gradient-primary)' }}>
                    {dc.upgrade}
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {/* Plan */}
                <div className="rounded-xl p-3 text-center" style={{ background: 'var(--muted)' }}>
                  <div className="flex justify-center mb-1.5">
                    <Crown size={16} style={{ color: isSubscribed ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                  </div>
                  <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>{dc.plan}</p>
                  <p className="font-bold text-sm capitalize" style={{ color: 'var(--foreground)' }}>
                    {isSubscribed && plan ? plan.charAt(0).toUpperCase() + plan.slice(1) + ' Pro' : 'Free'}
                  </p>
                </div>

                {/* Days left / renewal */}
                <div className="rounded-xl p-3 text-center" style={{ background: 'var(--muted)' }}>
                  <div className="flex justify-center mb-1.5">
                    <CalendarDays size={16} style={{ color: isSubscribed ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                  </div>
                  <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
                    {isSubscribed ? dc.renewsIn : dc.resetsIn}
                  </p>
                  <p className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>
                    {isSubscribed && periodEnd
                      ? (() => {
                          const days = Math.max(0, Math.ceil((new Date(periodEnd).getTime() - Date.now()) / 86400000))
                          return days === 0 ? 'Today' : `${days}d`
                        })()
                      : (() => {
                          const now = new Date()
                          const midnight = new Date(now)
                          midnight.setHours(24, 0, 0, 0)
                          const hrs = Math.ceil((midnight.getTime() - now.getTime()) / 3600000)
                          return `${hrs}h`
                        })()
                    }
                  </p>
                </div>

                {/* Credits / analyses */}
                <div className="rounded-xl p-3 text-center" style={{ background: 'var(--muted)' }}>
                  <div className="flex justify-center mb-1.5">
                    {isSubscribed
                      ? <Infinity size={16} style={{ color: 'var(--primary)' }} />
                      : credits > 0
                        ? <Coins size={16} style={{ color: 'oklch(0.7 0.19 55)' }} />
                        : <Zap size={16} style={{ color: 'var(--muted-foreground)' }} />}
                  </div>
                  <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
                    {isSubscribed ? dc.analyses : credits > 0 ? dc.credits : dc.freeLeft}
                  </p>
                  <p className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>
                    {isSubscribed ? '∞' : credits > 0 ? credits : `${remaining}/${FREE_LIMIT}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Usage banner (limit reached only) */}
            {isLimitReached && (
              <div className="mb-6 rounded-2xl p-4 flex items-center justify-between"
                style={{ background: 'oklch(0.577 0.245 27.325 / 0.07)', border: '1px solid oklch(0.577 0.245 27.325 / 0.3)' }}>
                <div className="flex items-center gap-3">
                  <AlertCircle size={19} style={{ color: 'oklch(0.577 0.245 27.325)', flexShrink: 0 }} />
                  <p className="font-medium text-sm" style={{ color: 'oklch(0.577 0.245 27.325)' }}>
                    {dc.limitMsg}
                  </p>
                </div>
                <Link href="/pricing"
                  className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-pill transition-transform hover:scale-105 shrink-0"
                  style={{ background: 'var(--gradient-primary)' }}>
                  {dc.getCredits}
                </Link>
              </div>
            )}

            {mode === 'analyze' ? (
              <>
                <div className="rounded-3xl p-6 md:p-8 mb-6 shadow-soft" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <ImageUploader setImageFile={setImageFile} setImagePreview={setImagePreview} imagePreview={imagePreview} imageFile={imageFile} />

                  {!imageFile && !result && (
                    <div className="mt-4 flex items-start gap-2">
                      <ImageIcon size={14} style={{ color: 'var(--muted-foreground)', flexShrink: 0, marginTop: 2 }} />
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{dc.hint}</p>
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 rounded-xl p-4 flex items-center gap-3"
                      style={{ background: 'oklch(0.577 0.245 27.325 / 0.07)', border: '1px solid oklch(0.577 0.245 27.325 / 0.3)' }}>
                      <AlertCircle size={17} style={{ color: 'oklch(0.577 0.245 27.325)', flexShrink: 0 }} />
                      <p className="text-sm" style={{ color: 'oklch(0.577 0.245 27.325)' }}>{error}</p>
                    </div>
                  )}

                  <button onClick={handleAnalyze}
                    disabled={!imageFile || isAnalyzing || isLimitReached}
                    className="mt-6 w-full rounded-full py-4 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-pill hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={!imageFile || isLimitReached
                      ? { background: 'var(--muted)', color: 'var(--muted-foreground)' }
                      : { background: 'var(--gradient-primary)', color: 'white' }}>
                    {isAnalyzing ? (
                      <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {dc.analyzing}</>
                    ) : (
                      <><Sparkles size={19} /> {dc.analyzeCta}</>
                    )}
                  </button>
                </div>

                <AnalysisResult
                  result={result}
                  isLoading={isAnalyzing}
                  onRegenerate={result ? handleRegenerate : undefined}
                />
              </>
            ) : (
              <OpenerGenerator
                accessToken={accessToken}
                onUsageUpdate={(count) => setUsageCount(count)}
                onCreditUsed={() => setCredits(c => Math.max(0, c - 1))}
              />
            )}
          </>
        )}
      </div>
    </main>
  )
}
