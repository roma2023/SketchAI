"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface AIVisualizerProps {
  generationData: {
    imageData: string
    prompt: string
    controlStrength: number
  } | null
}

export default function AIVisualizer({ generationData }: AIVisualizerProps) {
  const [realisticImage, setRealisticImage] = useState<string | null>(null)

  useEffect(() => {
    if (generationData) {
      generateImage(generationData)
    }
  }, [generationData])

  const generateImage = async ({
    imageData,
    prompt,
    controlStrength,
  }: {
    imageData: string
    prompt: string
    controlStrength: number
  }) => {
    try {
      const response = await fetch("http://localhost:5000/api/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sketch: imageData,
          prompt,
          control_strength: controlStrength,
          output_format: "webp",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate image")
      }

      const blob = await response.blob()
      const imageUrl = URL.createObjectURL(blob)
      setRealisticImage(imageUrl)
    } catch (error) {
      console.error("Error generating image:", error)
    }
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 border border-gray-300">
      {realisticImage ? (
        <div className="relative w-full h-full">
          <Image
            src={realisticImage || "/placeholder.svg"}
            alt="AI Generated Image"
            layout="fill"
            objectFit="contain"
            priority
          />
        </div>
      ) : (
        <p className="text-gray-500">AI-generated image will appear here</p>
      )}
    </div>
  )
}

