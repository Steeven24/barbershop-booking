import type { InputHTMLAttributes } from 'react'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string
  onChange: (value: string) => void
}

export default function FormField({ label, onChange, className, ...input }: Props) {
  return (
    <label className={className}>
      {label}
      <input onChange={(e) => onChange(e.target.value)} {...input} />
    </label>
  )
}
