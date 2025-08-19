"use client";

import { ArrowUpRight, CircleFadingPlus, FileInput, FolderPlus, Search } from "lucide-react";
import * as React from "react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"

export function CommandK() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <button
        className="inline-flex h-9 w-fit rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20"
        onClick={() => setOpen(true)}
        aria-label="Abrir comando de busca"
      >
        <span className="flex grow items-center">
          <Search
            className="-ms-1 me-2 text-muted-foreground/80"
            size={16}
            strokeWidth={2}
            aria-hidden="true"
          />
          <span className="hidden sm:inline font-normal text-muted-foreground/70">Buscar</span>
        </span>
        <kbd className="-me-1 ms-2 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-mono text-[0.625rem] font-medium text-muted-foreground/70">
          ⌘K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <DialogTitle className="sr-only">Menu de Comandos</DialogTitle>
        <DialogDescription className="sr-only">
          Busque e navegue rapidamente pela plataforma
        </DialogDescription>
        <CommandInput placeholder="Digite um comando ou busque..." className="font-sans" />
        <CommandList className="font-sans">
          <CommandEmpty className="font-sans">Nenhum resultado encontrado.</CommandEmpty>
          <CommandGroup heading="Início Rápido" className="font-sans">
            <CommandItem className="font-sans">
              <FolderPlus size={16} strokeWidth={2} className="opacity-60" aria-hidden="true" />
              <span>Nova pasta</span>
              <CommandShortcut className="justify-center font-mono">⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem className="font-sans">
              <FileInput size={16} strokeWidth={2} className="opacity-60" aria-hidden="true" />
              <span>Importar documento</span>
              <CommandShortcut className="justify-center font-mono">⌘I</CommandShortcut>
            </CommandItem>
            <CommandItem className="font-sans">
              <CircleFadingPlus
                size={16}
                strokeWidth={2}
                className="opacity-60"
                aria-hidden="true"
              />
              <span>Adicionar bloco</span>
              <CommandShortcut className="justify-center font-mono">⌘B</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Navegação" className="font-sans">
            <CommandItem className="font-sans">
              <ArrowUpRight size={16} strokeWidth={2} className="opacity-60" aria-hidden="true" />
              <span>Ir para dashboard</span>
            </CommandItem>
            <CommandItem className="font-sans">
              <ArrowUpRight size={16} strokeWidth={2} className="opacity-60" aria-hidden="true" />
              <span>Ir para apps</span>
            </CommandItem>
            <CommandItem className="font-sans">
              <ArrowUpRight size={16} strokeWidth={2} className="opacity-60" aria-hidden="true" />
              <span>Ir para conexões</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}