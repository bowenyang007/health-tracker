import { 
  Home, 
  Weight, 
  Activity, 
  Droplets, 
  Moon, 
  Heart,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'
import './Navigation.css'

const Navigation = ({ currentPage, setCurrentPage }) => {
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'weight', label: 'Weight Tracker', icon: Weight },
  ]

  const toggleMenu = () => setIsOpen(!isOpen)

  return (
    <>
      {/* Mobile menu button */}
      <button 
        className="mobile-menu-btn"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && <div className="nav-overlay" onClick={toggleMenu} />}

      {/* Navigation sidebar */}
      <nav className={`navigation ${isOpen ? 'navigation-open' : ''}`}>
        <div className="nav-header">
          <h1 className="nav-title">Health Tracker</h1>
        </div>

        <ul className="nav-menu">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <button
                  className={`nav-item ${currentPage === item.id ? 'nav-item-active' : ''}`}
                  onClick={() => {
                    setCurrentPage(item.id)
                    setIsOpen(false) // Close mobile menu
                  }}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>

        <div className="nav-footer">
          <p className="nav-footer-text">
            Stay healthy, stay happy! 💪
          </p>
        </div>
      </nav>
    </>
  )
}

export default Navigation
