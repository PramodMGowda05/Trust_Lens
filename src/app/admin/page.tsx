import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DateRangePicker } from '@/components/analytics/date-range-picker';
import { ClassificationChart } from '@/components/analytics/classification-chart';
import { CredibilityChart } from '@/components/analytics/credibility-chart';
import { StatCard } from '@/components/analytics/stat-card';
import { CheckCircle2, AlertTriangle, Users, BarChart, Bot } from 'lucide-react';
import { ModerationTable } from '@/components/admin/moderation-table';
import { Button } from '@/components/ui/button';
import { UsageChart } from '@/components/analytics/usage-chart';

export default function AdminPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Moderate reviews and manage the AI model.</p>
                </div>
                <div className="flex items-center gap-4">
                    <DateRangePicker />
                    <Button>
                        <Bot className="mr-2 h-4 w-4" />
                        Retrain Model
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Analyzed" value="1,254" icon={BarChart} />
                <StatCard title="Genuine" value="892" icon={CheckCircle2} color="text-green-500" />
                <StatCard title="Fake" value="362" icon={AlertTriangle} color="text-red-500" />
                <StatCard title="Pending" value="12" icon={Users} />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <ModerationTable />
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Reviewer Credibility</CardTitle>
                        <CardDescription>Distribution of credibility scores for flagged users.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CredibilityChart />
                    </CardContent>
                </Card>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Recent Classifications</CardTitle>
                    <CardDescription>Genuine vs. Fake reviews over the last 6 months.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ClassificationChart />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">System Usage</CardTitle>
                    <CardDescription>API calls and active users over time.</CardDescription>
                </CardHeader>
                <CardContent>
                    <UsageChart />
                </CardContent>
            </Card>
        </div>
    );
}
