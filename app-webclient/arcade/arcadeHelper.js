'use strict'
/*
  Open Rowing Monitor, https://github.com/laberning/openrowingmonitor

  Implements some common helpers for the games
*/
export function addButton ({ k, node = k, pos, width, height, text, textOptions, onClick }) {
  const button = node.add([
    k.rect(width, height),
    k.area(),
    k.pos(pos),
    k.origin('center'),
    k.outline(2, k.rgb(0, 0, 0)),
    k.color(54, 80, 128)
  ])
  node.add([
    k.text(text, textOptions),
    k.area({ cursor: 'pointer' }),
    k.pos(button.pos.add(2, 1)),
    k.origin('center'),
    k.color(255, 255, 255)
  ])

  button.onClick(() => {
    onClick()
  })

  button.onUpdate(() => {
    if (button.isHovering()) {
      k.cursor('pointer')
      const t = k.time() * 10
      button.color = k.rgb(
        k.wave(0, 255, t),
        k.wave(0, 255, t + 2),
        k.wave(0, 255, t + 4)
      )
    } else {
      // todo: resetting the cursor here will not work as expected if we have multiple buttons on the page
      // seems like kaboom does not yet have an elegant way of how to do this...
      k.cursor('default')
      button.color = k.rgb(54, 80, 128)
    }
  })
}
