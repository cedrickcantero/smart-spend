import { Database } from './schema'

export type { Database }


// Table row types
export type DBBudget = Database['public']['Tables']['budgets']['Row']
export type DBCalendarEvent = Database['public']['Tables']['calendar_events']['Row']
export type DBCategory = Database['public']['Tables']['categories']['Row']
export type DBColor = Database['public']['Tables']['colors']['Row']
export type DBExpense = Database['public']['Tables']['expenses']['Row']
export type DBRecurringBill = Database['public']['Tables']['recurring_bills']['Row']
export type DBSavingsGoal = Database['public']['Tables']['savings_goals']['Row']
export type DBSubscription = Database['public']['Tables']['subscriptions']['Row']
export type DBUserSettings = Database['public']['Tables']['user_settings']['Row'];
export type DBIncome = Database['public']['Tables']['income']['Row']


// Insert types
export type DBBudgetInsert = Database['public']['Tables']['budgets']['Insert']
export type DBCalendarEventInsert = Database['public']['Tables']['calendar_events']['Insert']
export type DBCategoryInsert = Database['public']['Tables']['categories']['Insert']
export type DBColorInsert = Database['public']['Tables']['colors']['Insert']
export type DBExpenseInsert = Database['public']['Tables']['expenses']['Insert']
export type DBRecurringBillInsert = Database['public']['Tables']['recurring_bills']['Insert']
export type DBSavingsGoalInsert = Database['public']['Tables']['savings_goals']['Insert']
export type DBSubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert']
export type DBUserSettingsInsert = Database['public']['Tables']['user_settings']['Insert'];

// Update types
export type DBBudgetUpdate = Database['public']['Tables']['budgets']['Update']
export type DBCalendarEventUpdate = Database['public']['Tables']['calendar_events']['Update']
export type DBCategoryUpdate = Database['public']['Tables']['categories']['Update']
export type DBColorUpdate = Database['public']['Tables']['colors']['Update']
export type DBExpenseUpdate = Database['public']['Tables']['expenses']['Update']
export type DBRecurringBillUpdate = Database['public']['Tables']['recurring_bills']['Update']
export type DBSavingsGoalUpdate = Database['public']['Tables']['savings_goals']['Update']
export type DBSubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update']
export type DBUserSettingsUpdate = Database['public']['Tables']['user_settings']['Update'];

// Client-side types (without fields added by the server)
export type ClientSubscriptionInsert = Omit<DBSubscriptionInsert, 'user_id'>;
export type ClientSubscriptionUpdate = Pick<DBSubscriptionUpdate, 'id'> & Omit<DBSubscriptionInsert, 'user_id'>;



