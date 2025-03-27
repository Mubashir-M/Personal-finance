import { Component } from '@angular/core';
import { UploadFileService } from '../services/UploadFileService';
import { Router } from '@angular/router';
import { ActivePageService } from '../services/activePageService';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-upload-file',
  imports: [CommonModule],
  templateUrl: './upload-file.component.html',
  styleUrl: './upload-file.component.scss',
})
export class UploadFileComponent {
  selectedFile: File | null = null;

  constructor(
    private uploadService: UploadFileService,
    private router: Router,
    private activePageService: ActivePageService
  ) {}
  onFileSelected(event: any) {
    this.selectedFile = event?.target.files[0];
  }

  onUploadFile() {
    if (this.selectedFile) {
      this.uploadService.UploadFile(this.selectedFile).subscribe({
        next: (response) => {
          console.log('Upload successful', response);
          this.router.navigate(['/']);
          this.activePageService.setActivePage('dashboard');
        },
        error: (error) => {
          console.error('Upload failed', error);
        },
      });
    } else {
      console.error('No file selected.');
    }
  }
}
