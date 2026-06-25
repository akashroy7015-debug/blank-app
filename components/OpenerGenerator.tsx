'use client'

import { useState } from 'react'
import { Sparkles, AlertCircle, Copy, Check, Lightbulb, Heart, Zap, Flame, RefreshCw, CopyCheck } from 'lucide-react'
import { useLanguage, type Lang } from '@/lib/language'

const copy: Record<Lang, {
  nameLbl: string; optional: string; platformLbl: string; selectPlatform: string
  bioLbl: string; interestsLbl: string; photoLbl: string; emptyError: string
  generating: string; cta: string; resultsTitle: string; tip: string
}> = {
  en: {
    nameLbl: 'Their name', optional: '(optional)', platformLbl: 'Platform',
    selectPlatform: 'Select a platform…', bioLbl: 'Their bio / about section',
    interestsLbl: 'Interests / hobbies shown', photoLbl: 'Profile photo description',
    emptyError: 'Add at least one detail about your match to get personalized openers.',
    generating: 'Crafting openers…', cta: 'Write My Opener',
    resultsTitle: 'Your 4 Opening Lines', tip: 'Conversation Tip',
  },
  hi: {
    nameLbl: 'Unka naam', optional: '(optional)', platformLbl: 'Platform',
    selectPlatform: 'Platform choose karo…', bioLbl: 'Unka bio / about section',
    interestsLbl: 'Interests / hobbies', photoLbl: 'Profile photo kaisi hai',
    emptyError: 'Kam se kam ek detail daalo match ke baare mein.',
    generating: 'Openers ban rahe hain…', cta: 'Opener Likho',
    resultsTitle: 'Tumhare 4 Opening Lines', tip: 'Conversation Tip',
  },
  es: {
    nameLbl: 'Su nombre', optional: '(opcional)', platformLbl: 'Plataforma',
    selectPlatform: 'Elige una plataforma…', bioLbl: 'Su bio / sección acerca de',
    interestsLbl: 'Intereses / hobbies', photoLbl: 'Descripción de la foto de perfil',
    emptyError: 'Añade al menos un detalle sobre tu match para obtener openers personalizados.',
    generating: 'Creando openers…', cta: 'Escribir mi Opener',
    resultsTitle: 'Tus 4 Frases de Apertura', tip: 'Consejo de Conversación',
  },
  fr: {
    nameLbl: 'Son prénom', optional: '(optionnel)', platformLbl: 'Plateforme',
    selectPlatform: 'Choisir une plateforme…', bioLbl: 'Sa bio / section à propos',
    interestsLbl: "Centres d'intérêt / loisirs", photoLbl: 'Description de la photo de profil',
    emptyError: 'Ajoute au moins un détail sur ton match pour obtenir des openers personnalisés.',
    generating: 'Création des openers…', cta: 'Écrire mon Opener',
    resultsTitle: "Vos 4 Phrases d'Accroche", tip: 'Conseil de Conversation',
  },
  pt: {
    nameLbl: 'Nome dele/a', optional: '(opcional)', platformLbl: 'Plataforma',
    selectPlatform: 'Escolha uma plataforma…', bioLbl: 'Bio / seção sobre',
    interestsLbl: 'Interesses / hobbies', photoLbl: 'Descrição da foto de perfil',
    emptyError: 'Adicione pelo menos um detalhe sobre seu match para obter openers personalizados.',
    generating: 'Criando openers…', cta: 'Escrever meu Opener',
    resultsTitle: 'Seus 4 Openers', tip: 'Dica de Conversa',
  },
  ar: {
    nameLbl: 'اسمه/ا', optional: '(اختياري)', platformLbl: 'المنصة',
    selectPlatform: 'اختر منصة…', bioLbl: 'السيرة الذاتية / قسم عنه/ا',
    interestsLbl: 'الاهتمامات والهوايات', photoLbl: 'وصف صورة الملف الشخصي',
    emptyError: 'أضف تفصيلاً واحداً على الأقل عن مطابقتك للحصول على رسائل مخصصة.',
    generating: 'جاري إنشاء الرسائل…', cta: 'اكتب رسالتي الأولى',
    resultsTitle: 'رسائلك الافتتاحية الـ4', tip: 'نصيحة المحادثة',
  },
  de: {
    nameLbl: 'Ihr/Sein Name', optional: '(optional)', platformLbl: 'Plattform',
    selectPlatform: 'Plattform auswählen…', bioLbl: 'Bio / Über mich-Abschnitt',
    interestsLbl: 'Interessen / Hobbys', photoLbl: 'Beschreibung des Profilfotos',
    emptyError: 'Füge mindestens ein Detail über dein Match hinzu, um personalisierte Openers zu erhalten.',
    generating: 'Openers werden erstellt…', cta: 'Meinen Opener schreiben',
    resultsTitle: 'Deine 4 Eröffnungszeilen', tip: 'Gesprächstipp',
  },
  zh: {
    nameLbl: '对方名字', optional: '（可选）', platformLbl: '平台',
    selectPlatform: '选择平台…', bioLbl: '对方的简介',
    interestsLbl: '兴趣爱好', photoLbl: '头像照片描述',
    emptyError: '请至少添加一条关于你的匹配对象的信息，以获得个性化的开场白。',
    generating: '正在生成开场白…', cta: '生成我的开场白',
    resultsTitle: '你的4条开场白', tip: '对话建议',
  },
  ja: {
    nameLbl: '相手の名前', optional: '（任意）', platformLbl: 'プラットフォーム',
    selectPlatform: 'プラットフォームを選択…', bioLbl: '相手のプロフィール',
    interestsLbl: '趣味・興味', photoLbl: 'プロフィール写真の説明',
    emptyError: '個性的なオープナーのために、マッチ相手の情報を1つ以上入力してください。',
    generating: 'オープナーを作成中…', cta: 'オープナーを書く',
    resultsTitle: 'あなたの4つの始め方', tip: '会話のヒント',
  },
  ko: {
    nameLbl: '상대방 이름', optional: '(선택사항)', platformLbl: '플랫폼',
    selectPlatform: '플랫폼 선택…', bioLbl: '상대방 프로필/소개',
    interestsLbl: '관심사 / 취미', photoLbl: '프로필 사진 설명',
    emptyError: '개인화된 오프너를 받으려면 상대방에 대한 정보를 하나 이상 추가하세요.',
    generating: '오프너 작성 중…', cta: '내 오프너 작성',
    resultsTitle: '나의 4가지 오프너', tip: '대화 팁',
  },
}

