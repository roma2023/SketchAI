"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { SketchPicker } from "react-color"
import { Eraser, Pen } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type React from "react"

interface SketchCanvasProps {
  onSubmit: (data: { imageData: string; prompt: string; controlStrength: number }) => void
}

export default function SketchCanvas({ onSubmit }: SketchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)
  const [tool, setTool] = useState<"pen" | "eraser">("pen")
  const [controlStrength, setControlStrength] = useState(0.95)
  const [prompt, setPrompt] = useState(
    "Transform this sketch into a photorealistic image, maintaining exact proportions and details",
  )

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (canvas && container) {
      const resizeCanvas = () => {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
        const context = canvas.getContext("2d")
        if (context) {
          context.lineCap = "round"
          context.lineJoin = "round"
          setCtx(context)
        }
      }

      resizeCanvas()
      window.addEventListener("resize", resizeCanvas)

      return () => {
        window.removeEventListener("resize", resizeCanvas)
      }
    }
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (ctx && canvas) {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      ctx.beginPath()
      ctx.moveTo(x, y)
      setIsDrawing(true)
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (isDrawing && ctx && canvas) {
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Ensure drawing stays within canvas borders
      if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
        ctx.lineTo(x, y)
        ctx.strokeStyle = tool === "eraser" ? "#FFFFFF" : color
        ctx.lineWidth = brushSize
        ctx.stroke()
      }
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    if (ctx) {
      ctx.closePath()
    }
  }

  const clearCanvas = () => {
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current?.width, canvasRef.current?.height)
    }
  }

  const handleSubmit = () => {
    if (canvasRef.current) {
      const imageData = canvasRef.current.toDataURL("image/png")
      onSubmit({
        imageData,
        prompt,
        controlStrength,
      })
    }
  }

  return (
    <div className="flex h-full">
      <div className="w-64 bg-gray-100 p-4 flex flex-col gap-4 overflow-y-auto">
        <div className="flex flex-col gap-2">
          <Button onClick={() => setTool("pen")} variant={tool === "pen" ? "default" : "outline"}>
            <Pen className="mr-2 h-4 w-4" /> Pen
          </Button>
          <Button onClick={() => setTool("eraser")} variant={tool === "eraser" ? "default" : "outline"}>
            <Eraser className="mr-2 h-4 w-4" /> Eraser
          </Button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full h-8 border-2" style={{ backgroundColor: color }}>
                <span className="sr-only">Pick a color</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <SketchPicker color={color} onChange={(color) => setColor(color.hex)} disableAlpha />
            </PopoverContent>
          </Popover>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brush Size</label>
          <Slider value={[brushSize]} onValueChange={(value) => setBrushSize(value[0])} max={20} step={1} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Control Strength: {controlStrength.toFixed(2)}
          </label>
          <Slider
            value={[controlStrength * 100]}
            onValueChange={(value) => setControlStrength(value[0] / 100)}
            max={100}
            step={1}
          />
          <p className="text-xs text-gray-500 mt-1">Higher values make the output more similar to the sketch</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Generation Prompt</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe how you want the image to be generated..."
            className="min-h-[100px] resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">Describe how you want the AI to interpret your sketch</p>
        </div>

        <div className="mt-auto pt-4">
          <Button onClick={clearCanvas} variant="outline" className="w-full mb-2">
            Clear
          </Button>
          <Button onClick={handleSubmit} className="w-full">
            Submit
          </Button>
        </div>
      </div>

      <div ref={containerRef} className="flex-grow relative w-full h-full">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          className="absolute top-0 left-0 w-full h-full border border-gray-300"
        />
      </div>
    </div>
  )
}

