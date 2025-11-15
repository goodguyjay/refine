import {ApplicationConfig, provideZoneChangeDetection,} from "@angular/core";
import {provideRouter} from "@angular/router";
import {TypstService} from "./core/services/typst.service";
import {routes} from "./app.routes";
import {FileService, MarkdownService, TauriFileService, TauriMarkdownService} from "./core/services";
import {TauriTypstService} from "./infrastructure/tauri/tauri-typst.service";

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({eventCoalescing: true}),
        provideRouter(routes),
        {
            provide: FileService,
            useClass: TauriFileService,
        },
        {
            provide: MarkdownService,
            useClass: TauriMarkdownService
        },
        {
            provide: TypstService,
            useClass: TauriTypstService
        }
    ],
};
