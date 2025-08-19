export default function TestStylesPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-foreground">Teste de Estilos</h1>
        
        {/* Teste de cores básicas */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Cores Básicas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-background border border-border rounded-lg">
              <div className="text-sm font-medium text-foreground">Background</div>
            </div>
            <div className="p-4 bg-card border border-border rounded-lg">
              <div className="text-sm font-medium text-card-foreground">Card</div>
            </div>
            <div className="p-4 bg-primary border border-border rounded-lg">
              <div className="text-sm font-medium text-primary-foreground">Primary</div>
            </div>
            <div className="p-4 bg-secondary border border-border rounded-lg">
              <div className="text-sm font-medium text-secondary-foreground">Secondary</div>
            </div>
          </div>
        </section>

        {/* Teste de sidebar */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Cores da Sidebar</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-sidebar border border-sidebar-border rounded-lg">
              <div className="text-sm font-medium text-sidebar-foreground">Sidebar</div>
            </div>
            <div className="p-4 bg-sidebar-primary border border-sidebar-border rounded-lg">
              <div className="text-sm font-medium text-sidebar-primary-foreground">Sidebar Primary</div>
            </div>
            <div className="p-4 bg-sidebar-accent border border-sidebar-border rounded-lg">
              <div className="text-sm font-medium text-sidebar-accent-foreground">Sidebar Accent</div>
            </div>
            <div className="p-4 bg-sidebar border border-sidebar-border rounded-lg">
              <div className="text-sm font-medium text-sidebar-foreground">Sidebar Border</div>
            </div>
          </div>
        </section>

        {/* Teste de componentes */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Componentes</h2>
          <div className="space-y-4">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              Botão Primary
            </button>
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors">
              Botão Secondary
            </button>
            <button className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors">
              Botão Destructive
            </button>
          </div>
        </section>

        {/* Teste de responsividade */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">Responsividade</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-card border border-border rounded-lg">
              <div className="text-sm font-medium text-card-foreground">Card 1</div>
            </div>
            <div className="p-4 bg-card border border-border rounded-lg">
              <div className="text-sm font-medium text-card-foreground">Card 2</div>
            </div>
            <div className="p-4 bg-card border border-border rounded-lg">
              <div className="text-sm font-medium text-card-foreground">Card 3</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
} 