import { Component } from "@angular/core";
import {
  BehaviorSubject,
  Observable,
  concatMap,
  map,
  takeWhile,
  scan,
  startWith,
} from "rxjs";
import { Product } from "./dto/product.dto";
import { ProductService } from "./services/product.service";
import { Settings } from "./dto/product-settings.dto";

interface PageInfo{
  products: Product[],
  total: number,
  skip: number,
  hasMore: boolean,

}

@Component({
  selector: "app-products",
  templateUrl: "./products.component.html",
  styleUrls: ["./products.component.css"],
})
export class ProductsComponent {
  /* Todo : Faire le nécessaire pour créer le flux des produits à afficher */
  /* Tips : vous pouvez voir les différents imports non utilisés et vous en inspirer */
  private loadMore$ = new BehaviorSubject<void>(undefined);


  products$!: Observable<PageInfo>;


  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.products$ = this.loadMore$.pipe(

      concatMap((_,index)=>{
        const skip = index *12;
        const limit = 12;
        return this.productService.getProducts({limit,skip}).pipe(
          map((response) =>({
            products: response.products,
            total: response.total,
            skip: response.skip + response.products.length,
            hasMore: response.skip +response.products.length < response.total,
          }))
        );
      }),
      takeWhile((page) => page.hasMore ||page.products.length ===0, true),


      scan((acc: PageInfo, current: PageInfo)=> ({
        products: [...acc.products, ...current.products],
        total: current.total,
        skip: current.skip,
        hasMore: current.hasMore,
      }), {products: [], total: 0, skip: 0, hasMore: true} as PageInfo),
    );

  }
  onLoadMore() : void {
    this.loadMore$.next();
  }
}