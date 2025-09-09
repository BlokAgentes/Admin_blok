import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || (!supabaseServiceKey && !supabaseAnonKey)) {
  throw new Error('Supabase configuration missing. Please set SUPABASE_URL and either SUPABASE_SERVICE_ROLE or SUPABASE_ANON_KEY environment variables.')
}

// Create Supabase clients
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || '', {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

/**
 * MCP-style Supabase client wrapper
 * Provides standardized methods for interacting with Supabase via MCP-like tools
 */
export class SupabaseMCP {
  private adminClient = supabaseAdmin
  private client = supabaseClient

  /**
   * Simulate MCP tool call structure
   */
  async call(toolName: string, params: any = {}) {
    try {
      switch (toolName) {
        // Auth tools
        case 'supabase_auth_create_user':
          return this.createUser(params)
        case 'supabase_auth_authenticate':
          return this.authenticateUser(params)
        case 'supabase_auth_reset_password':
          return this.resetPassword(params)
        case 'supabase_auth_confirm_email':
          return this.confirmEmail(params)
        case 'supabase_auth_logout':
          return this.logout(params)
        case 'supabase_auth_get_session':
          return this.getSession(params)
        case 'supabase_auth_refresh_session':
          return this.refreshSession(params)
        case 'supabase_auth_get_user':
          return this.getUser(params)

        // Database tools
        case 'supabase_database_select':
          return this.selectData(params)
        case 'supabase_database_insert':
          return this.insertData(params)
        case 'supabase_database_update':
          return this.updateData(params)
        case 'supabase_database_delete':
          return this.deleteData(params)
        case 'supabase_database_rpc':
          return this.callRPC(params)

        // Storage tools
        case 'supabase_storage_upload':
          return this.uploadFile(params)
        case 'supabase_storage_download':
          return this.downloadFile(params)
        case 'supabase_storage_delete':
          return this.deleteFile(params)
        case 'supabase_storage_list':
          return this.listFiles(params)

        default:
          throw new Error(`Unknown tool: ${toolName}`)
      }
    } catch (error) {
      console.error(`MCP tool error [${toolName}]:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // Auth Methods
  private async createUser(params: { email: string; password: string; options?: any }) {
    const { data, error } = await this.adminClient.auth.admin.createUser({
      email: params.email,
      password: params.password,
      email_confirm: params.options?.emailConfirm !== false,
      ...params.options
    })

    if (error) throw error

    return {
      success: true,
      data: {
        user: data.user,
        session: null
      }
    }
  }

  private async authenticateUser(params: { email: string; password: string }) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email: params.email,
      password: params.password
    })

    if (error) throw error

    return {
      success: true,
      data: {
        user: data.user,
        session: data.session
      }
    }
  }

  private async resetPassword(params: { email: string; redirectTo?: string }) {
    const { data, error } = await this.client.auth.resetPasswordForEmail(
      params.email,
      {
        redirectTo: params.redirectTo
      }
    )

    if (error) throw error

    return {
      success: true,
      data
    }
  }

  private async confirmEmail(params: { token: string; type: string }) {
    const { data, error } = await this.client.auth.verifyOtp({
      token_hash: params.token,
      type: params.type as any
    })

    if (error) throw error

    return {
      success: true,
      data: {
        user: data.user,
        session: data.session
      }
    }
  }

  private async logout(params: { scope?: 'global' | 'local' }) {
    const { error } = await this.client.auth.signOut({
      scope: params.scope || 'local'
    })

    if (error) throw error

    return {
      success: true,
      data: null
    }
  }

  private async getSession(params: any = {}) {
    const { data, error } = await this.client.auth.getSession()

    if (error) throw error

    return {
      success: true,
      data: data.session
    }
  }

  private async refreshSession(params: { refreshToken?: string }) {
    const { data, error } = await this.client.auth.refreshSession({
      refresh_token: params.refreshToken
    })

    if (error) throw error

    return {
      success: true,
      data: {
        session: data.session,
        user: data.user
      }
    }
  }

  private async getUser(params: { jwt?: string }) {
    const client = params.jwt ? 
      createClient(supabaseUrl!, supabaseAnonKey!, {
        global: { headers: { Authorization: `Bearer ${params.jwt}` } }
      }) : this.client

    const { data, error } = await client.auth.getUser(params.jwt)

    if (error) throw error

    return {
      success: true,
      data: {
        user: data.user
      }
    }
  }

  // Database Methods
  private async selectData(params: { 
    table: string; 
    select?: string; 
    filter?: any; 
    order?: any; 
    limit?: number;
    offset?: number;
  }) {
    try {
      let query = this.client.from(params.table)

      // Build the query
      const selectQuery = query.select(params.select || '*')

      // Apply filters
      let filteredQuery = selectQuery
      if (params.filter) {
        Object.entries(params.filter).forEach(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            // Handle complex filters like { name: { ilike: '%john%' } }
            const operator = Object.keys(value as object)[0]
            const operatorValue = (value as any)[operator]
            filteredQuery = (filteredQuery as any)[operator](key, operatorValue)
          } else {
            // Simple equality filter
            filteredQuery = filteredQuery.eq(key, value)
          }
        })
      }

      // Apply ordering
      if (params.order) {
        Object.entries(params.order).forEach(([column, direction]) => {
          filteredQuery = filteredQuery.order(column, { ascending: direction === 'asc' })
        })
      }

      // Apply limits
      if (params.limit) {
        filteredQuery = filteredQuery.limit(params.limit)
      }

      if (params.offset) {
        filteredQuery = filteredQuery.range(params.offset, params.offset + (params.limit || 100) - 1)
      }

      const { data, error } = await filteredQuery

      if (error) throw error

      return {
        success: true,
        data
      }
    } catch (error) {
      throw error
    }
  }

  private async insertData(params: { table: string; data: any; returning?: string }) {
    try {
      let query = this.client.from(params.table).insert(params.data)

      if (params.returning) {
        query = query.select(params.returning)
      }

      const { data, error } = await query

      if (error) throw error

      return {
        success: true,
        data
      }
    } catch (error) {
      throw error
    }
  }

  private async updateData(params: { 
    table: string; 
    data: any; 
    filter: any;
    returning?: string;
  }) {
    try {
      let query = this.client.from(params.table).update(params.data)

      // Apply filters
      Object.entries(params.filter).forEach(([key, value]) => {
        query = query.eq(key, value)
      })

      if (params.returning) {
        query = query.select(params.returning)
      }

      const { data, error } = await query

      if (error) throw error

      return {
        success: true,
        data
      }
    } catch (error) {
      throw error
    }
  }

  private async deleteData(params: { table: string; filter: any; returning?: string }) {
    try {
      let query = this.client.from(params.table).delete()

      // Apply filters
      Object.entries(params.filter).forEach(([key, value]) => {
        query = query.eq(key, value)
      })

      if (params.returning) {
        query = query.select(params.returning)
      }

      const { data, error } = await query

      if (error) throw error

      return {
        success: true,
        data
      }
    } catch (error) {
      throw error
    }
  }

  private async callRPC(params: { function: string; args?: any }) {
    const { data, error } = await this.client.rpc(params.function, params.args)

    if (error) throw error

    return {
      success: true,
      data
    }
  }

  // Storage Methods
  private async uploadFile(params: { 
    bucket: string; 
    path: string; 
    file: Buffer | ArrayBuffer | File | Blob;
    options?: any;
  }) {
    const { data, error } = await this.client.storage
      .from(params.bucket)
      .upload(params.path, params.file, params.options)

    if (error) throw error

    return {
      success: true,
      data
    }
  }

  private async downloadFile(params: { bucket: string; path: string }) {
    const { data, error } = await this.client.storage
      .from(params.bucket)
      .download(params.path)

    if (error) throw error

    return {
      success: true,
      data
    }
  }

  private async deleteFile(params: { bucket: string; paths: string[] }) {
    const { data, error } = await this.client.storage
      .from(params.bucket)
      .remove(params.paths)

    if (error) throw error

    return {
      success: true,
      data
    }
  }

  private async listFiles(params: { 
    bucket: string; 
    path?: string;
    limit?: number;
    offset?: number;
  }) {
    const { data, error } = await this.client.storage
      .from(params.bucket)
      .list(params.path, {
        limit: params.limit,
        offset: params.offset
      })

    if (error) throw error

    return {
      success: true,
      data
    }
  }

  /**
   * Get admin client for privileged operations
   */
  getAdminClient() {
    return this.adminClient
  }

  /**
   * Get regular client for user operations
   */
  getClient() {
    return this.client
  }
}

// Export singleton instance
export const supabaseMCP = new SupabaseMCP()