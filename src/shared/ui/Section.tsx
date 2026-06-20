import type { PropsWithChildren, ReactNode } from 'react'

type SectionProps = PropsWithChildren<{
  title: string
  subtitle?: string
  actions?: ReactNode
}>

export function Section({ title, subtitle, actions, children }: SectionProps) {
  return (
    <section className="section-card">
      <header className="section-header">
        <div>
          {subtitle && <p>{subtitle}</p>}
          <h1>{title}</h1>
        </div>
        {actions}
      </header>
      {children}
    </section>
  )
}
