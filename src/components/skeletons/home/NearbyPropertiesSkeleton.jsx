import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Skeleton for nearby properties section
const NearbyPropertiesSkeleton = () => {
    return (
        <div className="container mx-auto py-8 px-4 bg-gray-50">
            <div className="mb-6 flex justify-between items-center">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((_, index) => (
                    <div key={index} className="rounded-lg overflow-hidden shadow-md bg-white">
                        <div className="relative">
                            <Skeleton className="w-full h-44" />
                            <div className="absolute top-2 right-2">
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                                <Skeleton className="h-5 w-3/4" />
                            </div>
                        </div>
                        <div className="p-3 space-y-2">
                            <Skeleton className="h-4 w-2/3" />
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-5 w-20" />
                                <div className="flex items-center gap-1">
                                    <Skeleton className="h-4 w-4" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NearbyPropertiesSkeleton;
