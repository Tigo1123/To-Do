import { useState } from 'react'
import { Icon } from './Icon.jsx'

export function CategorySheet({ onClose, onSave, colors }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(colors[0])

  function submit(event) {
    event.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), color })
    onClose()
  }

  return (
    <div className="sheet-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="bottom-sheet category-sheet" role="dialog" aria-modal="true" aria-labelledby="category-sheet-title">
        <div className="sheet-handle" />
        <div className="sheet-heading">
          <div><p className="eyebrow">رتّب مهامك بطريقتك</p><h2 id="category-sheet-title">تصنيف جديد</h2></div>
          <button type="button" className="icon-button" aria-label="إغلاق" onClick={onClose}><Icon name="close" /></button>
        </div>
        <form className="task-form" onSubmit={submit}>
          <label className="field-label" htmlFor="category-name">اسم التصنيف</label>
          <input id="category-name" dir="auto" autoFocus required maxLength={35} value={name} onChange={(event) => setName(event.target.value)} placeholder="مثال: أفكار وملاحظات" />
          <span className="field-label">اختاري لونًا</span>
          <div className="color-picker" role="radiogroup" aria-label="لون التصنيف">
            {colors.map((item) => (
              <button
                key={item}
                type="button"
                className={`color-option${item === color ? ' selected' : ''}`}
                style={{ '--category-color': item }}
                role="radio"
                aria-checked={item === color}
                aria-label={`اللون ${item}`}
                onClick={() => setColor(item)}
              >{item === color && <Icon name="check" size={15} />}</button>
            ))}
          </div>
          <button className="primary-button form-submit" type="submit">إضافة التصنيف</button>
        </form>
      </section>
    </div>
  )
}
