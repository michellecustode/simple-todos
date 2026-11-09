require "test_helper"

class TodoTest < ActiveSupport::TestCase
  test "is valid with a title and user" do
    assert Todo.new(user: users(:one), title: "Walk dog").valid?
  end

  test "requires a title" do
    todo = Todo.new(user: users(:one), title: "   ")
    assert_not todo.valid?
    assert todo.errors[:title].any?
  end

  test "limits title and description length" do
    assert_not Todo.new(user: users(:one), title: "a" * 201).valid?
    assert_not Todo.new(user: users(:one), title: "ok", description: "a" * 2001).valid?
  end

  test "defaults to incomplete and blank description becomes nil" do
    todo = Todo.create!(user: users(:one), title: "  Trim me  ", description: "   ")
    assert_equal false, todo.completed
    assert_equal "Trim me", todo.title
    assert_nil todo.description
  end

  test "scopes split active and completed" do
    assert_includes Todo.active, todos(:one_active)
    assert_not_includes Todo.active, todos(:one_done)
    assert_equal [ todos(:one_done) ], users(:one).todos.completed.to_a
  end

  test "ordered puts incomplete first, newest first" do
    assert_equal [ todos(:one_active_newer), todos(:one_active), todos(:one_done) ],
                 users(:one).todos.ordered.to_a
  end

  test "are destroyed with their user" do
    assert_difference -> { Todo.count }, -3 do
      users(:one).destroy
    end
  end
end
