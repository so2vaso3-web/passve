export interface Ticket {
  _id: string;
  seller: {
    _id: string;
    name: string;
    image?: string;
    rating: number;
  };
  title: string;
  movieId?: number;
  movieTitle: string;
  moviePoster?: string;
  cinema: string;
  city: string;
  showDate: string;
  showTime: string;
  seats: string[];
  originalPrice: number;
  sellingPrice: number;
  images: string[];
  description?: string;
  status: "pending" | "approved" | "sold" | "cancelled" | "rejected";
  category: "movie" | "concert" | "event";
  buyer?: string;
  soldAt?: string;
  createdAt: string;
  updatedAt: string;
}



