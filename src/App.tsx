import './App.css'

type Stat = {
  value: string
  label: string
}

type Service = {
  icon: string
  title: string
  description: string
}

const stats: Stat[] = [
  { value: '24h', label: 'suporte rápido' },
  { value: '4.9', label: 'avaliação média' },
  { value: '100%', label: 'experiência mobile' },
]

const services: Service[] = [
  {
    icon: '⚡',
    title: 'Soluções digitais',
    description: 'Automatize atendimentos, vendas e processos em uma jornada simples.',
  },
  {
    icon: '📱',
    title: 'App no celular',
    description: 'Interface pensada para toque, leitura rápida e navegação com uma mão.',
  },
  {
    icon: '🛠️',
    title: 'Consultoria tech',
    description: 'Conte com especialistas para tirar sua ideia do papel com tecnologia.',
  },
]

function App() {
  return (
    <main className="phone-shell" aria-label="Página mobile Tech Engenhoso">
      <section className="hero-card">
        <header className="topbar" aria-label="Cabeçalho">
          <div className="brand-mark" aria-hidden="true">T</div>
          <div>
            <p className="eyebrow">Tech Engenhoso</p>
            <strong>Mobile first</strong>
          </div>
          <button className="menu-button" type="button" aria-label="Abrir menu">
            <span></span>
            <span></span>
          </button>
        </header>

        <div className="hero-copy">
          <span className="pill">Transformação digital no seu bolso</span>
          <h1>Crie, venda e acompanhe tudo pelo celular.</h1>
          <p>
            Uma experiência web inspirada em aplicativo mobile: rápida, elegante e
            pronta para conectar clientes às suas soluções.
          </p>
        </div>

        <div className="cta-row">
          <a className="primary-action" href="https://github.com/techengenhoso/my-app" target="_blank">
            Ver projeto
          </a>
          <a className="secondary-action" href="#servicos">
            Serviços
          </a>
        </div>
      </section>

      <section className="stats-grid" aria-label="Indicadores">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </section>

      <section className="content-card" id="servicos">
        <div className="section-heading">
          <p className="eyebrow">Para seu negócio</p>
          <h2>Funcionalidades principais</h2>
        </div>

        <div className="service-list">
          {services.map((service) => (
            <article className="service-item" key={service.title}>
              <div className="service-icon" aria-hidden="true">{service.icon}</div>
              <div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="highlight-card">
        <div>
          <p className="eyebrow">Pronto para começar?</p>
          <h2>Leve a presença da sua marca para qualquer tela.</h2>
        </div>
        <a className="primary-action wide" href="mailto:contato@techengenhoso.com">
          Falar agora
        </a>
      </section>
    </main>
  )
}

export default App
