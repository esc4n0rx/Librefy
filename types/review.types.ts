// types/review.types.ts

export interface BookRating {
    id: string;
    book_id: string;
    user_id: string;
    rating: number; // 1-5
    created_at: string;
    updated_at: string;
  }
  
  export interface BookReview {
    id: string;
    book_id: string;
    user_id: string;
    rating: number; // 1-5
    comment: string;
    created_at: string;
    updated_at: string;
    
    // Relação com usuário
    user?: {
      id: string;
      full_name?: string;
      avatar_url?: string;
    };
  }
  
  export interface BookStats {
    total_ratings: number;
    average_rating: number;
    total_reviews: number;
    rating_distribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  }
  
  export interface CreateReviewData {
    book_id: string;
    rating: number;
    comment: string;
  }