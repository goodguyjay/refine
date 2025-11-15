import {Injectable} from "@angular/core";
import {from, Observable} from "rxjs";
import {map} from "rxjs/operators"
import {invoke} from "@tauri-apps/api/core";
import {TypstService} from "../../core/services/typst.service";

@Injectable()
export class TauriTypstService implements TypstService {
    generatePdf(markdown: string): Observable<Uint8Array> {
        return from(
            invoke<number[]>('markdown_to_pdf', {markdown})
        ).pipe(
            map(bytes => new Uint8Array(bytes))
        )
    }
}