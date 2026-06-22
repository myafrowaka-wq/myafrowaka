import { client } from '../../sanity/lib/client'

export const revalidate = 0

export default async function TestPage() {
  const items = await client.fetch(`*[_type == "testItem"]{ title }`)

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Sanity Connection Test</h1>
      {items.length === 0 ? (
        <p>No test items yet. Go to /studio and create one.</p>
      ) : (
        <ul>
          {items.map((item: { title: string }, i: number) => (
            <li key={i}>{item.title}</li>
          ))}
        </ul>
      )}
    </main>
  )
}
