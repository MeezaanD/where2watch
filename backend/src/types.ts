export type Showtime = {
  cinema: "Ster-Kinekor" | "Nu Metro";
  branch: string;
  movie: string;
  date: string;
  time: string;
  format: string;
  price: number | null;
  thumbnailUrl: string | null;
  bookingUrl: string | null;
};
