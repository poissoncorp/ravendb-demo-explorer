// lib/actions.ts
'use server'

import { getMatchingProducts, getMatchingSupportTickets, getSalespersonDetails, getSupportTicketDetails } from '@/lib/database-service'

export async function searchProducts(query: string) {
  return await getMatchingProducts(query)
}

export async function searchTickets(query: string) {
  return await getMatchingSupportTickets(query)
}

export async function getTicketDetails(id: string) {
  return await getSupportTicketDetails(id)
}

export async function getSalesDetails(id: string) {
  return await getSalespersonDetails(id)
}