export interface Card {
  id: string;
  title: string;
  description: string | null;
  columnId: string;
  position: number;
  createdAt: string;
}
