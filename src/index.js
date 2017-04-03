import xs from 'xstream'
import { run } from '@cycle/run'
import { makeLogDriver } from './drivers/makeLogDriver'
import { makeMineflayerDriver } from './drivers/makeMineflayerDriver'

const username = 'ECHO'

function main (sources) {
  const chat$ = sources.minecraft.select('chat')
    .map(([username, message]) => ({
      username: username,
      message: message
    }))

  const command$ = chat$
    .filter(chat => chat.message.startsWith(`${username}:`))
    .map(chat => Object.assign({}, chat, { command: chat.message.split(' ') }))

  const tp$ = command$
    .filter(chat => chat.command.length === 3 || chat.command.length === 5)
    .filter(chat => chat.command[1] === 'tp')

  const tpUser$ = tp$
    .filter(chat => chat.command.length === 3)
    .map(chat => ({
      action: 'chat',
      args: [`/tp ${chat.username} ${chat.command[2]}`]
    }))

  const tpCoordinate$ = tp$
    .filter(chat => chat.command.length === 5)
    .map(chat => ({
      action: 'chat',
      args: [`/execute ${chat.username} ~ ~ ~ tp @p ${chat.command[2]} ${chat.command[3]} ${chat.command[4]}`]
    }))

  const minecraft$ = xs.merge(tpUser$, tpCoordinate$)

  return {
    log: chat$,
    minecraft: minecraft$
  }
}

const drivers = {
  log: makeLogDriver(),
  minecraft: makeMineflayerDriver({ host: '192.169.1.69', port: 25565, username: username })
}

run(main, drivers)
