import { UserSettings } from "@/types/userSettings";

// This is for typing the response structure from OpenRouter
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

// Interface for financial data to analyze
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

export type InsightType = 'spending' | 'saving' | 'budgeting' | 'income' | 'general';

export interface FinancialInsight {
  type: InsightType;
  title: string;
  description: string;
  recommendation?: string;
  priority: 'high' | 'medium' | 'low';
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
              content: `You are a financial advisor. You must respond ONLY with a JSON array containing multiple financial insights.

Each insight must have these exact properties:
- "type": one of "spending", "saving", "budgeting", "income", or "general"
- "title": short title (4 words maximum)
- "description": brief explanation (30 words maximum)
- "recommendation": brief action step (50 words maximum)
- "priority": one of "high", "medium", or "low"

IMPORTANT: Your entire response must be ONLY valid JSON that can be parsed with JSON.parse().
Do not include any explanation, markdown formatting, or anything outside the JSON array.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1,
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
        
        insights = insights.map(insight => ({
          type: insight.type && ['spending', 'saving', 'budgeting', 'income', 'general'].includes(insight.type) 
            ? insight.type : 'general',
          title: insight.title || "Financial Insight",
          description: insight.description || "Check your recent financial activity.",
          recommendation: insight.recommendation || "Review your spending habits.",
          priority: insight.priority && ['high', 'medium', 'low'].includes(insight.priority)
            ? insight.priority : 'medium'
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
    
    const expensesByCategory: Record<string, number> = {};
    data.expenses.forEach(expense => {
      if (!expensesByCategory[expense.category]) {
        expensesByCategory[expense.category] = 0;
      }
      expensesByCategory[expense.category] += expense.amount;
    });
    
    const sortedCategories = Object.entries(expensesByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3); 
    
    const budgetIssues = data.budgets
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
      })
      .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
      .slice(0, 3);
    
    return `
    Financial snapshot:
    - Income: ${currencySymbol} ${totalIncome}
    - Expenses: ${currencySymbol} ${totalExpenses}
    - Net: ${currencySymbol} ${netCashFlow}
    
    Top expenses:
    ${sortedCategories.map(([category, amount]) => 
      `${category}: ${currencySymbol} ${amount} (${((amount / totalExpenses) * 100).toFixed(0)}%)`
    ).join(', ')}
    
    Budget issues:
    ${budgetIssues.map(b => 
      `${b.category}: ${b.spent > b.amount ? 'Over' : 'Under'} by ${Math.abs(b.variance).toFixed(0)}%`
    ).join(', ')}
    
    Return ONLY a JSON array with EXACTLY 2 financial insight objects.
    `;
  }
} 