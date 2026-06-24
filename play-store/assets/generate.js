const PImage = require('pureimage')
const fs = require('fs')
const path = require('path')

const OUT = process.argv[2] || '.'
const FONTS = '/usr/share/fonts/truetype/dejavu'
const bold = PImage.registerFont(path.join(FONTS, 'DejaVuSans-Bold.ttf'), 'Bold')
const reg = PImage.registerFont(path.join(FONTS, 'DejaVuSans.ttf'), 'Reg')
bold.loadSync(); reg.loadSync()

// ---- helpers ----------------------------------------------------------
function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
function fillRound(ctx, x, y, w, h, r, color) { ctx.fillStyle = color; roundRect(ctx, x, y, w, h, r); ctx.fill() }
function text(ctx, s, x, y, size, color, font='Bold') {
  ctx.fillStyle = color; ctx.font = `${size}pt ${font}`; ctx.fillText(s, x, y)
}
function centerText(ctx, s, cx, y, size, color, font='Bold') {
  ctx.font = `${size}pt ${font}`
  const w = ctx.measureText(s).width
  ctx.fillStyle = color; ctx.fillText(s, cx - w/2, y)
}
function save(img, name) {
  return PImage.encodePNGToStream(img, fs.createWriteStream(path.join(OUT, name)))
    .then(() => console.log('wrote', name))
}

const PINK = '#E8395A', PINK_LT = '#FF6B9D', CREAM = '#FFF8F2', DARK = '#2B2B33', GREY = '#8A8A99'
const STYLES = [
  { label: 'AURA',      color: '#7C5CFF', sub: 'Magnetic & mysterious' },
  { label: 'COOL',      color: '#1FB6C4', sub: 'Laid-back & playful' },
  { label: 'BOLD',      color: '#FF6B35', sub: 'Direct & confident' },
  { label: 'GENTLEMAN', color: '#E8395A', sub: 'Warm & genuine' },
]

// ====== 1. FEATURE GRAPHIC  1024 x 500 ================================
function featureGraphic() {
  const W = 1024, H = 500
  const img = PImage.make(W, H); const ctx = img.getContext('2d')
  const g = ctx.createLinearGradient(0, 0, W, H)
  g.addColorStop(0, '#FF7AA8'); g.addColorStop(0.55, PINK); g.addColorStop(1, '#C81E47')
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
  // soft decorative circles
  ctx.globalAlpha = 0.10; ctx.fillStyle = '#FFFFFF'
  ctx.beginPath(); ctx.arc(880, 90, 160, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(120, 470, 130, 0, Math.PI*2); ctx.fill()
  ctx.globalAlpha = 1

  // left: brand + tagline
  text(ctx, 'FlirtIQ', 60, 175, 76, '#FFFFFF', 'Bold')
  text(ctx, 'AI Dating Assistant', 64, 235, 26, '#FFE3EC', 'Reg')
  text(ctx, 'Get 4 perfect replies', 60, 320, 38, '#FFFFFF', 'Bold')
  text(ctx, 'to any dating chat — in seconds.', 60, 372, 27, '#FFE3EC', 'Reg')
  // store-style pill
  fillRound(ctx, 60, 410, 300, 56, 28, '#FFFFFF')
  text(ctx, '3 free every day', 92, 447, 20, PINK, 'Bold')

  // right: 4 style chips stacked
  const cx = 620, cw = 350, ch = 78, gap = 18
  let cy = 70
  for (const s of STYLES) {
    fillRound(ctx, cx, cy, cw, ch, 18, '#FFFFFF')
    ctx.fillStyle = s.color
    ctx.beginPath(); ctx.arc(cx + 42, cy + ch/2, 20, 0, Math.PI*2); ctx.fill()
    text(ctx, s.label, cx + 78, cy + 38, 19, DARK, 'Bold')
    text(ctx, s.sub, cx + 78, cy + 62, 14, GREY, 'Reg')
    cy += ch + gap
  }
  return save(img, 'feature-graphic.png')
}

// ====== phone frame helper ===========================================
function phoneBase(W, H) {
  const img = PImage.make(W, H); const ctx = img.getContext('2d')
  ctx.fillStyle = CREAM; ctx.fillRect(0, 0, W, H)
  // top brand bar
  const g = ctx.createLinearGradient(0, 0, W, 0)
  g.addColorStop(0, PINK_LT); g.addColorStop(1, PINK)
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 150)
  centerText(ctx, 'FlirtIQ', W/2, 100, 34, '#FFFFFF', 'Bold')
  return { img, ctx }
}

