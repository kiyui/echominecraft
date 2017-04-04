import fs from 'fs'
import xs from 'xstream'
import { run } from '@cycle/run'
import { makeLogDriver } from './drivers/makeLogDriver'
import { makeMineflayerDriver } from './drivers/makeMineflayerDriver'

const env = JSON.parse(fs.readFileSync('env.json', 'utf8'))

function main (sources) {
  const chat$ = sources.minecraft.select('chat')
    .map(([username, message]) => ({
      username: username,
      message: message
    }))

  const command$ = chat$
    .filter(chat => chat.message.startsWith(`${env.username}:`))
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

  const spawn$ = command$
    .filter(chat => chat.command.length === 2)
    .filter(chat => chat.command[1] === 'spawnpoint')
    .map(chat => ({
      action: 'chat',
      args: [`/execute ${chat.username} ~ ~ ~ spawnpoint ${chat.username}`]
    }))

  const kill$ = command$
    .filter(chat => chat.command.length === 2)
    .filter(chat => chat.command[1] === 'kill')
    .map(chat => ({
      action: 'chat',
      args: [`/execute ${chat.username} ~ ~ ~ kill ${chat.username}`]
    }))

  const minecraft$ = xs.merge(tpUser$, tpCoordinate$, spawn$, kill$)
    .debug('minecraft')

  return {
    log: chat$,
    minecraft: minecraft$
  }
}

const drivers = {
  log: makeLogDriver(),
  minecraft: makeMineflayerDriver(env)
}

run(main, drivers)
