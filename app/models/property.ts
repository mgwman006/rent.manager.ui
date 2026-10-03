export interface PropertyCreateDTO {
  description?: string;
  createdByUserId: number;
  name: string;
  landSize?: number | null;
  landSizeUnit?: string | null;
  location: LocationCreateDTO;
  type: PropertyType;
  numberOfBuildings: number;
  developmentStatus?: DevelopmentStatus;
}

export interface LocationCreateDTO {
  name?: string;
  latitude: number;
  longitude: number;
  address: AddressDTO;
}

export interface AddressDTO {
  postalCode: number;
  streetNumber: number;
  streetName: string;
  ward: string;
  city: string;
  region: string;
  country: string;
}

export enum DevelopmentStatus {
  PLANNING = "PLANNING",
  UNDER_CONSTRUCTION = "UNDER_CONSTRUCTION",
  COMPLETED = "COMPLETED",
  OPERATIONAL = "OPERATIONAL",
}

export enum PropertyType {
  STAND_ALONE_HOUSE = "STAND_ALONE_HOUSE",
  APARTMENTS_BUILDING = "APARTMENTS_BUILDING",
  COMPOUND = "COMPOUND",
  COMPLEX = "COMPLEX",
}

export interface UnitDetailsDTO {
  id: number;
  unitNumber: string;
  rentalProfileId: number;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  numberParkingSpots: number;
  rentAmount: number;
  type: UnitType;
  status: UnitStatus;
  size: number;
  sizeUnit: string;
  buildingId: number;
}

export interface UnitCreateDTO {
  unitNumber: string;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  numberParkingSpots: number;
  rentAmount: number;
  type: UnitType;
  size: number;
  sizeUnit: string;
}

export enum UnitType {
  FLAT = "FLAT",
  HOUSE = "HOUSE",
  ROOM = "ROOM",
  OFFICE = "OFFICE",
  SHOP = "SHOP",
}

export enum UnitStatus {
  AVAILABLE = "AVAILABLE",
  OCCUPIED = "OCCUPIED",
  MAINTENANCE = "MAINTENANCE",
  RESERVED = "RESERVED",
}

export interface BuildingDetailsDTO {
  id: number;
  code: string;
  name: string;
  description: string;
  propertyId: number;
  units: UnitDetailsDTO[];
}

export interface PropertyDetailsDTO {
  id: number;
  code: string;
  description: string;
  name: string;
  landSize: number;
  landSizeUnit: string;
  type: string;
  developmentStatus: string;
  location: LocationDetailsDTO;
  buildings: BuildingDetailsDTO[];
}

export interface LocationDetailsDTO {
  latitude: number;
  longitude: number;
  address: AddressDTO;
}
