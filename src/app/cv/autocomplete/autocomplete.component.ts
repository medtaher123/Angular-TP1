import { Component, inject, OnInit, signal, OnDestroy } from "@angular/core";
import { FormBuilder, AbstractControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { debounceTime, distinctUntilChanged, switchMap, tap, startWith, catchError, of, Subscription, filter, Observable } from "rxjs";
import { CvService } from "../services/cv.service";
import { Cv } from "../model/cv";
import { CommonModule } from "@angular/common";
import { CvCardComponent } from "../cv-card/cv-card.component";

@Component({
    selector: "app-autocomplete",
    templateUrl: "./autocomplete.component.html",
    styleUrls: ["./autocomplete.component.css"],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, CommonModule, CvCardComponent],
})
export class AutocompleteComponent implements OnInit, OnDestroy {
  private formBuilder = inject(FormBuilder);
  private cvService = inject(CvService);
  private subscription?: Subscription;
  
  private searchCache = new Map<string, Cv[]>();
  
  filteredCvs = signal<Cv[]>([]);
  isLoading = signal(false);
  selectedCv = signal<Cv | null>(null);
  detailedCv = signal<Cv | null>(null);
  showDropdown = signal(false);
  searchTerm = signal<string>('');
  
  get search(): AbstractControl {
    return this.form.get("search")!;
  }
  
  form = this.formBuilder.group({ search: [""] });
  
  ngOnInit(): void {
    this.setupOptimizedAutoComplete();
  }
  
  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.searchCache.clear();
  }
  
 
  private setupOptimizedAutoComplete(): void {
    this.subscription = this.search.valueChanges.pipe(
      startWith(''),
      filter((searchTerm: string) => {
        const trimmed = searchTerm?.trim() || '';
        this.searchTerm.set(trimmed);
        return trimmed.length >= 2;
      }),
      debounceTime(250),
      distinctUntilChanged(),
      tap((searchTerm: string) => {
        this.isLoading.set(true);
        this.showDropdown.set(false);
      }),
      // SwitchMap for annuler les requêtes préced
      switchMap((searchTerm: string) => this.performSearch(searchTerm)),
      catchError(error => {
        console.error('Erreur lors de la recherche:', error);
        this.isLoading.set(false);
        this.showDropdown.set(false);
        return of([]);
      })
    ).subscribe({
      next: (cvs: Cv[]) => this.handleSearchResults(cvs),
      error: (error: any) => this.handleSearchError(error)
    });
  }
  
  
  private performSearch(searchTerm: string): Observable<Cv[]> {
    const trimmedTerm = searchTerm.trim().toLowerCase();
    
    if (this.searchCache.has(trimmedTerm)) {
      console.log(`Cache hit pour: ${trimmedTerm}`);
      return of(this.searchCache.get(trimmedTerm)!);
    }
    
    console.log(`Appel API pour: ${trimmedTerm}`);
    return this.cvService.selectByName(trimmedTerm).pipe(
      tap(cvs => {
        // Mettre en cache le résultat
        this.searchCache.set(trimmedTerm, cvs);
        // Nettoyer le cache si il devient trop grand (garder les 20 dernières recherches)
        if (this.searchCache.size > 20) {
          const firstKey = this.searchCache.keys().next().value;
          if (firstKey) {
            this.searchCache.delete(firstKey);
          }
        }
      }),
      catchError(error => {
        console.error(`Erreur API pour ${trimmedTerm}:`, error);
        return of([]);
      })
    );
  }
  
  
  private handleSearchResults(cvs: Cv[]): void {
    this.filteredCvs.set(cvs);
    this.isLoading.set(false);
    this.showDropdown.set(cvs.length > 0);
    
    // Log pour debugging
    console.log(`${cvs.length} CVs trouvés pour: "${this.searchTerm()}"`);
  }
  
 
  private handleSearchError(error: any): void {
    console.error('Erreur de souscription:', error);
    this.isLoading.set(false);
    this.showDropdown.set(false);
    this.filteredCvs.set([]);
  }
  
  
  selectCv(cv: Cv): void {
    this.selectedCv.set(cv);
    this.search.setValue(`${cv.firstname} ${cv.name}`, { emitEvent: false });
    this.showDropdown.set(false);
    this.cvService.selectCv(cv);
    
    this.detailedCv.set(null);
    
    console.log(`CV sélectionné: ${cv.firstname} ${cv.name}`);
  }
  

  
  
  viewCvDetails(cv: Cv): void {
    this.detailedCv.set(cv);
    this.showDropdown.set(false);
    this.cvService.selectCv(cv);
    
    console.log(`Affichage des détails pour: ${cv.firstname} ${cv.name}`);
  }
  

  
}
