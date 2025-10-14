'use client';

import { ReportGenerator } from "@/components/report/report-generator";
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function GenerateReportPage() {
    return (
        <ProtectedRoute module="relatorios" action="view">
            <ReportGenerator />
        </ProtectedRoute>
    );
}
