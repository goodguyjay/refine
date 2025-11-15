import {Component, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import {FileService} from './core/services';
import {FileData} from './core/models';
import {switchMap} from 'rxjs/operators';
import {PreviewComponent} from "./features/preview/preview.component";
import {ToastContainerComponent} from "./shared/components/toast/toast-container.component";
import {TypstService} from "./core/services/typst.service";
import {ToastService} from "./core/services/toast.service";
import {save} from "@tauri-apps/plugin-dialog";
import {writeFile} from "@tauri-apps/plugin-fs";
import {firstValueFrom} from "rxjs";

@Component({
    selector: "app-root",
    standalone: true,
    imports: [CommonModule, RouterOutlet, PreviewComponent, ToastContainerComponent],
    templateUrl: "./app.component.html",
    styleUrl: "./app.component.css",
})
export class AppComponent {
    private fileService = inject(FileService);
    private typstService = inject(TypstService);
    private toastService = inject(ToastService);

    currentFile = signal<FileData | null>(null);
    isLoading = signal(false);
    isExporting = signal(false);
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

    async exportPdf() {
        const file = this.currentFile();

        if (!file) {
            this.toastService.error('no file loaded to export');
            return;
        }

        this.isExporting.set(true);

        try {
            // generate pdf
            const pdfBytes = await firstValueFrom(
                this.typstService.generatePdf(file.content),
            );

            // save dialog
            const filePath = await save({
                filters: [{
                    name: 'PDF',
                    extensions: ['pdf'],
                }],
                defaultPath: file.name.replace(/\.md$/, '.pdf')
            });

            if (!filePath) {
                this.isExporting.set(false);
                return; // user cancelled
            }

            await writeFile(filePath, pdfBytes);

            this.toastService.success('PDF exported successfully');
        } catch (err: any) {
            this.toastService.error(`failed to export PDF: ${err.message || 'unknown error'}`);
            console.error('pdf export error:', err);
        } finally {
            this.isExporting.set(false);
        }
    }
}
