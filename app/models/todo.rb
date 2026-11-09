class Todo < ApplicationRecord
  belongs_to :user

  normalizes :title, with: ->(t) { t.strip }
  normalizes :description, with: ->(d) { d.strip.presence }

  validates :title, presence: true, length: { maximum: 200 }
  validates :description, length: { maximum: 2000 }

  scope :active, -> { where(completed: false) }
  scope :completed, -> { where(completed: true) }
  scope :ordered, -> { order(completed: :asc, created_at: :desc, id: :desc) }

  def as_inertia
    { id: id, title: title, description: description, completed: completed }
  end
end
