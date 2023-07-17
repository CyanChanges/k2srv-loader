import CAC from 'cac'
import start from './koishi/koishi-start'

const { version } = require('../package.json')

const cli = CAC('k2345').help().version(version)

cli.command('start-minify', 'Start minify Koishi')
  .action(start)


cli.parse()
