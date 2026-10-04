import { useEffect, useState } from 'react'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored === null ? initialValue : JSON.parse(stored)
    } catch (error) {
      console.error(`تعذرت قراءة البيانات المحلية (${key}).`, error)
      try {
        window.localStorage.removeItem(key)
      } catch (removeError) {
        console.error(`تعذر حذف البيانات المحلية التالفة (${key}).`, removeError)
      }
      return initialValue
    }
  })
  const [storageError, setStorageError] = useState('')

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
      setStorageError('')
    } catch (error) {
      console.error(`تعذر حفظ البيانات المحلية (${key}).`, error)
      setStorageError('تعذر حفظ التغييرات على هذا الجهاز. تحقّق من مساحة التخزين وإعدادات المتصفح.')
    }
  }, [key, value])

  return [value, setValue, storageError]
}
