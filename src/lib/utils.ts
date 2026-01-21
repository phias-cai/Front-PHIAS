// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Función para combinar clases de Tailwind CSS de forma inteligente
 * Evita conflictos entre clases y permite sobrescritura condicional
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}