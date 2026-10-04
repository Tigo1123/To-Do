import { useEffect, useState } from 'react'
import { Icon } from './Icon.jsx'

export function InstallButton() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    function handlePrompt(event) {
      event.preventDefault()
      setInstallPrompt(event)
    }
    function handleInstalled() {
      setInstalled(true)
      setInstallPrompt(null)
    }
    window.addEventListener('beforeinstallprompt', handlePrompt)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  if (!installPrompt || installed) return null

  async function install() {
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setInstallPrompt(null)
  }

  return <button type="button" className="install-button" onClick={install}><Icon name="download" size={17} /> تثبيت التطبيق</button>
}
