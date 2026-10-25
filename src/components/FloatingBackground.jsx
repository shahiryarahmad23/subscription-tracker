import apple from '../assets/apple.png'
import discord from '../assets/discord.png'
import netflix from '../assets/netflix.png'
import primeVideo from '../assets/primeviode.png'
import spotify from '../assets/spotify.png'
import youtube from '../assets/youtube.png'
import './FloatingBackground.css'

const icons = [
  { src: netflix, name: 'Netflix', className: 'floating-icon icon-netflix', delay: '0s', duration: '7s' },
  { src: spotify, name: 'Spotify', className: 'floating-icon icon-spotify', delay: '1.1s', duration: '8.2s' },
  { src: youtube, name: 'YouTube', className: 'floating-icon icon-youtube', delay: '2.2s', duration: '6.4s' },
  { src: apple, name: 'Apple', className: 'floating-icon icon-apple', delay: '0.6s', duration: '9s' },
  { src: discord, name: 'Discord', className: 'floating-icon icon-discord', delay: '1.8s', duration: '7.6s' },
  { src: primeVideo, name: 'Prime Video', className: 'floating-icon icon-prime', delay: '2.8s', duration: '8.6s' },
]

export default function FloatingBackground() {
  return (
    <div className="floating-background" aria-hidden="true">
      {icons.map((icon) => (
        <span
          key={icon.name}
          className={icon.className}
          style={{ '--float-delay': icon.delay, '--float-duration': icon.duration }}
        >
          <img src={icon.src} alt="" />
        </span>
      ))}
    </div>
  )
}
