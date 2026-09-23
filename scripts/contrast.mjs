// WCAG 2.2 relative luminance for an opaque, six-digit sRGB hex colour.
export function relativeLuminance(color) {
  if (typeof color !== 'string' || !/^#[0-9a-f]{6}$/i.test(color)) {
    throw new Error(`Expected an opaque six-digit sRGB hex colour, got ${JSON.stringify(color)}.`)
  }
  const [red, green, blue] = [1, 3, 5].map((offset) => {
    const channel = parseInt(color.slice(offset, offset + 2), 16) / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue
}

export function contrastRatio(foreground, background) {
  const first = relativeLuminance(foreground)
  const second = relativeLuminance(background)
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)
}

// Compare the full ratio. Round only when the table displays a result.
export function assessContrast(ratio, minimum) {
  const wcagLevel = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA large' : 'Fail'
  return { ratio, minimum, wcagLevel, passes: ratio >= minimum }
}
