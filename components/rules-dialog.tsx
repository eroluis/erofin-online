"use client"

import { BookOpen, Target } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export function RulesDialog() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="gap-1.5">
            <BookOpen className="size-4" aria-hidden />
            <span className="hidden sm:inline">Cómo jugar</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Target className="size-5 text-primary" aria-hidden />
            Cómo jugar FinLuis
          </DialogTitle>
          <DialogDescription>Administra tus finanzas durante 10 años y conviértete en el mejor estratega.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <section>
            <h3 className="font-semibold mb-1">El ciclo de cada año</h3>
            <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
              <li>Recibes tus ingresos (hogar + inversiones) y el bienestar recurrente de tus compras.</li>
              <li>Actúa: ahorra, invierte, compra, trabaja, pide crédito o contrata un seguro.</li>
              <li>Pulsa <strong className="text-foreground">Terminar año</strong>: pagas tus gastos, tu ahorro rinde 10% y ocurre un imprevisto al azar.</li>
            </ol>
          </section>

          <section>
            <h3 className="font-semibold mb-1">Conceptos clave</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong className="text-foreground">Ahorro:</strong> crece 10% cada año.</li>
              <li><strong className="text-foreground">Inversiones:</strong> otorgan ingreso pasivo todos los años.</li>
              <li><strong className="text-foreground">Compras:</strong> suben tu bienestar (algunas de forma recurrente).</li>
              <li><strong className="text-foreground">Crédito:</strong> +$600 pero suma 6 pagarés ($150 c/u de deuda).</li>
              <li><strong className="text-foreground">Seguro:</strong> $50 para protegerte de un imprevisto negativo.</li>
              <li>Si no te alcanza el efectivo, se retira de tu ahorro (multa 10%) o se pide crédito automáticamente.</li>
            </ul>
          </section>

          <section className="rounded-xl bg-primary/10 p-3">
            <h3 className="font-semibold mb-1.5 flex items-center gap-1.5">
              <Target className="size-4 text-primary" aria-hidden />
              Metas para ganar (al terminar el año 10)
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Bienestar ≥ 300 puntos</li>
              <li>Ahorro ≥ $500</li>
              <li>Cero pagarés (sin deuda)</li>
              <li>Al menos 1 inversión</li>
            </ul>
            <p className="mt-2 text-xs">Puntaje = (Bienestar × 2) + Efectivo + Ahorro</p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
