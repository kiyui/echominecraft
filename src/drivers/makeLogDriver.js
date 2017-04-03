export function makeLogDriver () {
  function logDriver (outgoing$) {
    outgoing$.addListener({
      next: outgoing => {
        console.dir(outgoing)
      },
      error: () => {
      },
      complete: () => {
      }
    })

    return false
  }

  return logDriver
}
