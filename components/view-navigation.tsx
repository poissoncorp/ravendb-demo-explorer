"use client"

import { useView } from "@/contexts/view-context"
import { Button } from "@/components/ui/button"
import { Search, Headphones, ShoppingCart } from "lucide-react"

export default function ViewNavigation() {
  const { currentView, setCurrentView } = useView()

  return (
    <div className="flex flex-wrap gap-2 bg-white rounded-lg p-2 shadow-sm border border-slate-200">
      <Button
        variant={currentView === "products" ? "default" : "ghost"}
        onClick={() => setCurrentView("products")}
        className="flex items-center space-x-2"
      >
        <Search className="h-4 w-4" />
        <span>AI Product Explorer</span>
      </Button>
      <Button
        variant={currentView === "helpdesk" ? "default" : "ghost"}
        onClick={() => setCurrentView("helpdesk")}
        className="flex items-center space-x-2"
      >
        <Headphones className="h-4 w-4" />
        <span>Intelligent Helpdesk</span>
      </Button>
      <Button
        variant={currentView === "shopping-agent" ? "default" : "ghost"}
        onClick={() => setCurrentView("shopping-agent")}
        className="flex items-center space-x-2"
      >
        <ShoppingCart className="h-4 w-4" />
        <span>Shopping AI Agent</span>
      </Button>
    </div>
  )
}
