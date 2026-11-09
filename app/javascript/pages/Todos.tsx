import * as React from "react"
import { Head, Link, router, useForm, usePage } from "@inertiajs/react"
import { Check, Circle, Pencil, Trash2 } from "lucide-react"
import { AppShell } from "@/components/AppShell"
import { PageHeader } from "@/components/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type {
  PageProps,
  Todo,
  TodoCounts,
  TodoFilter,
} from "@/types/inertia"

type TodosProps = {
  todos: Todo[]
  filter: TodoFilter
  counts: TodoCounts
}

const FILTERS: { value: TodoFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
]

const EMPTY_MESSAGES: Record<TodoFilter, string> = {
  all: "No to-dos yet. Add your first one above.",
  active: "Nothing left to do. Nice work!",
  completed: "No completed to-dos yet.",
}

const TITLE = "To-dos"
const DESCRIPTION =
  "Create, complete, edit, and delete the to-do items on your personal list."

function withFilter(path: string, filter: TodoFilter) {
  return filter === "all" ? path : `${path}?filter=${filter}`
}

export default function Todos() {
  const { props } = usePage<PageProps<TodosProps>>()
  const { todos, filter, counts } = props
  const [editing, setEditing] = React.useState<Todo | null>(null)
  const [deleting, setDeleting] = React.useState<Todo | null>(null)

  const addForm = useForm({ title: "", description: "" })

  function addTodo(e: React.FormEvent) {
    e.preventDefault()
    addForm.transform((data) => ({ todo: data }))
    addForm.post(withFilter("/todos", filter), {
      preserveScroll: true,
      onSuccess: () => addForm.reset(),
    })
  }

  function toggle(todo: Todo) {
    router.patch(
      withFilter(`/todos/${todo.id}`, filter),
      { todo: { completed: !todo.completed } },
      { preserveScroll: true },
    )
  }

  function confirmDelete() {
    if (!deleting) return
    router.delete(withFilter(`/todos/${deleting.id}`, filter), {
      preserveScroll: true,
      onSuccess: () => setDeleting(null),
    })
  }

  return (
    <>
      <Head title={TITLE}>
        <meta name="description" content={DESCRIPTION} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
      </Head>
      <AppShell>
        <PageHeader
          title="My to-dos"
          description={
            counts.total === 0
              ? "Add something to get started."
              : `${counts.completed} of ${counts.total} completed`
          }
        />

        {props.flash?.notice && (
          <p className="mt-6 text-sm text-accent" role="status">
            {props.flash.notice}
          </p>
        )}

        <form onSubmit={addTodo} className="mt-6 space-y-4" noValidate>
          <div className="space-y-2">
            <label htmlFor="new-todo-title">New to-do</label>
            <Input
              id="new-todo-title"
              value={addForm.data.title}
              onChange={(e) => addForm.setData("title", e.target.value)}
              placeholder="What needs doing?"
              maxLength={200}
              aria-invalid={!!addForm.errors.title}
            />
            {addForm.errors.title && (
              <p className="text-xs text-danger-display">
                Title {addForm.errors.title}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="new-todo-description">Description (optional)</label>
            <Textarea
              id="new-todo-description"
              value={addForm.data.description}
              onChange={(e) => addForm.setData("description", e.target.value)}
              placeholder="Add more detail…"
              maxLength={2000}
            />
            {addForm.errors.description && (
              <p className="text-xs text-danger-display">
                Description {addForm.errors.description}
              </p>
            )}
          </div>
          <Button type="submit" disabled={addForm.processing}>
            Add to-do
          </Button>
        </form>

        <nav
          aria-label="Filter to-dos"
          className="mt-10 flex flex-wrap items-center gap-2"
        >
          {FILTERS.map(({ value, label }) => (
            <Link
              key={value}
              href={value === "all" ? "/" : `/?filter=${value}`}
              preserveScroll
              className={cn(
                "toggle-button",
                filter === value && "toggle-button-on",
              )}
              aria-current={filter === value ? "page" : undefined}
            >
              {label}
              <span className="text-ink-muted">
                {value === "all"
                  ? counts.total
                  : value === "active"
                    ? counts.active
                    : counts.completed}
              </span>
            </Link>
          ))}
        </nav>

        {todos.length === 0 ? (
          <p className="mt-6">{EMPTY_MESSAGES[filter]}</p>
        ) : (
          <ul className="mt-4 divide-y divide-hairline border-y border-hairline">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-start gap-3 py-4"
                data-testid="todo-item"
                data-completed={todo.completed}
              >
                <Checkbox
                  className="mt-1"
                  checked={todo.completed}
                  onChange={() => toggle(todo)}
                  aria-label={
                    todo.completed
                      ? `Mark "${todo.title}" as incomplete`
                      : `Mark "${todo.title}" as complete`
                  }
                />
                <div
                  className={cn("min-w-0 flex-1", todo.completed && "opacity-70")}
                >
                  <span
                    className={cn(
                      "block break-words font-medium",
                      todo.completed
                        ? "text-ink-muted line-through"
                        : "text-ink-display",
                    )}
                  >
                    {todo.title}
                  </span>
                  {todo.description && (
                    <p className="mt-1 whitespace-pre-wrap break-words">
                      {todo.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
                  {todo.completed ? (
                    <Badge tone="accent">
                      <Check className="h-3 w-3" aria-hidden="true" />
                      Completed
                    </Badge>
                  ) : (
                    <Badge tone="neutral">
                      <Circle className="h-3 w-3" aria-hidden="true" />
                      To do
                    </Badge>
                  )}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditing(todo)}
                      aria-label={`Edit "${todo.title}"`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleting(todo)}
                      aria-label={`Delete "${todo.title}"`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <EditTodoDialog
          todo={editing}
          filter={filter}
          onClose={() => setEditing(null)}
        />

        <Dialog
          open={deleting !== null}
          onOpenChange={(open) => !open && setDeleting(null)}
        >
          <DialogContent size="sm">
            <DialogHeader>
              <DialogTitle>Delete this to-do?</DialogTitle>
              <DialogDescription>
                {deleting ? `“${deleting.title}” ` : ""}will be permanently
                deleted. This can’t be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDeleting(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </AppShell>
    </>
  )
}

function EditTodoDialog({
  todo,
  filter,
  onClose,
}: {
  todo: Todo | null
  filter: TodoFilter
  onClose: () => void
}) {
  return (
    <Dialog open={todo !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {todo && <EditTodoForm key={todo.id} todo={todo} filter={filter} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  )
}

function EditTodoForm({
  todo,
  filter,
  onClose,
}: {
  todo: Todo
  filter: TodoFilter
  onClose: () => void
}) {
  const form = useForm({
    title: todo.title,
    description: todo.description ?? "",
  })

  function save(e: React.FormEvent) {
    e.preventDefault()
    form.transform((data) => ({ todo: data }))
    form.patch(withFilter(`/todos/${todo.id}`, filter), {
      preserveScroll: true,
      onSuccess: onClose,
    })
  }

  return (
    <form onSubmit={save} className="space-y-4" noValidate>
      <DialogHeader>
        <DialogTitle>Edit to-do</DialogTitle>
        <DialogDescription>
          Update the title or description of this item.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-2">
        <label htmlFor="edit-todo-title">Title</label>
        <Input
          id="edit-todo-title"
          value={form.data.title}
          onChange={(e) => form.setData("title", e.target.value)}
          maxLength={200}
          aria-invalid={!!form.errors.title}
        />
        {form.errors.title && (
          <p className="text-xs text-danger-display">
            Title {form.errors.title}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <label htmlFor="edit-todo-description">Description (optional)</label>
        <Textarea
          id="edit-todo-description"
          value={form.data.description}
          onChange={(e) => form.setData("description", e.target.value)}
          maxLength={2000}
        />
        {form.errors.description && (
          <p className="text-xs text-danger-display">
            Description {form.errors.description}
          </p>
        )}
      </div>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={form.processing}>
          Save changes
        </Button>
      </DialogFooter>
    </form>
  )
}
