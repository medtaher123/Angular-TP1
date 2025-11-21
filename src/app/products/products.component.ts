import { Component } from "@angular/core";
import {
  BehaviorSubject,
  Observable,
  concatMap,
  map,
  takeWhile,
  scan,
} from "rxjs";
import { Product } from "./dto/product.dto";
import { ProductService } from "./services/product.service";
import { Settings } from "./dto/product-settings.dto";

@Component({
  selector: "app-products",
  templateUrl: "./products.component.html",
  styleUrls: ["./products.component.css"],
})
export class ProductsComponent {
  private readonly PRODUCTS_PER_PAGE = 12;
  
  // BehaviorSubject to trigger API calls
  private loadMoreSubject = new BehaviorSubject<void>(undefined);
  
  // Observable stream for products with pagination
  products$: Observable<Product[]> = this.loadMoreSubject.pipe(
    // Transform each trigger into settings for the next API call
    scan((acc, _) => ({
      limit: this.PRODUCTS_PER_PAGE,
      skip: acc ? acc.skip + this.PRODUCTS_PER_PAGE : 0
    }), { limit: this.PRODUCTS_PER_PAGE, skip: 0 } as Settings),
    
    // Fetch products from API using the settings
    concatMap(settings => this.productService.getProducts(settings)),
    
    // Stop calling API when no more products are available
    takeWhile(response => response.products.length > 0, true),
    
    // Extract and accumulate products
    scan((allProducts: Product[], response) => [
      ...allProducts, 
      ...response.products
    ], [])
  );

  // Observable to track if all products have been loaded
  allProductsLoaded$: Observable<boolean> = this.loadMoreSubject.pipe(
    scan((acc, _) => ({
      limit: this.PRODUCTS_PER_PAGE,
      skip: acc ? acc.skip + this.PRODUCTS_PER_PAGE : 0
    }), { limit: this.PRODUCTS_PER_PAGE, skip: 0 } as Settings),
    concatMap(settings => this.productService.getProducts(settings)),
    map(response => response.products.length === 0),
    scan((wasCompleted, isCompleted) => wasCompleted || isCompleted, false)
  );

  // Observable to track loading state
  isLoading$: Observable<boolean> = this.loadMoreSubject.pipe(
    map(() => true),
    scan((acc, _) => ({
      limit: this.PRODUCTS_PER_PAGE,
      skip: acc ? acc.skip + this.PRODUCTS_PER_PAGE : 0
    }), { limit: this.PRODUCTS_PER_PAGE, skip: 0 } as Settings),
    concatMap(settings => 
      this.productService.getProducts(settings).pipe(
        map(() => false)
      )
    )
  );

  constructor(private productService: ProductService) {}

  // Method to load more products
  loadMore(): void {
    this.loadMoreSubject.next();
  }
}
