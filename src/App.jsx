import { useMemo, useState } from 'react'
import { CategoryList } from './components/CategoryList.jsx'
import { Icon } from './components/Icon.jsx'
import { InstallButton } from './components/InstallButton.jsx'
import { TaskCard } from './components/TaskCard.jsx'
import { CategorySheet } from './components/CategorySheet.jsx'
import { TaskSheet } from './components/TaskSheet.jsx'
import { useLocalStorage } from './hooks/useLocalStorage.js'

const PALETTE = ['#B4C4FF', '#FFF681', '#D0F4EA', '#FFC0F5', '#F9DEFD', '#339363']
const DEFAULT_CATEGORIES = [
  { id: 'grocery', name: 'المشتريات', color: '#F9DEFD' },
  { id: 'educational', name: 'التعلّم', color: '#B4C4FF' },
  { id: 'home-related', name: 'المنزل', color: '#FFF681' },
  { id: 'work-related', name: 'العمل', color: '#339363' },
  { id: 'mandatory-work', name: 'مهام ضرورية', color: '#FFC0F5' },
  { id: 'personal-notes', name: 'ملاحظات شخصية', color: '#D0F4EA' },
]
const FILTERS = [
  { id: 'today', label: 'اليوم', color: '#B4C4FF', icon: 'calendar' },
  { id: 'scheduled', label: 'المجدولة', color: '#FFF681', icon: 'clock' },
  { id: 'all', label: 'الكل', color: '#D0F4EA', icon: 'check' },
  { id: 'overdue', label: 'المتأخرة', color: '#FFC0F5', icon: 'clock' },
]

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function todayISO() {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

function getFilter(tasks, filter, today) {
  if (filter === 'today') return tasks.filter((task) => task.date === today)
  if (filter === 'scheduled') return tasks.filter((task) => task.date > today)
  if (filter === 'overdue') return tasks.filter((task) => !task.done && task.date < today)
  return tasks
}

export function App() {
  const [tasks, setTasks, taskStorageError] = useLocalStorage('mahami.tasks.v1', [])
  const [categories, setCategories, categoryStorageError] = useLocalStorage('mahami.categories.v1', DEFAULT_CATEGORIES)
  const [view, setView] = useState('home')
  const [filter, setFilter] = useState('today')
  const [taskSheet, setTaskSheet] = useState({ open: false, task: null })
  const [categorySheetOpen, setCategorySheetOpen] = useState(false)
  const today = todayISO()
  const storageError = taskStorageError || categoryStorageError

  const visibleTasks = useMemo(() => {
    if (filter.startsWith('category:')) {
      const categoryId = filter.slice('category:'.length)
      return tasks.filter((task) => task.categoryId === categoryId)
    }
    return getFilter(tasks, filter, today)
  }, [filter, tasks, today])
  const selectedCategory = filter.startsWith('category:')
    ? categories.find((category) => category.id === filter.slice('category:'.length))
    : null
  const sectionTitle = selectedCategory
    ? selectedCategory.name
    : FILTERS.find((item) => item.id === filter)?.label ?? 'كل المهام'

  function updateTask(id, update) {
    setTasks((items) => items.map((item) => item.id === id ? update(item) : item))
  }

  function saveTask(values) {
    if (taskSheet.task) {
      updateTask(taskSheet.task.id, (task) => ({ ...task, ...values }))
      return
    }
    setTasks((items) => [...items, { id: createId(), ...values, done: false, subtasks: [] }])
  }

  function addCategory(values) {
    setCategories((items) => [...items, { id: createId(), ...values }])
  }

  function deleteCategory(id) {
    if (categories.length === 1) {
      window.alert('أبقي تصنيفًا واحدًا على الأقل لإضافة المهام إليه.')
      return
    }
    const linkedCount = tasks.filter((task) => task.categoryId === id).length
    if (linkedCount > 0 && !window.confirm(`هذا التصنيف مرتبط بـ ${linkedCount} مهام. هل تريدين حذف التصنيف ومهامه؟`)) return
    setCategories((items) => items.filter((item) => item.id !== id))
    if (linkedCount > 0) setTasks((items) => items.filter((task) => task.categoryId !== id))
    if (filter === `category:${id}`) setFilter('today')
  }

  function deleteTask(id) {
    if (window.confirm('هل تريد حذف هذه المهمة؟')) setTasks((items) => items.filter((task) => task.id !== id))
  }

  function addSubtask(taskId, title) {
    updateTask(taskId, (task) => ({ ...task, subtasks: [...task.subtasks, { id: createId(), title, done: false }] }))
  }

  const counts = {
    today: tasks.filter((task) => task.date === today).length,
    scheduled: tasks.filter((task) => task.date > today).length,
    all: tasks.length,
    overdue: tasks.filter((task) => !task.done && task.date < today).length,
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true"><Icon name="check" size={18} /></div>
        <div className="topbar-actions">
          <InstallButton />
          <button className="icon-button header-action" type="button" aria-label="التنبيهات" onClick={() => window.alert('ستظهر تنبيهات مهامك هنا قريبًا.')}><Icon name="bell" /></button>
          <button className="icon-button header-action" type="button" aria-label="عرض التصنيفات" onClick={() => setView('categories')}><Icon name="menu" /></button>
        </div>
      </header>

      {storageError && <div className="storage-alert" role="alert">{storageError}</div>}

      {view === 'home' && (
        <>
          <section className="welcome-section">
            <p className="eyebrow">مساحة هادئة ليومك</p>
            <h1>أهلًا، <span>صديقي</span></h1>
            <p>عندك مهام اليوم؟ خلّينا ننجزها سوا.</p>
          </section>

          <nav className="filter-grid" aria-label="تصفية المهام">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`filter-card${filter === item.id ? ' filter-card-active' : ''}`}
                style={{ '--card-color': item.color }}
                aria-pressed={filter === item.id}
                onClick={() => { setFilter(item.id); setView('home') }}
              >
                <span className="filter-icon"><Icon name={item.icon} size={18} /></span>
                <span className="filter-label">{item.label}</span>
                <strong>{counts[item.id]}</strong>
              </button>
            ))}
          </nav>
        </>
      )}

      {view === 'categories' ? (
        <CategoryList
          categories={categories}
          tasks={tasks}
          onSelect={(id) => { setFilter(`category:${id}`); setView('home') }}
          onAdd={() => setCategorySheetOpen(true)}
          onDelete={deleteCategory}
        />
      ) : (
        <section className="tasks-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{selectedCategory ? 'من مجموعتك' : 'خطوة بخطوة'}</p>
              <h2>{selectedCategory ? sectionTitle : filter === 'today' ? 'مهام اليوم' : `مهام ${sectionTitle}`}</h2>
            </div>
            <span className="task-count">{visibleTasks.length} {visibleTasks.length === 1 ? 'مهمة' : 'مهام'}</span>
          </div>
          {selectedCategory && (
            <button type="button" className="text-button back-to-categories" onClick={() => setView('categories')}>
              <Icon name="arrow" size={16} /> العودة للتصنيفات
            </button>
          )}
          <div className="task-list">
            {visibleTasks.length > 0 ? visibleTasks
              .slice()
              .sort((a, b) => a.date.localeCompare(b.date) || (a.time || '').localeCompare(b.time || ''))
              .map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  category={categories.find((category) => category.id === task.categoryId)}
                  onToggle={(id) => updateTask(id, (item) => ({ ...item, done: !item.done }))}
                  onEdit={(item) => setTaskSheet({ open: true, task: item })}
                  onDelete={deleteTask}
                  onToggleSubtask={(taskId, subtaskId) => updateTask(taskId, (item) => ({
                    ...item,
                    subtasks: item.subtasks.map((subtask) => subtask.id === subtaskId ? { ...subtask, done: !subtask.done } : subtask),
                  }))}
                  onAddSubtask={addSubtask}
                />
              ))
              : (
                <div className="empty-state">
                  <span className="empty-icon"><Icon name={selectedCategory ? 'folder' : 'check'} size={24} /></span>
                  <h3>{filter === 'today' ? 'يومك يبدأ بخطوة' : 'لا توجد مهام هنا بعد'}</h3>
                  <p>{filter === 'today' ? 'أضيفي أول مهمة، وكل إنجاز صغير يقرّبك.' : 'أضيفي مهمة جديدة لتظهر هنا.'}</p>
                  <button type="button" className="text-button" onClick={() => setTaskSheet({ open: true, task: null })}>+ أضيفي مهمة</button>
                </div>
              )}
          </div>
        </section>
      )}

      <footer className="bottom-nav" aria-label="التنقل الرئيسي">
        <button type="button" className={view === 'home' ? 'nav-item nav-item-active' : 'nav-item'} aria-current={view === 'home' ? 'page' : undefined} onClick={() => { setView('home'); if (filter.startsWith('category:')) setFilter('today') }}>
          <Icon name="home" size={20} /><span>الرئيسية</span>
        </button>
        <button type="button" className={view === 'categories' || selectedCategory ? 'nav-item nav-item-active' : 'nav-item'} aria-current={view === 'categories' ? 'page' : undefined} onClick={() => setView('categories')}>
          <Icon name="folder" size={20} /><span>التصنيفات</span>
        </button>
      </footer>

      {view === 'home' && <button className="fab" type="button" aria-label="إضافة مهمة جديدة" onClick={() => setTaskSheet({ open: true, task: null })}><Icon name="plus" size={25} /></button>}

      <TaskSheet
        open={taskSheet.open}
        task={taskSheet.task}
        categories={categories}
        onClose={() => setTaskSheet({ open: false, task: null })}
        onSave={saveTask}
      />
      {categorySheetOpen && <CategorySheet onClose={() => setCategorySheetOpen(false)} onSave={addCategory} colors={PALETTE} />}
    </main>
  )
}
