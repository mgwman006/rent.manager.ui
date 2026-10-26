import { NotificationInstance } from "antd/es/notification/interface";
import { propertyManagerApi } from "../api/propertyManagerApi";
import { ApiError } from "../models/error";
import { PropertyCreateDTO, PropertyDetailsDTO, UnitCreateDTO, UnitDetailsDTO } from "../models/property";

const showPropertyApiError = (
    notificationApi: NotificationInstance,
    error: unknown,
    fallbackMessage: string,
    fallbackDescription: string,
) => {
    const apiError = error as ApiError;
    const details = apiError.details;

    notificationApi.error({
        message: apiError.message ?? fallbackMessage,
        description: details
            ? typeof details === "string"
                ? details
                : JSON.stringify(details)
            : fallbackDescription,
    });
};

export const getPropertiesByRentalProfileId = async (
    rentalProfileId: number,
    token: string,
    notificationApi: NotificationInstance,
): Promise<PropertyDetailsDTO[]> => {
    try {
        return await propertyManagerApi.getPropertiesByRentalProfileId(rentalProfileId, token);
    } catch (error: unknown) {
        showPropertyApiError(
            notificationApi,
            error,
            "Unable to load properties",
            "The properties for this rental profile could not be loaded.",
        );
        return [];
    }
};

export const createProperty = async (
    rentalProfileId: number,
    request: PropertyCreateDTO,
    token: string,
    notificationApi: NotificationInstance,
): Promise<PropertyDetailsDTO | null> => {
    try {
        return await propertyManagerApi.createProperty(rentalProfileId, request, token);
    } catch (error: unknown) {
        showPropertyApiError(
            notificationApi,
            error,
            "Failed to create property",
            "Unable to create the property.",
        );
        return null;
    }
};

export const createUnit = async (
    buildingId: number,
    request: UnitCreateDTO,
    token: string,
    notificationApi: NotificationInstance,
): Promise<UnitDetailsDTO | null> => {
    try {
        return await propertyManagerApi.createUnit(buildingId, request, token);
    } catch (error: unknown) {
        showPropertyApiError(
            notificationApi,
            error,
            "Failed to create unit",
            "Unable to create the unit in this building.",
        );
        return null;
    }
};
