'use strict'
const { deepStrictEqual: eq } = require('assert')
const { Application } = require('spectron')
const path = require('path')
const delay = time => new Promise(fin => setTimeout(fin, time))

describe('grid', function () {
  this.timeout(8000)
  let app

  const input = async m => {
    await delay(100)
    await app.client.keys(m)
  }

  input.meta = async m => {
    await input('\uE03D')
    await input(m)
    await input('\uE03D')
  }

  const mode = {
    get insert() { input('i') },
    get normal() { input('Escape') },
  }

  beforeEach(async () => {
    app = new Application({
      path: './node_modules/.bin/electron',
      args: [path.join(__dirname, '../../build/bootstrap/main.js')]
    })
    await app.start()
    await delay(800)
  })

  it('do stuff', async () => {
    await delay(235)
    await input(':cd ~/Documents/projects/veonim')
    await input('Enter')
    await input(':e src/core/api.ts')
    await input('Enter')
    await input(':split src/core/render.ts')
    await input('Enter')
    await input(':vsplit')
    await input('Enter')

    await input(':Veonim blarg')
    await input('Enter')

    await app.webContents.openDevTools()
  })
})