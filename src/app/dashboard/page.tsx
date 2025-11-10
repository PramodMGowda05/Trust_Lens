"use client";

import React, { useState, useMemo } from 'react';
import { ReviewForm } from '@/components/dashboard/review-form';
import { ResultDisplay } from '@/components/dashboard/result-display';
import { HistoryPanel } from '@/components/dashboard/history-panel';
import type { HistoryItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';


export default function DashboardPage() {
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const firestore = useFirestore();

  const reviewsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, `users/${user.uid}/reviews`),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
  }, [firestore, user]);

  const { data: history, isLoading: isLoadingHistory } = useCollection<HistoryItem>(reviewsQuery);

  const handleAnalysisStart = () => {
    setIsAnalyzing(true);
    setSelectedHistoryItem(null);
  }

  const handleAnalysisComplete = (result: HistoryItem | null) => {
    if (result) {
      setSelectedHistoryItem(result);
      toast({
        title: 'Analysis Complete',
        description: `Review classified as ${result.predictedLabel}.`,
      });
    }
     setIsAnalyzing(false);
  };

  const displayItem = selectedHistoryItem || (!isAnalyzing && history && history.length > 0 ? history[0] : null);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <ReviewForm 
          onAnalysisStart={handleAnalysisStart}
          onAnalysisComplete={handleAnalysisComplete}
          isAnalyzing={isAnalyzing}
        />
        {isAnalyzing ? (
            <Card className="mt-6">
              <CardHeader>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-32 w-32 rounded-full" />
                    <div className="space-y-2 w-full">
                        <Skeleton className="h-6 w-1/4" />
                        <Skeleton className="h-10 w-1/3" />
                         <Skeleton className="h-10 w-full" />
                    </div>
                </div>
              </CardContent>
            </Card>
        ) : displayItem && (
          <div className="mt-6">
            <ResultDisplay result={displayItem} />
          </div>
        )}
      </div>
      <div className="md:col-span-1">
        <HistoryPanel 
          history={history || []} 
          onSelect={(item) => setSelectedHistoryItem(item)} 
          isLoading={isLoadingHistory}
        />
      </div>
    </div>
  );
}
