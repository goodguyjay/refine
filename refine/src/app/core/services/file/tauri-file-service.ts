import {Injectable} from "@angular/core";
import {BehaviorSubject, from, Observable} from "rxjs";
import {tap} from "rxjs/operators";
import {FileData} from "../../models";
import {FileService} from "./file.service";
import {invoke} from "@tauri-apps/api/core";

@Injectable()
export class TauriFileService extends FileService {
    private currentFile$ = new BehaviorSubject<FileData | null>(null);

    override openFileDialog(): Observable<string | null> {
        return from(invoke<string | null>('open_file_dialog'));
    }

    override readFile(path: string): Observable<FileData> {
        return from(invoke<FileData>('read_file', {path})).pipe(
            tap((fileData) => {
                this.currentFile$.next(fileData);
            })
        );
    }

    override getCurrentFile(): Observable<FileData | null> {
        return this.currentFile$.asObservable();
    }
}