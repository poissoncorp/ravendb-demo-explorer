// Types
export interface Product {
  id: string
  name: string
  alternative_names: {
    en: string
    es: string
    fr: string
    de: string
    it: string
  }
  category: string
  price: number
  description: string
  supplier: string
  stock_quantity: number
  vector_score?: number
}

export interface Order {
  id: string
  customer_name: string
  products: Array<{
    product_id: string
    quantity: number
    price: number
  }>
  total: number
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  created_at: string
}

export interface ConversationMessage {
  id: string
  sender: "customer" | "agent" | "system"
  sender_name: string
  content: string
  timestamp: string
  message_type: "text" | "system_note"
}

export interface HelpdeskTicket {
  id: string
  title: string
  summary: string
  customer_name: string
  priority: "high" | "medium" | "low"
  status: "open" | "in_progress" | "resolved"
  created_at: string
  updated_at: string
  order_id?: string
  needs_sales: boolean
  sales_assigned?: string | null
  conversation_history: ConversationMessage[]
  tags: string[]
}


export interface Salesperson {
  employee_id: string
  name: string
  email: string
  department: string
  phone?: string
  territory?: string
  active: boolean
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: string
}