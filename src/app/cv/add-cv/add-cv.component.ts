import { Component, inject, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule
} from "@angular/forms";
import { CvService } from "../services/cv.service";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { APP_ROUTES } from "src/config/routes.config";
import { Cv } from "../model/cv";
import { JsonPipe } from "@angular/common";
import {startWith, tap, Subject, takeUntil, filter, takeLast} from "rxjs";


const DRAFT_KEY = 'cv_add_draft'
@Component({
  selector: "app-add-cv",
  templateUrl: "./add-cv.component.html",
  styleUrls: ["./add-cv.component.css"],
})
export class AddCvComponent {
  private cvService = inject(CvService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private formBuilder = inject(FormBuilder);

  private destroy$ = new Subject<void>();

  form = this.formBuilder.group(
    {
      name: ["", Validators.required],
      firstname: ["", Validators.required],
      path: [""],
      job: ["", Validators.required],
      cin: [
        "",
        {
          validators: [Validators.required, Validators.pattern("[0-9]{8}")],
        },
      ],
      age: [
        0,
        {
          validators: [Validators.required],
        },
      ],
    },
  );

  ngOnInit(): void {
    this.restoreDraft();
    this.setupMinorProtection();
    this.setupAutoSave();

  }
  
  ngOnDestroy() : void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private restoreDraft(): void{
    const draft = localStorage.getItem(DRAFT_KEY);
    if(draft){
      try{
        const data = JSON.parse(draft);
        this.form.patchValue(data);
        this.toastr.info("Brouillon restauré !","",{timeOut: 3000});
      }catch(e){
        console.error("Erreur de restauration de brouillon", e);
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }
  private setupMinorProtection(): void{
    this.form.get('age')!.valueChanges.pipe(
      startWith(this.form.get('age')!.value),
      tap((age:number | null) =>{
        const pathControl = this.form.get('path')!;

        if ((age!== null && age <18) || (age === null)){
          pathControl.disable({emitEvent: false});
          pathControl.setValue('', {emitEvent: false});
        } else{
          pathControl.enable({emitEvent: false});
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private setupAutoSave(): void {
    this.form.valueChanges.pipe(
      startWith(this.form.value),
      filter(()=> this.form.valid),
      tap((value)=>{
        localStorage.setItem(DRAFT_KEY, JSON.stringify(value));
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }


  addCv() {
    this.cvService.addCv(this.form.getRawValue() as Cv).subscribe({
      next: (cv) => {
        this.router.navigate([APP_ROUTES.cv]);
        this.toastr.success(`Le cv ${cv.firstname} ${cv.name} a été ajouté`);
      },
      error: (err) => {
        this.toastr.error(
          `Une erreur s'est produite, Veuillez contacter l'admin`
        );
      },
    });
  }

  get name(): AbstractControl {
    return this.form.get("name")!;
  }
  get firstname() {
    return this.form.get("firstname");
  }
  get age(): AbstractControl {
    return this.form.get("age")!;
  }
  get job() {
    return this.form.get("job");
  }
  get path() {
    return this.form.get("path");
  }
  get cin(): AbstractControl {
    return this.form.get("cin")!;
  }
}
