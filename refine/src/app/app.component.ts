import {Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import {FileService} from './core/services';
import {FileData} from './core/models';
import {switchMap} from 'rxjs/operators';
import {PreviewComponent} from "./features/preview/preview.component";

@Component({
    selector: "app-root",
    standalone: true,
    imports: [CommonModule, RouterOutlet, PreviewComponent],
    templateUrl: "./app.component.html",
    styleUrl: "./app.component.css",
})
export class AppComponent {
    private fileService = inject(FileService);

    currentFile = signal<FileData | null>(null);
    isLoading = signal(false);
    error = signal<string | null>(null);

    openFile() {
        this.isLoading.set(true);
        this.error.set(null);

        this.fileService.openFileDialog().pipe(
            switchMap(path => {
                if (!path) {
                    this.isLoading.set(false);
                    return [];
                }
                return this.fileService.readFile(path);
            })
        ).subscribe({
            next: (fileData) => {
                this.currentFile.set(fileData);
                this.isLoading.set(false);
                console.log('file loaded:', fileData.name);
            },
            error: (err) => {
                this.error.set(err.message || 'failed to open file');
                this.isLoading.set(false);
                console.error('error loading file:', err);
            }
        });
    }
}
