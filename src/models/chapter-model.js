const { supabaseAdmin } = require('../config/database');

class ChapterModel {
  
  async create({ book_id, author_id, title, content_md, chapter_number = null }) {
    // Se não especificou número, pegar o próximo disponível
    if (!chapter_number) {
      const { data: lastChapter } = await supabaseAdmin
        .from('chapters')
        .select('chapter_number')
        .eq('book_id', book_id)
        .order('chapter_number', { ascending: false })
        .limit(1)
        .single();
      
      chapter_number = lastChapter ? lastChapter.chapter_number + 1 : 1;
    }

    const { data, error } = await supabaseAdmin
      .from('chapters')
      .insert([{
        book_id,
        author_id,
        title: title.trim(),
        content_md: content_md.trim(),
        chapter_number,
        is_published: false
      }])
      .select(`
        id, book_id, chapter_number, title, content_md, words_count,
        is_published, created_at, updated_at, published_at
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  async findById(id) {
    const { data, error } = await supabaseAdmin
      .from('chapters')
      .select(`
        id, book_id, author_id, chapter_number, title, content_md, words_count,
        is_published, created_at, updated_at, published_at,
        books!inner(id, title, author_id, status)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async findByBook(bookId, includeUnpublished = false) {
    let query = supabaseAdmin
      .from('chapters')
      .select(`
        id, chapter_number, title, content_md, words_count,
        is_published, created_at, updated_at, published_at
      `)
      .eq('book_id', bookId)
      .order('chapter_number', { ascending: true });

    if (!includeUnpublished) {
      query = query.eq('is_published', true);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }

  async update(id, updates) {
    // Limpar campos vazios
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

    // Sempre atualizar updated_at
    cleanUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('chapters')
      .update(cleanUpdates)
      .eq('id', id)
      .select(`
        id, book_id, chapter_number, title, content_md, words_count,
        is_published, created_at, updated_at, published_at
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  async delete(id) {
    const { error } = await supabaseAdmin
      .from('chapters')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  async reorder(bookId, newOrder) {
    // newOrder é um array de { chapterId, newNumber }
    const updates = newOrder.map(item => 
      supabaseAdmin
        .from('chapters')
        .update({ 
          chapter_number: item.newNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.chapterId)
        .eq('book_id', bookId)
    );

    await Promise.all(updates);
    return true;
  }

  async publish(id) {
    const now = new Date().toISOString();
    
    const { data, error } = await supabaseAdmin
      .from('chapters')
      .update({ 
        is_published: true,
        published_at: now,
        updated_at: now
      })
      .eq('id', id)
      .select(`
        id, book_id, chapter_number, title, words_count,
        is_published, updated_at, published_at
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  async unpublish(id) {
    const { data, error } = await supabaseAdmin
      .from('chapters')
      .update({ 
        is_published: false,
        published_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        id, book_id, chapter_number, title, words_count,
        is_published, updated_at, published_at
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  async getByBookAndNumber(bookId, chapterNumber) {
    const { data, error } = await supabaseAdmin
      .from('chapters')
      .select(`
        id, chapter_number, title, content_md, words_count,
        is_published, created_at, published_at,
        books!inner(id, title, author_id, status, visibility)
      `)
      .eq('book_id', bookId)
      .eq('chapter_number', chapterNumber)
      .single();
    
    if (error) throw error;
    return data;
  }
}

module.exports = new ChapterModel();