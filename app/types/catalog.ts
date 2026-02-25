export type Book = {
  id: string;
  title: string;
  author: string;
  stock: number;
  updatedAt: string;
  category: {
    name: string;
  } | null;
  imagePath: string;
};

export type Category = {
  id: string;
  name: string;
  _count: {
    books: number;
  };
};
