"use client"

import { useState } from "react"
import SketchCanvas from "./components/SketchCanvas"
import AIVisualizer from "./components/AIVisualizer"

interface SubmitData {
  imageData: string
  prompt: string
  controlStrength: number
}

export default function Home() {
  const [generationData, setGenerationData] = useState<SubmitData | null>(null)

  const handleSubmit = (data: SubmitData) => {
    setGenerationData(data)
  }

  return (
    <main className="flex h-screen">
      <div className="w-1/2 h-full flex flex-col">
        <h2 className="text-2xl font-bold p-4 text-center">Sketch Canvas</h2>
        <SketchCanvas onSubmit={handleSubmit} />
      </div>
      <div className="w-1/2 h-full flex flex-col">
        <h2 className="text-2xl font-bold p-4 text-center">AI Visualizer</h2>
        <AIVisualizer generationData={generationData} />
      </div>
    </main>
  )
}

