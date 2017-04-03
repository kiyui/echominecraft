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
    .filter(chat => chat.command.length === 3)
    .filter(chat => chat.command[1] === 'tp')
    .map(chat => ({
      action: 'chat',
      args: [`/tp ${chat.username} ${chat.command[2]}`]
    }))

  return {
    log: chat$,
    minecraft: tp$
  }
}

const drivers = {
  log: makeLogDriver(),
  minecraft: makeMineflayerDriver({ host: '192.169.1.69', port: 25565, username: username })
}

run(main, drivers)
