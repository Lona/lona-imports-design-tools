import { readSketchFile } from 'sketch-file'
import { writeColors, writeTextStyles } from './fs'
import { colorToString, rgbToHex } from './utils'

export async function sketchToLona(
  sketchFilePath: string,
  lonaWorkspace: string
) {
  const sketchFile = await readSketchFile(sketchFilePath)

  let colors: { name: string; value: string }[]

  if (!sketchFile.document.assets.colorAssets) {
    colors = sketchFile.document.assets.colors.map(c => ({
      name: `${rgbToHex(c.red, c.green, c.blue)}${
        c.alpha !== 1 ? ` (${Math.ceil(c.alpha * 100)}%)` : ''
      }`,
      value: colorToString(c),
    }))
  } else {
    colors = (sketchFile.document.assets.colorAssets || []).map(c => ({
      name: c.name,
      value: colorToString(c.color),
    }))
  }

  await writeColors('Sketch', colors, lonaWorkspace)

  const textStyles = sketchFile.document.layerTextStyles.objects.map(s => {
    let color: string | undefined | { name: string; value: string } = s.value
      .textStyle.encodedAttributes.MSAttributedStringColorAttribute
      ? colorToString(
          s.value.textStyle.encodedAttributes.MSAttributedStringColorAttribute
        )
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
      fontSize: s.value.textStyle.encodedAttributes
        .MSAttributedStringFontAttribute
        ? s.value.textStyle.encodedAttributes.MSAttributedStringFontAttribute
            .attributes.size
        : undefined,
      fontName: s.value.textStyle.encodedAttributes
        .MSAttributedStringFontAttribute
        ? s.value.textStyle.encodedAttributes.MSAttributedStringFontAttribute
            .attributes.name
        : undefined,
      letterSpacing:
        typeof s.value.textStyle.encodedAttributes.kerning !== 'undefined'
          ? s.value.textStyle.encodedAttributes.kerning
          : undefined,
      lineHeight:
        s.value.textStyle.encodedAttributes.paragraphStyle &&
        typeof s.value.textStyle.encodedAttributes.paragraphStyle
          .maximumLineHeight !== 'undefined'
          ? s.value.textStyle.encodedAttributes.paragraphStyle.maximumLineHeight
          : undefined,
    }
  })

  await writeTextStyles('Sketch', textStyles, lonaWorkspace)
}
