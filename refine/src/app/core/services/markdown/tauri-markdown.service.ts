import {Injectable} from "@angular/core";
import {MarkdownService} from "./markdown.service";
import {from, Observable} from "rxjs";
import {invoke} from "@tauri-apps/api/core";

@Injectable()
export class TauriMarkdownService extends MarkdownService {
    override parseMarkdown(content: String): Observable<string> {
        return from(invoke<string>('parse_markdown', {content}));
    }
}