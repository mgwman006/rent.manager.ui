import axios from "axios";
import { ApiResponse } from "../models/common";
import { ApiError } from "../models/error";
import { PropertyCreateDTO, PropertyDetailsDTO, UnitCreateDTO, UnitDetailsDTO, UnitSummaryDTO } from "../models/property";

const propertyManagerApiUrl = import.meta.env.VITE_PROPERTY_MANAGER_API_URL
const propertyManagerApiClient = axios.create({
    baseURL: `${propertyManagerApiUrl}/property-manager/v1`,
    headers: {
        "Content-Type": "application/json",
    },
});

propertyManagerApiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const { message, data, statusCode } = error.response.data ?? {};
            return Promise.reject(
                new ApiError({
                    message: message ?? "SERVER_ERROR",
                    data: data ?? null,
                    statusCode: statusCode ?? error.response.status,
                }),
            );
        }

        if (error.request) {
            return Promise.reject(
                new ApiError({
                    message: "NETWORK_ERROR",
                    data: "No response from property manager service",
                    statusCode: 0,
                }),
            );
        }

        return Promise.reject(
            new ApiError({
                message: "CLIENT_ERROR",
                data: "Unexpected property manager client error",
                statusCode: 0,
            }),
        );
    },
);

export const propertyManagerApi = {
    getUnitDetails: async (
        unitId: number,
        token: string,
    ): Promise<UnitDetailsDTO> => {
        const response = await propertyManagerApiClient.get<ApiResponse<UnitDetailsDTO>>(
            `/units/${unitId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        if (!response.data.success) {
            throw new ApiError({
                message: response.data.message ?? "UNIT_RETRIEVAL_FAILED",
                data: null,
                statusCode: response.status,
            });
        }

        return response.data.data;
    },

    getPropertiesByRentalProfileId: async (
        rentalProfileId: number,
        token: string,
    ): Promise<PropertyDetailsDTO[]> => {
        const response = await propertyManagerApiClient.get<ApiResponse<PropertyDetailsDTO[]>>(
            `/properties/rental-profile/${rentalProfileId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        if (!response.data.success) {
            throw new ApiError({
                message: response.data.message ?? "PROPERTY_RETRIEVAL_FAILED",
                data: null,
                statusCode: response.status,
            });
        }

        return response.data.data;
    },

    createProperty: async (
        rentalProfileId: number,
        requestBody: PropertyCreateDTO,
        token: string,
    ): Promise<PropertyDetailsDTO> => {
        const response = await propertyManagerApiClient.post<ApiResponse<PropertyDetailsDTO>>(
            `/properties/rental-profile/${rentalProfileId}`,
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        if (!response.data.success) {
            throw new ApiError({
                message: response.data.message ?? "PROPERTY_CREATION_FAILED",
                data: null,
                statusCode: response.status,
            });
        }

        return response.data.data;
    },

    createUnit: async (
        buildingId: number,
        requestBody: UnitCreateDTO,
        token: string,
    ): Promise<UnitSummaryDTO> => {
        const response = await propertyManagerApiClient.post<ApiResponse<UnitSummaryDTO>>(
            `/units/building/${buildingId}`,
            requestBody,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        if (!response.data.success) {
            throw new ApiError({
                message: response.data.message ?? "UNIT_CREATION_FAILED",
                data: null,
                statusCode: response.status,
            });
        }

        return response.data.data;
    },

    updateUnitListingStatus: async (
        unitId: number,
        isListed: boolean,
        token: string,
    ): Promise<boolean> => {
        const response = await propertyManagerApiClient.patch<ApiResponse<boolean>>(
            `/units/${unitId}/listing/status`,
            { isListed },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        if (!response.data.success) {
            throw new ApiError({
                message: response.data.message ?? "UNIT_LISTING_UPDATE_FAILED",
                data: null,
                statusCode: response.status,
            });
        }

        return response.data.data;
    },
};
