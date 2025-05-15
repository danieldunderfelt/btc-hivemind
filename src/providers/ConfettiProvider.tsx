'use client'

import { cn } from '@/lib/utils'
import { type MotionProps, motion } from 'motion/react'
import {
  type PropsWithChildren,
  type Ref,
  createContext,
  useContext,
  useRef,
  useState,
} from 'react'
import Confetti from 'react-confetti-boom'
import { useThrottledCallback } from 'use-debounce'

const ConfettiContext = createContext<{
  showConfetti: ({ key, x, y }: { key?: string; x: number; y: number }) => void
  hideConfetti: () => void
}>({
  showConfetti: () => {},
  hideConfetti: () => {},
})

export default function ConfettiProvider({ children }: { children: React.ReactNode }) {
  const [confetti, setConfetti] = useState<{ key: string; x: number; y: number } | null>(null)

  const showConfetti = ({ key, x, y }: { key?: string; x: number; y: number }) => {
    const confettiKey = key || Math.random().toString(36).substring(2, 15)
    setConfetti({ key: confettiKey, x, y })
  }

  const hideConfetti = () => {
    setConfetti(null)
  }

  return (
    <ConfettiContext.Provider value={{ showConfetti, hideConfetti }}>
      {children}
      {confetti && (
        <div className="pointer-events-none fixed inset-0 z-[1000] select-none">
          <Confetti
            key={confetti.key}
            x={confetti?.x || 0.5}
            y={confetti?.y || 0.5}
            mode="boom"
            particleCount={200}
            shapeSize={20}
            deg={270}
            effectCount={1}
            spreadDeg={75}
            launchSpeed={2}
            colors={['#05FF97', '#efefef', '#119860', '#9e4eff', '#ababab']}
          />
        </div>
      )}
    </ConfettiContext.Provider>
  )
}

export function useConfetti() {
  return useContext(ConfettiContext)
}

export function ConfettiTrigger({
  children,
  className,
  isActive = true,
  confettiKey,
  timeout = 300,
  motionProps,
  ref,
}: PropsWithChildren<{
  className?: string
  isActive?: boolean
  confettiKey: string
  timeout?: number
  motionProps?: MotionProps
  ref?: Ref<HTMLDivElement>
}>) {
  const { showConfetti } = useConfetti()
  const confettiRef = useRef<{ x: number; y: number; id: string } | null>(null)

  const debouncedShowConfetti = useThrottledCallback(() => {
    if (confettiRef.current) {
      showConfetti(confettiRef.current)
    }
  }, 1000)

  return (
    <motion.div
      {...motionProps}
      ref={(node) => {
        if (ref && typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }

        let timeoutRef: NodeJS.Timeout | null = null

        if (node && isActive && !confettiRef.current) {
          timeoutRef = setTimeout(() => {
            // Show confetti after a short delay
            // Get the bounding rectangle of the element
            const rect = node.getBoundingClientRect()

            // Calculate the center of the element
            const centerX = (rect.left + rect.right) / 2
            const centerY = (rect.top + rect.bottom) / 2

            // Convert to viewport relative coordinates (0-1)
            const viewportX = centerX / window.innerWidth
            const viewportY = centerY / window.innerHeight

            confettiRef.current = { x: viewportX, y: viewportY, id: confettiKey }

            if (isActive) {
              showConfetti({
                key: confettiKey,
                x: viewportX,
                y: viewportY,
              })
            }
          }, timeout)
        }

        return () => {
          if (timeoutRef) {
            clearTimeout(timeoutRef)
          }
        }
      }}
      className={cn(
        'touch-manipulation transition-transform duration-200 hover:scale-110',
        className,
      )}
      onClick={debouncedShowConfetti}>
      {children}
    </motion.div>
  )
}
