import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { Cv } from '../model/cv';
import { CvService } from '../services/cv.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { APP_ROUTES } from '../../../config/routes.config';
import { AuthService } from '../../auth/services/auth.service';
import { Subscription } from 'rxjs';

import { DefaultImagePipe } from '../pipes/default-image.pipe';

@Component({
  selector: 'app-details-cv',
  templateUrl: './details-cv.component.html',
  styleUrls: ['./details-cv.component.css'],
  standalone: true,
  imports: [DefaultImagePipe],
})
export class DetailsCvComponent implements OnInit, OnDestroy {
  private cvService = inject(CvService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private toastr = inject(ToastrService);
  authService = inject(AuthService);

  cv: Cv | null = null;
  private paramSubscription?: Subscription;

  ngOnInit() {
    this.paramSubscription = this.activatedRoute.paramMap.subscribe(
      (params) => {
        const id = params.get('id');
        if (id) {
          this.cvService.getCvById(+id).subscribe({
            next: (cv) => {
              this.cv = cv;
            },
            error: (e) => {
              this.router.navigate([APP_ROUTES.cv]);
            },
          });
        }
      }
    );
  }

  ngOnDestroy() {
    this.paramSubscription?.unsubscribe();
  }
  deleteCv(cv: Cv) {
    this.cvService.deleteCvById(cv.id).subscribe({
      next: () => {
        this.toastr.success(`${cv.name} supprimé avec succès`);
        this.router.navigate([APP_ROUTES.cv]);
      },
      error: () => {
        this.toastr.error(
          `Problème avec le serveur veuillez contacter l'admin`
        );
      },
    });
  }
}
