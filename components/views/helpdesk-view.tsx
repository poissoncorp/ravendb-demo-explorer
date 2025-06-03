"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Ticket, User, Clock, AlertCircle, CheckCircle, Users, Filter } from "lucide-react"
import TicketDetailModal from "@/components/ticket-detail-modal"
import { searchTickets } from "@/lib/actions"
import { HelpdeskTicket } from "@/lib/types"



export default function HelpdeskView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [showSalesOnly, setShowSalesOnly] = useState(false)
  const [searchResults, setSearchResults] = useState<HelpdeskTicket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<HelpdeskTicket | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [salesTicketsCount, setSalesTicketsCount] = useState(0)

useEffect(() => {
  const performSummarySearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    try {
      const results = await searchTickets(searchQuery)
      setSearchResults(results)
      setSalesTicketsCount(results.filter(t => t.needs_sales).length)
    } catch (error) {
      console.error("Error searching tickets:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const debounceTimer = setTimeout(performSummarySearch, 300)
  return () => clearTimeout(debounceTimer)
}, [searchQuery])


  // Apply filters using useMemo to avoid infinite loops
  const filteredTickets = useMemo(() => {
    // Start with either search results or all tickets
    let tickets = searchResults 

    // Apply sales filter
    if (showSalesOnly) {
      tickets = tickets.filter((ticket) => ticket.needs_sales)
    }

    // Apply priority filter
    if (selectedPriority !== "all") {
      tickets = tickets.filter((ticket) => ticket.priority === selectedPriority)
    }

    // Apply status filter
    if (selectedStatus !== "all") {
      tickets = tickets.filter((ticket) => ticket.status === selectedStatus)
    }

    return tickets
  }, [searchQuery, searchResults, selectedPriority, selectedStatus, showSalesOnly])

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

  const handleOpenTicket = (ticket: HelpdeskTicket) => {
    setSelectedTicket(ticket)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedTicket(null)
  }


  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Ticket className="h-6 w-6 text-blue-600" />
          <h2 className="text-3xl font-bold text-slate-900">Intelligent Support Desk</h2>
        </div>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Powered by RavenDB GenAI summaries and embedding search. Find relevant tickets instantly and let AI detect
          when sales support is needed.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search ticket summaries using AI embeddings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-3"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={showSalesOnly ? "default" : "outline"}
            onClick={() => setShowSalesOnly(!showSalesOnly)}
            className="flex items-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span>Sales Needed ({salesTicketsCount})</span>
          </Button>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {showSalesOnly && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-amber-600" />
            <span className="font-medium text-amber-900">
              Showing only tickets that require sales support ({filteredTickets.length} of {salesTicketsCount})
            </span>
          </div>
        </div>
      )}

      {isSearching && (
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Searching summaries with AI embeddings...</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTickets.map((ticket) => (
          <Card
            key={ticket.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleOpenTicket(ticket)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2">{ticket.title}</CardTitle>
                <div className="flex items-center space-x-1 ml-2">{getPriorityIcon(ticket.priority)}</div>
              </div>
              <div className="flex items-center space-x-2 flex-wrap">
                <Badge variant={getStatusColor(ticket.status)}>{ticket.status.replace("_", " ")}</Badge>
                <Badge variant="outline" className="capitalize">
                  {ticket.priority}
                </Badge>
                {ticket.needs_sales && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>Sales</span>
                  </Badge>
                )}
                {ticket.sales_assigned && (
                  <Badge variant="default" className="flex items-center space-x-1 bg-emerald-600">
                    <User className="h-3 w-3" />
                    <span>Assigned</span>
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-1">AI Generated Summary</h4>
                <p className="text-sm text-blue-800">{ticket.summary}</p>
              </div>

              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{ticket.customer_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                </div>
                {ticket.order_id && <div className="text-xs text-slate-500">Related Order: #{ticket.order_id}</div>}
              </div>

              {ticket.needs_sales && !ticket.sales_assigned && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                  <p className="text-xs text-amber-800">
                    🤖 AI detected: Sales support recommended for this conversation
                  </p>
                </div>
              )}

              {ticket.needs_sales && ticket.sales_assigned && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                  <p className="text-xs text-emerald-800">✅ Sales representative assigned and notified</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTickets.length === 0 && !isSearching && (
        <div className="text-center py-12">
          <Ticket className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No tickets found</h3>
          <p className="text-slate-600">
            {showSalesOnly
              ? "No tickets requiring sales support match your current filters."
              : "Try adjusting your search terms or filters."}
          </p>
        </div>
      )}

      <div className="bg-slate-50 rounded-lg p-4">
        <h3 className="font-medium text-slate-900 mb-2">RavenDB Integration Points</h3>
        <ul className="text-sm text-slate-600 space-y-1">
          <li>
            • <strong>Embedding Search:</strong> getMatchingSupportTickets() - AI-powered ticket summary search
          </li>
          <li>
            • <strong>Ticket Details:</strong> getSupportTicketDetails() - Complete ticket with conversation history
          </li>
          <li>
            • <strong>Sales Assignment:</strong> getSalespersonDetails() - Sales representative information
          </li>
          <li>
            • <strong>GenAI Summaries:</strong> Automatic ticket summarization using RavenDB GenAI
          </li>
          <li>
            • <strong>Smart Routing:</strong> AI detection for sales escalation needs
          </li>
        </ul>
      </div>
      <TicketDetailModal ticket={selectedTicket} isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  )
}
