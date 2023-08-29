// @deprecate

import { App } from 'koishi'
import mock from '@koishijs/plugin-mock'
import * as k2s from 'koishi-plugin-k2s'
import client from '@koishijs/client'
import console from '@koishijs/plugin-console'
import * as market from '@koishijs/plugin-market'

const app = new App()
app.plugin(mock)
app.plugin(client)
app.plugin(console)
app.plugin(market)
app.plugin(k2s)

before(() => app.start())
after(() => app.stop())

it('test 1', async ()=>{

  app.logger('test').info("Hello World!")
})


