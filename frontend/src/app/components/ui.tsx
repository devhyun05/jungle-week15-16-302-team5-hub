import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Button
export function Button({ className, variant = "primary", size = "md", ...props }: any) {
  const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-50 text-gray-700",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 py-2",
    lg: "h-12 px-6 text-lg",
    icon: "h-10 w-10",
  };
  return <button className={cn(base, variants[variant as keyof typeof variants], sizes[size as keyof typeof sizes], className)} {...props} />;
}

// Card
export function Card({ className, ...props }: any) {
  return <div className={cn("bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden", className)} {...props} />;
}
export function CardHeader({ className, ...props }: any) {
  return <div className={cn("px-6 py-4 border-b border-gray-100", className)} {...props} />;
}
export function CardTitle({ className, ...props }: any) {
  return <h3 className={cn("text-lg font-semibold text-gray-900", className)} {...props} />;
}
export function CardContent({ className, ...props }: any) {
  return <div className={cn("p-6", className)} {...props} />;
}
export function CardFooter({ className, ...props }: any) {
  return <div className={cn("px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center", className)} {...props} />;
}

// Badge
export function Badge({ className, variant = "default", ...props }: any) {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    primary: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  };
  return <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", variants[variant as keyof typeof variants], className)} {...props} />;
}

// Input & Textarea
export function Input({ className, ...props }: any) {
  return <input className={cn("flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />;
}
export function Textarea({ className, ...props }: any) {
  return <textarea className={cn("flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} />;
}

// Label
export function Label({ className, ...props }: any) {
  return <label className={cn("block text-sm font-medium text-gray-700 mb-1", className)} {...props} />;
}

// Tabs (Simple custom implementation)
export function Tabs({ children, className }: any) {
  return <div className={cn("flex flex-col", className)}>{children}</div>;
}
export function TabsList({ children, className }: any) {
  return <div className={cn("flex items-center space-x-2 border-b border-gray-200", className)}>{children}</div>;
}
export function TabsTrigger({ children, active, className, ...props }: any) {
  return (
    <button
      className={cn(
        "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
        active ? "border-emerald-600 text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
