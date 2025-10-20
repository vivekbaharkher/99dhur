import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Skeleton for premium properties section with different styling
const PremiumPropertiesSkeleton = () => {
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6 flex justify-between items-center">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2].map((_, index) => (
                    <div key={index} className="rounded-lg overflow-hidden shadow-lg bg-white relative">
                        <div className="absolute top-2 right-2 z-10">
                            <Skeleton className="h-8 w-20 rounded-full" />
                        </div>
                        <Skeleton className="w-full h-56" />
                        <div className="p-4 space-y-3">
                            <div className="flex justify-between">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-6 w-16" />
                            </div>
                            <Skeleton className="h-4 w-2/3" />
                            <div className="flex justify-between items-center mt-4">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <Skeleton className="h-5 w-32" />
                                </div>
                                <Skeleton className="h-10 w-10 rounded-full" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PremiumPropertiesSkeleton;
