import { ReactNode } from 'react'

interface DeviceFrameProps {
  children: ReactNode
}

export function DeviceFrame({ children }: DeviceFrameProps) {
  return (
    <div className="min-h-dvh w-full flex flex-col bg-surface text-on-surface font-sans">
      {children}
    </div>
  )
}
