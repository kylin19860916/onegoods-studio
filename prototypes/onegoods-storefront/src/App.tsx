import { useStore } from './store'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Home from './screens/Home'
import Shop from './screens/Shop'
import Detail from './screens/Detail'
import Cart from './screens/Cart'
import About from './screens/About'

export default function App() {
  const { screen } = useStore()

  return (
    <div style={{ minHeight: '100vh', background: '#FAF2E4' }}>
      <Nav />
      {screen === 'home' && <Home />}
      {screen === 'shop' && <Shop />}
      {screen === 'detail' && <Detail />}
      {screen === 'cart' && <Cart />}
      {screen === 'about' && <About />}
      <Footer />
    </div>
  )
}
