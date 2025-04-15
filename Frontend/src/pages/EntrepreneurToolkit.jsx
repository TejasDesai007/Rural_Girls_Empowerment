// src/pages/EntrepreneurToolkit.jsx
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

import InventoryForm from "../components/InventoryForm"
import BizDashboard from "../components/BizDashboard"
import DownloadCard from "../components/DownloadCard"
import BizTipsGeminiSection from "../components/BizTipsGeminiSection"

const EntrepreneurToolkit = () => {
  return (
    <div className="p-6 md:p-10 bg-gradient-to-br from-orange-50 to-white min-h-screen space-y-16">
      
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-orange-600">
          Start Your Micro-Business Today
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          Empower yourself with tools to manage your small business like a pro — all in one place!
        </p>
        <Button className="mt-2">Start Your Journey</Button>
      </section>

      {/* InventoryForm Section */}
      <section>
        <InventoryForm />
      </section>

      {/* BizDashboard Section */}
      <section>
        <BizDashboard />
      </section>

      {/* Download Templates Section */}
      <section>
        <h3 className="text-2xl font-bold text-center mb-4">📄 Download Business Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Invoice Template",
              file: "invoice.pdf",
              description: "Professional invoice format for client billing."
            },
            {
              title: "Inventory Tracker",
              file: "inventory.pdf",
              description: "Track product stock and supplies."
            },
            {
              title: "Marketing Poster",
              file: "poster.pdf",
              description: "Pre-designed poster for promoting your business."
            }
          ].map((doc, i) => (
            <DownloadCard
              key={i}
              title={doc.title}
              file={doc.file}
              description={doc.description}
            />
          ))}
        </div>
      </section>

      {/* Gemini Tips Section */}
      <section>
        <BizTipsGeminiSection />
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-gray-800">Ready to Grow?</h3>
        <p className="text-gray-600">
          Let’s build your business and make your vision a reality.
        </p>
        <Button size="lg">Get Started</Button>
      </section>

      {/* Footer */}
      <footer className="mt-16 text-center text-sm text-gray-400">
        © 2025 Rural Girls Empowerment. All rights reserved.
      </footer>
    </div>
  )
}

export default EntrepreneurToolkit
