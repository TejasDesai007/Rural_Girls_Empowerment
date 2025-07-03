import { Workbox } from 'workbox-window'

export function registerSW() {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/service-worker.js')

    wb.addEventListener('installed', (event) => {
      if (!event.isUpdate) {
        console.log('PWA installed for the first time')
      }
    })

    wb.addEventListener('waiting', () => {
      if (confirm('New update available! Reload to update?')) {
        wb.addEventListener('controlling', () => window.location.reload())
        wb.messageSkipWaiting()
      }
    })

    wb.register()
  }
}