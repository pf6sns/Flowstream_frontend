import { ObjectId } from "mongodb";

/**
 * Convert MongoDB ObjectId to string
 */
export function objectIdToString(id: ObjectId | string | undefined): string {
  if (!id) return "";
  return typeof id === "string" ? id : id.toString();
}

/**
 * Convert string to MongoDB ObjectId
 */
export function stringToObjectId(id: string): ObjectId {
  return new ObjectId(id);
}

/**
 * Check if string is valid ObjectId
 */
export function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id);
}
