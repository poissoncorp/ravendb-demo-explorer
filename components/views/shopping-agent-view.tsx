"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Bot, Send, ShoppingCart, Package, Info } from "lucide-react"
import { type ChatMessage, type Product, type Order } from "@/lib/types"

const mockProducts: Product[] = []
const messages: ChatMessage[] = []

export default function ShoppingAgentView() {

  const [inputValue, setInputValue] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [cart, setCart] = useState<Array<{ product: Product; quantity: number }>>([])
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [products, setProducts] = useState<Product[]>()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputValue.trim() || isProcessing) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputValue,
      timestamp: new Date().toISOString(),
    }


    setInputValue("")
    setIsProcessing(true)

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 600))

    // Process the user message and generate a response
    const response = await processUserMessage(userMessage.content)

    setIsProcessing(false)
  }

  const processUserMessage = async (message: string): Promise<ChatMessage> => {
    const lowerMessage = message.toLowerCase()

    // Check for product availability queries
    if (
      lowerMessage.includes("available") ||
      lowerMessage.includes("in stock") ||
      lowerMessage.includes("do you have")
    ) {
      // Extract product name from query
      const productMatches: any[] = []// mockProducts.filter((product) => lowerMessage.includes(product.name.toLowerCase()))

      if (productMatches.length > 0) {
        const product = productMatches[0]
        if (product.stock_quantity > 0) {
          return {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: `Yes, we have ${product.name} in stock! There are currently ${product.stock_quantity} units available at $${product.price} each. Would you like to add this to your cart?`,
            timestamp: new Date().toISOString(),
          }
        } else {
          return {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: `I'm sorry, ${product.name} is currently out of stock. Would you like me to suggest similar products?`,
            timestamp: new Date().toISOString(),
          }
        }
      } else {
        // Try to find partial matches
        const words = lowerMessage.split(" ")
        const potentialProducts = mockProducts.filter((product) =>
          words.some((word) => product.name.toLowerCase().includes(word) && word.length > 3),
        )

        if (potentialProducts.length > 0) {
          const suggestions = potentialProducts
            .slice(0, 3)
            .map((p) => `${p.name} ($${p.price})`)
            .join(", ")
          return {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: `I'm not sure which product you're looking for. Did you mean one of these? ${suggestions}`,
            timestamp: new Date().toISOString(),
          }
        } else {
          return {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: `I'm not sure which product you're asking about. Could you please specify the product name?`,
            timestamp: new Date().toISOString(),
          }
        }
      }
    }

    // Check for order placement
    if (
      lowerMessage.includes("order") ||
      lowerMessage.includes("buy") ||
      lowerMessage.includes("purchase") ||
      lowerMessage.includes("add to cart")
    ) {
      // Extract product name and quantity
      const productMatches = mockProducts.filter((product) => lowerMessage.includes(product.name.toLowerCase()))

      if (productMatches.length > 0) {
        const product = productMatches[0]

        // Extract quantity
        const quantityMatch = lowerMessage.match(/(\d+)/g)
        const quantity = quantityMatch ? Number.parseInt(quantityMatch[0]) : 1

        if (product.stock_quantity >= quantity) {
          // Update product stock
          const updatedProducts = mockProducts.map((p) =>
            p.id === product.id ? { ...p, stock_quantity: p.stock_quantity - quantity } : p,
          )
          setProducts(updatedProducts)

          // Add to cart
          setCart((prev) => {
            const existingItem = prev.find((item) => item.product.id === product.id)
            if (existingItem) {
              return prev.map((item) =>
                item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item,
              )
            } else {
              return [...prev, { product, quantity }]
            }
          })

          return {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: `I've added ${quantity} ${quantity === 1 ? "unit" : "units"} of ${product.name} to your cart. Your cart now has ${cart.length + 1} ${cart.length + 1 === 1 ? "item" : "items"}. Would you like to add anything else or proceed to checkout?`,
            timestamp: new Date().toISOString(),
          }
        } else {
          return {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: `I'm sorry, we only have ${product.stock_quantity} units of ${product.name} in stock. Would you like to order this amount instead?`,
            timestamp: new Date().toISOString(),
          }
        }
      } else {
        return {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: `I'm not sure which product you'd like to order. Could you please specify the product name?`,
          timestamp: new Date().toISOString(),
        }
      }
    }

    // Check for checkout
    if (
      lowerMessage.includes("checkout") ||
      lowerMessage.includes("place order") ||
      lowerMessage.includes("complete order") ||
      lowerMessage.includes("finish order")
    ) {
      if (cart.length === 0) {
        return {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: `Your cart is empty. Would you like to browse our products?`,
          timestamp: new Date().toISOString(),
        }
      } else {
        const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
        const newOrder: Order = {
          id: `ORD-${Date.now()}`,
          customer_name: "Current User",
          products: cart.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          })),
          total,
          status: "processing",
          created_at: new Date().toISOString(),
        }

        setCurrentOrder(newOrder)
        setCart([])

        return {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: `Thank you for your order! Your order #${newOrder.id} has been placed successfully. The total is $${total.toFixed(2)}. Your order is now being processed and will be shipped soon.`,
          timestamp: new Date().toISOString(),
        }
      }
    }

    // Check for cart queries
    if (
      lowerMessage.includes("cart") ||
      lowerMessage.includes("what did i add") ||
      lowerMessage.includes("what's in my cart")
    ) {
      if (cart.length === 0) {
        return {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: `Your cart is currently empty. Would you like to browse our products?`,
          timestamp: new Date().toISOString(),
        }
      } else {
        const cartItems = cart
          .map((item) => `${item.quantity}x ${item.product.name} ($${(item.product.price * item.quantity).toFixed(2)})`)
          .join(", ")
        const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

        return {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: `Your cart contains: ${cartItems}. Total: $${total.toFixed(2)}. Would you like to checkout or continue shopping?`,
          timestamp: new Date().toISOString(),
        }
      }
    }

    // Check for order status
    if (lowerMessage.includes("order status") || lowerMessage.includes("my order")) {
      if (currentOrder) {
        return {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: `Your order #${currentOrder.id} is currently ${currentOrder.status}. It contains ${currentOrder.products.length} products with a total of $${currentOrder.total.toFixed(2)}.`,
          timestamp: new Date().toISOString(),
        }
      } else {
        return {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: `You don't have any recent orders. Would you like to place a new order?`,
          timestamp: new Date().toISOString(),
        }
      }
    }

    // Check for product recommendations
    if (
      lowerMessage.includes("recommend") ||
      lowerMessage.includes("suggest") ||
      lowerMessage.includes("what do you have")
    ) {
      let category = ""
      if (lowerMessage.includes("beverage")) category = "Beverages"
      else if (lowerMessage.includes("condiment")) category = "Condiments"
      else if (lowerMessage.includes("produce")) category = "Produce"

      const filteredProducts = category
        ? mockProducts.filter((p) => p.category === category && p.stock_quantity > 0)
        : mockProducts.filter((p) => p.stock_quantity > 0)

      const recommendations = filteredProducts
        .slice(0, 3)
        .map((p) => `${p.name} ($${p.price}) - ${p.description.slice(0, 50)}...`)
        .join("\n\n")

      return {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: `Here are some recommendations for you:\n\n${recommendations}\n\nWould you like more information about any of these products?`,
        timestamp: new Date().toISOString(),
      }
    }

    // Default response
    return {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: `I can help you with checking product availability, placing orders, and managing your shopping cart. What would you like to do today?`,
      timestamp: new Date().toISOString(),
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <ShoppingCart className="h-6 w-6 text-emerald-600" />
          <h2 className="text-3xl font-bold text-slate-900">Shopping AI Agent</h2>
        </div>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Interact with our AI shopping assistant to check product availability, place orders, and manage your shopping
          cart using natural language.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=40&width=40" />
                  <AvatarFallback>
                    <Bot className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>Northwind Shopping Assistant</CardTitle>
                  <p className="text-sm text-slate-500">Powered by RavenDB Vector Search</p>
                </div>
              </div>
            </CardHeader>
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-4 py-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        message.role === "user"
                          ? "bg-emerald-600 text-white"
                          : message.role === "system"
                            ? "bg-slate-100 text-slate-800 border border-slate-200"
                            : "bg-white border border-slate-200 text-slate-800"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className="text-xs mt-1 opacity-70">{new Date(message.timestamp).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <CardFooter className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
                <Input
                  placeholder="Ask about products, place orders, or check stock..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isProcessing}
                  className="flex-1"
                />
                <Button type="submit" disabled={isProcessing || !inputValue.trim()}>
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Shopping Cart</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-6 text-slate-500">Your cart is empty</div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-slate-500">
                          {item.quantity} × ${item.product.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium">${(item.quantity * item.product.price).toFixed(2)}</p>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between items-center font-medium">
                    <p>Total</p>
                    <p>${cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)}</p>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      setInputValue("Checkout now")
                      handleSendMessage()
                    }}
                  >
                    Checkout
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {currentOrder && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Current Order</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Order ID:</span>
                    <span className="font-mono">{currentOrder.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Status:</span>
                    <Badge
                      variant={
                        currentOrder.status === "processing"
                          ? "default"
                          : currentOrder.status === "shipped" || currentOrder.status === "delivered"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {currentOrder.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Total:</span>
                    <span className="font-medium">${currentOrder.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Items:</span>
                    <span>{currentOrder.products.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Date:</span>
                    <span>{new Date(currentOrder.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Info className="h-5 w-5" />
                <span>Try Asking</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left"
                  onClick={() => {
                    setInputValue("Do you have Chai in stock?")
                    handleSendMessage()
                  }}
                >
                  "Do you have Chai in stock?"
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left"
                  onClick={() => {
                    setInputValue("I'd like to order 3 bottles of Aniseed Syrup")
                    handleSendMessage()
                  }}
                >
                  "I'd like to order 3 bottles of Aniseed Syrup"
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left"
                  onClick={() => {
                    setInputValue("What's in my cart?")
                    handleSendMessage()
                  }}
                >
                  "What's in my cart?"
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left"
                  onClick={() => {
                    setInputValue("Can you recommend some beverages?")
                    handleSendMessage()
                  }}
                >
                  "Can you recommend some beverages?"
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-4">
        <h3 className="font-medium text-slate-900 mb-2">RavenDB Integration Points</h3>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>
            • <strong>Natural Language Processing:</strong> Vector search for understanding user queries
          </li>
          <li>
            • <strong>Real-time Inventory:</strong> Live stock updates as orders are placed
          </li>
          <li>
            • <strong>Order Management:</strong> Document-based storage for order history and status
          </li>
          <li>
            • <strong>Product Recommendations:</strong> AI-powered suggestions based on query context
          </li>
        </ul>
      </div>
    </div>
  )
}
