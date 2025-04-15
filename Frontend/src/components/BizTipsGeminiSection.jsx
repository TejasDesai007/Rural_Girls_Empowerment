// src/components/BizTipsGeminiSection.jsx
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RotateCcw, Trash } from "lucide-react"
import { Label } from "@/components/ui/label" // Make sure to import Label
import askGemini from "../services/geminiService" // You must implement this function

const promptSuggestions = [
  "How to market handmade soaps?",
  "Ideas for small town businesses",
  "Where to sell online?",
]

const BizTipsGeminiSection = () => {
  const [query, setQuery] = useState("")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAsk = async (question) => {
    setQuery(question)
    setLoading(true)
    setResponse("")

    try {
      const answer = await askGemini(question)
      setResponse(answer)
    } catch (error) {
      setResponse("An error occurred. Please try again.")
      console.error("Gemini error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    if (query) handleAsk(query)
  }

  const handleClear = () => {
    setQuery("")
    setResponse("")
  }

  return (
    <section className="my-10 space-y-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-orange-600 text-xl">Ask Gemini for Business Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {promptSuggestions.map((prompt, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => handleAsk(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>

          <Input
            placeholder="Ask your own business question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAsk(query)}
          />

          <div className="flex gap-2">
            <Button disabled={loading || !query} onClick={() => handleAsk(query)}>
              Ask
            </Button>
            <Button
              variant="ghost"
              onClick={handleRetry}
              disabled={!query || loading}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Retry
            </Button>
            <Button
              variant="destructive"
              onClick={handleClear}
              disabled={!query && !response}
            >
              <Trash className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </div>

          <div className="mt-4">
            <Label>Gemini's Response</Label>
            <Textarea
              readOnly
              className="min-h-[150px]"
              value={loading ? "Thinking..." : response}
            />
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

export default BizTipsGeminiSection
