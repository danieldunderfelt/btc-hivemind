import { trpc } from '@/lib/trpc'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const greetingQuery = useQuery(trpc.greet.queryOptions({ name: 'Daniel' }))
  console.log(greetingQuery.data)

  return <div className="p-2">{greetingQuery.data && <p>{greetingQuery.data}</p>}</div>
}
