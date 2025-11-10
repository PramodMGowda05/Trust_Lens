"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, Loader2 } from "lucide-react";
import { generateRealTimeTrustScore } from "@/ai/flows/generate-real-time-trust-score";
import { useToast } from "@/hooks/use-toast";
import type { HistoryItem } from '@/lib/types';
import { useAuth } from "@/context/auth-context";
import { doc, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';


const formSchema = z.object({
    reviewText: z.string().min(20, "Review text must be at least 20 characters.").max(5000),
    productOrService: z.string().min(2, "Product/Service is required.").max(50),
    platform: z.string().min(1, "Please select a platform."),
});

type ReviewFormProps = {
    onAnalysisStart: () => void;
    onAnalysisComplete: (result: HistoryItem | null) => void;
    isAnalyzing: boolean;
};

export function ReviewForm({ onAnalysisStart, onAnalysisComplete, isAnalyzing }: ReviewFormProps) {
    const { toast } = useToast();
    const { user, getIdToken } = useAuth();
    const firestore = useFirestore();
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            reviewText: "",
            productOrService: "",
            platform: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) {
             toast({
                variant: 'destructive',
                title: 'Authentication Error',
                description: 'You must be logged in to analyze a review.',
            });
            return;
        }
        
        const token = await getIdToken();
        if (!token) {
            toast({
                variant: 'destructive',
                title: 'Authentication Error',
                description: 'Could not verify your session. Please log in again.',
            });
            return;
        }

        onAnalysisStart();
        try {
            const result = await generateRealTimeTrustScore(values, token);
            
            const newHistoryItem: Omit<HistoryItem, 'id' | 'timestamp'> = {
              userId: user.uid,
              ...values,
              ...result,
            }
            
            // Save to Firestore without blocking
            const docRef = doc(firestore, `users/${user.uid}/reviews`, new Date().toISOString());
            setDocumentNonBlocking(docRef, { ...newHistoryItem, timestamp: serverTimestamp() }, { merge: true });

            onAnalysisComplete({
                ...newHistoryItem,
                id: docRef.id,
                timestamp: new Date() // for immediate UI update
            });

            form.reset();

        } catch (error) {
            console.error("Analysis failed:", error);
            const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
            toast({
                variant: 'destructive',
                title: 'Analysis Failed',
                description: errorMessage,
            });
            onAnalysisComplete(null);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <Wand2 className="text-primary" />
                    Analyze a Review
                </CardTitle>
                <CardDescription>Submit review details below to get a real-time trust analysis from our AI.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="reviewText"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Review Text</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Enter the full review text here..." className="min-h-[120px]" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="productOrService"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product or Service</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., AstroBook Pro" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="platform"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Platform</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a platform" />
                                                </Trigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="amazon">Amazon</SelectItem>
                                                <SelectItem value="yelp">Yelp</SelectItem>
                                                <SelectItem value="google-maps">Google Maps</SelectItem>
                                                <SelectItem value="tripadvisor">TripAdvisor</SelectItem>
                                                <SelectItem value="other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button type="submit" disabled={isAnalyzing} className="w-full sm:w-auto">
                            {isAnalyzing ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
                            ) : (
                                <><Wand2 className="mr-2 h-4 w-4" /> Analyze</>
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
