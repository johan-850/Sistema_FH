export type UserRole = 'admin' | 'cashier'

export type TableStatus = 'available' | 'occupied' | 'reserved'
export type OrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type PaymentMethod = 'cash' | 'card' | 'transfer'
export type MovementType = 'entrada' | 'salida' | 'ajuste'
export type ItemType = 'product' | 'resource'
export type SessionStatus = 'open' | 'closed'

export interface Profile {
  id: string
  full_name: string
  role: UserRole
  avatar_url: string | null
  created_at: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  color: string
  icon: string
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  category_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  is_active: boolean
  stock_quantity: number
  unit: string
  created_at: string
  category?: Category
}

export interface Resource {
  id: string
  name: string
  description: string | null
  quantity: number
  unit: string
  min_stock: number
  cost_per_unit: number
  supplier: string | null
  is_active: boolean
  created_at: string
}

export interface InventoryMovement {
  id: string
  item_type: ItemType
  item_id: string
  movement_type: MovementType
  quantity: number
  reason: string | null
  performed_by: string
  created_at: string
  performer?: Profile
  product?: Product
  resource?: Resource
}

export interface CashRegisterSession {
  id: string
  cashier_id: string
  opening_amount: number
  closing_amount: number | null
  expected_amount: number | null
  difference: number | null
  status: SessionStatus
  opened_at: string
  closed_at: string | null
  cashier?: Profile
}

export interface Table {
  id: string
  number: number
  name: string
  capacity: number
  status: TableStatus
  position_x: number
  position_y: number
}

export interface Order {
  id: string
  table_id: string | null
  session_id: string
  cashier_id: string
  order_number: string
  status: OrderStatus
  subtotal: number
  tax: number
  discount: number
  total: number
  notes: string | null
  created_at: string
  updated_at: string
  table?: Table
  cashier?: Profile
  items?: OrderItem[]
  payment?: Payment
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  subtotal: number
  notes: string | null
  created_at: string
  product?: Product
}

export interface Payment {
  id: string
  order_id: string
  method: PaymentMethod
  amount_given: number
  change_amount: number
  reference: string | null
  created_at: string
}

export interface Expense {
  id: string
  session_id: string
  cashier_id: string
  amount: number
  category: string
  description: string
  created_at: string
  cashier?: Profile
}

// For Supabase typing
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Omit<Profile, 'created_at'>; Update: Partial<Profile> }
      categories: { Row: Category; Insert: Omit<Category, 'id' | 'created_at'>; Update: Partial<Category> }
      products: { Row: Product; Insert: Omit<Product, 'id' | 'created_at'>; Update: Partial<Product> }
      resources: { Row: Resource; Insert: Omit<Resource, 'id' | 'created_at'>; Update: Partial<Resource> }
      inventory_movements: { Row: InventoryMovement; Insert: Omit<InventoryMovement, 'id' | 'created_at'>; Update: Partial<InventoryMovement> }
      cash_register_sessions: { Row: CashRegisterSession; Insert: Omit<CashRegisterSession, 'id' | 'opened_at'>; Update: Partial<CashRegisterSession> }
      tables: { Row: Table; Insert: Omit<Table, 'id'>; Update: Partial<Table> }
      orders: { Row: Order; Insert: Omit<Order, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Order> }
      order_items: { Row: OrderItem; Insert: Omit<OrderItem, 'id' | 'created_at'>; Update: Partial<OrderItem> }
      payments: { Row: Payment; Insert: Omit<Payment, 'id' | 'created_at'>; Update: Partial<Payment> }
      expenses: { Row: Expense; Insert: Omit<Expense, 'id' | 'created_at'>; Update: Partial<Expense> }
    }
  }
}
