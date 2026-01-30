import { useEffect, useId } from 'react'

import { Check, Minus } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import useThemeStore from '@/lib/themeStore'

const items = [
  { image: '/origin/ui-light.png', label: 'Light', value: '1' },
  { image: '/origin/ui-dark.png', label: 'Dark', value: '2' },
  { image: '/origin/ui-system.png', label: 'System', value: '3' },
]

export default function ThemeSwitcher() {
  const id = useId()
  const theme = useThemeStore((s: any) => s.theme)
  const setTheme = useThemeStore((s: any) => s.setTheme)

  useEffect(() => {
    try {
      useThemeStore.getState().init()
    } catch (e) {}
  }, [])

  const handleThemeChange = (value: unknown) => {
    const strValue = String(value)
    switch (strValue) {
      case '1':
        setTheme('light')
        break
      case '2':
        setTheme('dark')
        break
      case '3':
        setTheme('system')
        break
      default:
        setTheme('light')
    }
  }

  const radioValue = theme === 'light' ? '1' : theme === 'dark' ? '2' : '3'

  return (
    <RadioGroup
      className="flex gap-3"
      value={radioValue}
      onValueChange={handleThemeChange}
    >
      {items.map((item) => (
        <label key={`${id}-${item.value}`}>
          <RadioGroupItem
            className="peer sr-only after:absolute after:inset-0"
            id={`${id}-${item.value}`}
            value={item.value}
          />
          <img
            alt={item.label}
            className="relative cursor-pointer overflow-hidden rounded-md border border-input shadow-xs outline-none transition-[color,box-shadow] peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50 peer-data-disabled:cursor-not-allowed peer-data-[state=checked]:border-ring peer-data-[state=checked]:bg-accent peer-data-disabled:opacity-50"
            height={70}
            src={item.image}
            width={88}
          />
          <span className="group mt-2 flex items-center gap-1 peer-data-[state=unchecked]:text-muted-foreground/70">
            <HugeiconsIcon
              icon={Check}
              aria-hidden="true"
              className="group-peer-data-[state=unchecked]:hidden"
              size={16}
            />
            <HugeiconsIcon
              icon={Minus}
              aria-hidden="true"
              className="group-peer-data-[state=checked]:hidden"
              size={16}
            />
            <span className="font-medium text-xs">{item.label}</span>
          </span>
        </label>
      ))}
    </RadioGroup>
  )
}
