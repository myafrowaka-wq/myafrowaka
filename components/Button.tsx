import { ReactNode } from 'react'

type ButtonProps = {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  href?: string
  onClick?: () => void
  className?: string
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export function Button({
  children,
  variant = 'primary',
  href,
  onClick,
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-sans font-semibold text-sm px-6 py-3 rounded-[14px] transition-colors duration-200 cursor-pointer disabled:opacity-55 disabled:cursor-not-allowed'
  // Session 6.3 (WDOS Design Integrity gate, X-09 — all six interactive
  // states) — primary already gets a real :active press state from the
  // global `.bg-action:active` rule in globals.css; secondary had no
  // equivalent, so a click never looked pressed. active:brightness-90
  // matches that same darken-on-press treatment locally instead of
  // adding a second global selector for one variant.
  const styles = {
    primary: 'bg-action text-cream hover:bg-action-hover shadow-soft',
    secondary: 'border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-cream active:brightness-90',
  }

  const cls = `${base} ${styles[variant]} ${className}`
  const isDisabled = disabled || loading

  const content = loading ? (
    <>
      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      <span className="sr-only">Loading</span>
      {children}
    </>
  ) : children

  if (href) {
    // An <a> has no native disabled state — aria-disabled + blocking the
    // click handler is the accessible equivalent.
    return (
      <a
        href={isDisabled ? undefined : href}
        aria-disabled={isDisabled || undefined}
        className={cls}
        onClick={isDisabled ? (e) => e.preventDefault() : undefined}
        tabIndex={isDisabled ? -1 : undefined}
      >
        {content}
      </a>
    )
  }

  return (
    <button type={type} onClick={onClick} disabled={isDisabled} className={cls}>
      {content}
    </button>
  )
}
