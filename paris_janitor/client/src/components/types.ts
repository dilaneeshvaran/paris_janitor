export interface Property {
    id: number;
    name: string;
    address: string;
    price: number;
    imageUrl: string;
    description: string;
    verified: boolean;
}

export interface Reservation {
    id: number;
    property_id: number;
    client_id: number;
    traveler_id: number;
    startDate: string;
    endDate: string;
    status: string;
}