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

export type InsightType = 'spending' | 'saving' | 'budgeting' | 'income' | 'general';

export interface FinancialInsight {
  type: InsightType;
  title: string;
  description: string;
  recommendation?: string;
  priority: 'high' | 'medium' | 'low';
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

const getFallbackInsights = (reason: string = 'Unable to process financial data'): FinancialInsight[] => {
  return [
    {
      type: "general",
      title: "Insights Unavailable",
      description: reason,
      recommendation: "Please try again in a moment. If the problem persists, check your data sources or contact support.",
      priority: "medium"
    }
  ];
};

const createFinancialPrompt = (data: FinancialData, settings: UserSettings): string => {
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
};

export const getFinancialInsights = async (
  data: FinancialData,
  settings: UserSettings,
  apiKey: string
): Promise<FinancialInsight[]> => {
  let retries = 0;
  
  while (retries <= MAX_RETRIES) {
    try {
      const prompt = createFinancialPrompt(data, settings);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(OPENROUTER_API_URL, {
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
          max_tokens: 2000,
          response_format: { type: "json_object" }
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      const responseClone = response.clone();
      const bodyText = await responseClone.text();
      
      if (!response.ok) {
        try {
          const errorResult = bodyText ? JSON.parse(bodyText) : { error: 'Unknown error' };
          console.error('Error from OpenRouter:', errorResult);
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
          console.error('Raw error response:', bodyText);
        }
        
        if (retries < MAX_RETRIES) {
          retries++;
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          continue;
        }
        
        throw new Error(`Failed to generate insights: ${response.status} ${response.statusText}`);
      }
      
      let result: OpenRouterResponse;
      try {
        result = bodyText ? JSON.parse(bodyText) : null;
        if (!result) {
          throw new Error('Empty response body');
        }
        
        if (!result.choices || !Array.isArray(result.choices) || result.choices.length === 0) {
          throw new Error('Invalid response structure: missing choices array');
        }
        
        if (!result.choices[0]?.message?.content) {
          throw new Error('Invalid response structure: missing content in first choice');
        }
      } catch (e) {
        console.error('Error parsing response JSON:', e);
        console.error('Response body that failed to parse:', bodyText);
        
        if (retries < MAX_RETRIES) {
          retries++;
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          continue;
        }
        
        return getFallbackInsights('Invalid API response format');
      }
      
      const content = result.choices[0].message.content;
      console.log("AI content response:", content);
      
      if (!content || typeof content !== 'string') {
        if (retries < MAX_RETRIES) {
          retries++;
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          continue;
        }
        
        return getFallbackInsights('Empty or invalid content from AI model');
      }
      
      let insights: FinancialInsight[] = [];
      
      try {
        const jsonContent = content.replace(/```json|```/g, '').trim();
        console.log("Processed JSON content:", jsonContent);
        
        try {
          try {
            insights = JSON.parse(jsonContent);
          } catch (initialError) {
            console.log("initialError:", initialError);
            const firstBrace = jsonContent.indexOf('{');
            const lastBrace = jsonContent.lastIndexOf('}');
            
            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
              const extractedJson = jsonContent.substring(firstBrace, lastBrace + 1);
              console.log("Extracted JSON:", extractedJson);
              try {
                insights = JSON.parse(extractedJson);
              } catch (extractError) {
                if (extractError instanceof Error) {
                  throw new Error(`Failed to parse extracted JSON: ${extractError.message}`);
                } else {
                  throw new Error(`Failed to parse extracted JSON: Unknown error`);
                }
              }
            } else {
              throw new Error(`Failed to extract valid JSON from: ${jsonContent}`);
            }
          }
        } catch (jsonError) {
          console.error('Invalid JSON response:', jsonContent);
          console.error('JSON parsing error:', jsonError);
          
          if (retries < MAX_RETRIES) {
            retries++;
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            continue;
          }
          
          return getFallbackInsights();
        }
        
        if (!Array.isArray(insights)) {
          if (insights && typeof insights === 'object' && 'insights' in insights) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            insights = (insights as any).insights;
          } else {
            if (retries < MAX_RETRIES) {
              retries++;
              await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
              continue;
            }
            
            return getFallbackInsights();
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
        
        return insights;
        
      } catch (error) {
        console.error('Error parsing AI response:', error);
        
        if (retries < MAX_RETRIES) {
          retries++;
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          continue;
        }
        
        return getFallbackInsights();
      }
    } catch (error) {
      console.error('Error getting financial insights:', error);
      
      if (retries < MAX_RETRIES && !(error instanceof DOMException && error.name === 'AbortError')) {
        retries++;
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        continue;
      }
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        return getFallbackInsights('Request timeout');
      }
      
      throw error;
    }
  }
  
  return getFallbackInsights();
}; 