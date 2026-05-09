export const cx = (...classes) => classes.filter(Boolean).join(' ')

const LEVEL_THEME = {
  A1: {
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    tint: 'border-emerald-200/80 bg-emerald-50/60',
    text: 'text-emerald-700',
  },
  A2: {
    badge: 'bg-lime-50 text-lime-700 ring-lime-200',
    tint: 'border-lime-200/80 bg-lime-50/60',
    text: 'text-lime-700',
  },
  B1: {
    badge: 'bg-sky-50 text-sky-700 ring-sky-200',
    tint: 'border-sky-200/80 bg-sky-50/60',
    text: 'text-sky-700',
  },
  B2: {
    badge: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
    tint: 'border-indigo-200/80 bg-indigo-50/60',
    text: 'text-indigo-700',
  },
  C1: {
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
    tint: 'border-amber-200/80 bg-amber-50/60',
    text: 'text-amber-700',
  },
  C2: {
    badge: 'bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200',
    tint: 'border-fuchsia-200/80 bg-fuchsia-50/60',
    text: 'text-fuchsia-700',
  },
}

export function levelTheme(level = 'A1') {
  return LEVEL_THEME[String(level).toUpperCase()] || LEVEL_THEME.A1
}

export function levelBadgeClass(level = 'A1') {
  return cx(
    'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] ring-1',
    levelTheme(level).badge
  )
}

export const buttonClass = {
  primary:
    'btn-primary inline-flex items-center justify-center gap-2 rounded-full bg-brand-blue px-5 py-3 font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-brand-blueDeep focus:outline-none focus:ring-4 focus:ring-brand-blue/20 disabled:cursor-not-allowed disabled:opacity-60',
  secondary:
    'btn-secondary inline-flex items-center justify-center gap-2 rounded-full bg-brand-green px-5 py-3 font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-brand-greenDeep focus:outline-none focus:ring-4 focus:ring-brand-green/20 disabled:cursor-not-allowed disabled:opacity-60',
  outline:
    'btn-outline inline-flex items-center justify-center gap-2 rounded-full border border-brand-blue/30 bg-white/80 px-5 py-3 font-semibold text-brand-text transition hover:border-brand-blue hover:bg-brand-sky/80 hover:text-brand-blueDeep focus:outline-none focus:ring-4 focus:ring-brand-blue/15 disabled:cursor-not-allowed disabled:opacity-60',
  ghost:
    'btn-ghost inline-flex items-center justify-center gap-2 rounded-full bg-brand-sky/60 px-5 py-3 font-semibold text-brand-brown transition hover:bg-brand-sky focus:outline-none focus:ring-4 focus:ring-brand-blue/10 disabled:cursor-not-allowed disabled:opacity-60',
}

export const cardClass = {
  base: 'rounded-[1.9rem] border border-brand-border/80 bg-white/88 shadow-panel backdrop-blur-sm',
  soft: 'rounded-[1.65rem] border border-brand-border/70 bg-white/72 shadow-soft backdrop-blur-sm',
  interactive:
    'rounded-[1.9rem] border border-brand-border/80 bg-white/92 shadow-panel backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-brand-blue/40 hover:shadow-card',
}

export const inputClass =
  'w-full rounded-[1.35rem] border border-brand-border bg-white/90 px-4 py-3 text-base text-brand-text shadow-inner outline-none transition placeholder:text-brand-brown/45 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/15'
