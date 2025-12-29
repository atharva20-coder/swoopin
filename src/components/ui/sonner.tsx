"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-neutral-900 dark:group-[.toaster]:text-gray-100 dark:group-[.toaster]:border-neutral-800",
          description: "group-[.toast]:text-gray-600 dark:group-[.toast]:text-gray-400",
          actionButton:
            "group-[.toast]:bg-gray-900 group-[.toast]:text-white dark:group-[.toast]:bg-white dark:group-[.toast]:text-gray-900",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-600 dark:group-[.toast]:bg-neutral-800 dark:group-[.toast]:text-gray-300",
          success: "group-[.toaster]:bg-green-50 group-[.toaster]:text-green-900 group-[.toaster]:border-green-200 dark:group-[.toaster]:bg-green-950 dark:group-[.toaster]:text-green-100 dark:group-[.toaster]:border-green-900",
          error: "group-[.toaster]:bg-red-50 group-[.toaster]:text-red-900 group-[.toaster]:border-red-200 dark:group-[.toaster]:bg-red-950 dark:group-[.toaster]:text-red-100 dark:group-[.toaster]:border-red-900",
          warning: "group-[.toaster]:bg-yellow-50 group-[.toaster]:text-yellow-900 group-[.toaster]:border-yellow-200 dark:group-[.toaster]:bg-yellow-950 dark:group-[.toaster]:text-yellow-100 dark:group-[.toaster]:border-yellow-900",
          info: "group-[.toaster]:bg-blue-50 group-[.toaster]:text-blue-900 group-[.toaster]:border-blue-200 dark:group-[.toaster]:bg-blue-950 dark:group-[.toaster]:text-blue-100 dark:group-[.toaster]:border-blue-900",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

