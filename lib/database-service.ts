import { DocumentStore } from "ravendb"
import { faker } from '@faker-js/faker'
import { Salesperson, Product, HelpdeskTicket } from "./types"


const documentStore = new DocumentStore("http://live-test.ravendb.net", "genai")
documentStore.initialize()



// Database service functions

export async function getMatchingProducts(query: string): Promise<Product[]> {
  const session = documentStore.openSession()
  try {
    // // TODO: Replace with actual vector search query
    // const results = await session
    //   .query<any>({ collection: "Products" })
    //   // .whereLucene("Description", `vector:$${query}`) or actual vector logic
    //   .all()
      
    const results = await session
      .query<Product>({ collection: "Products" })
  .whereExists("Name")
  .all()
      
    const mapped: Product[] = results.map((doc: any) => ({
      id: doc['@metadata']?.['@id'] ?? 'unknown',
      name: doc.Name,
      alternative_names: doc.AlternativeNames,
      category: doc.Category,
      price: doc.PricePerUnit,
      description: faker.commerce.productDescription(),
      supplier: doc.Supplier,
      stock_quantity: doc.UnitsInStock,
      vector_score: undefined // set this if you're doing vector queries later
    }))

    return mapped
  } finally {
    session.dispose()
  }
}


function mapToHelpdeskTicket(rawHelpdeskTicket: any): HelpdeskTicket {
  return {
    id: rawHelpdeskTicket["@metadata"]?.["@id"] ?? "",

    title: rawHelpdeskTicket.title,
    summary: rawHelpdeskTicket.summary ?? "",
    customer_name: rawHelpdeskTicket.customer_name,
    priority: rawHelpdeskTicket.priority,
    status: rawHelpdeskTicket.status,
    created_at: rawHelpdeskTicket.created_at,
    updated_at: rawHelpdeskTicket.updated_at,

    order_id: rawHelpdeskTicket.order_id ?? undefined,
    needs_sales: rawHelpdeskTicket.needs_sales,
    sales_assigned: rawHelpdeskTicket.sales_assigned ?? undefined,
    conversation_history: rawHelpdeskTicket.conversation_history ?? [],
    tags: rawHelpdeskTicket.tags ?? []
  }
}

function mapToSalesperson(employeeId: string, rawEmployee: any): Salesperson {
  return {
    employee_id: rawEmployee["@metadata"]?.["@id"],
    name: `${rawEmployee.FirstName} ${rawEmployee.LastName}`,
    email: `${rawEmployee.FirstName}.${rawEmployee.LastName}@northwind.com`.toLowerCase(),
    department: "Sales, "+ rawEmployee.Title,
    phone: rawEmployee.HomePhone,
    territory: rawEmployee.Territories ?? [],
    active: true // assuming all returned employees are active
  }
}



export async function getMatchingSupportTickets(query: string): Promise<HelpdeskTicket[]> {
  const session = documentStore.openSession()
  try {
    const rawResults = await session
      .query<any>({ collection: "HelpdeskTickets" })
      // .whereLucene("summary", query) or embedding search logic
      .all()

    return rawResults.map(mapToHelpdeskTicket) 
    
  } finally {
    session.dispose()
  }
}

export async function getSupportTicketDetails(ticketId: string): Promise<HelpdeskTicket | null> {
  const session = documentStore.openSession()
  try {
    const ticket = await session.load<HelpdeskTicket>(`HelpdeskTickets/${ticketId}`)
    return ticket ?? null
  } finally {
    session.dispose()
  }
}

export async function getSalespersonDetails(employeeId: string): Promise<Salesperson | null> {
  const session = documentStore.openSession()
  try {
    const rawEmployee = await session.load<any>(employeeId)
    if (!rawEmployee) return null
    return mapToSalesperson(employeeId, rawEmployee)
  } finally {
    session.dispose()
  }
}

// Simulated delay for UX realism
export function simulateApiDelay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
