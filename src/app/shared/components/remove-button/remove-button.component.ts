import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { RemoveButtonComponentInterface, RemoveButtonItemInterface } from './remove-button-component.interface';
import { MatDialog } from '@angular/material';
import { RemoveButtonDialogComponent } from './remove-button-dialog/remove-button-dialog.component';
import { ApiService } from '../../services/api.service';
import { forkJoin, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-remove-button',
  templateUrl: './remove-button.component.html',
  styleUrls: ['./remove-button.component.scss']
})
export class RemoveButtonComponent
      implements RemoveButtonComponentInterface, OnInit {
  @Input() items: RemoveButtonItemInterface[];
  @Input() afterRedirectTo: string;

  @Output() removed = new EventEmitter<any>();

  constructor(
    private api: ApiService,
    private router: Router,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
  }

  onDialogConfirmRemove(itemsToDelete: RemoveButtonItemInterface[] = []): void {
    const requests$: Observable<any>[] = [];

    itemsToDelete.forEach((item) => {
      requests$.push(this.api.delete$(item.apiModel, item.id));
    });

    forkJoin(requests$).subscribe((responseList) => {
      this.removed.emit(responseList);

      if (this.afterRedirectTo) {
        this.router.navigate([this.afterRedirectTo]);
      }
    });
  }

  onClickRemoveButton(): void {
    this.dialog
      .open(RemoveButtonDialogComponent, {
        data: this.items
      })
      .afterClosed()
        .subscribe((itemsToDelete: RemoveButtonItemInterface[]) => {
          if (itemsToDelete) {
            this.onDialogConfirmRemove(itemsToDelete);
          }
        });
  }
}