import { Icon } from './Icon.jsx'

export function CategoryList({ categories, tasks, onSelect, onAdd, onDelete }) {
  return (
    <section className="categories-view">
      <div className="section-heading category-list-heading">
        <div><p className="eyebrow">كل شيء في مكانه</p><h1>قائمة التصنيفات</h1></div>
        <button type="button" className="outline-button" onClick={onAdd}><Icon name="plus" size={17} /> تصنيف جديد</button>
      </div>
      <p className="section-subtitle">مساحات صغيرة لكل ما يشغل بالك.</p>
      <div className="category-stack">
        {categories.map((category, index) => {
          const categoryTasks = tasks.filter((task) => task.categoryId === category.id)
          const isDark = category.color === '#339363'
          return (
            <article
              key={category.id}
              className={`category-card${isDark ? ' category-card-dark' : ''}`}
              style={{ '--category-color': category.color, '--stack-index': index }}
            >
              <button type="button" className="category-card-main" onClick={() => onSelect(category.id)} aria-label={`عرض تصنيف ${category.name}`}>
                <span className="category-card-info">
                  <strong>{category.name}</strong>
                  <span>{categoryTasks.length} {categoryTasks.length === 1 ? 'مهمة' : 'مهام'}</span>
                </span>
                <span className="category-card-end">
                  <span className="completed-badge">{categoryTasks.filter((task) => task.done).length} مكتملة</span>
                  <Icon name="arrow" className="category-arrow" size={19} />
                </span>
              </button>
              <button
                type="button"
                className="category-delete"
                aria-label={`حذف تصنيف ${category.name}`}
                onClick={() => onDelete(category.id)}
              ><Icon name="trash" size={16} /></button>
            </article>
          )
        })}
      </div>
      {categories.length === 0 && <div className="empty-state"><span className="empty-icon"><Icon name="folder" size={24} /></span><h2>ابدئي بتصنيف جديد</h2><p>أنشئي تصنيفًا لترتيب مهامك حسب اهتماماتك.</p></div>}
    </section>
  )
}
