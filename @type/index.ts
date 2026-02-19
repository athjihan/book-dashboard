export type Book = {
    data: {
        id: number;
        title: string;
        author: string;
        stock: number;
        updatedAt: string;
        category: {
            name: string;
        } | null;
    }
};

export type Category = {
    data: {
        id: number;
        name: string;
        _count: {
            books: number;
        };
    }[];
};