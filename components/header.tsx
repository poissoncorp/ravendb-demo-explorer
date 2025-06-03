"use client"

import { Database, Sparkles } from "lucide-react"

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Database className="h-8 w-8 text-purple-600" />
              <Sparkles className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">RavenDB Demo Explorer</h1>
              <p className="text-sm text-slate-600">Interactive Feature Showcase</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
