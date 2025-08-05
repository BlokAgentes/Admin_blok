export default function TestSidebarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Teste da Sidebar</h1>
        <p className="text-muted-foreground">
          Esta página testa se a sidebar está funcionando corretamente com o padrão shadcn/ui.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="font-semibold">Sidebar Funcional</h3>
          <p className="text-sm text-muted-foreground">
            A sidebar deve estar colapsível e mostrar tooltips quando fechada.
          </p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="font-semibold">Navegação</h3>
          <p className="text-sm text-muted-foreground">
            Os itens de menu devem funcionar corretamente.
          </p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="font-semibold">Responsivo</h3>
          <p className="text-sm text-muted-foreground">
            A sidebar deve se adaptar a diferentes tamanhos de tela.
          </p>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="font-semibold">Estilos</h3>
          <p className="text-sm text-muted-foreground">
            Os estilos devem estar aplicados corretamente.
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Instruções de Teste</h2>
        <ul className="space-y-2 text-sm">
          <li>• Clique no botão de menu (☰) para abrir/fechar a sidebar</li>
          <li>• Quando fechada, a sidebar deve mostrar apenas ícones</li>
          <li>• Passe o mouse sobre os ícones para ver tooltips</li>
          <li>• Teste a navegação entre as páginas</li>
          <li>• Redimensione a janela para testar responsividade</li>
        </ul>
      </div>
    </div>
  )
} 