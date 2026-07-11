// 头像配置和解析工具

const avatarConfigs = [
  { emoji: '😊', c1: '#667eea', c2: '#764ba2' },
  { emoji: '😎', c1: '#f093fb', c2: '#f5576c' },
  { emoji: '🤗', c1: '#4facfe', c2: '#00f2fe' },
  { emoji: '🦊', c1: '#43e97b', c2: '#38f9d7' },
  { emoji: '🐱', c1: '#fa709a', c2: '#fee140' },
  { emoji: '🐼', c1: '#a18cd1', c2: '#fbc2eb' },
  { emoji: '🌟', c1: '#ffecd2', c2: '#fcb69f' },
  { emoji: '🎓', c1: '#a1c4fd', c2: '#c2e9fb' },
  { emoji: '📚', c1: '#d4fc79', c2: '#96e6a1' },
  { emoji: '🎨', c1: '#f6d365', c2: '#fda085' },
  { emoji: '🚀', c1: '#89f7fe', c2: '#66a6ff' },
  { emoji: '🌈', c1: '#fddb92', c2: '#d1fdff' },
]

function generateAvatarSvg(emoji, c1, c2) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${c1}"/><stop offset="100%" style="stop-color:${c2}"/>
    </linearGradient></defs>
    <circle cx="50" cy="50" r="50" fill="url(#g)"/>
    <text x="50" y="62" text-anchor="middle" font-size="42">${emoji}</text>
  </svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/**
 * 将 avatar 存储值转为可显示的图片 URL
 * avatar:N → 动态生成 SVG data URI
 * http/data: → 直接使用
 * 其他 → 文件下载路径
 */
export function resolveAvatarUrl(v) {
  if (!v) return ''
  const m = v.match(/^avatar:(\d+)$/)
  if (m) {
    const idx = parseInt(m[1]) - 1
    const cfg = avatarConfigs[idx]
    return cfg ? generateAvatarSvg(cfg.emoji, cfg.c1, cfg.c2) : ''
  }
  if (v.startsWith('http') || v.startsWith('data:')) return v
  return `/api/file/download/${v}`
}

/** 获取默认头像列表（用于选择器） */
export function getDefaultAvatars() {
  return avatarConfigs.map((c, i) => ({
    id: i + 1,
    displayUrl: generateAvatarSvg(c.emoji, c.c1, c.c2),
    storeKey: `avatar:${i + 1}`,
    name: `头像${i + 1}`,
  }))
}
