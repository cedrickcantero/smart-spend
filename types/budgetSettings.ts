export interface BudgetSettings {
  tracking: {
    reoccurring: boolean;
    resetDay: number;
    customPeriodDays: number;
  };
}

// Default settings object
export const defaultBudgetSettings: BudgetSettings = {
  tracking: {
    reoccurring: false,
    resetDay: 1,
    customPeriodDays: 30,
  },
}; 