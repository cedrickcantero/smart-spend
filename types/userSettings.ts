export interface UserSettings {
    role: string;
    email: {
      productUpdates: boolean;
      marketingEmails: boolean;
      tipsAndTutorials: boolean;
    };
    payment: {
      subscription: string;
      billingAddress: {
        city: string;
        state: string;
        address: string;
        country: string;
        zipCode: string;
      };
      paymentMethods: any[]; // You can replace `any` with a proper PaymentMethod interface if you have it
    };
    profile: {
      bio: string;
      avatar_url: string;
    };
    security: {
      aiFeatures: boolean;
      dataCollection: boolean;
      twoFactorEnabled: boolean;
    };
    dashboard: {
      showAIInsights: boolean;
      showUpcomingBills: boolean;
      showBudgetProgress: boolean;
      showRecentTransactions: boolean;
    };
    preferences: {
      theme: string; // e.g., 'light' | 'dark'
      currency: string;
      language: string;
      animations: boolean;
      dateFormat: string;
      accentColor: string;
      compactMode: boolean;
    };
    notifications: {
      types: {
        budgetAlerts: boolean;
        billReminders: boolean;
        weeklyReports: boolean;
        unusualActivity: boolean;
      };
      channels: {
        pushNotifications: boolean;
         emailNotifications: boolean;
      };
    };
  }
  