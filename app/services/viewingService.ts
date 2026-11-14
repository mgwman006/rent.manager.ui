import { NotificationInstance } from "antd/es/notification/interface";
import { viewingApi } from "../api/api";
import { ApiError } from "../models/error";
import {
    RecordViewingOutcomeDTO,
    ViewingBookingDetailsDTO,
} from "../models/viewing";

const notifyViewingError = (
    notificationApi: NotificationInstance,
    error: unknown,
    fallbackMessage: string,
    fallbackDescription: string,
) => {
    const apiError = error instanceof ApiError ? error : null;
    const details = apiError?.details;
    notificationApi.error({
        message: apiError?.message ?? fallbackMessage,
        description: details
            ? typeof details === "string"
                ? details
                : JSON.stringify(details)
            : fallbackDescription,
    });
};

export const getViewingBookings = async (
    rentalProfileId: number,
    token: string,
    notificationApi: NotificationInstance,
): Promise<ViewingBookingDetailsDTO[] | null> => {
    try {
        return await viewingApi.getBookingsByRentalProfile(rentalProfileId, token);
    } catch (error: unknown) {
        notifyViewingError(
            notificationApi,
            error,
            "Unable to load viewing bookings",
            "The viewing bookings for this rental profile could not be loaded.",
        );
        return null;
    }
};

const updateViewingBooking = async (
    request: () => Promise<ViewingBookingDetailsDTO>,
    notificationApi: NotificationInstance,
    failureDescription: string,
): Promise<ViewingBookingDetailsDTO | null> => {
    try {
        return await request();
    } catch (error: unknown) {
        notifyViewingError(
            notificationApi,
            error,
            "Unable to update viewing booking",
            failureDescription,
        );
        return null;
    }
};

export const approveViewingBooking = (
    bookingId: number,
    token: string,
    notificationApi: NotificationInstance,
) => updateViewingBooking(
    () => viewingApi.approveBooking(bookingId, token),
    notificationApi,
    "This booking could not be approved.",
);

export const rejectViewingBooking = (
    bookingId: number,
    token: string,
    notificationApi: NotificationInstance,
) => updateViewingBooking(
    () => viewingApi.rejectBooking(bookingId, token),
    notificationApi,
    "This booking could not be rejected.",
);

export const cancelViewingBooking = (
    bookingId: number,
    token: string,
    notificationApi: NotificationInstance,
) => updateViewingBooking(
    () => viewingApi.cancelBooking(bookingId, token),
    notificationApi,
    "This booking could not be cancelled.",
);

export const recordViewingOutcome = (
    bookingId: number,
    request: RecordViewingOutcomeDTO,
    token: string,
    notificationApi: NotificationInstance,
) => updateViewingBooking(
    () => viewingApi.recordOutcome(bookingId, request, token),
    notificationApi,
    "The viewing outcome could not be saved.",
);
