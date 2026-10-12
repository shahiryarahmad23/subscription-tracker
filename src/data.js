export const SERVICES = [
  'Netflix',
  'Spotify',
  'YouTube Premium',
  'Disney+',
  'Steam',
  'Apple TV+',
  'Claude',
  'Cursor',
]

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR', 'PKR']

export const serviceColor = {
  Netflix: 'var(--netflix)',
  Spotify: 'var(--spotify)',
  'YouTube Premium': '#ff4e45',
  'Disney+': '#8eb4ff',
  Steam: 'var(--steam)',
  'Apple TV+': 'var(--cursor-ink)',
  Claude: 'var(--claude)',
  Cursor: 'var(--cursor-ink)',
}

export const emptyForm = {
  serviceName: '',
  planName: '',
  price: '',
  currency: '',
  startDate: '',
  duration: '',
}
