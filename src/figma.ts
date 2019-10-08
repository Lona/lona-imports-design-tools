import {
  Client as Figma,
  Node,
  Style,
  TypeStyle,
  Paint,
  LayoutGrid,
  Effect,
} from 'figma-js'
import { writeColors, writeTextStyles } from './fs'
import { colorToString } from './utils'

type RawPropObject = TypeStyle | ReadonlyArray<Paint | LayoutGrid | Effect>

type RawStyleType = Style & {
  props: RawPropObject
}

type RawStyleObject = {
  [key: string]: RawStyleType
}

const fileIdFromURL = (url: string) => {
  const res = /https:\/\/www.figma.com\/file\/([A-Za-z0-9]+)\//.exec(url)
  if (!res) {
    return url
  }

  return res[1]
}

// work through the node and its children to attach all style definitions to the style types
const findStyleInNode = (
  stylesIndex: {
    [key: string]: Style
  },
  keysToFind: string[],
  node: Node,
  parent?: Node,
  styles: RawStyleObject = {}
) => {
  let finalStyles = styles

  if ('styles' in node && node.styles !== undefined) {
    Object.entries(node.styles).forEach(([styleType, key]) => {
      if (!(key in styles)) {
        finalStyles[key] = stylesIndex[key] as RawStyleType

        switch (styleType) {
          case 'text':
            if ('style' in node) {
              styles[key].props = node.style
            }
            break
          case 'grid':
            if ('layoutGrids' in node && node.layoutGrids !== undefined) {
              styles[key].props = node.layoutGrids
            }
            break
          case 'background':
            if ('background' in node) {
              styles[key].props = node.background
            }
            break
          case 'stroke':
            if ('strokes' in node) {
              styles[key].props = node.strokes
            }
            break
          case 'fill':
            if ('fills' in node) {
              styles[key].props = node.fills
            }
            break
          case 'effect':
            if ('effects' in node) {
              styles[key].props = node.effects
            }
        }
      }
    })
  }

  if ('children' in node) {
    node.children.forEach(child => {
      const { styles: childStyles } = findStyleInNode(
        stylesIndex,
        keysToFind,
        child,
        node,
        styles
      )
      finalStyles = {
        ...finalStyles,
        ...childStyles,
      }
    })
  }

  return { styles: finalStyles }
}

export async function figmaToLona(
  { url, token }: { url: string; token: string },
  lonaWorkspace: string
) {
  const figma = Figma({ personalAccessToken: token })

  const fileId = fileIdFromURL(url)

  const document = (await figma.file(fileId)).data

  const { styles } = findStyleInNode(
    document.styles,
    Object.keys(document.styles),
    document.document
  )

  const colors = Object.values(styles)
    .filter(
      s =>
        s.styleType === 'FILL' &&
        Array.isArray(s.props) &&
        s.props.length === 1 &&
        s.props[0].type === 'SOLID'
    )
    .map(s => {
      const props = (s.props as Paint[])[0]
      return {
        name: s.name,
        value: colorToString(props.color || { r: 0, g: 0, b: 0, a: 0 }),
      }
    })

  await writeColors('Figma', colors, lonaWorkspace)

  const textStyles = Object.values(styles)
    .filter(s => s.styleType === 'TEXT')
    .map(s => {
      const props = s.props as TypeStyle
      return {
        name: s.name,
        fontFamily: props.fontFamily,
        fontWeigth: props.fontWeight,
        fontSize: props.fontSize,
        letterSpacing: props.letterSpacing,
        lineHeight: props.lineHeightPx,
        fontName: props.fontPostScriptName,
      }
    })

  await writeTextStyles('Figma', textStyles, lonaWorkspace)

  return Object.values(styles).filter(s => s.styleType === 'TEXT')
}
