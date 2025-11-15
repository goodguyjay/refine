import {Component, inject} from "@angular/core";
import {ToastService} from "../../../core/services/toast.service";
import {ToastComponent} from "./toast.component";

@Component({
    selector: 'app-toast-container',
    imports: [ToastComponent],
    template: `
        <div
                class="fixed top-4 right-4 z-50 flex flex-col">
            @for (toast of toastService.toasts$(); track toast.id) {
                <app-toast
                        [toast]="toast"
                        (dismiss)="onDismiss($event)"/>
            }
        </div>
    `
})
export class ToastContainerComponent {
    toastService = inject(ToastService);

    onDismiss(id: string): void {
        this.toastService.dismiss(id);
    }
}