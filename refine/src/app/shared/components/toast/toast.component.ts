import {Component, input, output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Toast} from '../../../core/services/toast.service';

@Component({
    selector: 'app-toast',
    imports: [CommonModule],
    template: `
        <div
                [class]="getToastClasses()"
                class="mb-3 rounded-lg shadow-lg p-4 flex items-center justify-between min-w-[300px] max-w-md animate-slide-in"
                role="alert"
        >
            <div class="flex items-center gap-3">
                <!-- icon based on type -->
                <div [class]="getIconClasses()">
                    @switch (toast().type) {
                        @case ('success') {
                            <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clip-rule="evenodd"/>
                            </svg>
                        }
                        @case ('error') {
                            <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                      clip-rule="evenodd"/>
                            </svg>
                        }
                        @case ('info') {
                            <svg class="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                      clip-rule="evenodd"/>
                            </svg>
                        }
                    }
                </div>

                <!-- message -->
                <p class="text-sm font-medium">{{ toast().message }}</p>
            </div>

            <!-- close button -->
            <button
                    (click)="onDismiss()"
                    class="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="close"
            >
                <svg class="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clip-rule="evenodd"/>
                </svg>
            </button>
        </div>
    `,
    styles: [`
      @keyframes slide-in {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      .animate-slide-in {
        animation: slide-in 0.3s ease-out;
      }
    `]
})
export class ToastComponent {
    toast = input.required<Toast>();
    dismiss = output<string>();

    onDismiss(): void {
        this.dismiss.emit(this.toast().id);
    }

    getToastClasses(): string {
        const base = 'border-l-4';
        const typeClasses = {
            success: 'bg-green-50 border-green-500 text-green-900',
            error: 'bg-red-50 border-red-500 text-red-900',
            info: 'bg-blue-50 border-blue-500 text-blue-900'
        };
        return `${base} ${typeClasses[this.toast().type]}`;
    }

    getIconClasses(): string {
        const typeClasses = {
            success: 'text-green-500',
            error: 'text-red-500',
            info: 'text-blue-500'
        };
        return typeClasses[this.toast().type];
    }
}