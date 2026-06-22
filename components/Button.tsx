import { ReactNode } from 'react'

type ButtonProps = {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  href?: string
  onClick?: () => void
  className?: string
}

export function Button({ children, variant = 'primary', href, onClick, className = '' }: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-sans font-semibold text-sm px-6 py-3 rounded-[14px] transition-all duration-200 cursor-pointer'
  const styles = {
    primary: 'bg-crimson text-cream hover:bg-crimson-600 shadow-soft',
    secondary: 'border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-cream',
  }

  const cls = `${base} ${styles[variant]} ${className}`

  if (href) return <a href={href} className={cls}>{children}</a>
  return <button onClick={onClick} className={cls}>{children}</button>
}
