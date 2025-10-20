import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Skeleton for articles section with different layout
const ArticleSectionSkeleton = () => {
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6 flex justify-between items-center">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((_, index) => (
                    <div key={index} className="rounded-lg overflow-hidden shadow-md bg-white">
                        <Skeleton className="w-full h-40" />
                        <div className="p-4 space-y-2">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <div className="flex flex-col gap-2 pt-3">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-6 w-6 rounded-full" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-4 rounded-full" />
                                    <Skeleton className="h-3 w-24" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ArticleSectionSkeleton;
