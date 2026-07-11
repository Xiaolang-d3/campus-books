/**
 * 统一的图片 URL 处理函数
 * - 外部 http(s) 图片通过后端代理 + 缓存加速
 * - 本地上传图片走 /api/file/download/
 */
export function getImg(value) {
  if (!value) return ''

  // data:image 直接返回
  if (value.startsWith('data:image')) return value

  // 外部 URL → 走后端代理缓存
  if (/^https?:\/\//i.test(value)) {
    return `/api/file/image-proxy?url=${encodeURIComponent(value)}`
  }

  // 本地文件路径标准化
  const normalized = value.replace(/\\/g, '/').replace(/^\/+/, '')
  if (normalized.startsWith('upload/')) {
    return `/api/file/download/${normalized}`
  }
  return `/api/file/download/upload/${normalized}`
}
