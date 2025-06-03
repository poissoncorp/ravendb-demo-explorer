"use client"

import { ViewProvider, useView } from "@/contexts/view-context"
import Header from "@/components/header"
import ViewNavigation from "@/components/view-navigation"
import ProductExplorer from "@/components/views/product-explorer"
import HelpdeskView from "@/components/views/helpdesk-view"
import ShoppingAgentView from "@/components/views/shopping-agent-view"

export default function RavenDBDemo() {
  return (
    <ViewProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <ViewNavigation />
          <div className="mt-8">
            <ViewContent />
          </div>
        </main>
      </div>
    </ViewProvider>
  )
}

function ViewContent() {
  const { currentView } = useView()

  switch (currentView) {
    case "products":
      return <ProductExplorer />
    case "helpdesk":
      return <HelpdeskView />
    case "shopping-agent":
      return <ShoppingAgentView />
    default:
      return <ProductExplorer />
  }
}
