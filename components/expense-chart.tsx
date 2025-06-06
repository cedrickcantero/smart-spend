"use client"

import { useState } from "react";
import { ExpenseService } from "@/app/api/expense/service";
import { DBExpense } from "@/types/supabase";
import { useEffect } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { formatMoney } from "@/lib/utils";
import { useUserSettings } from "@/app/contexts/UserSettingsContext";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function ExpenseChart({ showValues = false }: { showValues?: boolean }) {
  const [chartData, setChartData] = useState<Array<{name: string, total: number}>>([]);
  const { userSettings } = useUserSettings();

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const expenses = await ExpenseService.getExpenses();
        
        processExpensesForChart(expenses);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };
    
    fetchExpenses();
  }, []);
  
  const processExpensesForChart = (expenses: DBExpense[]) => {
    const monthlyTotals = new Map<string, number>();
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${month.getFullYear()}-${month.getMonth()}`;
      monthlyTotals.set(key, 0);
    }
    
    expenses.forEach(expense => {
      if (!expense.date) return;
      
      const expenseDate = new Date(expense.date);
      const key = `${expenseDate.getFullYear()}-${expenseDate.getMonth()}`;
      
      if (monthlyTotals.has(key)) {
        monthlyTotals.set(key, (monthlyTotals.get(key) || 0) + (expense.amount || 0));
      }
    });
    
    const data = Array.from(monthlyTotals.entries())
      .map(([key, total]) => {
        const [month] = key.split('-').map(Number);
        return {
          name: monthNames[month],
          yearMonth: key,
          total
        };
      })
      .sort((a, b) => a.yearMonth.localeCompare(b.yearMonth))
      .map(({ name, total }) => ({ name, total }));
    
    setChartData(data);
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 50 }}>
        <XAxis 
          dataKey="name" 
          stroke="#888888" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => showValues ? formatMoney(value, userSettings?.preferences?.currency || "USD", true) : "***"}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Month</span>
                      <span className="font-bold text-muted-foreground">{payload[0].payload.name}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[0.70rem] uppercase text-muted-foreground">Total</span>
                      <span className="font-bold">{showValues ? formatMoney(payload[0].payload.total, userSettings?.preferences?.currency || "USD") : "***"}</span>
                    </div>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="#0ea5e9"
          strokeWidth={2}
          activeDot={{
            r: 6,
            style: { fill: "#0ea5e9", opacity: 0.25 },
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
