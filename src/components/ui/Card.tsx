import type React from "react"

interface CardProps {
  className?: string
  children: React.ReactNode
}

export function Card({ className = "", children }: CardProps) {
  return <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>
}

export function CardHeader({ className = "", children }: CardProps) {
  return <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
}

export function CardTitle({ className = "", children }: CardProps) {
  return <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
}

export function CardDescription({ className = "", children }: CardProps) {
  return <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
}

export function CardContent({ className = "", children }: CardProps) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>
}
