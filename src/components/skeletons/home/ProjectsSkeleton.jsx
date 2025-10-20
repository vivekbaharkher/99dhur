import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Skeleton for projects section with large cards
const ProjectsSkeleton = () => {
    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6 flex justify-between items-center">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((_, index) => (
                    <div key={index} className="rounded-lg overflow-hidden shadow-md bg-white">
                        <Skeleton className="w-full h-60" />
                        <div className="p-4 space-y-3">
                            <div className="flex justify-between">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-6 w-16" />
                            </div>
                            <Skeleton className="h-4 w-1/2" />
                            <div className="grid grid-cols-3 gap-2 py-3">
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <Skeleton className="h-4 w-4 rounded-full" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center pt-3">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-10 w-28 rounded-md" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectsSkeleton;
