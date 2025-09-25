const { supabaseAdmin } = require('../config/database');

class CommentModel {
  
  async createComment({ user_id, book_id, content, parent_comment_id = null }) {
    const { data, error } = await supabaseAdmin
      .from('book_comments')
      .insert([{
        user_id,
        book_id,
        content: content.trim(),
        parent_comment_id
      }])
      .select(`
        id, user_id, book_id, parent_comment_id, content, is_deleted,
        created_at, updated_at
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  async findById(id) {
    const { data, error } = await supabaseAdmin
      .from('book_comments_with_users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async findByBook(bookId, limit = 50, offset = 0, includeDeleted = false) {
    const { data, error } = await supabaseAdmin
      .rpc('get_book_comments_hierarchical', {
        p_book_id: bookId,
        p_limit: limit,
        p_offset: offset
      });
    
    if (error) throw error;
    return data;
  }

  async findReplies(parentCommentId, limit = 20, offset = 0) {
    let query = supabaseAdmin
      .from('book_comments_with_users')
      .select('*')
      .eq('parent_comment_id', parentCommentId)
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;
    
    if (error) throw error;
    return data;
  }

  async updateComment(id, content) {
    const { data, error } = await supabaseAdmin
      .from('book_comments')
      .update({ 
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        id, user_id, book_id, parent_comment_id, content, is_deleted,
        created_at, updated_at
      `)
      .single();
    
    if (error) throw error;
    return data;
  }

  async softDeleteComment(id, deletedBy) {
    const { data, error } = await supabaseAdmin
      .from('book_comments')
      .update({ 
        is_deleted: true,
        deleted_by: deletedBy,
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, is_deleted, deleted_at')
      .single();
    
    if (error) throw error;
    return data;
  }

  async hardDeleteComment(id) {
    const { error } = await supabaseAdmin
      .from('book_comments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  async getCommentStats(bookId) {
    const { data, error } = await supabaseAdmin
      .from('books')
      .select('comments_count')
      .eq('id', bookId)
      .single();
    
    if (error) throw error;
    return data;
  }

  async getUserComments(userId, limit = 20, offset = 0) {
    const { data, error } = await supabaseAdmin
      .from('book_comments')
      .select(`
        id, content, is_deleted, created_at, updated_at,
        books!inner(id, title, cover_url, status, author_id,
          users!inner(name, username, avatar_url)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
  }

  async countReplies(commentId) {
    const { count, error } = await supabaseAdmin
      .from('book_comments')
      .select('id', { count: 'exact' })
      .eq('parent_comment_id', commentId)
      .eq('is_deleted', false);
    
    if (error) throw error;
    return count || 0;
  }
}

module.exports = new CommentModel();