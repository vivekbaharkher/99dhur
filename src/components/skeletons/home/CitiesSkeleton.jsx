import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Skeleton for properties by cities section
const CitiesSkeleton = () => {
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6 flex justify-between items-center">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((_, index) => (
                    <div key={index} className="rounded-lg overflow-hidden shadow-md bg-white">
                        <Skeleton className="w-full h-32" />
                        <div className="p-3 text-center">
                            <Skeleton className="h-5 w-24 mx-auto" />
                            <div className="flex justify-center items-center mt-2">
                                <Skeleton className="h-4 w-16 mx-auto" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CitiesSkeleton;
