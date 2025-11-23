import { inject, Injectable } from "@angular/core";
import {
  AbstractControl,
  AsyncValidator,
  ValidationErrors,
} from "@angular/forms";
import { Observable, of, timer } from "rxjs";
import { catchError, map, switchMap } from "rxjs/operators";
import { CvService } from "../cv/services/cv.service";

@Injectable({ providedIn: "root" })
export class UniqueCinValidator implements AsyncValidator {
  private cvService = inject(CvService);

  validate(
    control: AbstractControl<string | null>
  ): Observable<ValidationErrors | null> {
    const cin = control.value?.trim();

    if (!cin || cin.length !== 8 || !/^\d{8}$/.test(cin)) {
      return of(null);
    }

    return timer(500).pipe(
      switchMap(() =>
        this.cvService.checkCinExists(cin).pipe(
          map((exists) => (exists ? { cinAlreadyExists: true } : null)),
          catchError(() => of(null))
        )
      )
    );
  }
}