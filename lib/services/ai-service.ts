import { UserSettings } from "@/types/userSettings";

interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
    index: number;
  }[];
  model: string;
  created: number;
}

export interface FinancialData {
  expenses: {
    amount: number;
    category: string;
    date: string;
  }[];
  income: {
    amount: number;
    source: string;
    date: string;
  }[];
  budgets: {
    category: string;
    amount: number;
    spent: number;
  }[];
  savingsGoals?: {
    name: string;
    target: number;
    current: number;
  }[];
}

export type InsightType = 'spending' | 'saving' | 'budgeting' | 'income' | 'general' | 'investing' | 'debt' | 'tax' | 'retirement' | 'emergency';

export interface FinancialInsight {
  type: InsightType;
  title: string;
  description: string;
  recommendation?: string;
  priority: 'high' | 'medium' | 'low';
  details?: string;
  metrics?: {
    name: string;
    value: string | number;
    trend?: 'up' | 'down' | 'stable';
  }[];
  potentialSavings?: number;
}

export class AIService {
  private static OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  
  public static async getFinancialInsights(
    data: FinancialData,
    settings: UserSettings,
    apiKey: string
  ): Promise<FinancialInsight[]> {
    try {
      const prompt = this.createFinancialPrompt(data, settings);
      
      const response = await fetch(this.OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || '',
          'X-Title': 'SmartSpend'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat-v3-0324:free',
          messages: [
            {
              role: 'system',
              content: `You are an expert financial advisor with years of experience in personal finance management, budgeting, investment strategies, and wealth building. Analyze the financial data provided and generate comprehensive, actionable financial insights.

Your response should be a JSON array containing between 5-8 detailed financial insights covering various aspects of the user's financial health.

Each insight must have the following properties:
- "type": one of "spending", "saving", "budgeting", "income", "general", "investing", "debt", "tax", "retirement", or "emergency"
- "title": A concise, attention-grabbing title (2-6 words)
- "description": A clear explanation of the insight (50-100 words)
- "recommendation": Specific, actionable advice tailored to their financial situation (80-150 words)
- "priority": "high", "medium", or "low" based on urgency and impact
- "details": Additional context, analysis, or explanation about why this insight matters (100-200 words)
- "metrics": (Optional) An array of relevant metrics with name, value, and trend ("up", "down", or "stable")
- "potentialSavings": (Optional) Estimated annual savings if recommendation is followed

Be thoughtful and specific in your analysis. Consider:
- Long-term financial health and goals
- Spending patterns and potential areas of waste
- Budgeting effectiveness and adherence
- Saving rate and emergency preparedness
- Debt management and reduction strategies
- Investment opportunities based on their profile
- Tax efficiency and planning
- Retirement readiness

Your entire response must be valid JSON that can be parsed with JSON.parse().
Do not include explanations outside the JSON structure.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: 50000,
          response_format: { type: "json_object" }
        })
      });

      const result: OpenRouterResponse = await response.json();

      if (!response.ok) {
        console.error('Error from OpenRouter:', result);
        throw new Error('Failed to generate insights');
      }
      
      const content = result.choices[0].message.content;
      let insights: FinancialInsight[] = [];
      
      try {
        const jsonContent = content.replace(/```json|```/g, '').trim();
        
        insights = JSON.parse(jsonContent);
        
        if (!Array.isArray(insights)) {
          if (insights && typeof insights === 'object' && 'insights' in insights) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            insights = (insights as any).insights;
          } else {
            insights = [
              {
                type: "general",
                title: "Financial Review",
                description: "Check your finances regularly.",
                recommendation: "Review your spending patterns.",
                priority: "medium"
              }
            ];
          }
        }
        
        const validTypes = ['spending', 'saving', 'budgeting', 'income', 'general', 'investing', 'debt', 'tax', 'retirement', 'emergency'];
        insights = insights.map(insight => ({
          type: insight.type && validTypes.includes(insight.type) 
            ? insight.type : 'general',
          title: insight.title || "Financial Insight",
          description: insight.description || "Check your recent financial activity.",
          recommendation: insight.recommendation || "Review your spending habits.",
          priority: insight.priority && ['high', 'medium', 'low'].includes(insight.priority)
            ? insight.priority : 'medium',
          details: insight.details || undefined,
          metrics: insight.metrics || undefined,
          potentialSavings: insight.potentialSavings || undefined
        }));
        
      } catch (error) {
        console.error('Error parsing AI response:', error);
        insights = [
          {
            type: "general",
            title: "Financial Health Check",
            description: "Review your financial accounts regularly.",
            recommendation: "Set up weekly finance reviews.",
            priority: "medium"
          }
        ];
      }
      
      return insights;
    } catch (error) {
      console.error('Error getting financial insights:', error);
      throw error;
    }
  }

  private static createFinancialPrompt(data: FinancialData, settings: UserSettings): string {
    const currencySymbol = settings.preferences?.currency || 'USD';
    
    const totalExpenses = data.expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalIncome = data.income.reduce((sum, income) => sum + income.amount, 0);
    const netCashFlow = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    const expensesByCategory: Record<string, number> = {};
    data.expenses.forEach(expense => {
      if (!expensesByCategory[expense.category]) {
        expensesByCategory[expense.category] = 0;
      }
      expensesByCategory[expense.category] += expense.amount;
    });
    
    const sortedCategories = Object.entries(expensesByCategory)
      .sort((a, b) => b[1] - a[1]);
    
    const budgetPerformance = data.budgets
      .map(budget => {
        const spentPercentage = budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0;
        const variance = spentPercentage - 100;
        return {
          category: budget.category,
          variance,
          spent: budget.spent,
          amount: budget.amount,
          spentPercentage
        };
      });
    
    const savingsGoalsAnalysis = data.savingsGoals?.map(goal => {
      const progressPercentage = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
      return {
        name: goal.name,
        progress: progressPercentage.toFixed(1) + '%',
        remaining: goal.target - goal.current
      };
    });
    
    return `
    # COMPREHENSIVE FINANCIAL ANALYSIS

    ## CURRENT FINANCIAL SNAPSHOT
    - Total Monthly Income: ${currencySymbol} ${totalIncome.toFixed(2)}
    - Total Monthly Expenses: ${currencySymbol} ${totalExpenses.toFixed(2)}
    - Net Cash Flow: ${currencySymbol} ${netCashFlow.toFixed(2)}
    - Monthly Savings Rate: ${savingsRate.toFixed(1)}%
    - Financial Health Status: ${netCashFlow > 0 ? 'Positive' : 'Negative'} cash flow

    ## EXPENSE BREAKDOWN
    ${sortedCategories.map(([category, amount], index) => 
      `${index + 1}. ${category}: ${currencySymbol} ${amount.toFixed(2)} (${((amount / totalExpenses) * 100).toFixed(1)}% of total expenses)`
    ).join('\n')}

    ## BUDGET PERFORMANCE
    ${budgetPerformance.map(b => 
      `- ${b.category}: Budget ${currencySymbol} ${b.amount.toFixed(2)}, Spent ${currencySymbol} ${b.spent.toFixed(2)} (${b.spentPercentage.toFixed(1)}% of budget, ${b.spent > b.amount ? 'OVER by ' : 'UNDER by '}${Math.abs(b.variance).toFixed(1)}%)`
    ).join('\n')}

    ${savingsGoalsAnalysis ? `
    ## SAVINGS GOALS PROGRESS
    ${savingsGoalsAnalysis.map(goal => 
      `- ${goal.name}: Progress ${goal.progress}, Remaining ${currencySymbol} ${goal.remaining.toFixed(2)}`
    ).join('\n')}
    ` : ''}

    ## INCOME SOURCES
    ${data.income.map(income => 
      `- ${income.source}: ${currencySymbol} ${income.amount.toFixed(2)}`
    ).join('\n')}

    ## ADDITIONAL CONTEXT
    - Number of expense transactions: ${data.expenses.length}
    - Number of budget categories: ${data.budgets.length}
    - Currency: ${currencySymbol}
    
    Based on this detailed financial data, provide a thorough analysis with 5-8 in-depth financial insights. 
    Consider spending patterns, budget adherence, saving opportunities, debt management (if applicable), 
    investment potential, and long-term financial planning.
    
    Each insight should be detailed, specific, and actionable. Focus on both immediate optimizations 
    and long-term financial health. Include numerical analysis where relevant and make concrete recommendations 
    that would meaningfully improve this financial situation.
    `;
  }
} 