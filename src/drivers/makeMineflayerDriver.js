import mineflayer from 'mineflayer'
import xs from 'xstream'

export function makeMineflayerDriver (config) {
  const bot = mineflayer.createBot({
    host: '192.168.1.69',
    port: 25565,
    username: 'ECHO'
  })

  function mineflayerDriver (outgoing$) {
    outgoing$.addListener({
      next: outgoing => {
        bot[outgoing.action](...outgoing.args)
      },
      error: () => {
      },
      complete: () => {
      }
    })

    return {
      select: event => xs.create({
        start: listener => {
          bot.on(event, (...args) => listener.next(args))
        },
        stop: () => {
        }
      })
    }
  }

  return mineflayerDriver
}
