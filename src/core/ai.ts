import { getSignatureHint } from '../ai/signature-hint'
import * as updateService from '../ai/update-server'
import { getCompletions } from '../ai/completions'
import colorizer from '../services/colorizer'
import nvim from '../core/neovim'
import '../ai/diagnostics'
import '../ai/references'
import '../ai/definition'
import '../ai/highlights'
import '../ai/symbols'
import '../ai/rename'
import '../ai/hover'

// TODO: temp hack to fix langservers not recv didOpen events
// when sourcing a vim session
import { onServerStart } from '../langserv/director'

onServerStart(async () => {
  const buffers = await nvim.buffers.list()
  const bufs = await Promise.all(buffers.map(b => ({ ...b, name: b.name })))

  bufs.forEach(async b => {
    const lines = await b.getAllLines()
    updateService.update({ lines: lines as any })
  })
})

nvim.watchState.colorscheme((color: string) => colorizer.call.setColorScheme(color))

nvim.on.bufAdd(() => updateService.update({ bufferOpened: true }))
nvim.on.bufLoad(() => updateService.update())
nvim.on.bufChange(() => updateService.update())

// using cursor move with a diff on revision number because we might need to
// update the lang server before triggering completions/hint lookups. using
// textChangedI + cursorMovedI would make it very difficult to wait in cursorMovedI
// until textChangedI ran AND updated the server
nvim.on.cursorMoveInsert(async (bufferModified) => {
  if (bufferModified) await updateService.update({ lineChange: true })
  const lineContent = await nvim.getCurrentLine()
  getCompletions(lineContent, nvim.state.line, nvim.state.column)
  getSignatureHint(lineContent)
})
