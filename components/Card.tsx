import { Badge } from './Badge'

type CardProps = {
  title: string
  country: string
  category: string
  imageUrl?: string
  lastVerified?: string
  isUNESCO?: boolean
  href?: string
}

export function Card({ title, country, category, imageUrl, lastVerified, isUNESCO, href = '#' }: CardProps) {
  return (
    <a href={href} className="group block bg-sand rounded-[22px] overflow-hidden shadow-soft hover:shadow-lift transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-48 bg-ochre-100 overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-mono text-ochre-300 text-xs uppercase tracking-widest">No image yet</span>
          </div>
        )}
        {isUNESCO && (
          <div className="absolute top-3 right-3">
            <Badge variant="unesco">UNESCO</Badge>
          </div>
        )}
      </div>
      <div className="p-5">
        <p className="font-mono text-xs uppercase tracking-widest text-charcoal-300 mb-1">{country} · {category}</p>
        <h3 className="font-display font-semibold text-lg text-charcoal leading-snug mb-3">{title}</h3>
        {lastVerified && (
          <Badge variant="verified">Verified {lastVerified}</Badge>
        )}
      </div>
    </a>
  )
}
