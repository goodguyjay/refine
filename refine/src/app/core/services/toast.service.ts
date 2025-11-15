import {Injectable, signal} from "@angular/core";

export interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    duration: number;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toasts = signal<Toast[]>([]);

    readonly toasts$ = this.toasts.asReadonly();

    private idCounter = 0;

    success(message: string, duration = 4000): void {
        this.show(message, 'success', duration);
    }

    error(message: string, duration = 5000): void {
        this.show(message, 'error', duration);
    }

    info(message: string, duration = 4000): void {
        this.show(message, 'info', duration);
    }

    private show(message: string, type: Toast['type'], duration: number): void {
        const id = `toast-${++this.idCounter}`;
        const toast: Toast = {id, message, type, duration};

        this.toasts.update(current => [...current, toast]);

        // auto dismiss
        setTimeout(() => this.dismiss(id), duration);
    }

    dismiss(id: string): void {
        this.toasts.update(current => current.filter(toast => toast.id !== id));
    }
}