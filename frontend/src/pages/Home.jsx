import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { useLanguage } from '../i18n/LanguageContext'

// Font stacks — load Space Grotesk / Inter / JetBrains Mono via Google Fonts in index.html
const FONT_DISPLAY = "'Space Grotesk', 'Inter', sans-serif"
const FONT_BODY = "'Inter', sans-serif"
const FONT_MONO = "'JetBrains Mono', ui-monospace, monospace"

// Depot + clusters describing the TSP-clustering visualization.
// Each cluster is a closed loop (its own local TSP tour); dashed lines
// show the dispatch leg from the depot to each cluster's entry node.
const depot = { x: 10, y: 86 }

const clusters = [
  {
    id: 'A',
    color: '#8B5CF6',
    nodes: [
      { x: 18, y: 20 },
      { x: 33, y: 12 },
      { x: 41, y: 27 },
    ],
  },
  {
    id: 'B',
    color: '#F59E0B',
    nodes: [
      { x: 62, y: 15 },
      { x: 81, y: 22 },
      { x: 75, y: 38 },
      { x: 58, y: 34 },
    ],
  },
  {
    id: 'C',
    color: '#2DD4BF',
    nodes: [
      { x: 55, y: 57 },
      { x: 73, y: 65 },
      { x: 66, y: 80 },
      { x: 47, y: 74 },
    ],
  },
]

const toLoopPath = (nodes) =>
  `M ${nodes[0].x} ${nodes[0].y} ` +
  nodes
    .slice(1)
    .map((n) => `L ${n.x} ${n.y}`)
    .join(' ') +
  ' Z'

// The overall tour: depot -> entry node of cluster A -> entry node of cluster B
// -> entry node of cluster C -> back to depot. Each cluster's own loop (its
// local TSP tour) is drawn separately in the cluster's color.
const connectorPoints = [depot, ...clusters.map((c) => c.nodes[0]), depot]

const workflow = [
  { label: 'Create Delivery', icon: '📦' },
  { label: 'Optimize Route', icon: '🧭' },
  { label: 'Track Progress', icon: '📍' },
]

const capabilityTags = ['Cluster visualization', 'Route optimization', 'Live fleet map', 'Distance savings']

const highlights = [
  {
    icon: '🧭',
    title: 'Cluster-based Routing',
    description: 'Delivery points are grouped into balanced clusters, then each cluster is solved as its own shortest-tour problem.',
  },
  {
    icon: '📍',
    title: 'Real-time Tracking',
    description: 'Follow every drone across every active cluster with live GPS position and ETA updates.',
  },
  {
    icon: '📊',
    title: 'Optimization Analytics',
    description: 'See distance saved, cluster balance, and time-per-stop compared against an unoptimized baseline.',
  },
]

