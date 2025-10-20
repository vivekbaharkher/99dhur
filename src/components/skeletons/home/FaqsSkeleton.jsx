import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Skeleton for FAQs section
const FaqsSkeleton = () => {
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="text-center mb-8">
                <Skeleton className="h-8 w-64 mx-auto mb-3" />
                <Skeleton className="h-4 w-full max-w-lg mx-auto" />
            </div>
            <div className="max-w-3xl mx-auto space-y-4">
                {[1, 2, 3, 4, 5].map((_, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-6 w-6 rounded-full" />
                        </div>
                        <div className="mt-2 hidden">
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FaqsSkeleton;
