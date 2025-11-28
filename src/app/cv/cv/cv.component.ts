import { Component } from "@angular/core";
import { Cv } from "../model/cv";
import { LoggerService } from "../../services/logger.service";
import { ToastrService } from "ngx-toastr";
import { CvService } from "../services/cv.service";
import { Observable, catchError, of } from "rxjs";
import { EmbaucheService } from "../services/embauche.service";
@Component({
  selector: "app-cv",
  templateUrl: "./cv.component.html",
  styleUrls: ["./cv.component.css"],
})
export class CvComponent {
  cvs$: Observable<Cv[]>;
  embauchees: Cv[] = [];
  selectedCv$: Observable<Cv | null>;
  date = new Date();

  constructor(
    private logger: LoggerService,
    private toastr: ToastrService,
    private cvService: CvService,
    private embaucheService: EmbaucheService
  ) {
    this.embauchees = this.embaucheService.getEmbauchees();
    this.cvs$ = this.cvService.getCvs().pipe(
      catchError((error) => {
        this.logger.error('Erreur lors du chargement des CVs:', error);
        this.toastr.error(`
          Attention!! Les données sont fictives, problème avec le serveur.
          Veuillez contacter l'admin.`);
        return of(this.cvService.getFakeCvs());
      })
    );
    this.logger.logger("je suis le cvComponent");
    this.toastr.info("Bienvenu dans notre CvTech");
    this.selectedCv$ = this.cvService.selectCv$;
  }
}
