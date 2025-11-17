"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import React from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wand2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { HistoryItem } from '@/lib/types';
import { useAuth } from '@/context/auth-context';

const formSchema = z.object({
    reviewText: z.string().min(20, "Review text must be at least 20 characters.").max(5000),
    productOrService: z.string().min(2, "Product/Service is required.").max(50),
    platform: z.string().min(1, "Please select a platform."),
    language: z.string().optional(),
});

type ReviewFormProps = {
    onAnalysisStart: () => void;
    onAnalysisComplete: (result: Omit<HistoryItem, 'id' | 'userId' | 'timestamp'> | null) => void;
    isAnalyzing: boolean;
};

// IMPORTANT: Replace with your actual backend URL in production
const API_URL = "http://localhost:5001/api/v1/predict";

export function ReviewForm({ onAnalysisStart, onAnalysisComplete, isAnalyzing }: ReviewFormProps) {
    const { toast } = useToast();
    const { user, getIdToken } = useAuth();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            reviewText: "",
            productOrService: "",
            platform: "",
            language: "en",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Authentication Error',
                description: 'You must be logged in to analyze a review.',
            });
            return;
        }

        onAnalysisStart();
        
        try {
            const token = await getIdToken();
            if (!token) {
                throw new Error("Unable to retrieve authentication token.");
            }

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    text: values.reviewText,
                    lang: values.language || 'en',
                    metadata: {
                        // You can add more metadata here in the future
                    }
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            // The backend returns explanation as a dictionary, we need the main point.
            // This can be made more sophisticated later.
            const explanationText = result.explanation?.shap || "No explanation provided by the model.";

            onAnalysisComplete({
                trustScore: result.trust_score,
                predictedLabel: result.label,
                explanation: typeof explanationText === 'string' ? explanationText : JSON.stringify(explanationText),
                productOrService: values.productOrService,
                platform: values.platform,
                reviewText: values.reviewText,
            });
            
        } catch (error) {
            console.error("Analysis API error:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({
                variant: 'destructive',
                title: 'Analysis Failed',
                description: errorMessage,
            });
            onAnalysisComplete(null);
        }
    };
    
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
                                                </SelectTrigger>
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
                        <FormField
                            control={form.control}
                            name="language"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Language of Review</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a language" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="en">English</SelectItem>
                                            <SelectItem value="es">Spanish</SelectItem>
                                            <SelectItem value="fr">French</SelectItem>
                                            <SelectItem value="de">German</SelectItem>
                                            <SelectItem value="hi">Hindi</SelectItem>
                                            <SelectItem value="kn">Kannada</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
