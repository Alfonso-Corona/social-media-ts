import { Route, Routes } from "react-router"
import { Home } from "./pages/Home"
import { Navbar } from "./components/Navbat"

function App() {
  return (
    <div className="min-h-screen bg-black text-gray-100 transition-opacity duration-700 pt-20">
      <Navbar />
      <div className="containter mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />}/>
        </Routes>
      </div>
    </div>
  )
}

export default App
