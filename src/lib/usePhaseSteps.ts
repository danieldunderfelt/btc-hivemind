import { useCallback, useState } from 'react'

export function usePhaseSteps<PhaseType extends string>(
  phases: PhaseType[][],
  initialPhase: PhaseType,
) {
  const [phase, setPhase] = useState<PhaseType>(initialPhase)

  const activatePhase = useCallback(
    (phase: PhaseType) => {
      setPhase((current) => {
        const currentIndex = phases.findIndex((p) => p.includes(current))
        const nextIndex = phases.findIndex((p) => p.includes(phase))

        if (nextIndex === -1 || nextIndex < currentIndex) {
          return current
        }

        return phase
      })
    },
    [phases],
  )

  return { phase, activatePhase }
}
