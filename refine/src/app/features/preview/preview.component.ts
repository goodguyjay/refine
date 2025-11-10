import {Component, effect, inject, input, signal} from "@angular/core";
import {CommonModule} from "@angular/common";
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";
import {MarkdownService} from "../../core/services";
import {Subscription} from "rxjs";

@Component({
    selector: 'app-preview',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="preview-container">
            @if (isLoading()) {
                <p class="loading">parsing markdown...</p>
            } @else if (error()) {
                <p class="error">failed to parse markdown: {{ error() }}</p>
            } @else {
                <div class="preview-content" [innerHTML]="safeHtml()"></div>
            }
        </div>
    `,
    styles: [`
      .preview-container {
        padding: 2rem;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        min-height: 400px;
      }

      .loading {
        color: #666;
        font-style: italic;
      }

      .error {
        color: #d32f2f;
        background: #ffebee;
        padding: 1rem;
        border-radius: 4px;
      }

      .preview-content {
        font-family: 'Times New Roman', Times, serif;
        font-size: 14px;
        line-height: 1.6;
        color: #333;
      }

      :host ::ng-deep .preview-content h1 {
        font-size: 2em;
        margin: 1em 0 0.5em;
        font-weight: bold;
      }

      :host ::ng-deep .preview-content h2 {
        font-size: 1.5em;
        margin: 1em 0 0.5em;
        font-weight: bold;
      }

      :host ::ng-deep .preview-content h3 {
        font-size: 1.25em;
        margin: 1em 0 0.5em;
        font-weight: bold;
      }

      :host ::ng-deep .preview-content p {
        margin: 0.5em 0;
      }

      :host ::ng-deep .preview-content code {
        font-family: 'Courier New', monospace;
        background: #f4f4f4;
        padding: 2px 4px;
        border-radius: 3px;
        font-size: 0.9em;
      }

      :host ::ng-deep .preview-content pre {
        background: #f4f4f4;
        padding: 1em;
        border-radius: 4px;
        overflow-x: auto;
      }

      :host ::ng-deep .preview-content pre code {
        background: none;
        padding: 0;
      }

      :host ::ng-deep .preview-content ul,
      :host ::ng-deep .preview-content ol {
        margin: 0.5em 0;
        padding-left: 2em;
      }

      :host ::ng-deep .preview-content li {
        margin: 0.25em 0;
      }

      :host ::ng-deep .preview-content a {
        color: #1976d2;
        text-decoration: none;
      }

      :host ::ng-deep .preview-content strong {
        font-weight: bold;
      }

      :host ::ng-deep .preview-content em {
        font-style: italic;
      }

      :host ::ng-deep .preview-content table {
        border-collapse: collapse;
        width: 100%;
        margin: 1em 0;
      }

      :host ::ng-deep .preview-content th,
      :host ::ng-deep .preview-content td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }

      :host ::ng-deep .preview-content th {
        background: #f4f4f4;
        font-weight: bold;
      }
    `]
})

export class PreviewComponent {
    private markdownService = inject(MarkdownService);
    private sanitizer = inject(DomSanitizer);

    markdownContent = input.required<string>();

    isLoading = signal(false);
    error = signal(<string | null>null);
    safeHtml = signal<SafeHtml>('');

    private subscription?: Subscription;

    constructor() {
        effect((onCleanup) => {
            const content = this.markdownContent();

            if (this.subscription) {
                this.subscription.unsubscribe();
            }

            if (!content) {
                this.safeHtml.set('');
                return;
            }

            this.isLoading.set(true);
            this.error.set(null);

            this.subscription = this.markdownService.parseMarkdown(content).subscribe({
                next: (html) => {
                    const safe = this.sanitizer.bypassSecurityTrustHtml(html);
                    this.safeHtml.set(safe);
                    this.isLoading.set(false);
                },
                error: (err) => {
                    this.error.set(err.message || 'unknown error');
                    this.isLoading.set(false);
                }
            })

            onCleanup(() => {
                if (this.subscription) {
                    this.subscription.unsubscribe();
                }
            });
        });
    }
}