interface OpenerResult {
  replies: { aura: string; cool: string; bold: string; gentleman: string }
  tip: string
}

const PLATFORMS = ['Tinder', 'Bumble', 'Hinge', 'Instagram', 'WhatsApp', 'OkCupid', 'Other']

const replyCards = [
  { key: 'aura'      as const, label: 'Aura',      Icon: Sparkles, color: 'oklch(0.6 0.22 290)',  bg: 'from-violet-50 to-purple-50',  border: 'oklch(0.88 0.06 290)' },
  { key: 'cool'      as const, label: 'Cool',      Icon: Zap,      color: 'oklch(0.6 0.17 220)',  bg: 'from-sky-50 to-cyan-50',       border: 'oklch(0.88 0.05 220)' },
  { key: 'bold'      as const, label: 'Bold',      Icon: Flame,    color: 'oklch(0.65 0.2 40)',   bg: 'from-orange-50 to-amber-50',   border: 'oklch(0.9 0.09 60)'   },
  { key: 'gentleman' as const, label: 'Gentleman', Icon: Heart,    color: 'oklch(0.64 0.24 5)',   bg: 'from-rose-50 to-pink-50',      border: 'oklch(0.88 0.08 5)'   },
]

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* noop */ }
  }
  return (
    <button onClick={handleCopy} aria-label={copied ? 'Copied' : 'Copy'} title="Copy"
      className="p-1.5 rounded-lg transition-all hover:opacity-70" style={{ color: 'var(--muted-foreground)' }}>
      {copied ? <Check size={14} style={{ color: 'oklch(0.6 0.18 160)' }} /> : <Copy size={14} />}
    </button>
  )
}

interface Props {
  accessToken: string | null
  onUsageUpdate: (count: number) => void
  onCreditUsed: () => void
}

