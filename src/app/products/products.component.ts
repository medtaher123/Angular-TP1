import { Component, OnInit, signal, inject } from "@angular/core";
import { Product } from "./dto/product.dto";
import { ProductService } from "./services/product.service";
import { Settings } from "./dto/product-settings.dto";
import { CommonModule } from "@angular/common";

@Component({
    selector: "app-products",
    templateUrl: "./products.component.html",
    styleUrls: ["./products.component.css"],
    standalone: true,
    imports: [
    CommonModule
],
})
export class ProductsComponent implements OnInit {
  products = signal<Product[]>([]);
  limit = 12;
  skip = 0;
  totalProducts = 0;
  isLoading = signal(false);

  private productService = inject(ProductService);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);
    const settings: Settings = { limit: this.limit, skip: this.skip };
    this.productService.getProducts(settings).subscribe({
      next: (res) => {
        this.products.update(old => [...old, ...res.products]);
        this.totalProducts = res.total;
        this.skip += this.limit;
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading.set(false);
      }
    });
  }

  loadMore(): void {
    if (this.skip >= this.totalProducts) {
      return;
    }
    this.loadProducts();
  }
}
