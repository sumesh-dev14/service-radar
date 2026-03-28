/**
 * Shared category visuals for Home “Browse by Category” and Search chips.
 * Uses keyword matching so new API categories get sensible icons without code changes.
 */

import type { ReactNode } from 'react'
import {
    Wrench,
    Zap,
    Brush,
    Wind,
    Hammer,
    Leaf,
    PawPrint,
    Truck,
    BookOpen,
    Laptop,
    Camera,
    Dumbbell,
    Sparkles,
    type LucideProps,
} from 'lucide-react'

const stroke = 1.65

function Ic(
    Icon: React.ComponentType<LucideProps>,
    size: number,
    props?: Partial<LucideProps>,
): ReactNode {
    return <Icon size={size} strokeWidth={stroke} {...props} />
}

/** Pick a Lucide icon from category name / description (case-insensitive). */
function resolveCategoryIcon(name: string, description?: string, size = 26): ReactNode {
    const blob = `${name} ${description ?? ''}`.toLowerCase()

    if (blob.includes('plumb')) return Ic(Wrench, size)
    if (blob.includes('electric')) return Ic(Zap, size)
    if (blob.includes('hvac') || blob.includes('air condition') || blob.includes('heating') || blob.includes('cooling') || blob.includes('climate'))
        return Ic(Wind, size)
    if (blob.includes('clean')) return Ic(Brush, size)
    if (blob.includes('handyman') || blob.includes('odd job') || blob.includes('assembly'))
        return Ic(Hammer, size)
    if (blob.includes('landscap') || blob.includes('lawn') || blob.includes('garden') || blob.includes('yard'))
        return Ic(Leaf, size)
    if (blob.includes('pet') || blob.includes('dog walk') || blob.includes('cat sit'))
        return Ic(PawPrint, size)
    if (blob.includes('mov') || blob.includes('haul') || blob.includes('delivery help'))
        return Ic(Truck, size)
    if (blob.includes('tutor') || blob.includes('academic') || blob.includes('homework'))
        return Ic(BookOpen, size)
    if (blob.includes('computer') || blob.includes('it &') || blob.includes('wifi') || blob.includes('network') || blob.includes('tech support'))
        return Ic(Laptop, size)
    if (blob.includes('photo')) return Ic(Camera, size)
    if (blob.includes('fitness') || blob.includes('personal train') || blob.includes('yoga'))
        return Ic(Dumbbell, size)

    return Ic(Sparkles, size)
}

export function CategoryBrowseIcon({
    name,
    description,
    size = 26,
}: {
    name: string
    description?: string
    size?: number
}) {
    return <>{resolveCategoryIcon(name, description, size)}</>
}
