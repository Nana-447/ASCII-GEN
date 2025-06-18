"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowRightIcon as ArrowCounterclockwise,
  Copy,
  Download,
  ImageIcon,
  WandIcon as MagicWand,
  MicroscopeIcon as MagnifyingGlass,
  TextSelectIcon as Selection,
  Sliders,
  TextIcon as TextT,
  Upload,
  DotIcon as Dots,
  Github,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export default function AsciiGenerator() {
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(null)
  const [asciiArt, setAsciiArt] = useState<string>("")
  const [fileName, setFileName] = useState<string>("No file selected")
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [activeTab, setActiveTab] = useState<string>("upload")
  const [isGenerating, setIsGenerating] = useState<boolean>(false)

  // Settings state
  const [settings, setSettings] = useState({
    asciiWidth: 100,
    brightness: 0,
    contrast: 0,
    blur: 0,
    zoom: 100,
    dithering: true,
    ditherAlgorithm: "floyd",
    invert: false,
    ignoreWhite: true,
    charset: "detailed",
    manualChar: "0",
    edgeMethod: "none",
    edgeThreshold: 100,
    dogEdgeThreshold: 100,
  })

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const asciiRef = useRef<HTMLPreElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Load default image on component mount
    const defaultImg = new Image()
    defaultImg.crossOrigin = "anonymous"
    defaultImg.src =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Flux_BFL_Depth_Redux_30674_-PUiTBLYGPZ5Y0dd3aW95fFa4NX8ij0.png" // Updated to use the skull image
    defaultImg.onload = () => {
      setCurrentImage(defaultImg)
      generateASCII(defaultImg)
    }

    // Set theme based on system preference
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
      setTheme("light")
      document.documentElement.classList.remove("dark")
    } else {
      document.documentElement.classList.add("dark")
    }
  }, [])

  // Update ASCII art when settings change
  useEffect(() => {
    if (currentImage) {
      generateASCII(currentImage)
    }
  }, [settings])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          setCurrentImage(img)
          generateASCII(img)
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          setCurrentImage(img)
          generateASCII(img)
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const resetSettings = () => {
    setSettings({
      asciiWidth: 100,
      brightness: 0,
      contrast: 0,
      blur: 0,
      zoom: 100,
      dithering: true,
      ditherAlgorithm: "floyd",
      invert: false,
      ignoreWhite: true,
      charset: "detailed",
      manualChar: "0",
      edgeMethod: "none",
      edgeThreshold: 100,
      dogEdgeThreshold: 100,
    })

    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default values.",
    })
  }

  const copyToClipboard = () => {
    if (asciiArt) {
      navigator.clipboard.writeText(asciiArt).then(
        () => {
          toast({
            title: "Copied!",
            description: "ASCII art copied to clipboard.",
          })
        },
        () => {
          toast({
            title: "Copy failed",
            description: "Could not copy to clipboard.",
            variant: "destructive",
          })
        },
      )
    }
  }

  const downloadPNG = () => {
    if (!asciiArt.trim()) {
      toast({
        title: "No ASCII art",
        description: "Generate some ASCII art first.",
        variant: "destructive",
      })
      return
    }

    // Split the ASCII art into lines
    const lines = asciiArt.split("\n")

    // Set a scaling factor (2x resolution for better quality)
    const scaleFactor = 2

    // Define the border margin
    const borderMargin = 20 * scaleFactor

    // Get font size based on zoom
    const baseFontSize = 7
    const fontSize = ((baseFontSize * settings.zoom) / 100) * scaleFactor

    // Create a temporary canvas to measure text dimensions
    const tempCanvas = document.createElement("canvas")
    const tempCtx = tempCanvas.getContext("2d")
    if (!tempCtx) return

    tempCtx.font = `${fontSize}px Consolas, Monaco, "Liberation Mono", monospace`

    // Determine the maximum line width
    let maxLineWidth = 0
    for (let i = 0; i < lines.length; i++) {
      const lineWidth = tempCtx.measureText(lines[i]).width
      if (lineWidth > maxLineWidth) {
        maxLineWidth = lineWidth
      }
    }

    // Calculate the required text dimensions
    const lineHeight = fontSize
    const textWidth = Math.ceil(maxLineWidth)
    const textHeight = Math.ceil(lines.length * lineHeight)

    // Create an offscreen canvas with extra space for the border margin
    const canvasWidth = textWidth + 2 * borderMargin
    const canvasHeight = textHeight + 2 * borderMargin
    const offCanvas = document.createElement("canvas")
    offCanvas.width = canvasWidth
    offCanvas.height = canvasHeight
    const offCtx = offCanvas.getContext("2d")
    if (!offCtx) return

    // Fill the background based on the current theme
    const bgColor = theme === "light" ? "#fff" : "#000"
    offCtx.fillStyle = bgColor
    offCtx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Set the font and text styles
    offCtx.font = `${fontSize}px Consolas, Monaco, "Liberation Mono", monospace`
    offCtx.textBaseline = "top"
    offCtx.fillStyle = theme === "light" ? "#000" : "#eee"

    // Draw each line of the ASCII art onto the canvas with the margin offset
    for (let i = 0; i < lines.length; i++) {
      offCtx.fillText(lines[i], borderMargin, borderMargin + i * lineHeight)
    }

    // Convert the canvas content to a blob and trigger a download
    offCanvas.toBlob((blob) => {
      if (!blob) return
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = "ascii_art.png"
      a.click()

      toast({
        title: "Downloaded!",
        description: "ASCII art saved as PNG.",
      })
    })
  }

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === "dark" ? "light" : "dark"
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
      return newTheme
    })
  }

  // Helper functions for ASCII generation
  const clamp = (value: number, min: number, max: number) => {
    return Math.max(min, Math.min(max, value))
  }

  // Main ASCII generation function
  const generateASCII = (img: HTMLImageElement) => {
    setIsGenerating(true)

    // Use setTimeout to allow UI to update before heavy computation
    setTimeout(() => {
      try {
        if (settings.edgeMethod === "dog") {
          generateContourASCII(img)
        } else {
          generateStandardASCII(img)
        }
      } catch (error) {
        console.error("Error generating ASCII:", error)
        toast({
          title: "Generation Error",
          description: "Failed to generate ASCII art.",
          variant: "destructive",
        })
      } finally {
        setIsGenerating(false)
      }
    }, 50)
  }

  const generateStandardASCII = (img: HTMLImageElement) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const asciiWidth = settings.asciiWidth
    const brightness = settings.brightness
    const contrastValue = settings.contrast
    const blurValue = settings.blur
    const ditheringEnabled = settings.dithering
    const ditherAlgorithm = settings.ditherAlgorithm
    const invertEnabled = settings.invert
    const ignoreWhite = settings.ignoreWhite
    const charsetType = settings.charset

    let gradient
    switch (charsetType) {
      case "standard":
        gradient = "@%#*+=-:."
        break
      case "blocks":
        gradient = "█▓▒░ "
        break
      case "binary":
        gradient = "01"
        break
      case "manual":
        const manualChar = settings.manualChar || "0"
        gradient = manualChar + " "
        break
      case "hex":
        gradient = "0123456789ABCDEF"
        break
      case "detailed":
      default:
        gradient = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'."
        break
    }

    const nLevels = gradient.length
    const contrastFactor = (259 * (contrastValue + 255)) / (255 * (259 - contrastValue))
    const fontAspectRatio = 0.55
    const asciiHeight = Math.round((img.height / img.width) * asciiWidth * fontAspectRatio)

    canvas.width = asciiWidth
    canvas.height = asciiHeight
    ctx.filter = blurValue > 0 ? `blur(${blurValue}px)` : "none"
    ctx.drawImage(img, 0, 0, asciiWidth, asciiHeight)

    const imageData = ctx.getImageData(0, 0, asciiWidth, asciiHeight)
    const data = imageData.data
    let gray: number[] = [],
      grayOriginal: number[] = []

    for (let i = 0; i < data.length; i += 4) {
      let lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      if (invertEnabled) lum = 255 - lum
      const adjusted = clamp(contrastFactor * (lum - 128) + 128 + brightness, 0, 255)
      gray.push(adjusted)
      grayOriginal.push(adjusted)
    }

    let ascii = ""
    if (settings.edgeMethod === "sobel") {
      const threshold = settings.edgeThreshold
      gray = applyEdgeDetection(gray, asciiWidth, asciiHeight, threshold)
      for (let y = 0; y < asciiHeight; y++) {
        let line = ""
        for (let x = 0; x < asciiWidth; x++) {
          const idx = y * asciiWidth + x
          if (ignoreWhite && grayOriginal[idx] === 255) {
            line += " "
            continue
          }
          const computedLevel = Math.round((gray[idx] / 255) * (nLevels - 1))
          line += gradient.charAt(computedLevel)
        }
        ascii += line + "\n"
      }
    } else if (ditheringEnabled) {
      if (ditherAlgorithm === "floyd") {
        // Floyd–Steinberg dithering
        for (let y = 0; y < asciiHeight; y++) {
          let line = ""
          for (let x = 0; x < asciiWidth; x++) {
            const idx = y * asciiWidth + x
            if (ignoreWhite && grayOriginal[idx] === 255) {
              line += " "
              continue
            }
            const computedLevel = Math.round((gray[idx] / 255) * (nLevels - 1))
            line += gradient.charAt(computedLevel)
            const newPixel = (computedLevel / (nLevels - 1)) * 255
            const error = gray[idx] - newPixel
            if (x + 1 < asciiWidth) {
              gray[idx + 1] = clamp(gray[idx + 1] + error * (7 / 16), 0, 255)
            }
            if (x - 1 >= 0 && y + 1 < asciiHeight) {
              gray[idx - 1 + asciiWidth] = clamp(gray[idx - 1 + asciiWidth] + error * (3 / 16), 0, 255)
            }
            if (y + 1 < asciiHeight) {
              gray[idx + asciiWidth] = clamp(gray[idx + asciiWidth] + error * (5 / 16), 0, 255)
            }
            if (x + 1 < asciiWidth && y + 1 < asciiHeight) {
              gray[idx + asciiWidth + 1] = clamp(gray[idx + asciiWidth + 1] + error * (1 / 16), 0, 255)
            }
          }
          ascii += line + "\n"
        }
      } else if (ditherAlgorithm === "atkinson") {
        // Atkinson dithering
        for (let y = 0; y < asciiHeight; y++) {
          let line = ""
          for (let x = 0; x < asciiWidth; x++) {
            const idx = y * asciiWidth + x
            if (ignoreWhite && grayOriginal[idx] === 255) {
              line += " "
              continue
            }
            const computedLevel = Math.round((gray[idx] / 255) * (nLevels - 1))
            line += gradient.charAt(computedLevel)
            const newPixel = (computedLevel / (nLevels - 1)) * 255
            const error = gray[idx] - newPixel
            const diffusion = error / 8
            if (x + 1 < asciiWidth) {
              gray[idx + 1] = clamp(gray[idx + 1] + diffusion, 0, 255)
            }
            if (x + 2 < asciiWidth) {
              gray[idx + 2] = clamp(gray[idx + 2] + diffusion, 0, 255)
            }
            if (y + 1 < asciiHeight) {
              if (x - 1 >= 0) {
                gray[idx - 1 + asciiWidth] = clamp(gray[idx - 1 + asciiWidth] + diffusion, 0, 255)
              }
              gray[idx + asciiWidth] = clamp(gray[idx + asciiWidth] + diffusion, 0, 255)
              if (x + 1 < asciiWidth) {
                gray[idx + asciiWidth + 1] = clamp(gray[idx + asciiWidth + 1] + diffusion, 0, 255)
              }
            }
            if (y + 2 < asciiHeight) {
              gray[idx + 2 * asciiWidth] = clamp(gray[idx + 2 * asciiWidth] + diffusion, 0, 255)
            }
          }
          ascii += line + "\n"
        }
      } else if (ditherAlgorithm === "noise") {
        // Noise dithering
        for (let y = 0; y < asciiHeight; y++) {
          let line = ""
          for (let x = 0; x < asciiWidth; x++) {
            const idx = y * asciiWidth + x
            if (ignoreWhite && grayOriginal[idx] === 255) {
              line += " "
              continue
            }
            const noise = (Math.random() - 0.5) * (255 / nLevels)
            const noisyValue = clamp(gray[idx] + noise, 0, 255)
            const computedLevel = Math.round((noisyValue / 255) * (nLevels - 1))
            line += gradient.charAt(computedLevel)
          }
          ascii += line + "\n"
        }
      } else if (ditherAlgorithm === "ordered") {
        // Ordered dithering using a 4x4 Bayer matrix
        const bayer = [
          [0, 8, 2, 10],
          [12, 4, 14, 6],
          [3, 11, 1, 9],
          [15, 7, 13, 5],
        ]
        const matrixSize = 4
        for (let y = 0; y < asciiHeight; y++) {
          let line = ""
          for (let x = 0; x < asciiWidth; x++) {
            const idx = y * asciiWidth + x
            if (ignoreWhite && grayOriginal[idx] === 255) {
              line += " "
              continue
            }
            const p = gray[idx] / 255
            const t = (bayer[y % matrixSize][x % matrixSize] + 0.5) / (matrixSize * matrixSize)
            let valueWithDither = p + t - 0.5
            valueWithDither = Math.min(Math.max(valueWithDither, 0), 1)
            let computedLevel = Math.floor(valueWithDither * nLevels)
            if (computedLevel >= nLevels) computedLevel = nLevels - 1
            line += gradient.charAt(computedLevel)
          }
          ascii += line + "\n"
        }
      }
    } else {
      // Simple mapping without dithering
      for (let y = 0; y < asciiHeight; y++) {
        let line = ""
        for (let x = 0; x < asciiWidth; x++) {
          const idx = y * asciiWidth + x
          if (ignoreWhite && grayOriginal[idx] === 255) {
            line += " "
            continue
          }
          const computedLevel = Math.round((gray[idx] / 255) * (nLevels - 1))
          line += gradient.charAt(computedLevel)
        }
        ascii += line + "\n"
      }
    }

    setAsciiArt(ascii)
  }

  // Apply simple Sobel edge detection on a 1D grayscale array
  const applyEdgeDetection = (gray: number[], width: number, height: number, threshold: number) => {
    const edges = new Array(width * height).fill(255)
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x
        const a = gray[(y - 1) * width + (x - 1)]
        const b = gray[(y - 1) * width + x]
        const c = gray[(y - 1) * width + (x + 1)]
        const d = gray[y * width + (x - 1)]
        const e = gray[y * width + x]
        const f = gray[y * width + (x + 1)]
        const g = gray[(y + 1) * width + (x - 1)]
        const h = gray[(y + 1) * width + x]
        const i = gray[(y + 1) * width + (x + 1)]
        const Gx = -1 * a + 0 * b + 1 * c + -2 * d + 0 * e + 2 * f + -1 * g + 0 * h + 1 * i
        const Gy = -1 * a + -2 * b + -1 * c + 0 * d + 0 * e + 0 * f + 1 * g + 2 * h + 1 * i
        const magVal = Math.sqrt(Gx * Gx + Gy * Gy)
        const normalized = (magVal / 1442) * 255
        edges[idx] = normalized > threshold ? 0 : 255
      }
    }
    return edges
  }

  // Generate contour ASCII art (DoG mode)
  const generateContourASCII = (img: HTMLImageElement) => {
    // This is a simplified version - in a real implementation, you would need to implement
    // the Difference of Gaussians algorithm and other helper functions
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const asciiWidth = settings.asciiWidth
    const brightness = settings.brightness
    const contrastValue = settings.contrast
    const blurValue = settings.blur
    const invertEnabled = settings.invert
    const fontAspectRatio = 0.55
    const asciiHeight = Math.round((img.height / img.width) * asciiWidth * fontAspectRatio)

    canvas.width = asciiWidth
    canvas.height = asciiHeight
    ctx.filter = blurValue > 0 ? `blur(${blurValue}px)` : "none"
    ctx.drawImage(img, 0, 0, asciiWidth, asciiHeight)

    // For simplicity, we'll just use a basic edge detection here
    // In a real implementation, you would implement the DoG algorithm
    const imageData = ctx.getImageData(0, 0, asciiWidth, asciiHeight)
    const data = imageData.data

    // Convert to grayscale
    const gray: number[][] = []
    for (let y = 0; y < asciiHeight; y++) {
      gray[y] = []
      for (let x = 0; x < asciiWidth; x++) {
        const idx = (y * asciiWidth + x) * 4
        let lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
        if (invertEnabled) lum = 255 - lum
        gray[y][x] = lum
      }
    }

    // Apply a simple edge detection
    let ascii = ""
    for (let y = 1; y < asciiHeight - 1; y++) {
      let line = ""
      for (let x = 1; x < asciiWidth - 1; x++) {
        // Simple gradient calculation
        const gx =
          -1 * gray[y - 1][x - 1] +
          0 * gray[y - 1][x] +
          1 * gray[y - 1][x + 1] +
          -2 * gray[y][x - 1] +
          0 * gray[y][x] +
          2 * gray[y][x + 1] +
          -1 * gray[y + 1][x - 1] +
          0 * gray[y + 1][x] +
          1 * gray[y + 1][x + 1]

        const gy =
          -1 * gray[y - 1][x - 1] +
          -2 * gray[y - 1][x] +
          -1 * gray[y - 1][x + 1] +
          0 * gray[y][x - 1] +
          0 * gray[y][x] +
          0 * gray[y][x + 1] +
          1 * gray[y + 1][x - 1] +
          2 * gray[y + 1][x] +
          1 * gray[y + 1][x + 1]

        const magnitude = Math.sqrt(gx * gx + gy * gy)
        const threshold = settings.dogEdgeThreshold

        if (magnitude > threshold) {
          // Determine edge direction
          const angle = Math.atan2(gy, gx) * (180 / Math.PI)
          const adjustedAngle = (angle + 90) % 180

          // Choose character based on edge direction
          const edgeChar =
            adjustedAngle < 22.5 || adjustedAngle >= 157.5
              ? "-"
              : adjustedAngle < 67.5
                ? "/"
                : adjustedAngle < 112.5
                  ? "|"
                  : "\\"

          line += edgeChar
        } else {
          line += " "
        }
      }
      ascii += line + "\n"
    }

    setAsciiArt(ascii)
  }

  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-b from-background to-muted/50 transition-colors duration-500",
        theme === "dark" ? "dark" : "",
      )}
    >
      <div className="container mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <motion.h1
            className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            ASCII-Gen
          </motion.h1>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={toggleTheme} className="relative overflow-hidden">
              <motion.span
                initial={false}
                animate={{
                  rotate: theme === "dark" ? 0 : 180,
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 0.5 }}
              >
                {theme === "dark" ? "🌙" : "☀️"}
              </motion.span>
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => window.open("https://github.com/Saganaki22/ASCII-GEN", "_blank")}
              className="relative overflow-hidden"
            >
              <Github size={16} />
            </Button>

            <Button variant="outline" onClick={resetSettings} className="flex items-center gap-2">
              <ArrowCounterclockwise size={16} />
              <span className="hidden sm:inline">Reset Settings</span>
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Panel */}
          <Card className="lg:col-span-4 bg-card/80 backdrop-blur-sm border-primary/20">
            <CardContent className="p-0">
              <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-6 rounded-none">
                  <TabsTrigger value="upload" className="rounded-none data-[state=active]:bg-primary/20">
                    <Upload size={16} className="mr-2 sm:mr-0" />
                    <span className="hidden sm:inline">Upload</span>
                  </TabsTrigger>
                  <TabsTrigger value="basic" className="rounded-none data-[state=active]:bg-primary/20">
                    <Sliders size={16} className="mr-2 sm:mr-0" />
                    <span className="hidden sm:inline">Basic</span>
                  </TabsTrigger>
                  <TabsTrigger value="dither" className="rounded-none data-[state=active]:bg-primary/20">
                    <Dots size={16} className="mr-2 sm:mr-0" />
                    <span className="hidden sm:inline">Dither</span>
                  </TabsTrigger>
                  <TabsTrigger value="charset" className="rounded-none data-[state=active]:bg-primary/20">
                    <TextT size={16} className="mr-2 sm:mr-0" />
                    <span className="hidden sm:inline">Charset</span>
                  </TabsTrigger>
                  <TabsTrigger value="edge" className="rounded-none data-[state=active]:bg-primary/20">
                    <Selection size={16} className="mr-2 sm:mr-0" />
                    <span className="hidden sm:inline">Edge</span>
                  </TabsTrigger>
                  <TabsTrigger value="display" className="rounded-none data-[state=active]:bg-primary/20">
                    <MagnifyingGlass size={16} className="mr-2 sm:mr-0" />
                    <span className="hidden sm:inline">Display</span>
                  </TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[calc(100vh-20rem)] p-4">
                  <TabsContent value="upload" className="mt-0 p-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <Upload size={18} />
                        Upload Your Image
                      </h3>

                      <div
                        className="border-2 border-dashed border-primary/40 rounded-lg p-8 text-center cursor-pointer hover:border-primary/80 transition-colors duration-300"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      >
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex flex-col items-center gap-4"
                        >
                          <ImageIcon className="w-16 h-16 text-primary/60" />
                          <div>
                            <p className="font-medium">Drag & drop an image or click to select</p>
                            <p className="text-sm text-muted-foreground mt-1">{fileName}</p>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                          />
                        </motion.div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="basic" className="mt-0 p-4">
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <Sliders size={18} />
                        Basic Adjustments
                      </h3>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="asciiWidth">Output Width (chars)</Label>
                            <span className="text-sm font-medium">{settings.asciiWidth}</span>
                          </div>
                          <Slider
                            id="asciiWidth"
                            min={20}
                            max={300}
                            step={1}
                            value={[settings.asciiWidth]}
                            onValueChange={(value) => handleSettingChange("asciiWidth", value[0])}
                            className="cursor-pointer"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="brightness">Brightness</Label>
                            <span className="text-sm font-medium">{settings.brightness}</span>
                          </div>
                          <Slider
                            id="brightness"
                            min={-100}
                            max={100}
                            step={1}
                            value={[settings.brightness]}
                            onValueChange={(value) => handleSettingChange("brightness", value[0])}
                            className="cursor-pointer"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="contrast">Contrast</Label>
                            <span className="text-sm font-medium">{settings.contrast}</span>
                          </div>
                          <Slider
                            id="contrast"
                            min={-100}
                            max={100}
                            step={1}
                            value={[settings.contrast]}
                            onValueChange={(value) => handleSettingChange("contrast", value[0])}
                            className="cursor-pointer"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="blur">Blur (px)</Label>
                            <span className="text-sm font-medium">{settings.blur.toFixed(2)}</span>
                          </div>
                          <Slider
                            id="blur"
                            min={0}
                            max={10}
                            step={0.01}
                            value={[settings.blur]}
                            onValueChange={(value) => handleSettingChange("blur", value[0])}
                            className="cursor-pointer"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label htmlFor="invert">Invert Colors</Label>
                          <Switch
                            id="invert"
                            checked={settings.invert}
                            onCheckedChange={(checked) => handleSettingChange("invert", checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="dither" className="mt-0 p-4">
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <Dots size={18} />
                        Dithering Options
                      </h3>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="dithering">Enable Dithering</Label>
                          <Switch
                            id="dithering"
                            checked={settings.dithering}
                            onCheckedChange={(checked) => handleSettingChange("dithering", checked)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ditherAlgorithm">Dither Algorithm</Label>
                          <Select
                            value={settings.ditherAlgorithm}
                            onValueChange={(value) => handleSettingChange("ditherAlgorithm", value)}
                            disabled={!settings.dithering}
                          >
                            <SelectTrigger id="ditherAlgorithm">
                              <SelectValue placeholder="Select algorithm" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="floyd">Floyd–Steinberg</SelectItem>
                              <SelectItem value="atkinson">Atkinson</SelectItem>
                              <SelectItem value="noise">Noise</SelectItem>
                              <SelectItem value="ordered">Ordered</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="charset" className="mt-0 p-4">
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <TextT size={18} />
                        Character Set
                      </h3>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="charset">Select Set</Label>
                          <Select
                            value={settings.charset}
                            onValueChange={(value) => handleSettingChange("charset", value)}
                          >
                            <SelectTrigger id="charset">
                              <SelectValue placeholder="Select character set" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="detailed">Detailed</SelectItem>
                              <SelectItem value="standard">Standard</SelectItem>
                              <SelectItem value="blocks">Blocks</SelectItem>
                              <SelectItem value="binary">Binary</SelectItem>
                              <SelectItem value="hex">Hex</SelectItem>
                              <SelectItem value="manual">Manual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {settings.charset === "manual" && (
                          <div className="space-y-2">
                            <Label htmlFor="manualChar">Manual Character</Label>
                            <Input
                              id="manualChar"
                              value={settings.manualChar}
                              onChange={(e) => handleSettingChange("manualChar", e.target.value.charAt(0) || "0")}
                              maxLength={1}
                              className="w-16 text-center"
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <Label htmlFor="ignoreWhite">Ignore Pure White</Label>
                          <Switch
                            id="ignoreWhite"
                            checked={settings.ignoreWhite}
                            onCheckedChange={(checked) => handleSettingChange("ignoreWhite", checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="edge" className="mt-0 p-4">
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <Selection size={18} />
                        Edge Detection
                      </h3>

                      <div className="space-y-4">
                        <RadioGroup
                          value={settings.edgeMethod}
                          onValueChange={(value) => handleSettingChange("edgeMethod", value)}
                          className="space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="none" id="edgeNone" />
                            <Label htmlFor="edgeNone">No Edge Detection</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="sobel" id="edgeSobel" />
                            <Label htmlFor="edgeSobel">Sobel Edge Detection</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="dog" id="edgeDoG" />
                            <Label htmlFor="edgeDoG">DoG (Contour) Detection</Label>
                          </div>
                        </RadioGroup>

                        {settings.edgeMethod === "sobel" && (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Label htmlFor="edgeThreshold">Sobel Threshold</Label>
                              <span className="text-sm font-medium">{settings.edgeThreshold}</span>
                            </div>
                            <Slider
                              id="edgeThreshold"
                              min={0}
                              max={255}
                              step={1}
                              value={[settings.edgeThreshold]}
                              onValueChange={(value) => handleSettingChange("edgeThreshold", value[0])}
                              className="cursor-pointer"
                            />
                          </div>
                        )}

                        {settings.edgeMethod === "dog" && (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Label htmlFor="dogEdgeThreshold">DoG Threshold</Label>
                              <span className="text-sm font-medium">{settings.dogEdgeThreshold}</span>
                            </div>
                            <Slider
                              id="dogEdgeThreshold"
                              min={0}
                              max={255}
                              step={1}
                              value={[settings.dogEdgeThreshold]}
                              onValueChange={(value) => handleSettingChange("dogEdgeThreshold", value[0])}
                              className="cursor-pointer"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="display" className="mt-0 p-4">
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium flex items-center gap-2">
                        <MagnifyingGlass size={18} />
                        Display Settings
                      </h3>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="zoom">Zoom (%)</Label>
                            <span className="text-sm font-medium">{settings.zoom}</span>
                          </div>
                          <Slider
                            id="zoom"
                            min={20}
                            max={600}
                            step={1}
                            value={[settings.zoom]}
                            onValueChange={(value) => handleSettingChange("zoom", value[0])}
                            className="cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </CardContent>
          </Card>

          {/* Output Panel */}
          <Card className="lg:col-span-8 bg-card/80 backdrop-blur-sm border-primary/20">
            <CardContent className="p-6 flex flex-col h-[calc(100vh-12rem)]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <MagicWand size={20} className="text-primary" />
                  ASCII Art Output
                </h2>
              </div>

              <div className="relative flex-1 overflow-hidden bg-background/50 rounded-lg border border-border/50">
                {isGenerating && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="text-sm font-medium">Generating ASCII art...</p>
                    </div>
                  </div>
                )}

                <ScrollArea className="h-full p-4">
                  <pre
                    ref={asciiRef}
                    className="font-mono whitespace-pre overflow-auto transition-all duration-300"
                    style={{
                      fontSize: `${(7 * settings.zoom) / 100}px`,
                      lineHeight: `${(7 * settings.zoom) / 100}px`,
                    }}
                  >
                    {asciiArt}
                  </pre>
                </ScrollArea>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <Button
                  onClick={copyToClipboard}
                  variant={theme === "dark" ? "default" : "outline"}
                  className={cn(
                    "flex-1 sm:flex-none transition-all duration-300",
                    theme === "dark"
                      ? "bg-primary hover:bg-primary/90"
                      : "border-primary text-primary hover:bg-primary/10",
                  )}
                  disabled={!asciiArt || isGenerating}
                >
                  <Copy size={16} className="mr-2" />
                  Copy ASCII Art
                </Button>
                <Button
                  onClick={downloadPNG}
                  variant={theme === "dark" ? "default" : "outline"}
                  className={cn(
                    "flex-1 sm:flex-none transition-all duration-300",
                    theme === "dark"
                      ? "bg-primary hover:bg-primary/90"
                      : "border-primary text-primary hover:bg-primary/10",
                  )}
                  disabled={!asciiArt || isGenerating}
                >
                  <Download size={16} className="mr-2" />
                  Download PNG
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <p>Copyright 2025 &copy; DrBaph, UK. All rights reserved.</p>
        </footer>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
