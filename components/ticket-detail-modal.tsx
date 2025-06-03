"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Bot, Clock, AlertCircle, CheckCircle, Users, Package, Tag, Mail, UserCheck } from "lucide-react"
import type { HelpdeskTicket, ConversationMessage, Salesperson } from "@/lib/types"
import { getTicketDetails, getSalesDetails } from "@/lib/actions"


interface TicketDetailModalProps {
  ticket: HelpdeskTicket | null
  isOpen: boolean
  onClose: () => void
}

export default function TicketDetailModal({ ticket, isOpen, onClose }: TicketDetailModalProps) {
  const [detailedTicket, setDetailedTicket] = useState<HelpdeskTicket | null>(null)
  const [salesperson, setSalesperson] = useState<Salesperson | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Load detailed ticket information when modal opens
  useEffect(() => {
    const loadTicketDetails = async () => {
      if (!ticket || !isOpen) {
        setSalesperson(null)
        setDetailedTicket(null)
        return
      }

      setIsLoading(true)
      try {
        // Load detailed ticket information
        const ticketDetails = await getTicketDetails(ticket.id)

        // Load salesperson details if assigned
        if (ticket.sales_assigned) {
          const salespersonDetails = await getSalesDetails(ticket.sales_assigned)
          setSalesperson(salespersonDetails)
        }

        setDetailedTicket(ticketDetails)
      } catch (error) {
        console.error("Error loading ticket details:", error)
        setDetailedTicket(ticket) // Fallback to provided ticket
      } finally {
        setIsLoading(false)
      }
    }

    loadTicketDetails()
  }, [ticket, isOpen])

  const currentTicket = detailedTicket || ticket
  if (!currentTicket) return null

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "medium":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "low":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "destructive"
      case "in_progress":
        return "default"
      case "resolved":
        return "secondary"
      default:
        return "outline"
    }
  }


  const getSenderAvatar = (message: ConversationMessage) => {
    const initials = message.sender_name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()

    return (
      <Avatar className="h-8 w-8">
        <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
        <AvatarFallback className={message.sender === "system" ? "bg-purple-100 text-purple-700" : ""}>
          {message.sender === "system" ? <Bot className="h-4 w-4" /> : initials}
        </AvatarFallback>
      </Avatar>
    )
  }

  const formatMessageContent = (content: string, messageType: string) => {
    if (messageType === "system_note") {
      return (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <Bot className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-purple-800">{content}</p>
          </div>
        </div>
      )
    }
    return <p className="text-sm whitespace-pre-wrap">{content}</p>
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-xl">{currentTicket.title}</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center space-x-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Loading ticket details...</span>
            </div>
          </div>
        )}

        {!isLoading && (
          <div className="flex-1 overflow-hidden min-h-0">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full min-h-[70vh]">
              {/* Ticket Information Panel */}
              <div className="lg:col-span-1 space-y-4 overflow-y-auto max-h-[70vh]">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Package className="h-5 w-5" />
                      <span>Ticket Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Status:</span>
                        <Badge variant={getStatusColor(currentTicket.status)}>
                          {currentTicket.status.replace("_", " ")}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Priority:</span>
                        <div className="flex items-center space-x-1">
                          {getPriorityIcon(currentTicket.priority)}
                          <Badge variant="outline" className="capitalize">
                            {currentTicket.priority}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Customer:</span>
                        <span className="font-medium">{currentTicket.customer_name}</span>
                      </div>

                      {currentTicket.order_id && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">Related Order:</span>
                          <span className="font-mono text-sm">#{currentTicket.order_id}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-start">
                        <span className="text-sm text-slate-500">Created:</span>
                        <span className="text-sm">{new Date(currentTicket.created_at).toLocaleString()}</span>
                      </div>

                      <div className="flex justify-between items-start">
                        <span className="text-sm text-slate-500">Updated:</span>
                        <span className="text-sm">{new Date(currentTicket.updated_at).toLocaleString()}</span>
                      </div>

                      {currentTicket.needs_sales && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-amber-600" />
                            <span className="text-sm font-medium text-amber-800">Sales Support Required</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {currentTicket.needs_sales && currentTicket.sales_assigned && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <UserCheck className="h-5 w-5 text-emerald-600" />
                        <span>Sales Assignment</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-emerald-600" />
                            <span className="font-medium text-emerald-900">
                              {salesperson?.name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-emerald-700">ID:</span>
                            <span className="font-mono text-sm text-emerald-800">
                              {salesperson?.employee_id}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-emerald-600" />
                            <span className="text-sm text-emerald-800">
                              {salesperson?.email}
                            </span>
                          </div>
                          {salesperson?.department && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-emerald-700">Department:</span>
                              <span className="text-sm text-emerald-800">{salesperson.department}</span>
                            </div>
                          )}
                          <div className="text-xs text-emerald-600">
                            Assigned: {new Date(currentTicket.sales_assigned.assigned_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Bot className="h-5 w-5 text-blue-600" />
                      <span>AI Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">{currentTicket.summary}</p>
                    </div>
                  </CardContent>
                </Card>

                {currentTicket.tags.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <Tag className="h-5 w-5" />
                        <span>Tags</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {currentTicket.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Conversation History Panel */}
              <div className="lg:col-span-3 flex flex-col min-h-0">
                <Card className="flex-1 flex flex-col min-h-0">
                  <CardHeader className="pb-3 flex-shrink-0 border-b">
                    <CardTitle className="text-lg">Conversation History</CardTitle>
                    <p className="text-sm text-slate-500">{currentTicket.conversation_history.length} messages</p>
                  </CardHeader>
                  <CardContent className="flex-1 p-0 min-h-0">
                    <ScrollArea className="h-full max-h-[60vh]">
                      <div className="space-y-4 p-6">
                        {currentTicket.conversation_history.map((message, index) => (
                          <div key={message.id}>
                            <div className="flex items-start space-x-3">
                              {getSenderAvatar(message)}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-sm">{message.sender_name}</span>
                                  <span className="text-xs text-slate-500 capitalize">{message.sender}</span>
                                  <span className="text-xs text-slate-400">
                                    {new Date(message.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                {formatMessageContent(message.content, message.message_type)}
                              </div>
                            </div>
                            {index < currentTicket.conversation_history.length - 1 && <Separator className="my-4" />}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
