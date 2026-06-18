import { useEffect, useMemo, useState } from 'react'
import { Nav } from './components/Nav'
import type { AppData, SectionId } from './types'
import { loadAppData, saveAppData } from './utils/storage'
import './styles/global.css'

const services = [
  { label: 'Ideias', icon: '💡' },
  { label: 'Apps', icon: '📱' },
  { label: 'Sites', icon: '🌐' },
  { label: 'IA', icon: '🤖' },
]

function App() {
  const [appData, setAppData] = useState<AppData>(() => loadAppData())
  const [section, setSection] = useState<SectionId>('parties')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => saveAppData(appData), [appData])

  const activeParty = appData.parties.find((party) => party.id === appData.selectedPartyId && party.active && !party.archived) ?? appData.parties.find((party) => party.active && !party.archived)
  const emptyActive = !activeParty

  const projectCards = useMemo(() => {
    const tabs = activeParty?.tabs.filter((tab) => tab.active).slice(0, 2) ?? []
    if (tabs.length > 0) {
      return tabs.map((tab, index) => {
        const consumed = activeParty?.consumptions.filter((item) => item.tabId === tab.id).reduce((sum, item) => sum + item.price, 0) ?? 0
        const progress = tab.minimumSpend > 0 ? Math.min(96, Math.max(18, Math.round((consumed / tab.minimumSpend) * 100))) : index === 0 ? 82 : 64
        return {
          title: index === 0 ? 'Aplicativo mobile' : tab.code,
          status: index === 0 ? 'Protótipo aprovado' : 'Em desenvolvimento',
          progress,
          tone: index === 0 ? 'mint' : 'violet',
        }
      })
    }

    return [
      { title: 'Aplicativo mobile', status: 'Protótipo aprovado', progress: 82, tone: 'mint' },
      { title: 'Landing page', status: 'Em desenvolvimento', progress: 64, tone: 'violet' },
    ]
  }, [activeParty])

  return (
    <main className={`app-shell ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <div className="phone-status" aria-hidden="true">
        <span>09:41</span>
        <span>●●● 5G ▰</span>
      </div>

      <div className="app-container">
        <header className="topbar">
          <div className="brand-mark">TE</div>
          <div className="welcome-copy">
            <span>Olá, bem-vindo</span>
            <h1>Tech Engenhoso</h1>
          </div>
          <button className="theme-toggle" type="button" onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')} aria-label="Alternar tema claro e escuro">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </header>

        <section className="hero-card">
          <div className="hero-art" aria-hidden="true" />
          <p>Projeto em destaque</p>
          <h2>Transforme sua ideia em um produto digital.</h2>
          <span>Aplicativos, automações e sites criados com estratégia.</span>
          <button className="cta-button" type="button" onClick={() => setSection('tabs')}>Começar</button>
        </section>

        <section className="service-grid" aria-label="Tipos de solução">
          {services.map((service) => <button className="service-card" key={service.label} type="button"><span>{service.icon}</span>{service.label}</button>)}
        </section>

        <section className="dashboard-heading">
          <div>
            <p>Dashboard</p>
            <h2>Projetos recentes</h2>
          </div>
          <button type="button" onClick={() => setSection('tabs')}>Ver todos</button>
        </section>

        <section className="project-list" aria-label="Projetos recentes">
          {projectCards.map((project) => <article className={`project-card ${project.tone}`} key={project.title}>
            <div className="project-icon">▣</div>
            <div className="project-info">
              <h3>{project.title}</h3>
              <p>{project.status}</p>
              <div className="progress-track"><span style={{ width: `${project.progress}%` }} /></div>
            </div>
            <strong>{project.progress}%</strong>
          </article>)}
        </section>

        <section className="solutions">
          <p>Soluções</p>
          <h2>O que você pode solicitar</h2>
          <article className="solution-card">
            <span>Plano ideal</span>
            <h3>Consultoria + desenvolvimento sob medida</h3>
            <p>Da validação ao lançamento, tudo acompanhado pelo celular.</p>
            <button type="button" onClick={() => setAppData((current) => ({ ...current }))}>Abrir app</button>
          </article>
        </section>

        <Nav current={section} disabled={emptyActive} onChange={setSection} />
      </div>
    </main>
  )
}

export default App
