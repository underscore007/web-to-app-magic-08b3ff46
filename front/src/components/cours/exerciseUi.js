import { buttonClass, cardClass, cx, inputClass } from '@utils/ui'

export const exerciseShell = cx(cardClass.base, 'flex flex-col gap-5 p-5 sm:p-6')
export const exerciseBadge =
  'inline-flex w-fit items-center gap-2 rounded-full border border-brand-border/70 bg-brand-sky/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-brand-blue'
export const questionCard = 'rounded-[1.5rem] bg-brand-sky/55 p-4 sm:p-5'
export const questionText = 'font-display text-2xl font-semibold tracking-tight text-brand-text'
export const subText = 'mt-2 text-sm leading-relaxed text-brand-brown'
export const feedbackClass = (correct) =>
  cx(
    'rounded-[1.4rem] border px-4 py-3 text-sm font-semibold',
    correct ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'
  )
export const explainBox = 'rounded-[1.5rem] border border-brand-border/70 bg-white/72 p-4 text-sm leading-relaxed text-brand-brown'
export const optionBase =
  'flex w-full items-center gap-3 rounded-[1.4rem] border border-brand-border/80 bg-white/80 px-4 py-3 text-left text-brand-text transition hover:border-brand-blue/50 hover:bg-brand-sky/65 disabled:cursor-not-allowed disabled:opacity-80'
export const optionSelected = 'border-brand-blue bg-brand-sky/80 shadow-soft'
export const optionCorrect = 'border-emerald-300 bg-emerald-50 text-emerald-700'
export const optionWrong = 'border-rose-300 bg-rose-50 text-rose-700'
export const inputBase = inputClass
export const ghostButton = buttonClass.ghost
export const primaryButton = buttonClass.primary
export const outlineButton = buttonClass.outline
