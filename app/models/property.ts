/** Property  */

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

export interface PropertySummaryDTO {
  id: number;
  name: string;
  code: string;
  description?: string;
  landSize?: number;
  landSizeUnit?: string;
  location?: LocationDetailsDTO;
  type?: PropertyType;
  developmentStatus?: DevelopmentStatus;
  images?: PropertyImageDTO[];
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
  images: PropertyImageDTO[];
}

export interface PropertyImageDTO {
  id: number;
  url: string;
  fileName: string;
  contentType: string;
  size: number;
  primaryImage: boolean;
}

/** Location **/

export interface LocationDetailsDTO {
  latitude: number;
  longitude: number;
  address: AddressDTO;
}

export interface LocationCreateDTO {
  name?: string;
  latitude: number;
  longitude: number;
  address: AddressDTO;
}

export interface AddressDTO {
  postalCode?: number | null;
  houseNumber?: number | null;
  streetName: string;
  ward: string;
  city: string;
  region: string;
  country: string;
}


/** Unit **/

export interface UnitSummaryDTO {
  id: number;
  unitNumber: string;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  numberParkingSpots: number;
  rentAmount: number;
  type: UnitType;
  status: UnitStatus;
  roomSize: number;
  sizeUnit: string;
  isListed: boolean;
  floorNumber: number;
  buildingId: number;
  propertyName: string;
  location: LocationDetailsDTO;
  images: UnitImageDTO[];
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
  roomSize: number;
  sizeUnit: string;
  isListed?: boolean;
  floorNumber?: number;
  building?: BuildingSummaryDTO;
  images?: UnitImageDTO[];
}

export interface UnitImageDTO {
  id: number;
  url?: string;
  imageUrl?: string;
  fileName?: string;
  contentType?: string;
  size?: number;
  primaryImage?: boolean;
}

export interface UnitCreateDTO {
  rentalProfileId: number;
  unitNumber: string;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  numberParkingSpots: number;
  rentAmount: number;
  type: UnitType;
  roomSize: number;
  sizeUnit: string;
}



/** Building **/

export interface BuildingDetailsDTO {
  id: number;
  name: string;
  number: number;
  code: string;
  description: string;
  numberOfFloors: number;
  property: PropertySummaryDTO;
  units: UnitSummaryDTO[];
}


export interface BuildingSummaryDTO {
  id: number;
  name: string;
  number?: number;
  code: string;
  description?: string;
  numberOfFloors?: number;
  property: PropertySummaryDTO;
}





/** Enums **/


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