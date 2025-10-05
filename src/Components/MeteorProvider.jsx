

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import OverlayMeteor from './OverlayMeteor'

const Ctx = createContext(null)

export function MeteorProvider({ children }) {
  const [cmd, setCmd] = useState(null)
  const [enabled, setEnabled] = useState(true)

  const api = useMemo(() => ({
    fireAt: (x, y, opts={}) => setCmd({ key: Date.now(), target: { x, y }, ...opts }),
    fireAtEvent: (e, opts={}) => setCmd({ key: Date.now(), target: { x: e.clientX, y: e.clientY }, ...opts }),
    fireAtElement: (el, opts={}) => {
      if (!el) return
      const r = el.getBoundingClientRect()
      setCmd({ key: Date.now(), target: { x: r.left + r.width/2, y: r.top + r.height/2 }, ...opts })
    },
    enable: () => setEnabled(true),
    disable: () => setEnabled(false),
  }), [])

  useEffect(() => { window.meteor = api; return () => { delete window.meteor } }, [api])

  return (
    <Ctx.Provider value={api}>
      {children}
      {cmd && (
        <OverlayMeteor
          key={cmd.key}
          enabled={enabled}
          target={cmd.target}
          from={cmd.from ?? 'top'}
          scale={cmd.scale ?? 1}
          duration={cmd.duration ?? 1400}
          controlOffset={cmd.controlOffset ?? 0.25}
          onComplete={() => setCmd(null)}
        />
      )}
    </Ctx.Provider>
  )
}

export function useMeteor() {
  return useContext(Ctx)
}