type BadgeProps = {
  variant: 'verified' | 'unesco' | 'tag'
  children: React.ReactNode
}

export function Badge({ variant, children }: BadgeProps) {
  const styles = {
    verified: 'bg-moss-050 text-moss-700 border border-moss-200',
    unesco:   'bg-gold-050 text-gold-700 border border-gold-200',
    tag:      'bg-ochre-050 text-ochre-700 border border-ochre-200',
  }
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full ${styles[variant]}`}>
      {children}
    </span>
  )
}
