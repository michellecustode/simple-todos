class TodosController < ApplicationController
  FILTERS = %w[ all active completed ].freeze

  allow_unauthenticated_access only: :index

  def index
    return render inertia: "Home" unless authenticated?

    todos = Current.user.todos
    render inertia: "Todos", props: {
      todos: filtered(todos).ordered.map(&:as_inertia),
      filter: filter,
      counts: {
        total: todos.count,
        completed: todos.completed.count,
        active: todos.active.count
      }
    }
  end

  def create
    todo = Current.user.todos.build(todo_params)
    if todo.save
      redirect_to todos_redirect_path, notice: "To-do added."
    else
      redirect_to todos_redirect_path, inertia: { errors: errors_for(todo) }
    end
  end

  def update
    todo = Current.user.todos.find(params[:id])
    if todo.update(todo_params)
      redirect_to todos_redirect_path, notice: "To-do updated."
    else
      redirect_to todos_redirect_path, inertia: { errors: errors_for(todo) }
    end
  end

  def destroy
    Current.user.todos.find(params[:id]).destroy!
    redirect_to todos_redirect_path, notice: "To-do deleted."
  end

  private
    def todo_params
      params.require(:todo).permit(:title, :description, :completed)
    end

    def filter
      FILTERS.include?(params[:filter]) ? params[:filter] : "all"
    end

    def filtered(scope)
      case filter
      when "active" then scope.active
      when "completed" then scope.completed
      else scope
      end
    end

    def todos_redirect_path
      filter == "all" ? root_path : root_path(filter: filter)
    end

    def errors_for(todo)
      todo.errors.to_hash(true).transform_values(&:first)
    end
end
