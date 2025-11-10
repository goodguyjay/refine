import {ApplicationConfig, provideZoneChangeDetection,} from "@angular/core";
import {provideRouter} from "@angular/router";

import {routes} from "./app.routes";
import {FileService, MarkdownService, TauriFileService, TauriMarkdownService} from "./core/services";

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
        }
    ],
};
