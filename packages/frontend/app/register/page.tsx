'use client'

import { Navbar } from '@/components/navbar'
import { RegisterForm } from '@/components/register-form'

export default function RegisterPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <RegisterForm />
        </div>
      </main>
    </div>
  )
}

