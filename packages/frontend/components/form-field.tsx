'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FormFieldProps {
  id: string
  label: string
  type?: string
  placeholder?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function FormField({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}
