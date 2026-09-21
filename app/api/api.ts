import axios from 'axios';
import { ApiResponse } from '../models/common';
import { ApiError } from '../models/error';
import { MembershipDetailsDTO, TenantInvitationCreateDTO, TenantInvitationDetailsDTO } from '../models/user';
import { CreateRentalProfileDTO, RentalProfileDetailsDTO } from '../models/rentalprofile';
import { LeaseCreateDTO, LeaseDetailsDTO, LeaseStatus, RentSummaryDTO } from '../models/lease';

const apiUrl = import.meta.env.VITE_RENT_MANAGER_API_URL;


export const apiClient = axios.create({
  baseURL: `${apiUrl}/rent-manager/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});


apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { message, data, statusCode } = error.response.data;

      return Promise.reject(
        new ApiError({
          message: message ?? "SERVER_ERROR",
          data: data ?? null,
          statusCode: statusCode ?? error.response.status,
        })
      );
    }

    if (error.request) {
      return Promise.reject(
        new ApiError({
          message: "NETWORK_ERROR",
          data: "No response from server",
          statusCode: 0,
        })
      );
    }

    return Promise.reject(
      new ApiError({
        message: "CLIENT_ERROR",
        data: "Unexpected error occurred",
        statusCode: 0,
      })
    );
  }
);


export const membershipApi = {
  getAllMembershipsByPhoneNumber: async (phoneNumber: string, token: string) => {
    const res = await apiClient.get<ApiResponse<MembershipDetailsDTO []>>(`/memberships/phone/${phoneNumber}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return handleResponse(res.data);
  }
};

export const rentalProfileApi = {
  createRentalProfile: async (requestBody: CreateRentalProfileDTO, token: string) => {
    const res = await apiClient.post<ApiResponse<RentalProfileDetailsDTO>>(
      `/rentalprofiles`,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return handleResponse(res.data);
  },

  getRentalProfileDetails: async (rentalProfileId: number, token: string) => {
    const res = await apiClient.get<ApiResponse<RentalProfileDetailsDTO>>(
      `/rentalprofiles/${rentalProfileId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return handleResponse(res.data);
  },

  getByUserIdOrOrganizationId: async (userId: number, organizationId: number, token: string) => {
    const res = await apiClient.get<ApiResponse<RentalProfileDetailsDTO[]>>(
      `/rentalprofiles/${userId}/${organizationId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return handleResponse(res.data);
  }
};

export const leaseApi = {
  getLeasesByRentalProfile: async (rentalProfileId: number, token: string) => {
    const res = await apiClient.get<ApiResponse<LeaseDetailsDTO[]>>(
      `/leases/rental-profile/${rentalProfileId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return handleResponse(res.data);
  },

  getLeasesByRentalProfileAndStatus: async (rentalProfileId: number,status:LeaseStatus, token: string) => {
    const res = await apiClient.get<ApiResponse<LeaseDetailsDTO[]>>(
      `/leases/rental-profile/${rentalProfileId}?status=${status}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return handleResponse(res.data);
  },

  getLeaseById: async (id : number, token: string) => {
    const res = await apiClient.get<ApiResponse<LeaseDetailsDTO>>(
      `/leases/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return handleResponse(res.data);
  },

  createLease: async (requestBody: LeaseCreateDTO, token: string) => {
    const res = await apiClient.post<ApiResponse<LeaseDetailsDTO>>(
      `/leases`,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return handleResponse(res.data);
  },

  getRentCollectionSummary: async (leaseId: number, token: string) => {
    const res = await apiClient.get<ApiResponse<RentSummaryDTO>>(
      `/leases/rent/summary/${leaseId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return handleResponse(res.data);
  },
};


export const leaseInvitationApi = {

  create: async (requestBody:TenantInvitationCreateDTO, token:string) => {
    const res = await apiClient.post<ApiResponse<TenantInvitationDetailsDTO>>(
      `/tenant-invitations`,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    return handleResponse(res.data);
  },
    getActiveInvitationsByPhoneNumber: async (phoneNumber :string, jwtToken: string) => {
        const results = await apiClient.get<ApiResponse<TenantInvitationDetailsDTO[]>>(`/lease-invitations/phone/${phoneNumber}`,
            {
                headers: {
                'Authorization': `Bearer ${jwtToken}`
                }
            }
        );
        return handleResponse(results.data);
    },

  getByInvitationToken: async (invitationToken:string,jwtToken: string) => {
    const res = await apiClient.get<ApiResponse<TenantInvitationDetailsDTO>>(`/lease-invitations/${invitationToken}`,
        {
            headers: {
            'Authorization': `Bearer ${jwtToken}`
            }
        }
    );
    return handleResponse(res.data);
  },

  acceptInvitation: async (invitationToken:string, id:number, jwtToken: string) => {
    const res = await apiClient.post<ApiResponse<TenantInvitationDetailsDTO>>(
      `/lease-invitations/${invitationToken}/landlord/accept?landlordId=${id}`,
      null,
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      }
    );
    return handleResponse(res.data);
  },

  getLeaseDetailsByInvitationToken: async (invitationToken:string, jwtToken:string) => {
    const res = await apiClient.get<ApiResponse<LeaseDetailsDTO>>(`/lease-invitations/${invitationToken}/lease`,
        {
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            }
        }
    );

    return handleResponse(res.data);
  }
};

export function handleResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new Error(response.message ?? "Request failed");
  }

  return response.data;
}