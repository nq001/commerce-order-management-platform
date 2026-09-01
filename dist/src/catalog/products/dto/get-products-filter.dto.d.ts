export declare class GetProductsFilterDto {
    search?: string;
    category_id?: string;
    min_price?: number;
    max_price?: number;
    sort_by?: string;
    order?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
}
