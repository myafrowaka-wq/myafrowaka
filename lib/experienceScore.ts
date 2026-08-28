// Session 3.3 — the MyAfroWaka Experience Score rollup. The published
// rubric lives at /events/experience-score.

export interface ExperienceScoreFields {
  scoreCulturalDepth?: number
  scoreInternationalAppeal?: number
  scoreMusic?: number
  scoreFood?: number
  scoreFamilySuitability?: number
  scoreAccessibility?: number
  scorePhotography?: number
  scoreTravelInfrastructure?: number
}

export const SCORE_DIMENSIONS: { key: keyof ExperienceScoreFields; label: string }[] = [
  { key: 'scoreCulturalDepth',         label: 'Cultural Depth' },
  { key: 'scoreInternationalAppeal',   label: 'International Appeal' },
  { key: 'scoreMusic',                 label: 'Music' },
  { key: 'scoreFood',                  label: 'Food' },
  { key: 'scoreFamilySuitability',     label: 'Family Suitability' },
  { key: 'scoreAccessibility',         label: 'Accessibility' },
  { key: 'scorePhotography',           label: 'Photography' },
  { key: 'scoreTravelInfrastructure',  label: 'Travel Infrastructure' },
]

/**
 * Returns the averaged overall score, or null if any of the 8 dimensions
 * is missing. A partial score — 5 of 8 filled in, say — is not a smaller
 * version of a real score, it's a different, misleading claim, so this
 * deliberately refuses to average an incomplete set rather than silently
 * treating a missing dimension as absent from the average.
 */
export function overallExperienceScore(event: ExperienceScoreFields): number | null {
  const values = SCORE_DIMENSIONS.map(d => event[d.key])
  if (values.some(v => v === undefined || v === null)) return null
  const numbers = values as number[]
  const sum = numbers.reduce((a, b) => a + b, 0)
  return Math.round((sum / numbers.length) * 10) / 10
}
