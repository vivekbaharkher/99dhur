import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Skeleton for properties on map section
const MapSkeleton = () => {
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6 flex justify-between items-center">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 space-y-4">
                    {[1, 2, 3].map((_, index) => (
                        <div key={index} className="rounded-lg overflow-hidden shadow-md p-3 bg-white">
                            <div className="flex gap-3">
                                <Skeleton className="w-24 h-24 rounded-md" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <div className="flex gap-2">
                                        <Skeleton className="h-4 w-16" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="w-full md:w-2/3 h-[400px]">
                    <Skeleton className="w-full h-full rounded-md" />
                </div>
            </div>
        </div>
    );
};

export default MapSkeleton;
