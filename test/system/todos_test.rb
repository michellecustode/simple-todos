require "application_system_test_case"

class TodosTest < ApplicationSystemTestCase
  setup do
    user = users(:one)
    visit login_path
    fill_in "Email", with: user.email
    fill_in "Password", with: "password"
    click_button "Log in"
    assert_text "My to-dos"
  end

  test "add, complete, uncomplete, edit and delete a to-do" do
    fill_in "New to-do", with: "System test task"
    fill_in "Description (optional)", with: "Written by a robot"
    click_button "Add to-do"

    item = find("[data-testid=todo-item]", text: "System test task")
    assert_text "Written by a robot"
    assert item.has_text?("To do")

    find("input[aria-label='Mark \"System test task\" as complete']").click
    item = find("[data-testid=todo-item][data-completed=true]", text: "System test task")
    assert item.has_text?("Completed")

    find("input[aria-label='Mark \"System test task\" as incomplete']").click
    item = find("[data-testid=todo-item][data-completed=false]", text: "System test task")
    assert item.has_text?("To do")

    find("button[aria-label='Edit \"System test task\"']").click
    within "[role=dialog]" do
      fill_in "Title", with: "Renamed task"
      click_button "Save changes"
    end
    assert_selector "[data-testid=todo-item]", text: "Renamed task"
    assert_no_text "System test task"

    find("button[aria-label='Delete \"Renamed task\"']").click
    within("[role=dialog]") { click_button "Delete" }
    assert_no_text "Renamed task"
  end

  test "shows a validation error for an empty title" do
    click_button "Add to-do"
    assert_text "Title can't be blank"
  end
end
