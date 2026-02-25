export type BookCategory = {
  id: string;
  name: string;
};

export type BookItem = {
  id: string;
  title: string;
  author: string;
  stock: number;
  updatedAt: string;
  category: BookCategory | null;
  imagePath: string;
};

export type CategoryItem = {
  id: string;
  name: string;
  _count: {
    books: number;
  };
};

export type PaginatedResponse<T> = {
  success: boolean;
  status: number;
  message: string;
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    totalStock?: number;
  };
};

export type BookFormPayload = {
  title: string;
  author: string;
  categoryId: string;
  stock: number;
  imagePath: string;
};

export type CategoryFormPayload = {
  categoryName: string;
};
