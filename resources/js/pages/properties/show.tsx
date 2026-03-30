import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Heart, MapPin, MessageSquare, Users } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { AmenityBadge } from '@/components/booking/amenity-badge';
import { DateRangePicker } from '@/components/booking/date-range-picker';
import { PhotoGallery } from '@/components/booking/photo-gallery';
import { ReviewCard } from '@/components/booking/review-card';
import { RoomTypeCard } from '@/components/booking/room-type-card';
import { StarRating } from '@/components/booking/star-rating';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import PublicLayout from '@/layouts/public-layout';
import { cn } from '@/lib/utils';
import type { PaginatedData, Property, Review, User } from '@/types';

type PropertyShowProps = {
    property: Property;
    reviews: PaginatedData<Review>;
    isWishlisted: boolean;
    canReview: boolean;
};

export default function PropertyShow({ property, reviews, isWishlisted }: PropertyShowProps) {
    const { auth } = usePage<{ auth: { user: User | null } }>().props;
    const user = auth?.user;


    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
        property.room_types.length > 0 ? property.room_types[0].id : null,
    );
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(1);
    const [wishlisted, setWishlisted] = useState(isWishlisted);

    const selectedRoom = property.room_types.find((rt) => rt.id === selectedRoomId);

    const nightCount =
        checkIn && checkOut
            ? Math.max(0, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
            : 0;

    const estimatedTotal = selectedRoom ? nightCount * selectedRoom.base_price_per_night : 0;

    return (
        <PublicLayout>
            <Head title={property.name} />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <PhotoGallery images={property.images} />

                <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold sm:text-3xl">{property.name}</h1>
                                    <Badge variant="outline" className="capitalize">
                                        {property.type}
                                    </Badge>
                                </div>
                                <div className="mt-2 flex items-center gap-3 text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="size-4" />
                                        {property.city}, {property.country}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <StarRating rating={property.average_rating} size="sm" />
                                        <span className="text-sm">
                                            {property.average_rating.toFixed(1)} ({property.reviews_count} reviews)
                                        </span>
                                    </span>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setWishlisted(!wishlisted)}
                                className="shrink-0"
                            >
                                <Heart
                                    className={cn(
                                        'size-5',
                                        wishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground',
                                    )}
                                />
                            </Button>
                        </div>

                        <Separator className="my-6" />

                        <div>
                            <h2 className="text-lg font-semibold">About this property</h2>
                            <p className="mt-3 leading-relaxed text-muted-foreground">{property.description}</p>
                        </div>

                        {property.amenities.length > 0 && (
                            <>
                                <Separator className="my-6" />
                                <div>
                                    <h2 className="text-lg font-semibold">Amenities</h2>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {property.amenities.map((amenity) => (
                                            <AmenityBadge key={amenity} amenity={amenity} />
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {property.cancellation_policy && (
                            <>
                                <Separator className="my-6" />
                                <div>
                                    <h2 className="text-lg font-semibold">Cancellation Policy</h2>
                                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                                        {property.cancellation_policy}
                                    </p>
                                </div>
                            </>
                        )}

                        {property.room_types.length > 0 && (
                            <>
                                <Separator className="my-6" />
                                <div>
                                    <h2 className="text-lg font-semibold">Room Types</h2>
                                    <div className="mt-4 space-y-4">
                                        {property.room_types.map((roomType) => (
                                            <RoomTypeCard
                                                key={roomType.id}
                                                roomType={roomType}
                                                onSelect={setSelectedRoomId}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {reviews.data.length > 0 && (
                            <>
                                <Separator className="my-6" />
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        Reviews ({reviews.total})
                                    </h2>
                                    <div className="mt-4 space-y-6">
                                        {reviews.data.map((review) => (
                                            <ReviewCard key={review.id} review={review} />
                                        ))}
                                    </div>
                                    {reviews.next_page_url && (
                                        <div className="mt-6 text-center">
                                            <Button variant="outline" asChild>
                                                <Link href={reviews.next_page_url}>Load more reviews</Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Book this property</CardTitle>
                                    {selectedRoom && (
                                        <p className="text-sm text-muted-foreground">
                                            From{' '}
                                            <span className="font-semibold text-foreground">
                                                {selectedRoom.base_price_per_night.toLocaleString()} LYD
                                            </span>
                                            /night
                                        </p>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {property.room_types.length > 0 && (
                                        <div>
                                            <Label className="mb-1 block text-sm">Room Type</Label>
                                            <select
                                                value={selectedRoomId ?? ''}
                                                onChange={(e) => setSelectedRoomId(e.target.value)}
                                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                                            >
                                                {property.room_types.map((rt) => (
                                                    <option key={rt.id} value={rt.id}>
                                                        {rt.name} - {rt.base_price_per_night.toLocaleString()} LYD
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <DateRangePicker
                                        checkIn={checkIn}
                                        checkOut={checkOut}
                                        onCheckInChange={setCheckIn}
                                        onCheckOutChange={setCheckOut}
                                    />

                                    <div>
                                        <Label htmlFor="booking-guests" className="mb-1 block text-sm">
                                            Guests
                                        </Label>
                                        <Input
                                            id="booking-guests"
                                            type="number"
                                            min={1}
                                            max={selectedRoom?.max_guests}
                                            value={guests}
                                            onChange={(e) => setGuests(Number(e.target.value))}
                                        />
                                    </div>

                                    {nightCount > 0 && selectedRoom && (
                                        <>
                                            <Separator />
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-muted-foreground">
                                                        {selectedRoom.base_price_per_night.toLocaleString()} LYD x{' '}
                                                        {nightCount} nights
                                                    </span>
                                                    <span>{estimatedTotal.toLocaleString()} LYD</span>
                                                </div>
                                                <Separator />
                                                <div className="flex justify-between font-semibold">
                                                    <span>Total</span>
                                                    <span>{estimatedTotal.toLocaleString()} LYD</span>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {user ? (
                                        <Button className="w-full" size="lg">
                                            Request to Book
                                        </Button>
                                    ) : (
                                        <Button className="w-full" size="lg" asChild>
                                            <Link href="/login">Log in to Book</Link>
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-0">
                                    <h3 className="font-semibold">Contact Property</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Have questions? Send a message to the property management.
                                    </p>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="mt-3 w-full">
                                                <MessageSquare className="mr-2 size-4" />
                                                Send Inquiry
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Send Inquiry to {property.name}</DialogTitle>
                                            </DialogHeader>
                                            <Form
                                                action={`/properties/${property.id}/inquire`}
                                                method="post"
                                                className="flex flex-col gap-4"
                                            >
                                                {({ processing, errors }) => (
                                                    <>
                                                        <div className="grid gap-2">
                                                            <Label htmlFor="inquiry-body">Your message</Label>
                                                            <textarea
                                                                id="inquiry-body"
                                                                name="body"
                                                                required
                                                                rows={4}
                                                                placeholder="Ask about availability, amenities, or anything else..."
                                                                className="border-input focus-visible:border-ring focus-visible:ring-ring/50 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
                                                            />
                                                            <InputError message={errors.body} />
                                                        </div>
                                                        <Button type="submit" disabled={processing}>
                                                            {processing && <Spinner />}
                                                            Send Message
                                                        </Button>
                                                    </>
                                                )}
                                            </Form>
                                        </DialogContent>
                                    </Dialog>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