export default function Home() {
  const navigate = useNavigate()
  const { account } = useAuth()
  const { t } = useLanguage()

  useEffect(() => {
    if (account) {
      navigate('/dashboard')
    }
  }, [account, navigate])

  return (
    <div className="min-h-screen bg-[#F7F8FB] text-[#0B1220]" style={{ fontFamily: FONT_BODY }}>
      <header className="border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-3"
            aria-label="DroneFlow home"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-2xl">
              🚁
            </span>
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: FONT_DISPLAY }}>
              DroneFlow CICD
            </span>
          </button>

          <div className="flex items-center gap-2">
            <LanguageSwitcher compact />
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
            >
              {t('Login')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              {t('Sign Up')}
            </button>
          </div>
        </div>
      </header>

      <main>
        <section
          className="relative overflow-hidden"
          style={{
            backgroundImage:
              'radial-gradient(1100px 480px at 15% -10%, rgba(99,102,241,0.10), transparent), radial-gradient(900px 420px at 100% 10%, rgba(45,212,191,0.08), transparent)',
          }}
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-12 lg:items-center lg:py-20">
            <div className="lg:col-span-7">
              <div className="mb-6 inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700">
                {t('TSP-Optimized Delivery Network')}
              </div>

              <h1
                className="max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-[#0B1220] md:text-6xl"
                style={{ fontFamily: FONT_DISPLAY }}
              >
                {t('The Future of')} {t('Drone Delivery')}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                {t('Real-time tracking, cluster-based route optimization, and fleet analytics all in one place.')}
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="rounded-lg bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
                >
                  {t('Get Started Free')}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="text-base font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 transition hover:text-indigo-700 hover:decoration-indigo-400"
                >
                  {t('Create Account')} →
                </button>
              </div>

              <div className="mt-10 max-w-2xl rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="grid gap-3 sm:grid-cols-3">
                  {workflow.map((item, index) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-xl">
                        {item.icon}
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400" style={{ fontFamily: FONT_MONO }}>
                          0{index + 1}
                        </p>
                        <p className="text-sm font-bold text-slate-800">{t(item.label)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex max-w-2xl flex-wrap gap-2">
                {capabilityTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600"
                  >
                    {t(tag)}
                  </span>
                ))}
              </div>
            </div>

            {/* Signature element: dark "mission control" panel visualizing
                clustered TSP tours rather than a single generic route. */}
            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0F172A] p-5 shadow-2xl shadow-indigo-950/30">
                <div className="flex items-center justify-between px-1 pb-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400" style={{ fontFamily: FONT_MONO }}>
                    {t('Route Optimization Engine')}
                  </p>
                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-400">
                    {t('Optimized')}
                  </span>
                </div>

                <div className="relative h-[360px] overflow-hidden rounded-xl bg-[#0B1526]">
                  {/* subtle grid */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        'linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)',
                      backgroundSize: '28px 28px',
                    }}
                  />

                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
                    {/* connector route: depot -> cluster A -> cluster B -> cluster C -> depot */}
                    {connectorPoints.slice(0, -1).map((p, i) => (
                      <line
                        key={`connector-${i}`}
                        x1={p.x}
                        y1={p.y}
                        x2={connectorPoints[i + 1].x}
                        y2={connectorPoints[i + 1].y}
                        stroke="#64748B"
                        strokeWidth="0.5"
                        strokeDasharray="2 2"
                      />
                    ))}
                    {/* optimized loop per cluster */}
                    {clusters.map((c) => (
                      <path
                        key={`loop-${c.id}`}
                        d={toLoopPath(c.nodes)}
                        fill="none"
                        stroke={c.color}
                        strokeWidth="0.9"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    ))}
                    {/* depot */}
                    <circle cx={depot.x} cy={depot.y} r="2" fill="#E2E8F0" stroke="#0F172A" strokeWidth="0.6" />
                    {/* cluster nodes */}
                    {clusters.map((c) =>
                      c.nodes.map((n, i) => (
                        <circle
                          key={`${c.id}-${i}`}
                          cx={n.x}
                          cy={n.y}
                          r="1.5"
                          fill={c.color}
                          stroke="#0B1526"
                          strokeWidth="0.5"
                        />
                      )),
                    )}
                  </svg>

                  <div
                    className="absolute -translate-x-1/2 -translate-y-full rounded bg-slate-800/90 px-2 py-0.5 text-[10px] font-semibold text-slate-200"
                    style={{ left: `${depot.x}%`, top: `${depot.y - 3}%` }}
                  >
                    {t('Depot')}
                  </div>
                  {clusters.map((c) => (
                    <div
                      key={`label-${c.id}`}
                      className="absolute -translate-x-1/2 -translate-y-full rounded px-2 py-0.5 text-[10px] font-bold text-slate-900"
                      style={{
                        left: `${c.nodes[0].x}%`,
                        top: `${c.nodes[0].y - 2}%`,
                        backgroundColor: c.color,
                      }}
                    >
                      {t('Cluster')} {c.id}
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 px-1" style={{ fontFamily: FONT_MONO }}>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">{t('Clusters')}</p>
                    <p className="text-lg font-semibold text-white">3</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">{t('Stops')}</p>
                    <p className="text-lg font-semibold text-white">11</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">{t('Distance saved')}</p>
                    <p className="text-lg font-semibold text-emerald-400">-34%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-5 px-5 py-14 md:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-2xl">
                  {item.icon}
                </div>
                <h3 className="text-base font-bold text-[#0B1220]" style={{ fontFamily: FONT_DISPLAY }}>
                  {t(item.title)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{t(item.description)}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}