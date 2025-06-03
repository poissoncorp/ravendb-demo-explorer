"use client"

import { useState, useEffect } from "react"
import { LanguageProvider, useLanguage } from "@/contexts/language-context"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Sparkles, Package, Globe } from "lucide-react"
import { mockProducts, type Product } from "@/lib/mock-data"
import { searchProducts } from "@/lib/actions"

export default function ProductExplorer() {
  return (
    <LanguageProvider>
      <ProductExplorerContent />
    </LanguageProvider>
  )
}

function LanguageSelector() {
  const { currentLanguage, setLanguage, languages } = useLanguage()
  const currentLang = languages.find((lang) => lang.code === currentLanguage)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <Globe className="h-4 w-4" />
          <span>{currentLang?.flag}</span>
          <span>{currentLang?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => setLanguage(language.code)}
            className="flex items-center space-x-2"
          >
            <span>{language.flag}</span>
            <span>{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ProductExplorerContent() {
  const { currentLanguage } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // Simulate RavenDB vector search
  useEffect(() => {
    const performVectorSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([])
        return
      }

      setIsSearching(true)

      try {
        // Call database service function for vector search
        const results = await searchProducts(searchQuery)

        // If database returns empty (placeholder), fall back to mock data for demo
        if (results.length === 0) {
          // await simulateApiDelay(300)

          // Mock search logic - filter products based on query
          const filtered = mockProducts.filter((product) => {
            const productName = product.alternative_names[currentLanguage] || product.name
            const searchTerms = searchQuery.toLowerCase().split(" ")
            return searchTerms.some(
              (term) =>
                productName.toLowerCase().includes(term) ||
                product.category.toLowerCase().includes(term) ||
                product.description.toLowerCase().includes(term),
            )
          })
          setSearchResults(filtered)
        } else {
          setSearchResults(results)
        }
      } catch (error) {
        console.error("Error searching products:", error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(performVectorSearch, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, currentLanguage])

  const getProductName = (product: Product) => {
    if (product.alternative_names === undefined) {
      return product.name
    }
    return product.alternative_names[currentLanguage] || product.name
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Sparkles className="h-6 w-6 text-purple-600" />
          <h2 className="text-3xl font-bold text-slate-900">AI-Powered Product Explorer</h2>
        </div>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Experience RavenDB's vector search capabilities. Type natural language queries to find products using
          AI-generated embeddings from the Northwind database.
        </p>

        <div className="flex justify-center">
          <LanguageSelector />
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            type="text"
            placeholder="Search for products using natural language (e.g., 'spicy condiments', 'dairy products from France')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 py-3 text-lg"
          />
        </div>

        {isSearching && (
          <div className="flex items-center justify-center mt-4">
            <div className="flex items-center space-x-2 text-purple-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              <span>Searching with vector embeddings...</span>
            </div>
          </div>
        )}
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-slate-600" />
            <h3 className="text-xl font-semibold text-slate-900">Found {searchResults.length} products</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{getProductName(product)}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{product.category}</Badge>
                    <Badge variant="outline">${product.price}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm mb-3">{product.description}</p>
                  <div className="space-y-2 text-xs text-slate-500">
                    <div>
                      <strong>Supplier:</strong> {product.supplier}
                    </div>
                    <div>
                      <strong>Stock:</strong> {product.stock_quantity} units
                    </div>
                    {product.vector_score !== undefined && (
                      <div>
                        <strong>Vector Score:</strong> {product.vector_score.toFixed(3)}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {searchQuery && !isSearching && searchResults.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No products found</h3>
          <p className="text-slate-600">Try adjusting your search terms or use different keywords.</p>
        </div>
      )}

      <div className="bg-slate-50 rounded-lg p-4">
        <h3 className="font-medium text-slate-900 mb-2">RavenDB Integration Points</h3>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>
            • <strong>Vector Search:</strong> getMatchingProducts() - Natural language product search using embeddings
          </li>
          <li>
            • <strong>Product Details:</strong> getProductDetails() - Individual product information retrieval
          </li>
          <li>
            • <strong>Stock Levels:</strong> getStockLevels() - Real-time inventory management
          </li>
          <li>
            • <strong>Multi-language Support:</strong> Alternative names stored in document structure
          </li>
        </ul>
      </div>
    </div>
  )
}
