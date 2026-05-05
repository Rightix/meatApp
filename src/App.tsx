import { Header } from './components/header/header.tsx'
import { ProductsPage } from './pages/products-page.tsx'
import './App.css'

const App = () => (
  <div className="min-h-screen bg-gray-50">
    <Header />
    <main className="p-6">
      <ProductsPage />
    </main>
  </div>
)

export default App
