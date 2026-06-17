import type { CSSProperties } from 'react'
import './App.css'

type Shortcut = {
  icon: string
  label: string
}

type Project = {
  title: string
  status: string
  progress: number
  accent: string
}

const shortcuts: Shortcut[] = [
  { icon: '💡', label: 'Ideias' },
  { icon: '📱', label: 'Apps' },
  { icon: '🌐', label: 'Sites' },
  { icon: '🤖', label: 'IA' },
]

const projects: Project[] = [
  {
    title: 'Aplicativo mobile',
    status: 'Protótipo aprovado',
    progress: 82,
    accent: '#14b8a6',
  },
  {
    title: 'Landing page',
    status: 'Em desenvolvimento',
    progress: 64,
    accent: '#6366f1',
  },
]

function App() {
  return (
    <main className="app-screen" aria-label="Réplica web mobile do app Tech Engenhoso">
      <section className="phone-frame">
        <header className="status-bar" aria-label="Barra de status">
          <strong>09:41</strong>
          <span>●●● 5G ▰</span>
        </header>

        <section className="home-header">
          <div className="profile-row">
            <div className="avatar" aria-hidden="true">TE</div>
            <div>
              <p>Olá, bem-vindo</p>
              <h1>Tech Engenhoso</h1>
            </div>
            <button className="icon-button" type="button" aria-label="Notificações">🔔</button>
          </div>

          <article className="hero-panel">
            <div>
              <span>Projeto em destaque</span>
              <h2>Transforme sua ideia em um produto digital.</h2>
              <p>Aplicativos, automações e sites criados com estratégia.</p>
            </div>
            <button type="button">Começar</button>
          </article>
        </section>

        <section className="quick-actions" aria-label="Atalhos">
          {shortcuts.map((item) => (
            <button className="shortcut" type="button" key={item.label}>
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </section>

        <section className="content-section" aria-labelledby="projects-title">
          <div className="section-title">
            <div>
              <p>Dashboard</p>
              <h2 id="projects-title">Projetos recentes</h2>
            </div>
            <a href="#todos">Ver todos</a>
          </div>

          <div className="project-list">
            {projects.map((project) => (
              <article className="project-card" key={project.title} style={{ '--accent': project.accent } as CSSProperties}>
                <div className="project-icon" aria-hidden="true">▣</div>
                <div>
                  <h3>{project.title}</h3>
                  <p>{project.status}</p>
                  <div className="progress-track" aria-label={`${project.progress}% concluído`}>
                    <span style={{ width: `${project.progress}%` }}></span>
                  </div>
                </div>
                <strong>{project.progress}%</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="content-section" aria-labelledby="services-title">
          <div className="section-title">
            <div>
              <p>Soluções</p>
              <h2 id="services-title">O que você pode solicitar</h2>
            </div>
          </div>

          <article className="service-banner">
            <div>
              <span>Plano ideal</span>
              <h3>Consultoria + desenvolvimento sob medida</h3>
              <p>Da validação ao lançamento, tudo acompanhado pelo celular.</p>
            </div>
            <a href="https://github.com/techengenhoso/my-app" target="_blank">Abrir app</a>
          </article>
        </section>

        <nav className="bottom-tabs" aria-label="Navegação principal">
          <a className="active" href="#inicio">⌂<span>Início</span></a>
          <a href="#projetos">▦<span>Projetos</span></a>
          <a href="#chat">◌<span>Chat</span></a>
          <a href="#perfil">♙<span>Perfil</span></a>
        </nav>
      </section>
    </main>
  )
}

export default App
