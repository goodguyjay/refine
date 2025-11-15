import {Observable} from 'rxjs';

export abstract class TypstService {
    abstract generatePdf(markdown: string): Observable<Uint8Array>;
}