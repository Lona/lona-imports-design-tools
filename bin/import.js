#!/usr/bin/env node

require('yargs')
  .command(
    'sketch [SketchFile]',
    'import a Sketch file to a Lona workspace',
    yargs => {
      yargs.positional('SketchFile', {
        describe: 'path to the Sketch file to import',
      })
    },
    argv => {
      require('../lib/sketch').sketchToLona(argv.SketchFile, argv.dist)
    }
  )
  .command(
    'figma [FigmaURL]',
    'import a Sketch file to a Lona workspace',
    yargs => {
      yargs.positional('FigmaURL', {
        describe: 'URL of the Figma file to import',
      })
    },
    argv => {
      require('../lib/figma').figmaToLona(
        { url: argv.FigmaURL, token: process.env.FIGMA_TOKEN },
        argv.workspace
      )
    }
  )
  .option('workspace', {
    alias: 'o',
    type: 'string',
    description: 'Path to the Lona workspace',
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Run with verbose logging',
  }).argv
