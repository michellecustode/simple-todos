require "test_helper"

class TodosControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
  end

  def inertia_props
    assert_equal "true", response.headers["X-Inertia"]
    JSON.parse(response.body)
  end

  def get_inertia(path)
    get path, headers: { "X-Inertia" => "true", "X-Inertia-Version" => ViteRuby.digest }
  end

  test "logged-out users see the Home landing page at root" do
    get_inertia root_path
    assert_response :success
    assert_equal "Home", inertia_props["component"]
  end

  test "logged-in users see only their own to-dos, incomplete first" do
    sign_in_as @user
    get_inertia root_path
    assert_response :success

    data = inertia_props
    assert_equal "Todos", data["component"]
    titles = data["props"]["todos"].map { |t| t["title"] }
    assert_equal [ "Write report", "Buy milk", "Pay rent" ], titles
    assert_equal({ "total" => 3, "completed" => 1, "active" => 2 }, data["props"]["counts"])
    assert_equal "all", data["props"]["filter"]
  end

  test "filters by active and completed but counts stay overall" do
    sign_in_as @user

    get_inertia root_path(filter: "active")
    assert_equal [ "Write report", "Buy milk" ], inertia_props["props"]["todos"].map { |t| t["title"] }

    get_inertia root_path(filter: "completed")
    data = inertia_props
    assert_equal [ "Pay rent" ], data["props"]["todos"].map { |t| t["title"] }
    assert_equal 3, data["props"]["counts"]["total"]
  end

  test "unknown filter falls back to all" do
    sign_in_as @user
    get_inertia root_path(filter: "bogus")
    assert_equal "all", inertia_props["props"]["filter"]
  end

  test "creates a to-do with a description" do
    sign_in_as @user
    assert_difference -> { @user.todos.count }, 1 do
      post todos_path, params: { todo: { title: "New task", description: "Details" } }
    end
    assert_redirected_to root_path
    todo = @user.todos.find_by!(title: "New task")
    assert_equal "Details", todo.description
    assert_not todo.completed
  end

  test "creating without a title fails and redirects back with errors" do
    sign_in_as @user
    assert_no_difference -> { Todo.count } do
      post todos_path, params: { todo: { title: "", description: "x" } }
    end
    assert_redirected_to root_path
  end

  test "create keeps the active filter" do
    sign_in_as @user
    post todos_path(filter: "active"), params: { todo: { title: "Filtered" } }
    assert_redirected_to root_path(filter: "active")
  end

  test "updates title and description" do
    sign_in_as @user
    todo = todos(:one_active)
    patch todo_path(todo), params: { todo: { title: "Buy oat milk", description: "" } }
    assert_response :redirect
    todo.reload
    assert_equal "Buy oat milk", todo.title
    assert_nil todo.description
  end

  test "invalid update leaves the record unchanged" do
    sign_in_as @user
    todo = todos(:one_active)
    patch todo_path(todo), params: { todo: { title: "" } }
    assert_response :redirect
    assert_equal "Buy milk", todo.reload.title
  end

  test "checks off and un-checks a to-do" do
    sign_in_as @user
    todo = todos(:one_active)

    patch todo_path(todo), params: { todo: { completed: true } }
    assert_response :redirect
    assert todo.reload.completed

    patch todo_path(todo), params: { todo: { completed: false } }
    assert_response :redirect
    assert_not todo.reload.completed
  end

  test "deletes a to-do" do
    sign_in_as @user
    assert_difference -> { Todo.count }, -1 do
      delete todo_path(todos(:one_done))
    end
    assert_response :redirect
  end

  test "cannot update or delete another user's to-do" do
    sign_in_as @user
    other = todos(:two_active)

    patch todo_path(other), params: { todo: { title: "Hacked" } }
    assert_response :not_found
    assert_equal "Someone else's todo", other.reload.title

    assert_no_difference -> { Todo.count } do
      delete todo_path(other)
    end
    assert_response :not_found
  end

  test "mutations require authentication" do
    post todos_path, params: { todo: { title: "x" } }
    assert_redirected_to login_path
    patch todo_path(todos(:one_active)), params: { todo: { title: "x" } }
    assert_redirected_to login_path
    delete todo_path(todos(:one_active))
    assert_redirected_to login_path
  end
end
