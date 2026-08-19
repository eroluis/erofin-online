"use client"

import { ScrollText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ActivityLog({ registro }: { registro: string[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ScrollText className="size-5 text-primary" aria-hidden />
          Registro de actividad
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {registro.map((entrada, i) => (
            <li
              key={`${i}-${entrada.slice(0, 12)}`}
              className="text-xs text-muted-foreground leading-relaxed border-l-2 border-border pl-2.5"
            >
              {entrada}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
