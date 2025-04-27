"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  BrainCircuit, 
  LineChart, 
  RefreshCw, 
  Lightbulb, 
  TrendingUp, 
  BanknoteIcon, 
  PiggyBank, 
  BarChart3 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { InsightType, FinancialInsight } from "@/lib/services/ai-service";
import { Skeleton } from "@/components/ui/skeleton";
import { AIInsightsService } from "@/app/api/ai-insights/service";


export function AIInsights() {
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const { toast } = useToast();

  const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const insightsData = await AIInsightsService.getFinancialInsights();
      setInsights(insightsData);
    } catch (err) {
      console.log("Error fetching AI insights:", err);
      const errorMessage = err instanceof Error 
        ? err.message
        : "Something went wrong. Please try again later.";
      
      const userMessage = errorMessage.includes("JSON") 
        ? "Our AI is processing your data. Please try again in a moment." 
        : errorMessage.includes("generate insights") || errorMessage.includes("process")
          ? "Our AI couldn't process your financial data. Please try again."
          : errorMessage;
      
      setError(userMessage);
      
      if (!errorMessage.includes("JSON") && !errorMessage.includes("process")) {
        toast({
          title: "AI Insights Unavailable",
          description: "We couldn't generate insights right now. Please try again later.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const filteredInsights = activeTab === "all" 
    ? insights 
    : insights.filter(insight => insight.type === activeTab);

  const getInsightIcon = (type: InsightType) => {
    switch (type) {
      case "spending":
        return <BarChart3 className="h-5 w-5" />;
      case "saving":
        return <PiggyBank className="h-5 w-5" />;
      case "budgeting":
        return <LineChart className="h-5 w-5" />;
      case "income":
        return <BanknoteIcon className="h-5 w-5" />;
      case "general":
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <BrainCircuit className="h-5 w-5" /> 
            AI Financial Insights
          </CardTitle>
          <CardDescription>
            Personalized analysis of your financial activity
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchInsights}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertTriangle className="h-10 w-10 text-amber-500 mb-2" />
            <h3 className="font-medium text-lg mb-1">Couldn&apos;t Load Insights</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {error.includes("AI is processing") ? (
                <>Our AI is warming up. This usually happens on the first request.</>
              ) : (
                error
              )}
            </p>
            <Button variant="default" onClick={fetchInsights}>
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="spending">Spending</TabsTrigger>
                <TabsTrigger value="saving">Saving</TabsTrigger>
                <TabsTrigger value="budgeting">Budgeting</TabsTrigger>
                <TabsTrigger value="income">Income</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="space-y-4 mt-0">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-6 w-48" />
                          <Skeleton className="h-4 w-16 rounded-full" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                      </CardContent>
                    </Card>
                  ))
                ) : filteredInsights.length > 0 ? (
                  filteredInsights.map((insight, index) => (
                    <Card key={index} className="border-l-4" style={{ 
                      borderLeftColor: insight.priority === 'high' 
                        ? 'var(--red-500)' 
                        : (insight.priority === 'medium' ? 'var(--amber-500)' : 'var(--green-500)')
                    }}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            {getInsightIcon(insight.type)}
                            <CardTitle className="text-base font-semibold">
                              {insight.title}
                            </CardTitle>
                          </div>
                          <Badge className={`text-xs ${getPriorityColor(insight.priority)}`}>
                            {insight.priority.charAt(0).toUpperCase() + insight.priority.slice(1)} Priority
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-3">{insight.description}</p>
                        {insight.recommendation && (
                          <div className="mt-2 bg-muted p-3 rounded-md">
                            <p className="text-sm font-medium mb-1">Recommendation:</p>
                            <p className="text-sm">{insight.recommendation}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <TrendingUp className="h-10 w-10 text-muted-foreground mb-2" />
                    <h3 className="font-medium text-lg mb-1">No Insights Available</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {activeTab === "all"
                        ? "We don't have enough data to generate insights yet. Add more financial data or try again later."
                        : `No ${activeTab} insights available. Try viewing a different category or refresh.`}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
} 