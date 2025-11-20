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
  
  // Cache pour éviter les requêtes redondantes
  private searchCache = new Map<string, Cv[]>();
  
  // Signals pour la gestion réactive de l'état
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
  
  /**
   * Configuration optimisée de l'autocomplétion avec cache et minimisation des appels HTTP
   */
  private setupOptimizedAutoComplete(): void {
    this.subscription = this.search.valueChanges.pipe(
      startWith(''),
      // Filtrer les valeurs vides et trop courtes avant le debounce
      filter((searchTerm: string) => {
        const trimmed = searchTerm?.trim() || '';
        this.searchTerm.set(trimmed);
        return trimmed.length >= 2;
      }),
      // Debounce optimisé : plus court pour une meilleure réactivité
      debounceTime(250),
      // Ne déclencher que si la valeur change réellement
      distinctUntilChanged(),
      // Gérer les états de chargement
      tap((searchTerm: string) => {
        this.isLoading.set(true);
        this.showDropdown.set(false);
      }),
      // SwitchMap pour annuler les requêtes précédentes
      switchMap((searchTerm: string) => this.performSearch(searchTerm)),
      // Gestion globale des erreurs
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
  
  /**
   * Effectue la recherche avec mise en cache intelligente
   */
  private performSearch(searchTerm: string): Observable<Cv[]> {
    const trimmedTerm = searchTerm.trim().toLowerCase();
    
    // Vérifier le cache d'abord
    if (this.searchCache.has(trimmedTerm)) {
      console.log(`Cache hit pour: ${trimmedTerm}`);
      return of(this.searchCache.get(trimmedTerm)!);
    }
    
    // Si pas en cache, faire l'appel API
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
  
  /**
   * Traite les résultats de recherche
   */
  private handleSearchResults(cvs: Cv[]): void {
    this.filteredCvs.set(cvs);
    this.isLoading.set(false);
    this.showDropdown.set(cvs.length > 0);
    
    // Log pour debugging
    console.log(`${cvs.length} CVs trouvés pour: "${this.searchTerm()}"`);
  }
  
  /**
   * Gère les erreurs de recherche
   */
  private handleSearchError(error: any): void {
    console.error('Erreur de souscription:', error);
    this.isLoading.set(false);
    this.showDropdown.set(false);
    this.filteredCvs.set([]);
  }
  
  /**
   * Sélectionne un CV et met à jour l'état de manière réactive
   */
  selectCv(cv: Cv): void {
    this.selectedCv.set(cv);
    this.search.setValue(`${cv.firstname} ${cv.name}`, { emitEvent: false });
    this.showDropdown.set(false);
    this.cvService.selectCv(cv);
    
    // Fermer automatiquement les détails si ouverts
    this.detailedCv.set(null);
    
    console.log(`CV sélectionné: ${cv.firstname} ${cv.name}`);
  }
  
  /**
   * Gère le focus sur l'input avec logique améliorée
   */
  onInputFocus(): void {
    const currentTerm = this.search.value?.trim();
    if (currentTerm && currentTerm.length >= 2 && this.filteredCvs().length > 0) {
      this.showDropdown.set(true);
    }
  }
  
  /**
   * Gère la perte de focus avec délai pour permettre les clics
   */
  onInputBlur(): void {
    // Délai plus long pour permettre les interactions avec le dropdown
    setTimeout(() => {
      this.showDropdown.set(false);
    }, 300);
  }
  
  /**
   * Réinitialise complètement le composant
   */
  clearSelection(): void {
    this.selectedCv.set(null);
    this.detailedCv.set(null);
    this.search.setValue('', { emitEvent: false });
    this.filteredCvs.set([]);
    this.showDropdown.set(false);
    this.searchTerm.set('');
    this.isLoading.set(false);
    
    console.log('Sélection effacée');
  }
  
  /**
   * Affiche les détails du CV de manière optimisée
   */
  viewCvDetails(cv: Cv): void {
    this.detailedCv.set(cv);
    this.showDropdown.set(false);
    this.cvService.selectCv(cv);
    
    console.log(`Affichage des détails pour: ${cv.firstname} ${cv.name}`);
  }
  
  /**
   * Affiche les détails du CV sélectionné
   */
  viewSelectedCvDetails(): void {
    const selected = this.selectedCv();
    if (selected) {
      this.viewCvDetails(selected);
    }
  }
  
  /**
   * Ferme la vue détaillée
   */
  closeDetails(): void {
    this.detailedCv.set(null);
  }
  
  /**
   * Getter pour les statistiques de cache (utile pour debugging)
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.searchCache.size,
      keys: Array.from(this.searchCache.keys())
    };
  }
  
  /**
   * Met en surbrillance les termes de recherche dans le texte
   */
  highlightSearchTerm(text: string, searchTerm: string): string {
    if (!searchTerm || !text) {
      return text;
    }
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-warning">$1</mark>');
  }
}
