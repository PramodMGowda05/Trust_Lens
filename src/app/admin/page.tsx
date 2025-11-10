import { ModerationTable } from '@/components/admin/moderation-table';
import { DateRangePicker } from '@/components/analytics/date-range-picker';
import { StatCard } from '@/components/analytics/stat-card';
import { CheckCircle2, AlertTriangle, ShieldAlert, BarChart } from 'lucide-react';

export default function AdminPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Moderate reviews, manage users, and view system activity.</p>
                </div>
                <DateRangePicker />
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Reviews Analyzed (24h)" value="1,254" icon={BarChart} />
                <StatCard title="Pending Moderation" value="12" icon={ShieldAlert} color="text-yellow-500" />
                <StatCard title="Approved" value="892" icon={CheckCircle2} color="text-green-500" />
                <StatCard title="Rejected" value="362" icon={AlertTriangle} color="text-red-500" />
            </div>

            <ModerationTable />
            
        </div>
    );
}