export default function OpenerGenerator({ accessToken, onUsageUpdate, onCreditUsed }: Props) {
  const { lang } = useLanguage()
  const c = copy[lang]
  const [name, setName] = useState('')
  const [platform, setPlatform] = useState('')
  const [bio, setBio] = useState('')
  const [interests, setInterests] = useState('')
  const [photoDesc, setPhotoDesc] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<OpenerResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)

  const handleGenerate = async () => {
    if (!bio && !interests && !name && !photoDesc) {
      setError(c.emptyError)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`
      const res = await fetch('/api/opener', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name, platform, bio, interests, photoDesc }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to generate openers.')
      }
      const data = await res.json()
      setResult(data)
      if (data.creditsUsed) onCreditUsed()
      else if (data.freeTierCount !== undefined) onUsageUpdate(data.freeTierCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyAll = async () => {
    if (!result) return
    const all = replyCards.map(c => `${c.label}: "${result.replies[c.key]}"`).join('\n\n')
    try { await navigator.clipboard.writeText(all); setCopiedAll(true); setTimeout(() => setCopiedAll(false), 2000) } catch { /* noop */ }
  }

  const canGenerate = !!(bio || interests || name || photoDesc)

  return (
    <div className="space-y-6">
      {/* Input form */}
      <div className="rounded-3xl p-6 md:p-8 shadow-soft" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Match name */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
              {c.nameLbl} <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>{c.optional}</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Sofia"
              maxLength={50}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
              style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid transparent' }}
              onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={e => (e.target.style.borderColor = 'transparent')}
            />
          </div>

          {/* Platform */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
              {c.platformLbl} <span style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>{c.optional}</span>
            </label>
            <select
              value={platform}
              onChange={e => setPlatform(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ background: 'var(--muted)', color: platform ? 'var(--foreground)' : 'var(--muted-foreground)', border: '1px solid transparent' }}
            >
              <option value="">{c.selectPlatform}</option>
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Bio */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
              {c.bioLbl}
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="e.g. Dog mom. Hiking obsessed. Looking for someone to watch terrible reality TV with 😂"
              rows={3}
              maxLength={500}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none transition-all"
              style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid transparent' }}
              onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={e => (e.target.style.borderColor = 'transparent')}
            />
          </div>

          {/* Interests */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
              {c.interestsLbl}
            </label>
            <input
              type="text"
              value={interests}
              onChange={e => setInterests(e.target.value)}
              placeholder="e.g. hiking, cooking, K-pop, yoga"
              maxLength={200}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
              style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid transparent' }}
              onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={e => (e.target.style.borderColor = 'transparent')}
            />
          </div>

          {/* Photo description */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
              {c.photoLbl}
            </label>
            <input
              type="text"
              value={photoDesc}
              onChange={e => setPhotoDesc(e.target.value)}
              placeholder="e.g. hiking in mountains, with a golden retriever"
              maxLength={200}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
              style={{ background: 'var(--muted)', color: 'var(--foreground)', border: '1px solid transparent' }}
              onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={e => (e.target.style.borderColor = 'transparent')}
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl p-4 flex items-center gap-3"
            style={{ background: 'oklch(0.577 0.245 27.325 / 0.07)', border: '1px solid oklch(0.577 0.245 27.325 / 0.3)' }}>
            <AlertCircle size={17} style={{ color: 'oklch(0.577 0.245 27.325)', flexShrink: 0 }} />
            <p className="text-sm" style={{ color: 'oklch(0.577 0.245 27.325)' }}>{error}</p>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={!canGenerate || isLoading}
          className="mt-6 w-full rounded-full py-4 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-pill hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
          style={!canGenerate
            ? { background: 'var(--muted)', color: 'var(--muted-foreground)' }
            : { background: 'var(--gradient-primary)', color: 'white' }}>
          {isLoading
            ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {c.generating}</>
            : <><Sparkles size={19} /> {c.cta}</>}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{c.resultsTitle}</h2>
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', background: 'var(--card)' }}>
              {copiedAll
                ? <><CopyCheck size={12} style={{ color: 'oklch(0.6 0.18 160)' }} /><span style={{ color: 'oklch(0.6 0.18 160)' }}>Copied!</span></>
                : <><Copy size={12} />Copy All</>}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {replyCards.map(({ key, label, Icon, color, bg, border }) => (
              <div key={key} className={`rounded-2xl p-5 bg-gradient-to-br ${bg}`} style={{ border: `1px solid ${border}` }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon size={15} style={{ color }} />
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color }}>{label}</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={handleGenerate}
                      disabled={isLoading}
                      className="p-1.5 rounded-lg transition-all hover:opacity-70 disabled:cursor-not-allowed"
                      style={{ color: 'var(--muted-foreground)' }}
                      aria-label={`Regenerate ${label} opener`}
                      title="Get a different opener">
                      <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                    <CopyBtn text={result.replies[key]} />
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
                  &ldquo;{result.replies[key]}&rdquo;
                </p>
              </div>
            ))}
          </div>

          {result.tip && (
            <div className="rounded-2xl p-6 shadow-soft" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
                <Lightbulb size={17} style={{ color: 'oklch(0.7 0.19 55)' }} /> {c.tip}
              </h3>
              <div className="rounded-xl p-4" style={{ background: 'oklch(0.7 0.19 55 / 0.06)', border: '1px solid oklch(0.7 0.19 55 / 0.25)' }}>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>{result.tip}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
