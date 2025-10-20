import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Skeleton for categories and agents sections with circular images
const CircularItemsSkeleton = ({ title }) => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex justify-between items-center">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((_, index) => (
          <div key={index} className="flex flex-col items-center p-2">
            <Skeleton className="h-20 w-20 rounded-full mb-3" />
            <Skeleton className="h-5 w-32 text-center" />
            <Skeleton className="h-4 w-24 mt-1" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CircularItemsSkeleton;
