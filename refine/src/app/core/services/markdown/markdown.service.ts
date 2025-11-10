import {Injectable} from "@angular/core";
import {Observable} from "rxjs";

@Injectable()
export abstract class MarkdownService {
    abstract parseMarkdown(content: String): Observable<string>;
}