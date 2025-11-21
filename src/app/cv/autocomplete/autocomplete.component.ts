import { Component, inject } from "@angular/core";
import { FormBuilder, AbstractControl } from "@angular/forms";
import { debounceTime, distinctUntilChanged, switchMap, tap, startWith, filter, Observable, of } from "rxjs";
import { CvService } from "../services/cv.service";
import { Cv } from "../model/cv";

@Component({
  selector: "app-autocomplete",
  templateUrl: "./autocomplete.component.html",
  styleUrls: ["./autocomplete.component.css"],
})
export class AutocompleteComponent {
  formBuilder = inject(FormBuilder);
  cvService = inject(CvService);
  form = this.formBuilder.group({ search: [""] });

  filteredCvs$: Observable<Cv[]> = (this.form.get("search")!.valueChanges as Observable<string>).pipe(
    startWith<string>(""),
    debounceTime(300),
    distinctUntilChanged<string>(),
    switchMap((search: string) => {
      if (!search || search.trim().length < 1) {
        return of([]);
      }
      return this.cvService.selectByName(search).pipe(
        filter(res => !!res && Array.isArray(res)),
      );
    })
  );
}
