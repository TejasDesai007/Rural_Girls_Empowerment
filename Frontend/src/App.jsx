import { useState } from 'react'
import './index.css'

// import the shadcn button component (make sure it's created)
import { Button } from "@/components/ui/button"

function App() {
  const [clicked, setClicked] = useState(false)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-900 p-4">
      <h1 className="text-3xl font-bold mb-6">ShadCN + Tailwind v4 Test</h1>
      
      <Button onClick={() => setClicked(true)} className="mb-4">
        Click me!
      </Button>

      {clicked && (
        <p className="text-green-600 font-medium transition-all">
          ✅ ShadCN and Tailwind are working!
        </p>
      )}
    </div>
  )
}

export default App
