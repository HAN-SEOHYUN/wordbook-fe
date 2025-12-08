"use client"

import type { TestWeek } from "@/types/test"

interface WeekSelectorProps {
    weeks: TestWeek[]
    selectedWeek: TestWeek | null
    onWeekSelect: (week: TestWeek) => void
}

export function WeekSelector({ weeks, selectedWeek, onWeekSelect }: WeekSelectorProps) {
    if (weeks.length === 0) {
        return null
    }

    return (
        <div className="sticky top-[88px] z-[9] bg-background/98 backdrop-blur-md border-b border-border shadow-sm">
            <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-2 px-5 py-3 min-w-max">
                    {weeks.map((week) => {
                        const isSelected = selectedWeek?.twi_id === week.twi_id
                        return (
                            <button
                                key={week.twi_id}
                                onClick={() => onWeekSelect(week)}
                                className={`
                  relative px-6 py-3 rounded-full font-bold text-sm transition-all duration-200 whitespace-nowrap
                  ${isSelected
                                        ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg scale-105"
                                        : "bg-muted/80 text-muted-foreground hover:bg-muted active:scale-95"
                                    }
                `}
                            >
                                {week.name}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
