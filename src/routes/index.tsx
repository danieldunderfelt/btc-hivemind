import PageContainer from '@/components/PageContainer'
import { trpc } from '@/lib/trpc'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const greetingQuery = useQuery(trpc.greet.queryOptions({ name: 'Test' }))

  return (
    <PageContainer innerClassName="max-w-none">
      {greetingQuery.data && <p>{greetingQuery.data}</p>}
    </PageContainer>
  )
}
