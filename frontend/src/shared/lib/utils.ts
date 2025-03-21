import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function sidebar_cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
