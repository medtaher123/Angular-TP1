import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CvService } from '../services/cv.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { APP_ROUTES } from 'src/config/routes.config';
import { Cv } from '../model/cv';
import { JsonPipe } from '@angular/common';
import { startWith, tap, Subject, takeUntil, filter } from 'rxjs';
import { UniqueCinValidator } from 'src/app/validators/unique-cin.validator';
import { cinAgeCorrelationValidtor } from 'src/app/validators/cin-age.validator';

const DRAFT_KEY = 'cv_add_draft';

@Component({
  selector: 'app-add-cv',
  templateUrl: './add-cv.component.html',
  styleUrls: ['./add-cv.component.css'],
})
export class AddCvComponent implements OnInit, OnDestroy {
  private cvService = inject(CvService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private fb = inject(FormBuilder);
  private uniqueCinValidator = inject(UniqueCinValidator);

  private destroy$ = new Subject<void>();

  // Validateur croisé appliqué au niveau du FormGroup
  form = this.fb.group(
    {
      name: ['', Validators.required],
      firstname: ['', Validators.required],
      path: [''],
      job: ['', Validators.required],
      cin: [
        '',
        [Validators.required, Validators.pattern('[0-9]{8}')],
        [this.uniqueCinValidator],
      ],
      age: [0, [Validators.required, Validators.min(1)]],
    },
    {
      validators: cinAgeCorrelationValidtor(),
    }
  );

  ngOnInit(): void {
    this.restoreDraft();
    this.setupMinorProtection();
    this.setupAutoSave();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private restoreDraft(): void {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        const data = JSON.parse(draft);
        this.form.patchValue(data);
        this.toastr.info('Brouillon restauré !', '', { timeOut: 3000 });
      } catch (e) {
        console.error('Erreur restauration brouillon', e);
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }

  private setupMinorProtection(): void {
    this.form
      .get('age')!
      .valueChanges.pipe(
        startWith(this.form.get('age')!.value as number),
        tap((age) => {
          const pathCtrl = this.form.get('path')!;
          if (age === null || (age < 18 && age >= 0)) {
            pathCtrl.setValue('');
            pathCtrl.disable({ emitEvent: false });
          } else if (age >= 18) {
            pathCtrl.enable({ emitEvent: false });
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  private setupAutoSave(): void {
    this.form.valueChanges
      .pipe(
        startWith(this.form.value),
        filter(() => this.form.valid),
        tap((value) => localStorage.setItem(DRAFT_KEY, JSON.stringify(value))),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  addCv(): void {
    if (this.form.invalid || this.form.pending) return;

    const raw = this.form.getRawValue();

    // Objet parfaitement typé pour Cv
    const newCv = {
      name: raw.name!,
      firstname: raw.firstname!,
      job: raw.job!,
      cin: raw.cin!,
      age: raw.age!,
      path: raw.path,
    };

    this.cvService.addCv(newCv as unknown as Cv).subscribe({
      next: (cv) => {
        localStorage.removeItem(DRAFT_KEY);
        this.toastr.success(`CV de ${cv.firstname} ${cv.name} ajouté !`);
        this.router.navigate([APP_ROUTES.cv]);
        this.form.reset();
      },
      error: (err) => {
        console.log(err);
        this.toastr.error("Erreur lors de l'ajout du CV");
      },
    });
  }

  // Getters
  get name() {
    return this.form.get('name');
  }
  get firstname() {
    return this.form.get('firstname');
  }
  get age() {
    return this.form.get('age');
  }
  get job() {
    return this.form.get('job');
  }
  get path() {
    return this.form.get('path');
  }
  get cin() {
    return this.form.get('cin')!;
  }
}
