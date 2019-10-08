import { readXDFile } from 'xd-file'
import { writeColors, writeTextStyles } from './fs'
import { colorToString, rgbToHex } from './utils'

export async function xdToLona(xdFilePath: string, lonaWorkspace: string) {
  const xdFile = await readXDFile(xdFilePath)

  let colors: {
    name: string
    value: string
  }[] = xdFile.resources.resources.meta.ux.documentLibrary.elements
    .filter(x => x.type === 'application/vnd.adobe.element.color+dcx')
    .map(c => ({
      name:
        c.name ||
        `${rgbToHex(
          c.representations[0].content.value.r,
          c.representations[0].content.value.g,
          c.representations[0].content.value.b,
          true
        )}${
          typeof c.representations[0].content.alpha !== 'undefined' &&
          c.representations[0].content.alpha !== 1
            ? ` (${Math.ceil(c.representations[0].content.alpha * 100)}%)`
            : ''
        }`,
      value: colorToString(c.representations[0].content),
    }))

  await writeColors('XD', colors, lonaWorkspace)

  const textStyles = xdFile.resources.resources.meta.ux.documentLibrary.elements
    .filter(x => x.type === 'application/vnd.adobe.element.characterstyle+dcx')
    .map(s => {
      const content = s.representations[0].content

      let color:
        | string
        | undefined
        | { name: string; value: string } = content.fontColor
        ? colorToString(content.fontColor)
        : undefined
      if (color) {
        const existingColor = colors.find(c => c.value === color)
        if (existingColor) {
          color = existingColor
        }
      }
      return {
        name: s.name,
        color,
        fontSize: content.fontSize ? content.fontSize : undefined,
        fontName: content.postscriptName ? content.postscriptName : undefined,
        letterSpacing:
          typeof content.charSpacing !== 'undefined'
            ? content.charSpacing
            : undefined,
        lineHeight:
          typeof content.lineSpacing !== 'undefined'
            ? content.charSpalineSpacingcing
            : undefined,
        fontFamily: content.fontFamily ? content.fontFamily : undefined,
        fontWeigth: content.fontStyle ? content.fontStyle : undefined,
      }
    })

  await writeTextStyles('XD', textStyles, lonaWorkspace)
}
