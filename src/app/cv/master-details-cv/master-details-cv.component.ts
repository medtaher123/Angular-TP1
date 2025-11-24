import { Component } from '@angular/core';
import { Cv } from '../model/cv';
import { LoggerService } from '../../services/logger.service';
import { ToastrService } from 'ngx-toastr';
import { CvService } from '../services/cv.service';
import { Observable, catchError, filter, map, of, take } from 'rxjs';

@Component({
  selector: 'app-master-details-cv',
  templateUrl: './master-details-cv.component.html',
  styleUrls: ['./master-details-cv.component.css'],
})
export class MasterDetailsCvComponent {
  cvs$: Observable<Cv[]>;
  selectedCv$: Observable<Cv | null>;
  date = new Date();

  constructor(
    private logger: LoggerService,
    private toastr: ToastrService,
    private cvService: CvService
  ) {
    this.cvs$ = this.cvService.getCvs().pipe(
      map((cvs) => cvs.slice(0, 5)),
      catchError((error) => {
        this.logger.error('Erreur lors du chargement des CVs:', error);
        this.toastr.error(`
          Attention!! Les données sont fictives, problème avec le serveur.
          Veuillez contacter l'admin.`);
        return of(this.cvService.getFakeCvs());
      })
    );
    this.logger.logger('je suis le cvComponent');
    this.toastr.info('Bienvenu dans notre CvTech');
    this.selectedCv$ = this.cvService.selectCv$;
  }
}
