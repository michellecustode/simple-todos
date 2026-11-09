import type { PageProps as InertiaPageProps } from "@inertiajs/core"

export type CurrentUser = {
  id: number
  email: string
  timezone: string | null
  admin: boolean
} | null

export type SharedProps = {
  current_user: CurrentUser
  flash: {
    notice: string | null
    alert: string | null
  }
  errors: Record<string, string>
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> =
  SharedProps & T & InertiaPageProps

export type Todo = {
  id: number
  title: string
  description: string | null
  completed: boolean
}

export type TodoFilter = "all" | "active" | "completed"

export type TodoCounts = {
  total: number
  completed: number
  active: number
}
