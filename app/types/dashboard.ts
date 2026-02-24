export type BookCategory = {
  id: number;
  name: string;
};

export type BookImage = {
  id: number;
  path: string;
};

export type BookItem = {
  id: number;
  title: string;
  author: string;
  stock: number;
  updatedAt: string;
  category: BookCategory | null;
  image: BookImage | null;
};

export type CategoryItem = {
  id: number;
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
  categoryId: number;
  stock: number;
};

export type CategoryFormPayload = {
  categoryName: string;
};
