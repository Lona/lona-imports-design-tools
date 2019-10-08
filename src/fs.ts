import * as fs from 'fs'
import * as path from 'path'

export function writeColors(
  prefix: string,
  colors: { name: string; value: string }[],
  lonaWorkspace?: string
) {
  return fs.promises.writeFile(
    path.join(lonaWorkspace || process.cwd(), `${prefix}Colors.tokens`),
    `<?xml version="1.0"?>
  <Declarations>
    <ImportDeclaration name="Color"/>
    <Namespace name="${prefix}Colors">
${colors
  .map(c => `    <Variable name="${c.name}" type="Color" value="${c.value}"/>`)
  .join('\n')}
    </Namespace>
  </Declarations>
    `
  )
}

export function writeTextStyles(
  prefix: string,
  textStyles: {
    name: string
    color?: string | { name: string; value: string }
    fontSize?: number
    fontName?: string
    letterSpacing?: number
    lineHeight?: number
    fontFamily?: string
    fontWeight?: number
  }[],
  lonaWorkspace?: string
) {
  return fs.promises.writeFile(
    path.join(lonaWorkspace || process.cwd(), `${prefix}TextStyles.tokens`),
    `<?xml version="1.0"?>
  <Declarations>
    <ImportDeclaration name="TextStyle"/>
    <Namespace name="${prefix}TextStyles">
  ${textStyles
    .map(
      s => `    <Variable name="${s.name}" type="TextStyle">
      <FunctionCallExpression>
        <IdentifierExpression name="TextStyle"/>${
          s.fontSize
            ? `
        <Argument label="fontSize">
          <FunctionCallExpression>
            <MemberExpression name="value">
              <IdentifierExpression name="Optional"/>
            </MemberExpression>
            <Argument>
              <Literal type="Number" value="${s.fontSize}"/>
            </Argument>
          </FunctionCallExpression>
        </Argument>`
            : ''
        }${
        s.fontName
          ? `
        <Argument label="fontName">
          <FunctionCallExpression>
            <MemberExpression name="value">
              <IdentifierExpression name="Optional"/>
            </MemberExpression>
            <Argument>
              <Literal type="String" value="${s.fontName}"/>
            </Argument>
          </FunctionCallExpression>
        </Argument>`
          : ''
      }${
        s.lineHeight
          ? `
        <Argument label="lineHeight">
          <FunctionCallExpression>
            <MemberExpression name="value">
              <IdentifierExpression name="Optional"/>
            </MemberExpression>
            <Argument>
              <Literal type="Number" value="${s.lineHeight}"/>
            </Argument>
          </FunctionCallExpression>
        </Argument>`
          : ''
      }${
        s.letterSpacing
          ? `
        <Argument label="letterSpacing">
          <FunctionCallExpression>
            <MemberExpression name="value">
              <IdentifierExpression name="Optional"/>
            </MemberExpression>
            <Argument>
              <Literal type="Number" value="${s.letterSpacing}"/>
            </Argument>
          </FunctionCallExpression>
        </Argument>`
          : ''
      }${
        s.color && typeof s.color === 'string'
          ? `
        <Argument label="color">
          <FunctionCallExpression>
            <MemberExpression name="value">
              <IdentifierExpression name="Optional"/>
            </MemberExpression>
            <Argument>
              <Literal type="String" value="${s.color}"/>
            </Argument>
          </FunctionCallExpression>
        </Argument>`
          : s.color && typeof s.color !== 'string' && typeof s.color.name
          ? `
        <Argument label="color">
          <FunctionCallExpression>
            <MemberExpression name="value">
              <IdentifierExpression name="Optional"/>
            </MemberExpression>
            <Argument>
              <MemberExpression name="${s.color.name}">
                <IdentifierExpression name="${prefix}Colors"/>
              </MemberExpression>
            </Argument>
          </FunctionCallExpression>
        </Argument>`
          : ''
      }${
        s.fontFamily
          ? `
        <Argument label="fontFamily">
          <FunctionCallExpression>
            <MemberExpression name="value">
              <IdentifierExpression name="Optional"/>
            </MemberExpression>
            <Argument>
              <Literal type="String" value="${s.fontFamily}"/>
            </Argument>
          </FunctionCallExpression>
        </Argument>`
          : ''
      }${
        s.fontWeight
          ? `
        <Argument label="fontWeight">
          <MemberExpression name="${
            typeof s.fontWeight === 'number' ? `w${s.fontWeight}` : s.fontWeight
          }">
            <IdentifierExpression name="FontWeight"/>
          </MemberExpression>
        </Argument>`
          : ''
      }
      </FunctionCallExpression>
    </Variable>`
    )
    .join('\n')}
    </Namespace>
  </Declarations>
    `
  )
}
