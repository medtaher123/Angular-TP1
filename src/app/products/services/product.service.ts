import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { API } from "src/config/api.config";
import { Settings } from "../dto/product-settings.dto";
import { ProductApiResponse } from "../dto/product-api-response.dto";

@Injectable({
  providedIn: "root",
})
export class ProductService {
  private http = inject(HttpClient);

  getProducts(settings: Settings) {
    const { limit, skip } = settings;
    return this.http.get<ProductApiResponse>(
      `${API.products}?limit=${limit}&skip=${skip}`
    );
  }
}
