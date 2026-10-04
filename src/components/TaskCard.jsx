import { useState } from 'react'
import { Icon } from './Icon.jsx'

export function TaskCard({ task, category, onToggle, onEdit, onDelete, onToggleSubtask, onAddSubtask }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [addingSubtask, setAddingSubtask] = useState(false)
  const [subtaskTitle, setSubtaskTitle] = useState('')
  const taskDate = new Date(`${task.date}T00:00:00`)
  const dateLabel = taskDate.toLocaleDateString('ar', { day: 'numeric', month: 'short' })

  function submitSubtask(event) {
    event.preventDefault()
    if (!subtaskTitle.trim()) return
    onAddSubtask(task.id, subtaskTitle.trim())
    setSubtaskTitle('')
    setAddingSubtask(false)
  }

  return (
    <article className={`task-card${task.done ? ' is-done' : ''}`}>
      <button
        type="button"
        className="task-check"
        aria-label={task.done ? `إلغاء إنجاز ${task.title}` : `إنجاز ${task.title}`}
        aria-pressed={task.done}
        onClick={() => onToggle(task.id)}
      >
        {task.done && <Icon name="check" size={15} />}
      </button>
      <div className="task-content">
        <div className="task-meta">
          <span><Icon name="calendar" size={13} />{dateLabel}</span>
          {task.time && <span><Icon name="clock" size={13} />{task.time}</span>}
          {category && <span className="task-category-dot" style={{ background: category.color }} aria-label={category.name} />}
        </div>
        <h3>{task.title}</h3>
        {task.subtasks.length > 0 && (
          <ul className="subtask-list">
            {task.subtasks.map((subtask) => (
              <li key={subtask.id}>
                <label className={subtask.done ? 'subtask-done' : ''}>
                  <input
                    type="checkbox"
                    checked={subtask.done}
                    onChange={() => onToggleSubtask(task.id, subtask.id)}
                  />
                  <span>{subtask.title}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
        {addingSubtask ? (
          <form className="subtask-form" onSubmit={submitSubtask}>
            <input
              autoFocus
              dir="auto"
              value={subtaskTitle}
              onChange={(event) => setSubtaskTitle(event.target.value)}
              placeholder="مهمة فرعية جديدة"
              aria-label="اسم المهمة الفرعية"
            />
            <button type="submit" aria-label="حفظ المهمة الفرعية"><Icon name="check" size={16} /></button>
            <button type="button" aria-label="إلغاء" onClick={() => setAddingSubtask(false)}><Icon name="close" size={16} /></button>
          </form>
        ) : (
          <button className="add-subtask" type="button" onClick={() => setAddingSubtask(true)}>
            <Icon name="plus" size={14} /> إضافة مهمة فرعية
          </button>
        )}
      </div>
      <div className="task-menu-wrap">
        <button
          className="icon-button task-menu-trigger"
          type="button"
          aria-label={`خيارات ${task.title}`}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Icon name="more" size={19} />
        </button>
        {menuOpen && (
          <div className="task-menu">
            <button type="button" onClick={() => { onEdit(task); setMenuOpen(false) }}><Icon name="edit" size={16} /> تعديل</button>
            <button type="button" className="danger-action" onClick={() => { onDelete(task.id); setMenuOpen(false) }}><Icon name="trash" size={16} /> حذف</button>
          </div>
        )}
      </div>
    </article>
  )
}
