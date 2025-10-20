import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Skeleton specifically for user recommendations section
const UserRecommendationSkeleton = () => {
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6 flex justify-between items-center">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((_, index) => (
                    <div key={index} className="rounded-lg overflow-hidden shadow-md bg-white">
                        <Skeleton className="w-full h-48" />
                        <div className="p-4 space-y-3">
                            <div className="flex justify-between">
                                <Skeleton className="h-6 w-2/3" />
                                <Skeleton className="h-6 w-16" />
                            </div>
                            <Skeleton className="h-4 w-1/2" />
                            <div className="flex gap-2 mt-2">
                                <Skeleton className="h-5 w-16" />
                                <Skeleton className="h-5 w-16" />
                                <Skeleton className="h-5 w-16" />
                            </div>
                            <div className="mt-3 bg-gray-50 p-2 rounded-md">
                                <div className="text-sm mb-1">
                                    <Skeleton className="h-4 w-full" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-5 w-24" />
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserRecommendationSkeleton;
