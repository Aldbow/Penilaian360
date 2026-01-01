"use client"

import * as React from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
    value: number
    onChange?: (value: number) => void
    disabled?: boolean
    className?: string
}

export function StarRating({ value, onChange, disabled, className }: StarRatingProps) {
    const [hoverValue, setHoverValue] = React.useState<number | null>(null)

    const handleMouseEnter = (index: number) => {
        if (!disabled) {
            setHoverValue(index)
        }
    }

    const handleMouseLeave = () => {
        if (!disabled) {
            setHoverValue(null)
        }
    }

    const handleClick = (index: number) => {
        if (!disabled && onChange) {
            onChange(index)
        }
    }

    // Map 1-5 stars to score descriptions
    const getLabel = (star: number) => {
        switch (star) {
            case 1: return "Sangat Kurang (20)"
            case 2: return "Kurang (40)"
            case 3: return "Cukup (60)"
            case 4: return "Baik (80)"
            case 5: return "Sangat Baik (100)"
            default: return ""
        }
    }

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        className={cn(
                            "transition-all duration-200 hover:scale-110 focus:outline-none",
                            disabled ? "cursor-default" : "cursor-pointer"
                        )}
                        onMouseEnter={() => handleMouseEnter(star)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleClick(star)}
                        disabled={disabled}
                    >
                        <Star
                            className={cn(
                                "h-8 w-8",
                                (hoverValue !== null ? star <= hoverValue : star <= value)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-muted text-muted-foreground"
                            )}
                        />
                    </button>
                ))}
            </div>
            {!disabled && (
                <span className="text-sm font-medium text-muted-foreground h-5">
                    {getLabel(hoverValue !== null ? hoverValue : value)}
                </span>
            )}
        </div>
    )
}