// ====== 2. SCREENSHOT — chat analysis  1080 x 1920 ===================
function shotAnalysis() {
  const W = 1080, H = 1920
  const { img, ctx } = phoneBase(W, H)
  centerText(ctx, 'Analyze any chat screenshot', W/2, 240, 30, DARK, 'Bold')
  centerText(ctx, 'Upload it. Get replies that work.', W/2, 288, 22, GREY, 'Reg')

  // compatibility score badge
  fillRound(ctx, W/2 - 150, 330, 300, 96, 22, '#FFFFFF')
  centerText(ctx, 'Compatibility  82%', W/2, 392, 26, PINK, 'Bold')

  // 4 reply cards
  let y = 470
  const cw = 920, x = (W - cw) / 2
  const replies = [
    'Bet you say that to all the playlists.',
    'Okay, a hiker AND you cook? Risky combo.',
    "You free Saturday? I'm calling it now.",
    'That trip photo got me — tell me the story.',
  ]
  STYLES.forEach((s, i) => {
    const ch = 250
    fillRound(ctx, x, y, cw, ch, 26, '#FFFFFF')
    fillRound(ctx, x, y, 12, ch, 6, s.color)
    ctx.fillStyle = s.color
    ctx.beginPath(); ctx.arc(x + 70, y + 64, 26, 0, Math.PI*2); ctx.fill()
    text(ctx, s.label, x + 110, y + 74, 24, DARK, 'Bold')
    text(ctx, s.sub, x + 110, y + 108, 17, GREY, 'Reg')
    text(ctx, replies[i], x + 44, y + 180, 21, DARK, 'Reg')
    y += ch + 28
  })
  // footer CTA
  fillRound(ctx, W/2 - 230, y + 10, 460, 80, 40, PINK)
  centerText(ctx, 'Regenerate · Copy All · 29 languages', W/2, y + 60, 19, '#FFFFFF', 'Bold')
  return save(img, 'screenshot-1-analyze.png')
}

// ====== 3. SCREENSHOT — opener generator  1080 x 1920 ================
function shotOpener() {
  const W = 1080, H = 1920
  const { img, ctx } = phoneBase(W, H)
  centerText(ctx, 'No screenshot? No problem.', W/2, 240, 30, DARK, 'Bold')
  centerText(ctx, "Describe your match — get openers.", W/2, 288, 22, GREY, 'Reg')

  // form mock
  const cw = 920, x = (W - cw) / 2
  let y = 350
  const fields = [['Name', 'Priya'], ['Platform', 'Hinge'], ['Their bio', 'Yoga, ramen & weekend treks']]
  fields.forEach(([label, val]) => {
    text(ctx, label, x + 10, y + 6, 18, GREY, 'Reg')
    fillRound(ctx, x, y + 20, cw, 84, 18, '#FFFFFF')
    text(ctx, val, x + 30, y + 72, 22, DARK, 'Reg')
    y += 130
  })
  // generate button
  fillRound(ctx, x, y + 6, cw, 92, 22, PINK)
  centerText(ctx, 'Generate openers', W/2, y + 64, 26, '#FFFFFF', 'Bold')
  y += 150

  // opener results
  const openers = [
    ['AURA', '#7C5CFF', 'Trekker who makes ramen? You\'re basically a plot twist.'],
    ['BOLD', '#FF6B35', 'Yoga Saturday, ramen after. I\'ll handle the ramen.'],
    ['GENTLEMAN', '#E8395A', 'A good trek and great ramen — tell me your favourite trail.'],
  ]
  openers.forEach(([label, color, line]) => {
    const ch = 200
    fillRound(ctx, x, y, cw, ch, 26, '#FFFFFF')
    fillRound(ctx, x, y, 12, ch, 6, color)
    ctx.fillStyle = color
    ctx.beginPath(); ctx.arc(x + 70, y + 56, 24, 0, Math.PI*2); ctx.fill()
    text(ctx, label, x + 108, y + 66, 23, DARK, 'Bold')
    text(ctx, line, x + 44, y + 140, 20, DARK, 'Reg')
    y += ch + 28
  })
  return save(img, 'screenshot-2-opener.png')
}

// ====== 4. SCREENSHOT — value / languages  1080 x 1920 ===============
function shotValue() {
  const W = 1080, H = 1920
  const { img, ctx } = phoneBase(W, H)
  centerText(ctx, 'Your AI wingman', W/2, 250, 38, DARK, 'Bold')
  centerText(ctx, 'for every conversation', W/2, 306, 38, DARK, 'Bold')

  const items = [
    ['4 reply styles', 'AURA, COOL, BOLD & GENTLEMAN'],
    ['Compatibility score', 'Reads tone & interest signals'],
    ['Strategy tip', 'Knows exactly what to say next'],
    ['Regenerate & Copy All', 'One tap for a fresh reply'],
    ['29 languages', 'Hinglish, Arabic, Turkish & more'],
  ]
  const cw = 920, x = (W - cw) / 2
  let y = 420
  items.forEach(([t, d]) => {
    const ch = 150
    fillRound(ctx, x, y, cw, ch, 24, '#FFFFFF')
    ctx.fillStyle = PINK
    ctx.beginPath(); ctx.arc(x + 70, y + ch/2, 28, 0, Math.PI*2); ctx.fill()
    text(ctx, '✓', x + 58, y + ch/2 + 14, 26, '#FFFFFF', 'Bold')
    text(ctx, t, x + 130, y + 64, 26, DARK, 'Bold')
    text(ctx, d, x + 130, y + 104, 19, GREY, 'Reg')
    y += ch + 26
  })
  // footer pill
  fillRound(ctx, W/2 - 260, y + 30, 520, 90, 45, PINK)
  centerText(ctx, '3 free analyses every day', W/2, y + 88, 24, '#FFFFFF', 'Bold')
  return save(img, 'screenshot-3-value.png')
}

(async () => {
  await featureGraphic()
  await shotAnalysis()
  await shotOpener()
  await shotValue()
  console.log('done')
})().catch(e => { console.error(e); process.exit(1) })
