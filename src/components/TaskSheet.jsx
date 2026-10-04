import { useEffect, useState } from 'react'
import { Icon } from './Icon.jsx'

function localToday() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
}

export function TaskSheet({ open, categories, task, onClose, onSave }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [categoryId, setCategoryId] = useState('')

  useEffect(() => {
    if (!open) return
    setTitle(task?.title ?? '')
    setDate(task?.date ?? localToday())
    setTime(task?.time ?? '')
    setCategoryId(task?.categoryId ?? categories[0]?.id ?? '')
  }, [open, task, categories])

  useEffect(() => {
    if (!open) return
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  function submit(event) {
    event.preventDefault()
    if (!title.trim() || !date || !categoryId) return
    onSave({ title: title.trim(), date, time, categoryId })
    onClose()
  }

  return (
    <div className="sheet-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="bottom-sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
        <div className="sheet-handle" />
        <div className="sheet-heading">
          <div>
            <p className="eyebrow">{task ? 'حدّث خطتك' : 'خطوة صغيرة تنجزها اليوم'}</p>
            <h2 id="sheet-title">{task ? 'تعديل المهمة' : 'مهمة جديدة'}</h2>
          </div>
          <button type="button" className="icon-button" aria-label="إغلاق" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form className="task-form" onSubmit={submit}>
          <label className="field-label" htmlFor="task-title">عنوان المهمة</label>
          <input id="task-title" dir="auto" autoFocus required maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="ما الذي تود إنجازه؟" />
          <div className="form-row">
            <div>
              <label className="field-label" htmlFor="task-date">التاريخ</label>
              <input id="task-date" type="date" required value={date} onChange={(event) => setDate(event.target.value)} />
            </div>
            <div>
              <label className="field-label" htmlFor="task-time">الوقت <span>(اختياري)</span></label>
              <input id="task-time" type="time" value={time} onChange={(event) => setTime(event.target.value)} />
            </div>
          </div>
          <label className="field-label" htmlFor="task-category">التصنيف</label>
          <select id="task-category" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <button className="primary-button form-submit" type="submit">{task ? 'حفظ التعديلات' : 'إضافة المهمة'}</button>
        </form>
      </section>
    </div>
  )
}
