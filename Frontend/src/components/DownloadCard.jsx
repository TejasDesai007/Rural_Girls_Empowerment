// src/components/DownloadCard.jsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

const DownloadCard = ({ file }) => {
  const handleDownload = async () => {
    try {
      const response = await fetch(file.downloadUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = file.title || "file.pdf"
      link.click()

      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading file:", error)
    }
  }

  return (
    <Card className="w-full md:max-w-sm flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center gap-4">
        {file.thumbnail ? (
          <img src={file.thumbnail} alt="File thumbnail" className="w-12 h-12 object-cover rounded" />
        ) : (
          <div className="p-2 bg-orange-100 rounded">
            <FileText className="text-orange-600 w-8 h-8" />
          </div>
        )}
        <div>
          <CardTitle className="text-base">{file.title}</CardTitle>
          <CardDescription>{file.description}</CardDescription>
        </div>
      </CardHeader>

      <CardFooter>
        <Button onClick={handleDownload} className="w-full">
          Download
        </Button>
      </CardFooter>
    </Card>
  )
}

export default DownloadCard
