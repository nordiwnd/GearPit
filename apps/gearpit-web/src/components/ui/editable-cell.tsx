"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface EditableCellProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string | number
    onSave: (value: string | number) => void
    type?: "text" | "number"
    className?: string
    isEditable?: boolean
}

export function EditableCell({
    value: initialValue,
    onSave,
    type = "text",
    className,
    isEditable = true,
    ...props
}: EditableCellProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [value, setValue] = useState(initialValue)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.focus()
        }
    }, [isEditing])

    const handleSave = () => {
        setIsEditing(false)
        if (value !== initialValue) {
            onSave(type === "number" ? Number(value) : value)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSave()
        } else if (e.key === "Escape") {
            setIsEditing(false)
            setValue(initialValue)
        }
    }

    // When focusing via keyboard (tab/arrows), the parent cell gets focus.
    // We want 'Enter' on the parent cell to trigger edit mode.
    // But here we are inside the cell renderer.
    // The Data-Table will handle navigation and focus on the cell container.
    // If this component detects it is inside a focused cell and Enter is pressed, it should edit?
    // Or we make THIS component the focusable element.

    if (isEditing && isEditable) {
        return (
            <Input
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className={cn("h-8 w-full px-2 py-1 text-xs", className)}
            />
        )
    }

    return (
        <div
            className={cn(
                "h-8 w-full flex items-center px-2 py-1 cursor-text truncate text-xs hover:bg-muted/50 rounded-sm border border-transparent hover:border-border",
                !isEditable && "cursor-default hover:bg-transparent hover:border-transparent",
                className
            )}
            onClick={() => isEditable && setIsEditing(true)}
            data-editable={isEditable}
            // Removed tabIndex and onKeyDown, handled by parent
            {...props}
        >
            {value}
        </div>
    )
}
