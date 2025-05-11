import PageContainer from '@/components/PageContainer'
import { ChangeEmailCard } from '@daveyplate/better-auth-ui'

export default function SettingsView() {
  return (
    <PageContainer innerClassName="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">(Email change disabled for now)</p>
      <ChangeEmailCard className="pointer-events-none opacity-50" />
    </PageContainer>
  )
}
