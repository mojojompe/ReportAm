import { Card } from "@/components/ui/card";

export function FeedItemSkeleton() {
    return (
        <Card className="overflow-hidden border border-[#EAECF0] bg-white shadow-sm rounded-2xl sm:rounded-3xl">
            {/* Image Skeleton */}
            <div className="aspect-video w-full bg-gray-200 animate-pulse" />

            <div className="p-4 sm:p-5 space-y-4">
                {/* Badges and Time Skeleton */}
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                        <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
                    </div>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                </div>

                {/* Content Skeleton */}
                <div className="space-y-2">
                    <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
                    <div className="space-y-1">
                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                    </div>
                </div>

                {/* Location Skeleton */}
                <div className="flex items-center gap-2">
                    <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                </div>

                <hr className="border-[#EAECF0]" />

                {/* Footer Skeleton */}
                <div className="flex flex-col gap-3">
                    <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse" />
                    <div className="flex gap-3">
                        <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse" />
                        <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse" />
                    </div>
                </div>
            </div>
        </Card>
    );
}
