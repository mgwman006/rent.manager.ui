export enum ViewingBookingStatus {
    DRAFT = "DRAFT",
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    REJECTED = "REJECTED",
    CANCELLED = "CANCELLED",
    CLOSED = "CLOSED",
    EXPIRED = "EXPIRED",
    RESCHEDULED = "RESCHEDULED",
}

export enum ViewingPaymentStatus {
    NOT_REQUIRED = "NOT_REQUIRED",
    AWAITING_PAYMENT = "AWAITING_PAYMENT",
    PAID = "PAID",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED",
}

export enum ViewingOutcomeType {
    COMPLETED = "COMPLETED",
    AGENT_ABSENT = "AGENT_ABSENT",
    TENANT_ABSENT = "TENANT_ABSENT",
    UNIT_NOT_AVAILABLE = "UNIT_NOT_AVAILABLE",
    RESCHEDULED = "RESCHEDULED",
}

export interface ViewingOutcomeDetailsDTO {
    id: number;
    bookingId: number;
    type: ViewingOutcomeType;
    notes?: string;
    recordedAt: string;
}

export interface ViewingBookingDetailsDTO {
    id: number;
    reference: string;
    rentalProfileId: number;
    unitId: number;
    startTime: string;
    endTime: string;
    requesterUserId: number;
    status: ViewingBookingStatus;
    serviceFee: number;
    paymentStatus: ViewingPaymentStatus;
    paymentUpdatedAt?: string;
    holdExpiresAt?: string;
    notes?: string;
    outcome?: ViewingOutcomeDetailsDTO;
}

export interface RecordViewingOutcomeDTO {
    outcome: ViewingOutcomeType;
    notes?: string;
}
