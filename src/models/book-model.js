const { supabaseAdmin } = require('../config/database');

class BookModel {
  
  async create({ author_id, title, description, tags = [], visibility = 'public' }) {
    const { data, error } = await supabaseAdmin
      .from('books')
      .insert([{
        author_id,
        title: title.trim(),
        description: description?.trim() || null,
        tags,
        visibility,
        status: 'draft'
      }])
      .select(`
        id, title, description, cover_url, status, visibility, tags,
        words_count, chapters_count, likes_count, reads_count,
        created_at, updated_at, published_at
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  async findById(id, includeChapters = false) {
    let query = supabaseAdmin
      .from('books')
      .select(`
        id, author_id, title, slug, description, cover_url, status, visibility, tags,
        words_count, chapters_count, likes_count, reads_count,
        created_at, updated_at, published_at,
        users!inner(id, name, username, avatar_url)
      `)
      .eq('id', id);

    if (includeChapters) {
      query = query.select(`
        *,
        chapters(
          id, chapter_number, title, content_md, words_count, is_published,
          created_at, updated_at, published_at
        )
      `);
    }

    const { data, error } = await query.single();
    
    if (error) throw error;
    return data;
  }

  async findByAuthor(authorId, status = null) {
    let query = supabaseAdmin
      .from('books')
      .select(`
        id, title, description, cover_url, status, visibility, tags,
        words_count, chapters_count, likes_count, reads_count,
        created_at, updated_at, published_at
      `)
      .eq('author_id', authorId)
      .order('updated_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }

  async update(id, updates) {
    const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'string') {
          acc[key] = value.trim();
        } else {
          acc[key] = value;
        }
      }
      return acc;
    }, {});

    cleanUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('books')
      .update(cleanUpdates)
      .eq('id', id)
      .select(`
        id, title, description, cover_url, status, visibility, tags,
        words_count, chapters_count, likes_count, reads_count,
        created_at, updated_at, published_at
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { error } = await supabaseAdmin
      .from('books')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  async generateUniqueSlug(title, bookId = null) {
    const baseSlug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') 
      .replace(/[^a-z0-9\s-]/g, '') 
      .trim()
      .replace(/\s+/g, '-');

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      let query = supabaseAdmin
        .from('books')
        .select('id')
        .eq('slug', slug);

      if (bookId) {
        query = query.neq('id', bookId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        return slug;
      }
      
      counter++;
      slug = `${baseSlug}-${counter}`;
    }
  }

  async publish(id) {
    const now = new Date().toISOString();
    
    await supabaseAdmin
      .from('chapters')
      .update({ 
        is_published: true,
        published_at: now 
      })
      .eq('book_id', id)
      .eq('is_published', false);

    const { data, error } = await supabaseAdmin
      .from('books')
      .update({ 
        status: 'published',
        published_at: now,
        updated_at: now
      })
      .eq('id', id)
      .select(`
        id, title, slug, description, cover_url, status, visibility, tags,
        words_count, chapters_count, likes_count, reads_count,
        created_at, updated_at, published_at
      `)
      .single();
    
    if (error) throw error;

    supabaseAdmin.rpc('refresh_book_search').catch(console.error);
    
    return data;
  }

  async unpublish(id) {
    const now = new Date().toISOString();
    
    await supabaseAdmin
      .from('chapters')
      .update({ 
        is_published: false,
        published_at: null 
      })
      .eq('book_id', id);

    const { data, error } = await supabaseAdmin
      .from('books')
      .update({ 
        status: 'draft',
        published_at: null,
        updated_at: now
      })
      .eq('id', id)
      .select(`
        id, title, description, cover_url, status, visibility, tags,
        words_count, chapters_count, likes_count, reads_count,
        created_at, updated_at, published_at
      `)
      .single();
    
    if (error) throw error;

    supabaseAdmin.rpc('refresh_book_search').catch(console.error);
    
    return data;
  }

  async archive(id) {
    const { data, error } = await supabaseAdmin
      .from('books')
      .update({ 
        status: 'archived',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        id, title, description, status, updated_at
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  async search(query, limit = 20, offset = 0) {
    const { data, error } = await supabaseAdmin
      .from('book_search')
      .select(`
        book_id, title, description, author_id, cover_url, tags,
        likes_count, reads_count, published_at
      `)
      .textSearch('search_vector', query, {
        type: 'websearch',
        config: 'portuguese'
      })
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  }

  async findPublished(limit = 20, offset = 0, orderBy = 'published_at') {
    const validOrders = ['published_at', 'reads_count', 'likes_count', 'title'];
    const order = validOrders.includes(orderBy) ? orderBy : 'published_at';

    const { data, error } = await supabaseAdmin
      .from('books')
      .select(`
        id, title, description, cover_url, tags, likes_count, reads_count,
        published_at, created_at,
        users!inner(id, name, username, avatar_url)
      `)
      .eq('status', 'published')
      .eq('visibility', 'public')
      .order(order, { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  }

  async incrementRead(bookId, userId = null, ipAddress = null, userAgent = null) {
    try {
      await supabaseAdmin
        .from('book_reads')
        .insert([{
          book_id: bookId,
          user_id: userId,
          ip_address: ipAddress,
          user_agent: userAgent
        }]);

      await supabaseAdmin
        .from('books')
        .update({ 
          reads_count: supabaseAdmin.raw('reads_count + 1')
        })
        .eq('id', bookId);

      return true;
    } catch (error) {
      if (error.code === '23505') {
        return false; 
      }
      throw error;
    }
  }


  async findPublishedWithRatings(limit = 20, offset = 0, orderBy = 'published_at') {
    const validOrders = ['published_at', 'reads_count', 'likes_count', 'title', 'average_rating', 'ratings_count'];
    const order = validOrders.includes(orderBy) ? orderBy : 'published_at';

    const { data, error } = await supabaseAdmin
      .from('books')
      .select(`
        id, title, description, cover_url, tags, likes_count, reads_count,
        average_rating, ratings_count, comments_count, published_at, created_at,
        users!inner(id, name, username, avatar_url)
      `)
      .eq('status', 'published')
      .eq('visibility', 'public')
      .order(order, { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  }

  async toggleLike(bookId, userId) {
    const { data: existing } = await supabaseAdmin
      .from('book_likes')
      .select('user_id')
      .eq('book_id', bookId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      await supabaseAdmin
        .from('book_likes')
        .delete()
        .eq('book_id', bookId)
        .eq('user_id', userId);

      await supabaseAdmin
        .from('books')
        .update({ 
          likes_count: supabaseAdmin.raw('likes_count - 1')
        })
        .eq('id', bookId);

      return { liked: false };
    } else {
      // Adicionar curtida
      await supabaseAdmin
        .from('book_likes')
        .insert([{ book_id: bookId, user_id: userId }]);

      // Incrementar contador
      await supabaseAdmin
        .from('books')
        .update({ 
          likes_count: supabaseAdmin.raw('likes_count + 1')
        })
        .eq('id', bookId);

      return { liked: true };
    }
  }
}

module.exports = new BookModel();