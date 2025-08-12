import { supabase, withRetry } from './supabase'

// Tipos para as operações CRUD
export interface CRUDResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface CreateOptions {
  retryAttempts?: number
  validateData?: boolean
}

export interface ReadOptions {
  limit?: number
  offset?: number
  orderBy?: string
  ascending?: boolean
  filters?: Record<string, unknown>
}

export interface UpdateOptions {
  retryAttempts?: number
  validateData?: boolean
}

export interface DeleteOptions {
  retryAttempts?: number
  softDelete?: boolean
}

// Classe principal para operações CRUD
export class SupabaseCRUD {
  private tableName: string
  private defaultRetryAttempts: number = 3

  constructor(tableName: string) {
    this.tableName = tableName
  }

  // CREATE - Criar novo registro
  async create<T = unknown>(
    data: Partial<T>,
    options: CreateOptions = {}
  ): Promise<CRUDResult<T>> {
    try {
      const { retryAttempts = this.defaultRetryAttempts, validateData = true } = options

      // Validação de dados
      if (validateData && (!data || Object.keys(data).length === 0)) {
        return {
          success: false,
          error: 'Dados inválidos ou vazios'
        }
      }

      const result = await withRetry(
        async () => {
          const { data: resultData, error } = await supabase
            .from(this.tableName)
            .insert(data)
            .select()
            .single()

          if (error) throw error
          return resultData
        },
        retryAttempts
      )

      return {
        success: true,
        data: result,
        message: 'Registro criado com sucesso'
      }
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error)
      }
    }
  }

  // READ - Buscar registros
  async read<T = unknown>(
    options: ReadOptions = {}
  ): Promise<CRUDResult<T[]>> {
    try {
      const {
        limit = 100,
        offset = 0,
        orderBy = 'created_at',
        ascending = false,
        filters = {}
      } = options

      let query = supabase
        .from(this.tableName)
        .select('*')
        .range(offset, offset + limit - 1)
        .order(orderBy, { ascending })

      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })

      const { data, error } = await query

      if (error) throw error

      return {
        success: true,
        data: data || [],
        message: `${data?.length || 0} registros encontrados`
      }
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error)
      }
    }
  }

  // READ BY ID - Buscar registro por ID
  async readById<T = unknown>(id: string | number): Promise<CRUDResult<T>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      return {
        success: true,
        data,
        message: 'Registro encontrado'
      }
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error)
      }
    }
  }

  // UPDATE - Atualizar registro
  async update<T = unknown>(
    id: string | number,
    data: Partial<T>,
    options: UpdateOptions = {}
  ): Promise<CRUDResult<T>> {
    try {
      const { retryAttempts = this.defaultRetryAttempts, validateData = true } = options

      // Validação de dados
      if (validateData && (!data || Object.keys(data).length === 0)) {
        return {
          success: false,
          error: 'Dados inválidos ou vazios'
        }
      }

      const result = await withRetry(
        async () => {
          const { data: resultData, error } = await supabase
            .from(this.tableName)
            .update(data)
            .eq('id', id)
            .select()
            .single()

          if (error) throw error
          return resultData
        },
        retryAttempts
      )

      return {
        success: true,
        data: result,
        message: 'Registro atualizado com sucesso'
      }
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error)
      }
    }
  }

  // DELETE - Deletar registro
  async delete(
    id: string | number,
    options: DeleteOptions = {}
  ): Promise<CRUDResult> {
    try {
      const { retryAttempts = this.defaultRetryAttempts, softDelete = false } = options

      if (softDelete) {
        // Soft delete - apenas marca como deletado
        return await this.update(id, { deleted_at: new Date().toISOString() } as any)
      }

      const result = await withRetry(
        async () => {
          const { error } = await supabase
            .from(this.tableName)
            .delete()
            .eq('id', id)

          if (error) throw error
          return true
        },
        retryAttempts
      )

      return {
        success: true,
        message: 'Registro deletado com sucesso'
      }
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error)
      }
    }
  }

  // COUNT - Contar registros
  async count(filters: Record<string, unknown> = {}): Promise<CRUDResult<number>> {
    try {
      let query = supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })

      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value)
        }
      })

      const { count, error } = await query

      if (error) throw error

      return {
        success: true,
        data: count || 0,
        message: `Total de registros: ${count || 0}`
      }
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error)
      }
    }
  }

  // SEARCH - Busca com texto
  async search<T = unknown>(
    searchTerm: string,
    searchFields: string[],
    options: ReadOptions = {}
  ): Promise<CRUDResult<T[]>> {
    try {
      const { limit = 100, offset = 0 } = options

      let query = supabase
        .from(this.tableName)
        .select('*')
        .range(offset, offset + limit - 1)

      // Aplicar busca em múltiplos campos
      if (searchFields.length > 0) {
        const orConditions = searchFields.map(field => `${field}.ilike.%${searchTerm}%`)
        query = query.or(orConditions.join(','))
      }

      const { data, error } = await query

      if (error) throw error

      return {
        success: true,
        data: data || [],
        message: `${data?.length || 0} registros encontrados para "${searchTerm}"`
      }
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error)
      }
    }
  }

  // Validação de permissões
  async validatePermissions(): Promise<CRUDResult> {
    try {
      const operations = [
        { name: 'SELECT', test: () => supabase.from(this.tableName).select('*').limit(1) },
        { name: 'INSERT', test: () => supabase.from(this.tableName).insert({}).select() },
        { name: 'UPDATE', test: () => supabase.from(this.tableName).update({}).eq('id', 999999) },
        { name: 'DELETE', test: () => supabase.from(this.tableName).delete().eq('id', 999999) }
      ]

      const results = []

      for (const op of operations) {
        try {
          const { error } = await op.test()
          const allowed = !error || error.code !== '42501' // 42501 = insufficient_privilege
          results.push({
            operation: op.name,
            allowed,
            error: error?.message
          })
        } catch (error) {
          results.push({
            operation: op.name,
            allowed: false,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          })
        }
      }

      return {
        success: true,
        data: results,
        message: 'Permissões validadas'
      }
    } catch (error) {
      return {
        success: false,
        error: this.handleError(error)
      }
    }
  }

  // Tratamento de erros
  private handleError(error: unknown): string {
    if (error instanceof Error) {
      // Erros específicos do Supabase
      if (error.message.includes('row-level security policy')) {
        return 'Acesso negado: Política de segurança de linha ativa'
      }
      if (error.message.includes('duplicate key')) {
        return 'Erro: Chave duplicada'
      }
      if (error.message.includes('foreign key')) {
        return 'Erro: Violação de chave estrangeira'
      }
      if (error.message.includes('not null')) {
        return 'Erro: Campo obrigatório não preenchido'
      }
      
      return error.message
    }
    
    return 'Erro desconhecido'
  }
}

// Função helper para criar instância CRUD
export function createCRUD<T = any>(tableName: string): SupabaseCRUD {
  return new SupabaseCRUD(tableName)
}

// Exporta a classe
export default SupabaseCRUD 