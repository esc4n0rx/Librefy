const { supabaseAdmin } = require('../config/database');

class LibraryModel {
  
  // Biblioteca pessoal (salvos/favoritos)
  async addToLibrary(userId, bookId) {
    const { data, error } = await supabaseAdmin
      .from('user_library')
      .insert([{
        user_id: userId,
        book_id: bookId
      }])
      .select('id, created_at')
      .single();
    
    if (error) {
      // Se é erro de duplicata (já salvo), não é erro
      if (error.code === '23505') {
        const { data: existing } = await supabaseAdmin
          .from('user_library')
          .select('id, created_at')
          .eq('user_id', userId)
          .eq('book_id', bookId)
          .single();
        
        return existing;
      }
      throw error;
    }
    
    return data;
  }

  async removeFromLibrary(userId, bookId) {
    const { error } = await supabaseAdmin
      .from('user_library')
      .delete()
      .eq('user_id', userId)
      .eq('book_id', bookId);
    
    if (error) throw error;
    return true;
  }

  async getUserLibrary(userId, limit = 20, offset = 0) {
    const { data, error } = await supabaseAdmin
      .from('user_library_with_books')
      .select('*')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  }

  async isBookInLibrary(userId, bookId) {
    const { data, error } = await supabaseAdmin
      .from('user_library')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }

  // Licenças offline
  async createOfflineLicense(licenseData) {
    const { user_id, book_id, device_id, content_key_wrapped, license_expires_at } = licenseData;
    
    const { data, error } = await supabaseAdmin
      .from('offline_licenses')
      .insert([{
        user_id,
        book_id,
        device_id,
        content_key_wrapped,
        license_expires_at,
        status: 'active'
      }])
      .select('*')
      .single();
    
    if (error) {
      // Se já existe licença ativa, retornar a existente
      if (error.code === '23505') {
        const { data: existing } = await supabaseAdmin
          .from('offline_licenses')
          .select('*')
          .eq('user_id', user_id)
          .eq('device_id', device_id)
          .eq('book_id', book_id)
          .eq('status', 'active')
          .single();
        
        return existing;
      }
      throw error;
    }
    
    return data;
  }

  async getOfflineLicense(userId, deviceId, bookId) {
    const { data, error } = await supabaseAdmin
      .from('offline_licenses')
      .select('*')
      .eq('user_id', userId)
      .eq('device_id', deviceId)
      .eq('book_id', bookId)
      .eq('status', 'active')
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async revokeOfflineLicense(userId, deviceId, bookId) {
    const { data, error } = await supabaseAdmin
      .from('offline_licenses')
      .update({ 
        status: 'revoked',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('device_id', deviceId)
      .eq('book_id', bookId)
      .eq('status', 'active')
      .select('id')
      .single();
    
    if (error) throw error;
    return !!data;
  }

  async getUserOfflineLicenses(userId, deviceId = null) {
    let query = supabaseAdmin
      .from('offline_licenses')
      .select(`
        *,
        books!inner(id, title, cover_url, status, words_count, chapters_count)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (deviceId) {
      query = query.eq('device_id', deviceId);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }

  async countActiveOfflineLicenses(userId, deviceId = null) {
    let query = supabaseAdmin
      .from('offline_licenses')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'active');

    if (deviceId) {
      query = query.eq('device_id', deviceId);
    }

    const { count, error } = await query;
    
    if (error) throw error;
    return count || 0;
  }

  async renewOfflineLicense(userId, deviceId, bookId, newExpiryDate) {
    const { data, error } = await supabaseAdmin
      .from('offline_licenses')
      .update({ 
        license_expires_at: newExpiryDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('device_id', deviceId)
      .eq('book_id', bookId)
      .eq('status', 'active')
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  }

  // Manifestos offline
  async getOrCreateManifest(bookId) {
    // Primeiro, tentar buscar manifesto existente
    const { data: existing, error: selectError } = await supabaseAdmin
      .from('offline_manifests')
      .select('*')
      .eq('book_id', bookId)
      .order('version', { ascending: false })
      .limit(1)
      .single();
    
    if (selectError && selectError.code !== 'PGRST116') {
      throw selectError;
    }
    
    if (existing) {
      return existing;
    }
    
    // Se não existe, criar novo manifesto
    const manifestPath = `manifests/${bookId}/v1/manifest.json`;
    const packagePath = `packages/${bookId}/v1/content.enc`;
    
    const { data, error } = await supabaseAdmin
      .from('offline_manifests')
      .insert([{
        book_id: bookId,
        version: 1,
        manifest_path: manifestPath,
        package_path: packagePath,
        package_size: 0, // Será atualizado quando o pacote for gerado
        checksum: 'pending' // Será atualizado quando o pacote for gerado
      }])
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateManifestMetadata(manifestId, packageSize, checksum) {
    const { data, error } = await supabaseAdmin
      .from('offline_manifests')
      .update({
        package_size: packageSize,
        checksum: checksum
      })
      .eq('id', manifestId)
      .select('*')
      .single();
    
    if (error) throw error;
    return data;
  }

  async cleanupExpiredLicenses() {
    const { error } = await supabaseAdmin
      .rpc('cleanup_expired_licenses');
    
    if (error) throw error;
    return true;
  }
}

module.exports = new LibraryModel();