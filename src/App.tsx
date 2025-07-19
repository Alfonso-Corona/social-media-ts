import { Route, Routes } from "react-router"
import { Home } from "./pages/Home"
import { Navbar } from "./components/Navbat"
import { CreatePostPage } from "./pages/CreatePostPage"
import { PostPage } from "./pages/PostPage"
import { CreateCommunityPage } from "./pages/CreateCommunityPage"
import { CommunitiesPage } from "./pages/CommunitiesPage"
import { CommunityPage } from "./pages/CommunityPage"

function App() {
  return (
    <div className="min-h-screen bg-black text-gray-100 transition-opacity duration-700 pt-20">
      <Navbar />
      <div className="containter mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/create" element={<CreatePostPage />}/>
          <Route path="/communities" element={<CommunitiesPage />}/>
          <Route path="/community/create" element={<CreateCommunityPage />}/>
          <Route path="/community/:id" element={<CommunityPage />}/>
          <Route path="/post/:id" element={<PostPage />}/>
        </Routes>
      </div>
    </div>
  )
}

export default App
