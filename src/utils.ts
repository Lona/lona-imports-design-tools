function floatTo255(c: number) {
  return Math.round(c * 255)
}

function componentToHex(c: number, is255?: boolean) {
  var hex = (is255 ? c : floatTo255(c)).toString(16)
  return hex.length == 1 ? '0' + hex : hex
}

function isAbbr(
  c: any
): c is {
  r: number
  g: number
  b: number
  a: number
} {
  return typeof c.r !== 'undefined'
}

function isWithMode(
  c: any
): c is {
  mode: string
  value: {
    r: number
    g: number
    b: number
  }
  alpha?: number
} {
  return typeof c.mode !== 'undefined'
}

export function colorToString(
  c:
    | {
        red: number
        green: number
        blue: number
        alpha: number
      }
    | {
        r: number
        g: number
        b: number
        a: number
      }
    | {
        mode: string
        value: {
          r: number
          g: number
          b: number
        }
        alpha?: number
      }
) {
  if (isAbbr(c)) {
    return `rgba(${floatTo255(c.r)}, ${floatTo255(c.g)}, ${floatTo255(c.b)}, ${
      c.a
    })`
  }
  if (isWithMode(c)) {
    return `rgba(${c.value.r}, ${c.value.g}, ${c.value.b}, ${
      typeof c.alpha !== 'undefined' ? c.alpha : 1
    })`
  }
  return `rgba(${floatTo255(c.red)}, ${floatTo255(c.green)}, ${floatTo255(
    c.blue
  )}, ${c.alpha})`
}

export function rgbToHex(r: number, g: number, b: number, is255?: boolean) {
  return (
    '#' +
    componentToHex(r, is255) +
    componentToHex(g, is255) +
    componentToHex(b, is255)
  )
}
