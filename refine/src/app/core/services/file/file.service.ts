import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {FileData} from "../../models";

@Injectable()
export abstract class FileService {
    abstract openFileDialog(): Observable<string | null>;

    abstract readFile(path: string): Observable<FileData>;

    abstract getCurrentFile(): Observable<FileData | null>;
}